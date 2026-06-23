# Python MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a sync-only Python 0.1.0 MVP SDK for all Toss Securities OpenAPI 1.1.1 business operations.

**Architecture:** Build a thin handwritten Python SDK over `requests.Session`. Keep public client methods in `client.py`, token caching in `auth.py`, transport and response parsing in `http.py`, SDK exceptions in `errors.py`, and public typing contracts in `types.py`.

**Tech Stack:** Python 3.12, requests, standard `typing`, pytest, ruff, ty, uv, hatchling.

## Global Constraints

- Work in the isolated worktree at `/home/retn0/repositories/nbsp1221/tossinvest-openapi-python-mvp`.
- Keep the original checkout and user changes untouched.
- Python MVP is sync-only.
- Use `requests.Session` as the default transport.
- Do not add async client support in this MVP.
- Do not add automatic retry.
- Do not add runtime response validation.
- Do not add Pydantic or msgspec as dependencies.
- Do not add live integration tests requiring real Toss credentials.
- Do not publish to PyPI.
- Move Python package version from `0.0.0` to `0.1.0`.
- Include all 20 OpenAPI 1.1.1 business operations.
- Public client methods use `snake_case` and keyword-only parameters.
- Default business method return value is unwrapped `result`.
- `with_response=True` returns a wrapper with `data`, `raw`, and `response`.
- Include `py.typed`.
- Use standard `TypedDict`, `Literal`, and `NotRequired` where practical.
- Token issue/cache refresh is protected with `threading.Lock`.
- Do not claim full client thread-safety.
- Caller-owned `requests.Session` must not be closed by SDK `close()`.
- SDK-owned `requests.Session` must be closed by SDK `close()`.
- Run `mise run check` before completion.

---

## File Structure

- Modify: `packages/python/pyproject.toml`
  - Add `requests==2.34.2`.
  - Bump version to `0.1.0`.
- Modify: `uv.lock`
  - Updated by `uv sync` after dependency/version changes.
- Modify: `packages/python/src/tossinvest_openapi/__init__.py`
  - Export client, errors, version helpers, and public response types.
- Create: `packages/python/src/tossinvest_openapi/version.py`
  - Package metadata and default User-Agent constants.
- Create: `packages/python/src/tossinvest_openapi/errors.py`
  - SDK exception hierarchy and HTTP status mapping.
- Create: `packages/python/src/tossinvest_openapi/types.py`
  - Public response wrapper, response metadata, OAuth token, request/response `TypedDict` contracts.
- Create: `packages/python/src/tossinvest_openapi/http.py`
  - URL building, JSON/form request helpers, response parsing, error conversion.
- Create: `packages/python/src/tossinvest_openapi/auth.py`
  - Lazy OAuth2 token manager with cache, expiry skew, and lock.
- Create: `packages/python/src/tossinvest_openapi/client.py`
  - `TossInvestClient` and all 20 business operation methods.
- Modify: `packages/python/src/tossinvest_openapi/py.typed`
  - Keep the marker file included in the package.
- Replace: `packages/python/tests/test_package.py`
  - Public export and version tests.
- Create: `packages/python/tests/helpers.py`
  - Mock `requests.Session` helpers.
- Create: `packages/python/tests/test_errors.py`
  - Error hierarchy and metadata tests.
- Create: `packages/python/tests/test_http.py`
  - URL, response parsing, and error conversion tests.
- Create: `packages/python/tests/test_auth.py`
  - Token lazy/cache/expiry/lock tests.
- Create: `packages/python/tests/test_client.py`
  - Client lifecycle, unwrap, `with_response`, and operation request mapping tests.
- Modify: `packages/python/README.md`
  - Python SDK usage guide.
- Modify: `README.md`
  - Root Korean status and Python package section.
- Modify: `README.en.md`
  - Root English status and Python package section.

---

### Task 1: Package Metadata and Public Exports

**Files:**
- Modify: `packages/python/pyproject.toml`
- Modify: `packages/python/src/tossinvest_openapi/__init__.py`
- Create: `packages/python/src/tossinvest_openapi/version.py`
- Replace: `packages/python/tests/test_package.py`
- Modify: `uv.lock`

**Interfaces:**
- Produces:
  - `PACKAGE_NAME: Final[str]`
  - `VERSION: Final[str]`
  - `DEFAULT_USER_AGENT: Final[str]`
  - `get_package_info() -> PackageInfo`
  - `PackageInfo(TypedDict)`
- Consumes:
  - Existing package scaffold.

- [ ] **Step 1: Write failing public export tests**

Replace `packages/python/tests/test_package.py` with:

```python
from __future__ import annotations

from tossinvest_openapi import (
    DEFAULT_USER_AGENT,
    PACKAGE_NAME,
    VERSION,
    PackageInfo,
    get_package_info,
)


def test_package_info_exports_name_and_version() -> None:
    assert PACKAGE_NAME == "tossinvest-openapi"
    assert VERSION == "0.1.0"
    assert DEFAULT_USER_AGENT == "tossinvest-openapi-python/0.1.0"
    assert get_package_info() == {
        "name": "tossinvest-openapi",
        "version": "0.1.0",
    }


def test_package_info_type_is_exported() -> None:
    package_info: PackageInfo = get_package_info()

    assert package_info["name"] == "tossinvest-openapi"
    assert package_info["version"] == "0.1.0"
```

- [ ] **Step 2: Run the package tests and verify failure**

Run:

```sh
cd packages/python
uv run pytest tests/test_package.py
```

Expected: FAIL because `DEFAULT_USER_AGENT`, `PACKAGE_NAME`, `VERSION`, and `PackageInfo` are not exported yet.

