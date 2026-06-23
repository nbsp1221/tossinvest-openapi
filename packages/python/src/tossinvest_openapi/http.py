from __future__ import annotations

from collections.abc import Mapping
from typing import Any, NamedTuple, Protocol
from urllib.parse import urlencode, urljoin

import requests

from .errors import (
    TossInvestConnectionError,
    TossInvestTimeoutError,
    api_error_from_status,
)
from .types import TossInvestResponseMeta


class HttpRequest(NamedTuple):
    method: str
    url: str
    headers: Mapping[str, str]
    timeout: float
    json: Any = None
    data: Mapping[str, str] | None = None


class HttpSuccess(NamedTuple):
    data: object
    response: TossInvestResponseMeta


class SessionLike(Protocol):
    def request(self, **kwargs: Any) -> Any: ...


def build_url(
    base_url: str,
    path: str,
    query: Mapping[str, object | None] | None = None,
) -> str:
    base = base_url if base_url.endswith("/") else f"{base_url}/"
    url = urljoin(base, path.lstrip("/"))
    defined_query = {key: str(value) for key, value in (query or {}).items() if value is not None}

    if not defined_query:
        return url

    return f"{url}?{urlencode(defined_query)}"


def request_json(session: SessionLike, request: HttpRequest) -> HttpSuccess:
    try:
        response = session.request(
            method=request.method,
            url=request.url,
            headers=dict(request.headers),
            timeout=request.timeout,
            json=request.json,
            data=request.data,
        )
    except requests.Timeout as error:
        raise TossInvestTimeoutError(
            "Toss Invest API request timed out",
            cause=error,
        ) from error
    except requests.RequestException as error:
        raise TossInvestConnectionError(
            "Toss Invest API request failed before receiving a response",
            cause=error,
        ) from error

    body = _parse_json_body(response)
    headers = dict(response.headers)
    request_id = headers.get("x-request-id")
    meta = TossInvestResponseMeta(
        status_code=response.status_code,
        headers=headers,
        request_id=request_id,
    )

    if not response.ok:
        raise api_error_from_status(
            response.status_code,
            message=_extract_error_message(body),
            code=_extract_error_code(body),
            request_id=request_id or _extract_body_request_id(body),
            body=body,
            headers=headers,
        )

    return HttpSuccess(data=body, response=meta)


def _parse_json_body(response: Any) -> object:
    if not response.text:
        return None

    try:
        return response.json()
    except ValueError:
        return response.text


def _extract_error_code(body: object) -> str | None:
    if not isinstance(body, dict):
        return None

    error = body.get("error")
    if isinstance(error, dict):
        code = error.get("code")
        if isinstance(code, str):
            return code
    code = body.get("code")
    if isinstance(code, str):
        return code
    if isinstance(error, str):
        return error
    return None


def _extract_error_message(body: object) -> str | None:
    if not isinstance(body, dict):
        return None

    error = body.get("error")
    if isinstance(error, dict):
        message = error.get("message")
        if isinstance(message, str):
            return message
    message = body.get("message")
    if isinstance(message, str):
        return message
    error_description = body.get("error_description")
    if isinstance(error_description, str):
        return error_description
    return None


def _extract_body_request_id(body: object) -> str | None:
    if not isinstance(body, dict):
        return None

    error = body.get("error")
    if isinstance(error, dict):
        request_id = error.get("requestId")
        if isinstance(request_id, str):
            return request_id
    return None
