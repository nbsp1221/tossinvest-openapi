# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tossinvest-openapi.svg)](https://www.npmjs.com/package/tossinvest-openapi)
[![PyPI version](https://img.shields.io/pypi/v/tossinvest-openapi.svg)](https://pypi.org/project/tossinvest-openapi/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

Unofficial SDK project for Toss Securities Open API. The TypeScript SDK is available on npm, and the Python SDK is available on PyPI.

> [!NOTE]
> This project uses only endpoints published in the official Toss Securities Open API documentation.
> It is not provided, endorsed, or supported by Toss Securities or Viva Republica.

[한국어](README.md)

## Quick Start

The TypeScript SDK can be installed from npm.

```sh
npm install tossinvest-openapi
# or
pnpm add tossinvest-openapi
```

```ts
import { TossInvestClient } from "tossinvest-openapi";

const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});

const accounts = await client.getAccounts();
const prices = await client.getPrices({ symbols: "005930,AAPL" });

console.log({
  accountCount: accounts.length,
  priceCount: prices.length,
});
```

The Python SDK can be installed from PyPI.

```sh
pip install tossinvest-openapi
```

```python
from tossinvest_openapi import TossInvestClient

with TossInvestClient(
    client_id="...",
    client_secret="...",
) as client:
    accounts = client.get_accounts()
    prices = client.get_prices(symbols="005930,AAPL")
```

> [!WARNING]
> Use `clientSecret` / `client_secret` only in server-side environments. Do not expose it in
> browsers, mobile apps, public repositories, or client bundles.

## Package Status

| Package    | Status      | Description                                                       |
| ---------- | ----------- | ----------------------------------------------------------------- |
| TypeScript | Usable, 0.x | Provides account, market data, and order APIs from OpenAPI 1.1.1. |
| Python     | Usable, 0.x | Provides sync account, market data, and order APIs.               |
| OpenAPI    | Based on 1.1.1 | Types and methods are maintained against the official OpenAPI document. |

## Supported Scope

The SDKs support the main APIs in the Toss Securities OpenAPI 1.1.1 document.

| Area                                                      | Supported |
| --------------------------------------------------------- | --------- |
| OAuth2 Client Credentials authentication                  | Yes       |
| Accounts, balances, and holdings                          | Yes       |
| Domestic and overseas market data                         | Yes       |
| Buying power, sellable quantity, and commission prechecks | Yes       |
| Create, modify, and cancel orders                         | Yes       |
| Order list and order detail lookup                        | Yes       |
| WebSocket/realtime streaming                              | No        |

See the [TypeScript package README](packages/typescript/README.md) and [Python package README](packages/python/README.md) for detailed usage.

## Why Use This SDK?

- Uses TypeScript and Python types derived from the official Toss Securities Open API schema.
- Handles OAuth2 Client Credentials authentication inside the SDK.
- Returns unwrapped `result` payloads by default while allowing access to raw responses and HTTP metadata.
- Exposes order APIs explicitly as state-changing operations.
- Does not use reverse engineered APIs, private Toss app/web APIs, or undocumented endpoints.

## Examples

- [Account and holdings lookup](packages/typescript/examples/account-holdings.ts)
- [Market price lookup](packages/typescript/examples/market-prices.ts)
- [Error handling](packages/typescript/examples/error-handling.ts)
- [Place an order](packages/typescript/examples/place-order.ts)

## Development

Required tools are managed through `mise`.

```sh
mise install
mise run install
mise run check
```

## Release

The TypeScript package is published to npm as `tossinvest-openapi`. The Python package is published to PyPI as `tossinvest-openapi`. See [CHANGELOG](CHANGELOG.md) for release history.

## Security

Do not post credentials, access tokens, account data, or order payloads in public issues. Follow [SECURITY](SECURITY.md) to report security-sensitive problems.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for local setup, verification commands, and documentation rules.

## Links

- [TypeScript package](packages/typescript/README.md)
- [Python package](packages/python/README.md)
- [Official Toss Securities Open API docs](https://developers.tossinvest.com/docs)
- [CHANGELOG](CHANGELOG.md)
- [SECURITY](SECURITY.md)
- [CONTRIBUTING](CONTRIBUTING.md)
- [LICENSE](LICENSE)
