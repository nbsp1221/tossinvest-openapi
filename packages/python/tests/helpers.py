from __future__ import annotations

from typing import Any


class FakeResponse:
    def __init__(
        self,
        body: object,
        *,
        status_code: int = 200,
        headers: dict[str, str] | None = None,
    ) -> None:
        self._body = body
        self.status_code = status_code
        self.headers = headers or {}
        self.text = "" if body is None else "body"
        self.ok = 200 <= status_code <= 299

    def json(self) -> object:
        return self._body


class FakeSession:
    def __init__(self, responses: list[FakeResponse]) -> None:
        self.responses = responses
        self.calls: list[dict[str, Any]] = []
        self.closed = False

    def request(self, method: str, url: str, **kwargs: Any) -> FakeResponse:
        kwargs["method"] = method
        kwargs["url"] = url
        self.calls.append(kwargs)
        return self.responses.pop(0)

    def close(self) -> None:
        self.closed = True


def oauth_response(access_token: str = "token") -> FakeResponse:
    return FakeResponse(
        {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": 3600,
        }
    )
