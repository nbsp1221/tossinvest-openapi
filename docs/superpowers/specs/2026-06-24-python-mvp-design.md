# Python MVP Design

## Goal

Implement a Python 0.1.0 MVP SDK for Toss Securities Open API with the same
product scope as the TypeScript 0.1.0 MVP, while prioritizing Python ecosystem
DX over one-to-one TypeScript API symmetry.

The Python MVP must provide a usable sync SDK for all business operations in
the pinned Toss Securities OpenAPI 1.1.1 contract. It must remain a thin SDK:
handle authentication, request mapping, response unwrapping, typed public
interfaces, predictable errors, lifecycle management, tests, and documentation.

## Non-Goals

- No async client in the MVP.
- No automatic retry.
- No runtime response validation.
- No Pydantic or msgspec dependency in the default package.
- No live integration tests that require real Toss credentials.
- No PyPI publication as part of the MVP implementation.
- No browser, mobile, or non-CPython runtime support claim.

## Decisions

### Client Shape

The public SDK starts with one sync client:

```python
from tossinvest_openapi import TossInvestClient

with TossInvestClient(
    client_id="...",
    client_secret="...",
) as client:
    accounts = client.get_accounts()
    prices = client.get_prices(symbols="005930,AAPL")
```

Public methods use Python naming and call conventions:

- `snake_case` method names.
- Keyword-only parameters.
- Flat operation methods rather than nested service objects.
- `with_response=True` for raw envelope and response metadata access.

The MVP includes all 20 business operations from OpenAPI 1.1.1:

- `get_orderbook`
- `get_prices`
- `get_trades`
- `get_price_limit`
- `get_candles`
- `get_stocks`
- `get_stock_warnings`
- `get_exchange_rate`
- `get_kr_market_calendar`
- `get_us_market_calendar`
- `get_accounts`
- `get_holdings`
- `get_orders`
- `create_order`
- `get_order`
- `modify_order`
- `cancel_order`
- `get_buying_power`
- `get_sellable_quantity`
- `get_commissions`

### HTTP Transport

Use `requests.Session` as the default sync transport.

Rationale:

- `requests` remains active and stable in 2026, including 2026 releases and
  inline typing improvements.
- It is the conventional choice for sync Python SDKs.
- Its `Session` model maps cleanly to this SDK's credential-scoped client.
- `httpx` is still a good future async path, but its current release posture is
  less compelling for a sync-only MVP.

The client accepts an optional `requests.Session`. If the caller supplies a
session, the SDK does not own or close it. If the SDK creates the session,
`close()` closes it.

### Lifecycle

Support both explicit close and context manager usage:

```python
client = TossInvestClient(client_id="...", client_secret="...")
try:
    accounts = client.get_accounts()
finally:
    client.close()
```

```python
with TossInvestClient(client_id="...", client_secret="...") as client:
    accounts = client.get_accounts()
```

### Authentication

OAuth2 Client Credentials handling is internal to the SDK.

- Token issuance is lazy.
- Tokens are cached in memory per client instance.
- Token expiry uses an expiry skew.
- Token issue/cache refresh is protected with `threading.Lock`.
- The SDK does not guarantee full client thread-safety.
- Documentation recommends one client instance per credential set.

The public client also exposes `issue_oauth2_token()` for explicit token issue,
matching the OpenAPI auth operation while keeping normal business calls lazy.

### Response Model

Business methods return the unwrapped `result` payload by default:

```python
accounts = client.get_accounts()
```

When `with_response=True`, methods return a wrapper:

```python
response = client.get_accounts(with_response=True)

response.data
response.raw
response.response.status_code
response.response.request_id
```

The response wrapper should be a small typed Python object, preferably a
`NamedTuple` or frozen dataclass. It must expose:

- `data`
- `raw`
- `response`

Response metadata exposes:

- `status_code`
- `headers`
- `request_id`

### Typing

Use standard Python typing:

- Include `py.typed`.
- Use `TypedDict`, `Literal`, and `NotRequired` for public request/response
  shapes where practical.