- [ ] **Step 3: Add version module**

Create `packages/python/src/tossinvest_openapi/version.py`:

```python
from __future__ import annotations

from typing import Final, TypedDict

PACKAGE_NAME: Final[str] = "tossinvest-openapi"
VERSION: Final[str] = "0.1.0"
DEFAULT_USER_AGENT: Final[str] = f"{PACKAGE_NAME}-python/{VERSION}"


class PackageInfo(TypedDict):
    name: str
    version: str


def get_package_info() -> PackageInfo:
    return {
        "name": PACKAGE_NAME,
        "version": VERSION,
    }
```

- [ ] **Step 4: Update public exports**

Replace `packages/python/src/tossinvest_openapi/__init__.py` with:

```python
from __future__ import annotations

from .version import (
    DEFAULT_USER_AGENT,
    PACKAGE_NAME,
    VERSION,
    PackageInfo,
    get_package_info,
)

__version__ = VERSION

__all__ = [
    "DEFAULT_USER_AGENT",
    "PACKAGE_NAME",
    "PackageInfo",
    "VERSION",
    "__version__",
    "get_package_info",
]
```

- [ ] **Step 5: Bump Python package version and add requests**

Edit `packages/python/pyproject.toml`:

```toml
[project]
name = "tossinvest-openapi"
version = "0.1.0"
description = "Unofficial SDK for Toss Securities Open API"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
  "requests==2.34.2",
]
```

Keep the existing `[dependency-groups]`, `[build-system]`, hatch, pytest, and ruff sections unchanged.

- [ ] **Step 6: Sync dependencies**

Run:

```sh
uv sync --all-packages
```

Expected: `uv.lock` updates and installs `requests==2.34.2` plus its transitive dependencies.

- [ ] **Step 7: Run package tests and type checks**

Run:

```sh
cd packages/python
uv run pytest tests/test_package.py
uv run ruff check .
uv run ruff format --check .
uv run ty check .
```

Expected: all commands pass.

- [ ] **Step 8: Commit Task 1**

Run:

```sh
git add packages/python/pyproject.toml uv.lock packages/python/src/tossinvest_openapi/__init__.py packages/python/src/tossinvest_openapi/version.py packages/python/tests/test_package.py
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "🔖 Prepare Python 0.1.0 package metadata"
```

If the guard script cannot execute inside a linked worktree, validate with `--dry-run`, then execute it from the main repository path with:

```sh
GIT_DIR=/home/retn0/repositories/nbsp1221/tossinvest-openapi/.git/worktrees/tossinvest-openapi-python-mvp \
GIT_WORK_TREE=/home/retn0/repositories/nbsp1221/tossinvest-openapi-python-mvp \
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "🔖 Prepare Python 0.1.0 package metadata"
```

---

### Task 2: SDK Error Hierarchy

**Files:**
- Create: `packages/python/src/tossinvest_openapi/errors.py`
- Modify: `packages/python/src/tossinvest_openapi/__init__.py`
- Create: `packages/python/tests/test_errors.py`

**Interfaces:**
- Consumes:
  - Public exports from Task 1.
- Produces:
  - `TossInvestError`
  - `TossInvestConnectionError`
  - `TossInvestTimeoutError`
  - `TossInvestAPIError`
  - `TossInvestBadRequestError`
  - `TossInvestAuthenticationError`
  - `TossInvestPermissionError`
  - `TossInvestNotFoundError`
  - `TossInvestRateLimitError`
  - `TossInvestServerError`
  - `api_error_from_status(status_code: int, ...) -> TossInvestAPIError`

- [ ] **Step 1: Write failing error tests**

Create `packages/python/tests/test_errors.py`:

```python
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
```

- [ ] **Step 2: Run error tests and verify failure**

Run:

```sh
cd packages/python
uv run pytest tests/test_errors.py
```

Expected: FAIL because error classes do not exist.

- [ ] **Step 3: Implement error hierarchy**

Create `packages/python/src/tossinvest_openapi/errors.py`:

```python
from __future__ import annotations

from collections.abc import Mapping
from typing import Any


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
```

If `ruff` reports `Any` is unused, remove `from typing import Any`.

- [ ] **Step 4: Export error classes**

Update `packages/python/src/tossinvest_openapi/__init__.py` to include:

```python
from .errors import (
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
```

Add these names to `__all__`:

```python
    "TossInvestAPIError",
    "TossInvestAuthenticationError",
    "TossInvestBadRequestError",
    "TossInvestConnectionError",
    "TossInvestError",
    "TossInvestNotFoundError",
    "TossInvestPermissionError",
    "TossInvestRateLimitError",
    "TossInvestServerError",
    "TossInvestTimeoutError",
```

- [ ] **Step 5: Run error tests and checks**

Run:

```sh
cd packages/python
uv run pytest tests/test_errors.py
uv run ruff check .
uv run ruff format --check .
uv run ty check .
```

Expected: all commands pass.

- [ ] **Step 6: Commit Task 2**

Run:

```sh
git add packages/python/src/tossinvest_openapi/__init__.py packages/python/src/tossinvest_openapi/errors.py packages/python/tests/test_errors.py
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "🥅 Add Python SDK error hierarchy"
```

Use the linked-worktree `GIT_DIR`/`GIT_WORK_TREE` guard-script invocation from Task 1 if needed.

---

### Task 3: Public Types and HTTP Helpers

**Files:**
- Create: `packages/python/src/tossinvest_openapi/types.py`
- Create: `packages/python/src/tossinvest_openapi/http.py`
- Modify: `packages/python/src/tossinvest_openapi/__init__.py`
- Create: `packages/python/tests/test_http.py`

