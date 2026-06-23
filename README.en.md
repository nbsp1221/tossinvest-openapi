# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

Unofficial client library for Toss Securities Open API.

> [!NOTE]
> This project uses only endpoints published in the official Toss Securities Open API documentation.
> It is not provided, endorsed, or supported by Toss Securities or Viva Republica.

[한국어](README.md) | English

## Status

| Package          | Status                   | Description                                                                               |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| TypeScript       | Implemented, pre-release | Provides flat methods for the business operations in the official OpenAPI 1.1.1 document. |
| Python           | Planned, scaffolded      | Kept as part of the polyglot workspace, but not yet a usable SDK.                         |
| OpenAPI contract | Pinned                   | Types are generated from `spec/upstream/openapi.json`.                                    |

## Why Use This SDK?

- Uses TypeScript types derived from the official Toss Securities Open API schema.
- Handles OAuth2 Client Credentials authentication inside the SDK.
- Returns unwrapped `result` payloads by default while allowing access to raw responses.
- Exposes order APIs explicitly as state-changing operations.

## Quick Start

```sh
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

console.log({ accounts, prices });
```

> [!WARNING]
> Use `clientSecret` only in server-side environments. Do not expose it in
> browsers, mobile apps, public repositories, or client bundles.

## Usage Notes

- Prefer one `TossInvestClient` instance per credential set.
- Do not log full error objects or HTTP metadata. They may include secrets, tokens, account data, or order data.
- Order methods can change real account state. Add explicit user confirmation at the application layer.
- This project does not use reverse engineered APIs, private Toss app/web APIs, or undocumented endpoints.

## Documentation

- [TypeScript package](packages/typescript/README.md)
- [Python package](packages/python/README.md)
- [Official Toss Securities Open API docs](https://developers.tossinvest.com/docs)
- [LICENSE](LICENSE)

## Development

Required tools are managed through `mise`.

```sh
mise install
mise run install
mise run check
```

## Release

The TypeScript package is prepared for npm Trusted Publishing. When adding the GitHub Actions trusted publisher in the npmjs.com package settings, set the workflow filename to `release-typescript.yml`.

The TypeScript publish workflow runs when a GitHub Release is published, and release tags use the `typescript-v` prefix, such as `typescript-v0.1.0`. npm Trusted Publishing requires a GitHub-hosted runner and npm CLI 11.5.1 or newer, so the release workflow uses npm 11.17.0.

npm Trusted Publisher settings are managed from npm package settings. If the package does not exist on the npm registry yet, package settings may not be available, so the first public version may need to be created through a direct publish flow with npm account 2FA first.

After publishing the first `0.1.0` version directly, do not run the publish workflow again with a GitHub Release for the same version. Configure Trusted Publisher settings, then use the GitHub Release publish workflow from the next version onward. The release workflow only accepts `typescript-v<package.json version>` tags.
