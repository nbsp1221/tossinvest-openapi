from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import pytest
import requests

from tossinvest_openapi import (
    TossInvestAPIError,
    TossInvestAuthenticationError,
    TossInvestConnectionError,
    TossInvestTimeoutError,
)
from tossinvest_openapi.http import HttpRequest, build_url, request_json


class FakeResponse:
    def __init__(
        self,
        *,
        status_code: int,
        body: object,
        headers: Mapping[str, str] | None = None,
    ) -> None:
        self.status_code = status_code
        self._body = body
        self.headers = dict(headers or {})
        self.text = "" if body is None else "body"
        self.ok = 200 <= status_code <= 299

    def json(self) -> object:
        if isinstance(self._body, BaseException):
            raise self._body
        return self._body


class FakeSession:
    def __init__(self, response: FakeResponse | BaseException) -> None:
        self.response = response
        self.calls: list[dict[str, Any]] = []

    def request(self, method: str, url: str, **kwargs: Any) -> FakeResponse:
        kwargs["method"] = method
        kwargs["url"] = url
        self.calls.append(kwargs)
        if isinstance(self.response, BaseException):
            raise self.response
        return self.response


def test_build_url_serializes_defined_query_values() -> None:
    url = build_url(
        "https://openapi.tossinvest.com/",
        "/api/v1/orders",
        {"status": "OPEN", "symbol": None, "limit": 20},
    )

    assert url == "https://openapi.tossinvest.com/api/v1/orders?status=OPEN&limit=20"


def test_request_json_returns_parsed_body_and_metadata() -> None:
    session = FakeSession(
        FakeResponse(
            status_code=200,
            body={"result": [{"accountSeq": 1}]},
            headers={"x-request-id": "req_123"},
        )
    )

    result = request_json(
        session,  # type: ignore[arg-type]
        HttpRequest(
            method="GET",
            url="https://example.test/accounts",
            headers={"authorization": "Bearer token"},
            timeout=30.0,
        ),
    )

    assert result.data == {"result": [{"accountSeq": 1}]}
    assert result.response.status_code == 200
    assert result.response.request_id == "req_123"
    assert session.calls[0]["method"] == "GET"
    assert session.calls[0]["url"] == "https://example.test/accounts"
    assert session.calls[0]["headers"] == {"authorization": "Bearer token"}
    assert session.calls[0]["timeout"] == 30.0


def test_request_json_raises_api_error_for_error_response() -> None:
    session = FakeSession(
        FakeResponse(
            status_code=401,
            body={
                "error": {
                    "requestId": "body_req",
                    "code": "invalid-token",
                    "message": "Token has expired",
                }
            },
            headers={"x-request-id": "req_401"},
        )
    )

    with pytest.raises(TossInvestAuthenticationError) as error_info:
        request_json(
            session,  # type: ignore[arg-type]
            HttpRequest(
                method="GET",
                url="https://example.test/accounts",
                headers={},
                timeout=30.0,
            ),
        )

    error = error_info.value
    assert isinstance(error, TossInvestAPIError)
    assert str(error) == "Token has expired"
    assert error.status_code == 401
    assert error.code == "invalid-token"
    assert error.request_id == "req_401"


def test_request_json_wraps_timeout() -> None:
    session = FakeSession(requests.Timeout("timed out"))

    with pytest.raises(TossInvestTimeoutError) as error_info:
        request_json(
            session,  # type: ignore[arg-type]
            HttpRequest(
                method="GET",
                url="https://example.test/accounts",
                headers={},
                timeout=30.0,
            ),
        )

    assert isinstance(error_info.value, TossInvestConnectionError)
    assert isinstance(error_info.value.cause, requests.Timeout)


def test_request_json_wraps_connection_errors() -> None:
    session = FakeSession(requests.ConnectionError("closed"))

    with pytest.raises(TossInvestConnectionError) as error_info:
        request_json(
            session,  # type: ignore[arg-type]
            HttpRequest(
                method="GET",
                url="https://example.test/accounts",
                headers={},
                timeout=30.0,
            ),
        )

    assert isinstance(error_info.value.cause, requests.ConnectionError)