**Interfaces:**
- Consumes:
  - Error classes from Task 2.
- Produces:
  - `OAuth2Token(TypedDict)`
  - `TossInvestResponseMeta(NamedTuple)`
  - `TossInvestWithResponse[TData, TRaw](NamedTuple)`
  - `build_url(base_url: str, path: str, query: Mapping[str, object | None] | None = None) -> str`
  - `request_json(session: requests.Session, request: HttpRequest) -> HttpSuccess`
  - `HttpRequest(NamedTuple)`
  - `HttpSuccess(NamedTuple)`

- [ ] **Step 1: Write failing HTTP tests**

Create `packages/python/tests/test_http.py`:

```python
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

    def request(self, **kwargs: Any) -> FakeResponse:
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
```

- [ ] **Step 2: Run HTTP tests and verify failure**

Run:

```sh
cd packages/python
uv run pytest tests/test_http.py
```

Expected: FAIL because `types.py` and `http.py` do not exist.

- [ ] **Step 3: Implement public types**

Create `packages/python/src/tossinvest_openapi/types.py`:

```python
from __future__ import annotations

from collections.abc import Mapping
from typing import Generic, NamedTuple, NotRequired, TypeVar, TypedDict

TData = TypeVar("TData")
TRaw = TypeVar("TRaw")


class OAuth2Token(TypedDict):
    access_token: str
    token_type: str
    expires_in: int


class TossInvestResponseMeta(NamedTuple):
    status_code: int
    headers: Mapping[str, str]
    request_id: str | None = None


class TossInvestWithResponse(NamedTuple, Generic[TData, TRaw]):
    data: TData
    raw: TRaw
    response: TossInvestResponseMeta


class BrokerageAccount(TypedDict):
    accountNo: str
    accountSeq: int
    accountType: str


class APIEnvelope(TypedDict, Generic[TData]):
    result: NotRequired[TData]
```

- [ ] **Step 4: Implement HTTP helpers**

Create `packages/python/src/tossinvest_openapi/http.py`:

```python
from __future__ import annotations

from collections.abc import Mapping
from typing import Any, NamedTuple
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
    json: object | None = None
    data: Mapping[str, str] | None = None


class HttpSuccess(NamedTuple):
    data: object
    response: TossInvestResponseMeta


def build_url(
    base_url: str,
    path: str,
    query: Mapping[str, object | None] | None = None,
) -> str:
    base = base_url if base_url.endswith("/") else f"{base_url}/"
    url = urljoin(base, path.lstrip("/"))
    defined_query = {
        key: str(value)
        for key, value in (query or {}).items()
        if value is not None
    }

    if not defined_query:
        return url

    return f"{url}?{urlencode(defined_query)}"


def request_json(session: requests.Session, request: HttpRequest) -> HttpSuccess:
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


def _parse_json_body(response: requests.Response) -> object:
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
    if isinstance(error, dict) and isinstance(error.get("code"), str):
        return error["code"]
    if isinstance(body.get("code"), str):
        return body["code"]
    if isinstance(error, str):
        return error
    return None


def _extract_error_message(body: object) -> str | None:
    if not isinstance(body, dict):
        return None

    error = body.get("error")
    if isinstance(error, dict) and isinstance(error.get("message"), str):
        return error["message"]
    if isinstance(body.get("message"), str):
        return body["message"]
    if isinstance(body.get("error_description"), str):
        return body["error_description"]
    return None


def _extract_body_request_id(body: object) -> str | None:
    if not isinstance(body, dict):
        return None

    error = body.get("error")
    if isinstance(error, dict) and isinstance(error.get("requestId"), str):
        return error["requestId"]
    return None
```

If `ruff` reports `Any` is unused, remove `from typing import Any`.

- [ ] **Step 5: Export response types**

Update `packages/python/src/tossinvest_openapi/__init__.py`:

```python
from .types import OAuth2Token, TossInvestResponseMeta, TossInvestWithResponse
```

Add to `__all__`:

```python
    "OAuth2Token",
    "TossInvestResponseMeta",
    "TossInvestWithResponse",
```

- [ ] **Step 6: Run HTTP tests and checks**

Run:

```sh
cd packages/python
uv run pytest tests/test_http.py
uv run ruff check .
uv run ruff format --check .
uv run ty check .
```

Expected: all commands pass.

- [ ] **Step 7: Commit Task 3**

Run:

```sh
git add packages/python/src/tossinvest_openapi/__init__.py packages/python/src/tossinvest_openapi/types.py packages/python/src/tossinvest_openapi/http.py packages/python/tests/test_http.py
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "🏗️ Add Python HTTP foundation"
```

Use the linked-worktree `GIT_DIR`/`GIT_WORK_TREE` guard-script invocation from Task 1 if needed.

---

### Task 4: OAuth2 Token Manager

**Files:**
- Create: `packages/python/src/tossinvest_openapi/auth.py`
- Create: `packages/python/tests/test_auth.py`

**Interfaces:**
- Consumes:
  - `build_url`, `request_json`, `HttpRequest` from Task 3.
  - `OAuth2Token` from Task 3.
- Produces:
  - `TokenManager`
  - `TokenManager.get_access_token() -> str`
  - `TokenManager.issue_token() -> OAuth2Token`

- [ ] **Step 1: Write failing auth tests**

Create `packages/python/tests/test_auth.py`:

```python
from __future__ import annotations

from collections.abc import Mapping
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

    def request(self, **kwargs: Any) -> FakeResponse:
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
```

