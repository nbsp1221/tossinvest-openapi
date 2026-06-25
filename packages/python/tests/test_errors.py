from __future__ import annotations

from tossinvest_openapi import (
    TossInvestAPIError,
    TossInvestAuthenticationError,
    TossInvestBadRequestError,
    TossInvestConnectionError,
    TossInvestError,
    TossInvestNotFoundError,
    TossInvestPermissionError,
    TossInvestRateLimitError,
    TossInvestServerError,
    TossInvestTimeoutError,
)
from tossinvest_openapi.errors import api_error_from_status


def test_api_error_stores_metadata() -> None:
    error = TossInvestAPIError(
        "Token has expired",
        status_code=401,
        code="invalid-token",
        request_id="req_123",
        body={"error": {"code": "invalid-token"}},
        headers={"x-request-id": "req_123"},
    )

    assert isinstance(error, TossInvestError)
    assert str(error) == "Token has expired"
    assert error.status_code == 401
    assert error.code == "invalid-token"
    assert error.request_id == "req_123"
    assert error.body == {"error": {"code": "invalid-token"}}
    assert error.headers == {"x-request-id": "req_123"}
    assert error.cause is None


def test_connection_error_stores_cause() -> None:
    cause = RuntimeError("socket closed")

    error = TossInvestConnectionError("Request failed", cause=cause)

    assert isinstance(error, TossInvestError)
    assert error.cause is cause


def test_timeout_error_is_connection_error() -> None:
    error = TossInvestTimeoutError("Request timed out")

    assert isinstance(error, TossInvestConnectionError)


def test_api_error_from_status_maps_known_statuses() -> None:
    assert isinstance(api_error_from_status(400, message="bad"), TossInvestBadRequestError)
    assert isinstance(
        api_error_from_status(401, message="auth"),
        TossInvestAuthenticationError,
    )
    assert isinstance(api_error_from_status(403, message="forbidden"), TossInvestPermissionError)
    assert isinstance(api_error_from_status(404, message="missing"), TossInvestNotFoundError)
    assert isinstance(api_error_from_status(429, message="limited"), TossInvestRateLimitError)
    assert isinstance(api_error_from_status(500, message="server"), TossInvestServerError)
    assert isinstance(api_error_from_status(503, message="server"), TossInvestServerError)


def test_api_error_from_status_falls_back_to_base_api_error() -> None:
    error = api_error_from_status(
        418,
        message=None,
        code="teapot",
        request_id="req_418",
        body={"code": "teapot"},
        headers={"x-request-id": "req_418"},
    )

    assert type(error) is TossInvestAPIError
    assert str(error) == "Toss Invest API request failed with status 418"
    assert error.status_code == 418
    assert error.code == "teapot"
    assert error.request_id == "req_418"
