from __future__ import annotations

from collections.abc import Mapping


class TossInvestError(Exception):
    """Base exception for all tossinvest-openapi errors."""

    def __init__(
        self,
        message: str,
        *,
        status_code: int | None = None,
        code: str | None = None,
        request_id: str | None = None,
        body: object | None = None,
        headers: Mapping[str, str] | None = None,
        cause: BaseException | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.request_id = request_id
        self.body = body
        self.headers = headers
        self.cause = cause


class TossInvestConnectionError(TossInvestError):
    """Raised when a request fails before an HTTP response is received."""


class TossInvestTimeoutError(TossInvestConnectionError):
    """Raised when a request times out."""


class TossInvestAPIError(TossInvestError):
    """Raised for non-2xx Toss Invest API responses."""


class TossInvestBadRequestError(TossInvestAPIError):
    """Raised for HTTP 400 responses."""


class TossInvestAuthenticationError(TossInvestAPIError):
    """Raised for HTTP 401 responses."""


class TossInvestPermissionError(TossInvestAPIError):
    """Raised for HTTP 403 responses."""


class TossInvestNotFoundError(TossInvestAPIError):
    """Raised for HTTP 404 responses."""


class TossInvestRateLimitError(TossInvestAPIError):
    """Raised for HTTP 429 responses."""


class TossInvestServerError(TossInvestAPIError):
    """Raised for HTTP 5xx responses."""


def api_error_from_status(
    status_code: int,
    *,
    message: str | None = None,
    code: str | None = None,
    request_id: str | None = None,
    body: object | None = None,
    headers: Mapping[str, str] | None = None,
) -> TossInvestAPIError:
    error_message = message or f"Toss Invest API request failed with status {status_code}"
    error_class: type[TossInvestAPIError]

    if status_code == 400:
        error_class = TossInvestBadRequestError
    elif status_code == 401:
        error_class = TossInvestAuthenticationError
    elif status_code == 403:
        error_class = TossInvestPermissionError
    elif status_code == 404:
        error_class = TossInvestNotFoundError
    elif status_code == 429:
        error_class = TossInvestRateLimitError
    elif 500 <= status_code <= 599:
        error_class = TossInvestServerError
    else:
        error_class = TossInvestAPIError

    return error_class(
        error_message,
        status_code=status_code,
        code=code,
        request_id=request_id,
        body=body,
        headers=headers,
    )