Remove `Mapping` if `ruff` reports it unused.

- [ ] **Step 2: Run auth tests and verify failure**

Run:

```sh
cd packages/python
uv run pytest tests/test_auth.py
```

Expected: FAIL because `auth.py` does not exist.

- [ ] **Step 3: Implement TokenManager**

Create `packages/python/src/tossinvest_openapi/auth.py`:

```python
from __future__ import annotations

import threading
import time
from typing import Callable, cast

import requests

from .http import HttpRequest, build_url, request_json
from .types import OAuth2Token


class TokenManager:
    def __init__(
        self,
        *,
        client_id: str,
        client_secret: str,
        base_url: str,
        session: requests.Session,
        timeout: float,
        user_agent: str | None = None,
        expiry_skew: float = 30.0,
        now: Callable[[], float] | None = None,
    ) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._base_url = base_url
        self._session = session
        self._timeout = timeout
        self._user_agent = user_agent
        self._expiry_skew = expiry_skew
        self._now = now or time.time
        self._lock = threading.Lock()
        self._token: OAuth2Token | None = None
        self._expires_at: float = 0.0

    def get_access_token(self) -> str:
        if self._token is not None and self._expires_at > self._now():
            return self._token["access_token"]

        with self._lock:
            if self._token is not None and self._expires_at > self._now():
                return self._token["access_token"]

            token = self.issue_token()
            self._token = token
            self._expires_at = self._now() + float(token["expires_in"]) - self._expiry_skew
            return token["access_token"]

    def issue_token(self) -> OAuth2Token:
        headers = {
            "content-type": "application/x-www-form-urlencoded",
        }
        if self._user_agent:
            headers["user-agent"] = self._user_agent

        result = request_json(
            self._session,
            HttpRequest(
                method="POST",
                url=build_url(self._base_url, "/oauth2/token"),
                headers=headers,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self._client_id,
                    "client_secret": self._client_secret,
                },
                timeout=self._timeout,
            ),
        )
        return cast(OAuth2Token, result.data)
```

- [ ] **Step 4: Run auth tests and checks**

Run:

```sh
cd packages/python
uv run pytest tests/test_auth.py
uv run ruff check .
uv run ruff format --check .
uv run ty check .
```

Expected: all commands pass.

- [ ] **Step 5: Commit Task 4**

Run:

```sh
git add packages/python/src/tossinvest_openapi/auth.py packages/python/tests/test_auth.py
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "🛂 Add Python OAuth token manager"
```

Use the linked-worktree `GIT_DIR`/`GIT_WORK_TREE` guard-script invocation from Task 1 if needed.

---

### Task 5: TossInvestClient Lifecycle and Core Response Handling

**Files:**
- Create: `packages/python/src/tossinvest_openapi/client.py`
- Modify: `packages/python/src/tossinvest_openapi/__init__.py`
- Create: `packages/python/tests/helpers.py`
- Create: `packages/python/tests/test_client.py`

**Interfaces:**
- Consumes:
  - `TokenManager` from Task 4.
  - `HttpRequest`, `build_url`, `request_json` from Task 3.
  - `TossInvestWithResponse` from Task 3.
- Produces:
  - `TossInvestClient`
  - `TossInvestClient.close() -> None`
  - `TossInvestClient.__enter__() -> TossInvestClient`
  - `TossInvestClient.__exit__(...) -> None`
  - `TossInvestClient.issue_oauth2_token() -> OAuth2Token`
  - Private `_request_envelope(...)`

- [ ] **Step 1: Write failing lifecycle and response tests**

Create `packages/python/tests/helpers.py`:

```python
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

    def request(self, **kwargs: Any) -> FakeResponse:
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
```

Create `packages/python/tests/test_client.py`:

```python
from __future__ import annotations

from tossinvest_openapi import TossInvestClient

from helpers import FakeResponse, FakeSession, oauth_response


def test_client_unwraps_result_and_lazily_authenticates() -> None:
    session = FakeSession(
        [
            oauth_response(),
            FakeResponse(
                {"result": [{"accountSeq": 1}]},
                headers={"x-request-id": "req_accounts"},
            ),
        ]
    )
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,  # type: ignore[arg-type]
    )

    assert client.get_accounts() == [{"accountSeq": 1}]
    assert session.calls[1]["method"] == "GET"
    assert session.calls[1]["url"] == "https://openapi.tossinvest.com/api/v1/accounts"
    assert session.calls[1]["headers"]["authorization"] == "Bearer token"


def test_client_returns_with_response_wrapper() -> None:
    session = FakeSession(
        [
            oauth_response(),
            FakeResponse({"result": []}, headers={"x-request-id": "req_accounts"}),
        ]
    )
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,  # type: ignore[arg-type]
    )

    result = client.get_accounts(with_response=True)

    assert result.data == []
    assert result.raw == {"result": []}
    assert result.response.status_code == 200
    assert result.response.request_id == "req_accounts"


def test_client_close_does_not_close_caller_owned_session() -> None:
    session = FakeSession([])
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,  # type: ignore[arg-type]
    )

    client.close()

    assert session.closed is False


def test_client_context_manager_closes_owned_session() -> None:
    client = TossInvestClient(client_id="client", client_secret="secret")

    with client as entered:
        assert entered is client

    assert client.is_closed is True


def test_issue_oauth2_token_exposes_auth_operation() -> None:
    session = FakeSession([oauth_response("manual-token")])
    client = TossInvestClient(
        client_id="client",
        client_secret="secret",
        session=session,  # type: ignore[arg-type]
    )

    assert client.issue_oauth2_token()["access_token"] == "manual-token"
```