- Prefer method signatures for request parameters over forcing users to build
  parameter dictionaries.
- Cast parsed JSON to the relevant typed shape after parsing.

Do not add runtime response validation in the MVP. This matches the thin SDK
scope and avoids adding Pydantic/msgspec complexity before there is evidence
that callers need strict runtime models.

Pydantic `TypeAdapter` or another validation layer can be evaluated later as an
optional extra or strict mode.

### Errors

Expose a Python SDK exception hierarchy optimized for catchability and
metadata access:

```text
TossInvestError
├── TossInvestConnectionError
│   └── TossInvestTimeoutError
└── TossInvestAPIError
    ├── TossInvestBadRequestError        # 400
    ├── TossInvestAuthenticationError    # 401
    ├── TossInvestPermissionError        # 403
    ├── TossInvestNotFoundError          # 404
    ├── TossInvestRateLimitError         # 429
    └── TossInvestServerError            # 5xx
```

Each SDK exception exposes relevant metadata:

- `status_code`
- `code`
- `request_id`
- `body`
- `headers`
- `cause`

`requests.Timeout` maps to `TossInvestTimeoutError`.
Other transport-level `requests.RequestException` failures map to
`TossInvestConnectionError`.
HTTP error responses map to status-specific API errors when possible and fall
back to `TossInvestAPIError`.

The SDK does not retry automatically. This is especially important because the
package exposes order operations that can change account state.

### Package Version and Status

Python moves from scaffold-only `0.0.0` to implemented pre-release `0.1.0`.

Update:

- `packages/python/pyproject.toml`
- `tossinvest_openapi.__version__`
- Python README
- root README status table
- English README equivalents if present

PyPI publishing is outside this MVP. Package build verification is in scope.

## Proposed File Structure

```text
packages/python/src/tossinvest_openapi/
  __init__.py
  auth.py
  client.py
  errors.py
  http.py
  types.py
  version.py
  py.typed
```

Test helpers can live under:

```text
packages/python/tests/
  helpers/
```

## Testing Requirements

The MVP must include tests for:

- Public exports and version metadata.
- OAuth lazy issue.
- OAuth cache reuse.
- OAuth expiry refresh.
- OAuth lock behavior for concurrent token misses.
- Request mapping for all 20 business operations.
- Account header mapping for account-scoped operations.
- JSON body mapping for order operations.
- Default `result` unwrapping.
- `with_response=True` wrapper behavior.
- API error subclass mapping by status code.
- Error metadata extraction, including request id.
- Timeout wrapping.
- Connection error wrapping.
- `close()`.
- Context manager lifecycle.
- Caller-owned session not being closed by SDK.

## Verification Requirements

Before completion, run and pass:

```sh
uv run pytest tests
uv run ruff check .
uv run ruff format --check .
uv run ty check .
uv build
mise run check
```

## Documentation Requirements

Python README must document:

- Current status: implemented, pre-release.
- Python 3.12+ requirement.
- Sync-only client.
- `requests` transport.
- Credential handling and server-side secret warning.
- Basic account/price examples.
- Order warning.
- `with_response=True`.
- Error handling.
- Timeout behavior.
- `close()` and context manager usage.
- No automatic retry.

Root README files must update the Python status from planned/scaffolded to
implemented/pre-release after the SDK is implemented.

## Research Notes

The stack choices were reviewed against 2026 Python ecosystem signals:

- `requests` remains stable and active for sync Python SDKs.
- `httpx` remains attractive for future async support but is not required for a
  sync-only MVP.
- Standard `typing` with `TypedDict`, `Literal`, and `NotRequired` is the right
  default for a thin SDK that does not perform runtime validation.
- Pydantic and msgspec remain strong options for validation-heavy SDKs, but
  they are intentionally outside this MVP's default dependency set.
- Python SDK error UX is better with a small domain exception hierarchy than by
  leaking raw `requests` exceptions or exposing only one generic error type.
