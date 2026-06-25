from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from typing import Any

from tossinvest_openapi.auth import TokenManager


class FakeResponse:
    def __init__(self, body: object, *, status_code: int = 200) -> None:
        self._body = body
        self.status_code = status_code
        self.headers: dict[str, str] = {}
        self.text = "body"
        self.ok = 200 <= status_code <= 299

    def json(self) -> object:
        return self._body


class FakeSession:
    def __init__(self, responses: list[FakeResponse]) -> None:
        self.responses = responses
        self.calls: list[dict[str, Any]] = []

    def request(self, method: str, url: str, **kwargs: Any) -> FakeResponse:
        kwargs["method"] = method
        kwargs["url"] = url
        self.calls.append(kwargs)
        return self.responses.pop(0)


def token(value: str, *, expires_in: int = 3600) -> dict[str, object]:
    return {
        "access_token": value,
        "token_type": "Bearer",
        "expires_in": expires_in,
    }


def test_token_manager_lazily_issues_and_caches_token() -> None:
    session = FakeSession([FakeResponse(token("token-1"))])
    manager = TokenManager(
        client_id="client",
        client_secret="secret",
        base_url="https://openapi.tossinvest.com",
        session=session,  # type: ignore[arg-type]
        timeout=30.0,
        user_agent="test-agent",
        now=lambda: 1_000_000.0,
    )

    assert manager.get_access_token() == "token-1"
    assert manager.get_access_token() == "token-1"
    assert len(session.calls) == 1
    assert session.calls[0]["method"] == "POST"
    assert session.calls[0]["url"] == "https://openapi.tossinvest.com/oauth2/token"
    assert session.calls[0]["headers"]["content-type"] == "application/x-www-form-urlencoded"
    assert session.calls[0]["headers"]["user-agent"] == "test-agent"
    assert session.calls[0]["data"]["grant_type"] == "client_credentials"
    assert session.calls[0]["data"]["client_id"] == "client"
    assert session.calls[0]["data"]["client_secret"] == "secret"


def test_token_manager_reissues_after_expiry() -> None:
    now = 1_000_000.0
    session = FakeSession(
        [
            FakeResponse(token("token-1", expires_in=1)),
            FakeResponse(token("token-2", expires_in=3600)),
        ]
    )
    manager = TokenManager(
        client_id="client",
        client_secret="secret",
        base_url="https://openapi.tossinvest.com",
        session=session,  # type: ignore[arg-type]
        timeout=30.0,
        expiry_skew=0.0,
        now=lambda: now,
    )

    assert manager.get_access_token() == "token-1"
    now += 1.1
    assert manager.get_access_token() == "token-2"
    assert len(session.calls) == 2


def test_token_manager_lock_coalesces_concurrent_cache_misses() -> None:
    session = FakeSession([FakeResponse(token("token-1"))])
    manager = TokenManager(
        client_id="client",
        client_secret="secret",
        base_url="https://openapi.tossinvest.com",
        session=session,  # type: ignore[arg-type]
        timeout=30.0,
        now=lambda: 1_000_000.0,
    )

    with ThreadPoolExecutor(max_workers=2) as executor:
        results = list(executor.map(lambda _: manager.get_access_token(), range(2)))

    assert results == ["token-1", "token-1"]
    assert len(session.calls) == 1