- [ ] **Step 2: Run client tests and verify failure**

Run:

```sh
cd packages/python
uv run pytest tests/test_client.py
```

Expected: FAIL because `TossInvestClient` does not exist.

- [ ] **Step 3: Implement core client**

Create `packages/python/src/tossinvest_openapi/client.py`:

```python
from __future__ import annotations

from types import TracebackType
from typing import Any, Literal, overload, cast

import requests

from .auth import TokenManager
from .http import HttpRequest, build_url, request_json
from .types import OAuth2Token, TossInvestWithResponse
from .version import DEFAULT_USER_AGENT

DEFAULT_BASE_URL = "https://openapi.tossinvest.com"
DEFAULT_TIMEOUT = 30.0


class TossInvestClient:
    def __init__(
        self,
        *,
        client_id: str,
        client_secret: str,
        base_url: str = DEFAULT_BASE_URL,
        session: requests.Session | None = None,
        timeout: float = DEFAULT_TIMEOUT,
        user_agent: str = DEFAULT_USER_AGENT,
    ) -> None:
        self._base_url = base_url
        self._session = session or requests.Session()
        self._owns_session = session is None
        self._timeout = timeout
        self._user_agent = user_agent
        self._closed = False
        self._token_manager = TokenManager(
            client_id=client_id,
            client_secret=client_secret,
            base_url=base_url,
            session=self._session,
            timeout=timeout,
            user_agent=user_agent,
        )

    @property
    def is_closed(self) -> bool:
        return self._closed

    def close(self) -> None:
        if self._owns_session and not self._closed:
            self._session.close()
        self._closed = True

    def __enter__(self) -> TossInvestClient:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        self.close()

    def issue_oauth2_token(self) -> OAuth2Token:
        return self._token_manager.issue_token()

    @overload
    def get_accounts(self, *, timeout: float | None = None) -> object: ...

    @overload
    def get_accounts(
        self,
        *,
        timeout: float | None = None,
        with_response: Literal[True],
    ) -> TossInvestWithResponse[object, object]: ...

    def get_accounts(
        self,
        *,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/accounts",
            method="GET",
            query=None,
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def _request_envelope(
        self,
        *,
        path: str,
        method: str,
        query: dict[str, object | None] | None,
        account_seq: int | None,
        timeout: float | None,
        with_response: bool,
        body: object | None = None,
    ) -> object | TossInvestWithResponse[object, object]:
        headers = {
            "authorization": f"Bearer {self._token_manager.get_access_token()}",
            "user-agent": self._user_agent,
        }
        if account_seq is not None:
            headers["x-tossinvest-account"] = str(account_seq)

        request = HttpRequest(
            method=method,
            url=build_url(self._base_url, path, query),
            headers=headers,
            json=body,
            timeout=timeout or self._timeout,
        )
        result = request_json(self._session, request)
        raw = cast(dict[str, object], result.data)
        data = raw.get("result")

        if with_response:
            return TossInvestWithResponse(data=data, raw=raw, response=result.response)

        return data
```

Remove unused imports if `ruff` reports them.

- [ ] **Step 4: Export client**

Update `packages/python/src/tossinvest_openapi/__init__.py`:

```python
from .client import TossInvestClient
```

Add `"TossInvestClient"` to `__all__`.

- [ ] **Step 5: Run lifecycle/response tests and checks**

Run:

```sh
cd packages/python
uv run pytest tests/test_client.py
uv run ruff check .
uv run ruff format --check .
uv run ty check .
```

Expected: all commands pass.

- [ ] **Step 6: Commit Task 5**

Run:

```sh
git add packages/python/src/tossinvest_openapi/__init__.py packages/python/src/tossinvest_openapi/client.py packages/python/tests/helpers.py packages/python/tests/test_client.py
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "✨ Add Python SDK client foundation"
```

Use the linked-worktree `GIT_DIR`/`GIT_WORK_TREE` guard-script invocation from Task 1 if needed.

---

### Task 6: All Business Operation Methods

**Files:**
- Modify: `packages/python/src/tossinvest_openapi/client.py`
- Modify: `packages/python/src/tossinvest_openapi/types.py`
- Modify: `packages/python/tests/test_client.py`

**Interfaces:**
- Consumes:
  - `_request_envelope(...)` from Task 5.
- Produces:
  - All 20 business operation methods listed in the spec.

- [ ] **Step 1: Add request mapping test cases**

Append this to `packages/python/tests/test_client.py`:

