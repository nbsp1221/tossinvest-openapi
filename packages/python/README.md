# tossinvest-openapi for Python

Unofficial sync Python SDK for Toss Securities Open API.

> [!NOTE]
> This package uses only endpoints published in the official Toss Securities
> Open API documentation. It is not provided, endorsed, or supported by Toss
> Securities or Viva Republica.

## Status

| Area | Status |
| --- | --- |
| Runtime SDK | Usable, 0.x |
| Transport | Sync-only, requests |
| Typing | `py.typed`, standard Python typing |
| Runtime validation | Not included |
| Release package | PyPI |

## Requirements

- Python 3.12+
- Toss Securities Open API client credentials

## Installation

```sh
pip install tossinvest-openapi
```

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
