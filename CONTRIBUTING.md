# Contributing

## Setup

This repository uses `mise` for tool versions, `pnpm` for TypeScript, and `uv` for Python.

```sh
mise install
mise run install
mise run check
```

## Development Rules

- Do not commit credentials, access tokens, account data, holdings, order IDs, or QA outputs.
- Do not use private Toss app/web APIs or undocumented endpoints.
- Keep TypeScript dependency versions exact.
- Keep generated OpenAPI types in sync with `spec/upstream/openapi.json`.
- Keep Korean and English public README files aligned when changing public behavior.
- Add or update examples when changing public SDK usage.

## Checks

Run the full repository check before sending a pull request:

```sh
mise run check
```

For TypeScript package-only changes:

```sh
pnpm --dir packages/typescript lint
pnpm --dir packages/typescript typecheck
pnpm --dir packages/typescript test
pnpm --dir packages/typescript build
```

## OpenAPI Types

When the pinned upstream OpenAPI document changes, regenerate TypeScript types:

```sh
pnpm --dir packages/typescript generate:types
pnpm --dir packages/typescript check:types
```

## Maintainer Release Notes

TypeScript releases are published from GitHub Releases through npm Trusted Publishing after the npm package trusted publisher is configured.

- Use the `typescript-v<version>` tag format.
- Keep the release workflow filename as `release-typescript.yml`.
- Do not publish a GitHub Release for `typescript-v0.1.0`; that version was published directly before Trusted Publishing was configured.