```python
from collections.abc import Callable
from typing import NamedTuple


class ExpectedRequest(NamedTuple):
    method: str
    url: str
    headers: dict[str, str]
    json: object | None = None


class ClientRequestCase(NamedTuple):
    name: str
    invoke: Callable[[TossInvestClient], object]
    expected: ExpectedRequest


ACCOUNT_HEADERS = {
    "authorization": "Bearer token",
    "x-tossinvest-account": "1",
}


REQUEST_MAPPING_CASES = [
    ClientRequestCase(
        "get_orderbook",
        lambda client: client.get_orderbook(symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/orderbook?symbol=005930",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_prices",
        lambda client: client.get_prices(symbols="005930,AAPL"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/prices?symbols=005930%2CAAPL",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_trades",
        lambda client: client.get_trades(symbol="AAPL", count=2),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/trades?symbol=AAPL&count=2",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_price_limit",
        lambda client: client.get_price_limit(symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/price-limits?symbol=005930",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_candles",
        lambda client: client.get_candles(symbol="005930", interval="1d", count=10),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/candles?symbol=005930&interval=1d&count=10",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_stocks",
        lambda client: client.get_stocks(symbols="005930,AAPL"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/stocks?symbols=005930%2CAAPL",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_stock_warnings",
        lambda client: client.get_stock_warnings(symbol="BRK.B"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/stocks/BRK.B/warnings",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_exchange_rate",
        lambda client: client.get_exchange_rate(
            date_time="2026-03-25T09:30:00+09:00",
            base_currency="USD",
            quote_currency="KRW",
        ),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/exchange-rate?dateTime=2026-03-25T09%3A30%3A00%2B09%3A00&baseCurrency=USD&quoteCurrency=KRW",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_kr_market_calendar",
        lambda client: client.get_kr_market_calendar(date="2026-03-25"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/market-calendar/KR?date=2026-03-25",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_us_market_calendar",
        lambda client: client.get_us_market_calendar(date="2026-03-25"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/market-calendar/US?date=2026-03-25",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_accounts",
        lambda client: client.get_accounts(),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/accounts",
            {"authorization": "Bearer token"},
        ),
    ),
    ClientRequestCase(
        "get_holdings",
        lambda client: client.get_holdings(account_seq=1, symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/holdings?symbol=005930",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "get_orders",
        lambda client: client.get_orders(
            account_seq=1,
            status="CLOSED",
            symbol="005930",
            from_date="2026-03-01",
            to_date="2026-03-31",
            cursor="next",
            limit=20,
        ),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/orders?status=CLOSED&symbol=005930&from=2026-03-01&to=2026-03-31&cursor=next&limit=20",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "create_order",
        lambda client: client.create_order(
            account_seq=1,
            symbol="005930",
            side="BUY",
            order_type="LIMIT",
            quantity="10",
            price="70000",
        ),
        ExpectedRequest(
            "POST",
            "https://openapi.tossinvest.com/api/v1/orders",
            ACCOUNT_HEADERS,
            {
                "symbol": "005930",
                "side": "BUY",
                "orderType": "LIMIT",
                "quantity": "10",
                "price": "70000",
            },
        ),
    ),
    ClientRequestCase(
        "get_order",
        lambda client: client.get_order(account_seq=1, order_id="order/1"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/orders/order%2F1",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "modify_order",
        lambda client: client.modify_order(
            account_seq=1,
            order_id="order/1",
            order_type="LIMIT",
            quantity="15",
            price="71000",
        ),
        ExpectedRequest(
            "POST",
            "https://openapi.tossinvest.com/api/v1/orders/order%2F1/modify",
            ACCOUNT_HEADERS,
            {
                "orderType": "LIMIT",
                "quantity": "15",
                "price": "71000",
            },
        ),
    ),
    ClientRequestCase(
        "cancel_order",
        lambda client: client.cancel_order(account_seq=1, order_id="order/1"),
        ExpectedRequest(
            "POST",
            "https://openapi.tossinvest.com/api/v1/orders/order%2F1/cancel",
            ACCOUNT_HEADERS,
            {},
        ),
    ),
    ClientRequestCase(
        "get_buying_power",
        lambda client: client.get_buying_power(account_seq=1, currency="KRW"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/buying-power?currency=KRW",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "get_sellable_quantity",
        lambda client: client.get_sellable_quantity(account_seq=1, symbol="005930"),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/sellable-quantity?symbol=005930",
            ACCOUNT_HEADERS,
        ),
    ),
    ClientRequestCase(
        "get_commissions",
        lambda client: client.get_commissions(account_seq=1),
        ExpectedRequest(
            "GET",
            "https://openapi.tossinvest.com/api/v1/commissions",
            ACCOUNT_HEADERS,
        ),
    ),
]


def test_all_business_operations_map_to_expected_requests() -> None:
    for case in REQUEST_MAPPING_CASES:
        session = FakeSession([oauth_response(), FakeResponse({"result": []})])
        client = TossInvestClient(
            client_id="client",
            client_secret="secret",
            session=session,  # type: ignore[arg-type]
        )

        case.invoke(client)

        request = session.calls[1]
        assert request["method"] == case.expected.method, case.name
        assert request["url"] == case.expected.url, case.name
        for header_name, header_value in case.expected.headers.items():
            assert request["headers"][header_name] == header_value, case.name
        if case.expected.json is not None:
            assert request["json"] == case.expected.json, case.name
```

- [ ] **Step 2: Run client mapping tests and verify failure**

Run:

```sh
cd packages/python
uv run pytest tests/test_client.py::test_all_business_operations_map_to_expected_requests
```

Expected: FAIL because most client methods do not exist.

- [ ] **Step 3: Add helper imports to client**

In `packages/python/src/tossinvest_openapi/client.py`, add:

```python
from urllib.parse import quote
```

- [ ] **Step 4: Implement all operation methods**

Add these methods to `TossInvestClient`:

```python
    def get_orderbook(
        self,
        *,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/orderbook",
            method="GET",
            query={"symbol": symbol},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_prices(
        self,
        *,
        symbols: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/prices",
            method="GET",
            query={"symbols": symbols},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_trades(
        self,
        *,
        symbol: str,
        count: int | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/trades",
            method="GET",
            query={"symbol": symbol, "count": count},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_price_limit(
        self,
        *,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/price-limits",
            method="GET",
            query={"symbol": symbol},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_candles(
        self,
        *,
        symbol: str,
        interval: str,
        count: int | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/candles",
            method="GET",
            query={"symbol": symbol, "interval": interval, "count": count},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_stocks(
        self,
        *,
        symbols: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/stocks",
            method="GET",
            query={"symbols": symbols},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_stock_warnings(
        self,
        *,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/stocks/{quote(symbol, safe='')}/warnings",
            method="GET",
            query=None,
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_exchange_rate(
        self,
        *,
        date_time: str,
        base_currency: str,
        quote_currency: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/exchange-rate",
            method="GET",
            query={
                "dateTime": date_time,
                "baseCurrency": base_currency,
                "quoteCurrency": quote_currency,
            },
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_kr_market_calendar(
        self,
        *,
        date: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/market-calendar/KR",
            method="GET",
            query={"date": date},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_us_market_calendar(
        self,
        *,
        date: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/market-calendar/US",
            method="GET",
            query={"date": date},
            account_seq=None,
            timeout=timeout,
            with_response=with_response,
        )

    def get_holdings(
        self,
        *,
        account_seq: int,
        symbol: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/holdings",
            method="GET",
            query={"symbol": symbol},
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def get_orders(
        self,
        *,
        account_seq: int,
        status: str | None = None,
        symbol: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        cursor: str | None = None,
        limit: int | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/orders",
            method="GET",
            query={
                "status": status,
                "symbol": symbol,
                "from": from_date,
                "to": to_date,
                "cursor": cursor,
                "limit": limit,
            },
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def create_order(
        self,
        *,
        account_seq: int,
        symbol: str,
        side: str,
        order_type: str,
        quantity: str,
        price: str | None = None,
        client_order_id: str | None = None,
        time_in_force: str | None = None,
        confirm_high_value_order: bool | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/orders",
            method="POST",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
            body={
                "symbol": symbol,
                "side": side,
                "orderType": order_type,
                "quantity": quantity,
                "price": price,
                "clientOrderId": client_order_id,
                "timeInForce": time_in_force,
                "confirmHighValueOrder": confirm_high_value_order,
            },
        )

    def get_order(
        self,
        *,
        account_seq: int,
        order_id: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/orders/{quote(order_id, safe='')}",
            method="GET",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def modify_order(
        self,
        *,
        account_seq: int,
        order_id: str,
        order_type: str,
        quantity: str,
        price: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/orders/{quote(order_id, safe='')}/modify",
            method="POST",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
            body={"orderType": order_type, "quantity": quantity, "price": price},
        )

    def cancel_order(
        self,
        *,
        account_seq: int,
        order_id: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path=f"/api/v1/orders/{quote(order_id, safe='')}/cancel",
            method="POST",
            query=None,
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
            body={},
        )

    def get_buying_power(
        self,
        *,
        account_seq: int,
        currency: str | None = None,
        symbol: str | None = None,
        side: str | None = None,
        order_type: str | None = None,
        price: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/buying-power",
            method="GET",
            query={
                "currency": currency,
                "symbol": symbol,
                "side": side,
                "orderType": order_type,
                "price": price,
            },
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def get_sellable_quantity(
        self,
        *,
        account_seq: int,
        symbol: str,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/sellable-quantity",
            method="GET",
            query={"symbol": symbol},
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )

    def get_commissions(
        self,
        *,
        account_seq: int,
        symbol: str | None = None,
        side: str | None = None,
        order_type: str | None = None,
        quantity: str | None = None,
        price: str | None = None,
        timeout: float | None = None,
        with_response: bool = False,
    ) -> object | TossInvestWithResponse[object, object]:
        return self._request_envelope(
            path="/api/v1/commissions",
            method="GET",
            query={
                "symbol": symbol,
                "side": side,
                "orderType": order_type,
                "quantity": quantity,
                "price": price,
            },
            account_seq=account_seq,
            timeout=timeout,
            with_response=with_response,
        )
```

- [ ] **Step 5: Filter `None` values from JSON request bodies**

In `_request_envelope`, before creating `HttpRequest`, add:

```python
        request_body = None
        if isinstance(body, dict):
            request_body = {key: value for key, value in body.items() if value is not None}
        elif body is not None:
            request_body = body
```

Then pass `json=request_body` instead of `json=body`.

- [ ] **Step 6: Run mapping tests and checks**

Run:

```sh
cd packages/python
uv run pytest tests/test_client.py
uv run ruff check .
uv run ruff format --check .
uv run ty check .
```

Expected: all commands pass.

- [ ] **Step 7: Commit Task 6**

Run:

```sh
git add packages/python/src/tossinvest_openapi/client.py packages/python/src/tossinvest_openapi/types.py packages/python/tests/test_client.py
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "✨ Add Python business operation methods"
```

Use the linked-worktree `GIT_DIR`/`GIT_WORK_TREE` guard-script invocation from Task 1 if needed.

---

### Task 7: Documentation Refresh

**Files:**
- Modify: `packages/python/README.md`
- Modify: `README.md`
- Modify: `README.en.md`

**Interfaces:**
- Consumes:
  - Public Python SDK APIs from Tasks 1-6.
- Produces:
  - Accurate user-facing documentation for the Python MVP.

- [ ] **Step 1: Replace Python README**

Replace `packages/python/README.md` with:

````markdown
# tossinvest-openapi for Python

Unofficial sync Python SDK for Toss Securities Open API.

> [!NOTE]
> This package uses only endpoints published in the official Toss Securities
> Open API documentation. It is not provided, endorsed, or supported by Toss
> Securities or Viva Republica.

## Status

| Area | Status |
| --- | --- |
| Runtime SDK | Implemented, pre-release |
| Transport | Sync-only, requests |
| Typing | `py.typed`, standard Python typing |
| Runtime validation | Not included |
| Release package | Not published |

## Requirements

- Python 3.12+
- Toss Securities Open API client credentials

## Installation

This package is managed inside the repository workspace. PyPI publication is
not part of the current MVP.

## Quick Start

```python
from tossinvest_openapi import TossInvestClient

with TossInvestClient(
    client_id="...",
    client_secret="...",
) as client:
    accounts = client.get_accounts()
    prices = client.get_prices(symbols="005930,AAPL")

print(accounts, prices)
```

> [!WARNING]
> Keep `client_secret` on the server side. Do not expose it in browsers,
> mobile apps, public repositories, logs, or crash reports.

## Authentication

The SDK handles OAuth2 Client Credentials internally. It issues an access token
on the first business API call, caches it in memory, and refreshes it after
expiry.

Prefer one `TossInvestClient` instance per credential set.

## Responses

Business methods return the unwrapped `result` payload by default.

```python
accounts = client.get_accounts()
```

Use `with_response=True` when you need the raw envelope or HTTP metadata.

```python
response = client.get_accounts(with_response=True)

print(response.data)
print(response.raw)
print(response.response.status_code)
print(response.response.request_id)
```

## Lifecycle

Use a context manager or call `close()` explicitly.

```python
with TossInvestClient(client_id="...", client_secret="...") as client:
    accounts = client.get_accounts()
```

```python
client = TossInvestClient(client_id="...", client_secret="...")
try:
    accounts = client.get_accounts()
finally:
    client.close()
```

## Errors

The SDK exposes domain exceptions such as `TossInvestAPIError`,
`TossInvestAuthenticationError`, `TossInvestRateLimitError`,
`TossInvestConnectionError`, and `TossInvestTimeoutError`.

```python
from tossinvest_openapi import TossInvestAPIError, TossInvestConnectionError

try:
    client.get_accounts()
except TossInvestAPIError as error:
    print(error.status_code, error.code, error.request_id)
except TossInvestConnectionError as error:
    print(error.cause)
```

Do not log full error objects or HTTP metadata. They may contain secrets,
tokens, account data, or order data.

## Orders

Order methods are exposed because they are part of the official OpenAPI
document. They can change real account state. Add explicit user confirmation at
the application layer before calling `create_order`, `modify_order`, or
`cancel_order`.

The SDK does not retry automatically.

## Development

From this package directory:

```sh
mise run check
```

From the repository root:

```sh
mise run check
```
````

- [ ] **Step 2: Update root Korean README status**

In `README.md`, update the status table Python row from planned/scaffolded to implemented/pre-release:

```markdown
| Python           | 구현됨, pre-release | 공식 OpenAPI 1.1.1의 business operation을 sync client로 제공합니다.       |
```

Update any sentence that says Python is only planned so it points to `packages/python/README.md` for Python usage.

- [ ] **Step 3: Update root English README status**

In `README.en.md`, update the status table Python row:

```markdown
| Python | Implemented, pre-release | Provides a sync client for the business operations in the official OpenAPI 1.1.1 document. |
```

Update any sentence that says Python is only planned so it points to `packages/python/README.md` for Python usage.

- [ ] **Step 4: Run documentation-related checks**

Run:

```sh
mise run check
```

Expected: all checks pass.

- [ ] **Step 5: Commit Task 7**

Run:

```sh
git add README.md README.en.md packages/python/README.md
python /home/retn0/.codex/skills/commit/scripts/commit-guard.py --convention gitmoji --message "📝 Document Python MVP SDK"
```

Use the linked-worktree `GIT_DIR`/`GIT_WORK_TREE` guard-script invocation from Task 1 if needed.

---

### Task 8: Final Verification and Package Audit

**Files:**
- No source files should be changed unless verification exposes a concrete issue.

**Interfaces:**
- Consumes:
  - Complete implementation from Tasks 1-7.
- Produces:
  - Verified Python MVP branch ready for review.

- [ ] **Step 1: Run package-specific verification**

Run:

```sh
cd packages/python
uv run pytest tests
uv run ruff check .
uv run ruff format --check .
uv run ty check .
uv build
```

Expected:

- pytest passes all Python tests.
- ruff reports no lint errors.
- ruff format reports files already formatted.
- ty reports all checks passed.
- uv builds sdist and wheel for `tossinvest-openapi==0.1.0`.

- [ ] **Step 2: Run root verification**

Run:

```sh
mise run check
```

Expected:

- OpenAPI spec check passes for version `1.1.1`.
- TypeScript lint/format/typecheck/test/build still pass.
- Python lint/typecheck/test/build pass.
- TypeScript version sync still passes.

- [ ] **Step 3: Inspect package contents**

Run:

```sh
cd packages/python
uv build
python -m zipfile -l ../../dist/tossinvest_openapi-0.1.0-py3-none-any.whl
```

Expected wheel contents include:

- `tossinvest_openapi/__init__.py`
- `tossinvest_openapi/auth.py`
- `tossinvest_openapi/client.py`
- `tossinvest_openapi/errors.py`
- `tossinvest_openapi/http.py`
- `tossinvest_openapi/types.py`
- `tossinvest_openapi/version.py`
- `tossinvest_openapi/py.typed`
- `tossinvest_openapi-0.1.0.dist-info/METADATA`

- [ ] **Step 4: Check git state**

Run:

```sh
git status --short --branch
git log --oneline --decorate -8
```

Expected:

- Branch is `feature/python-mvp`.
- Working tree is clean.
- Recent commits include the plan/spec commit and task commits.

- [ ] **Step 5: Report final status**

Report:

- Worktree path.
- Branch name.
- Final commit hash.
- Verification commands and pass/fail status.
- Any intentionally excluded scope: async, retry, runtime validation, PyPI publish.
