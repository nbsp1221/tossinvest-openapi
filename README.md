# tossinvest-openapi

Unofficial SDK for Toss Securities Open API. This project uses only official documented OpenAPI endpoints.

이 프로젝트는 토스증권 공식 OpenAPI 문서에 공개된 엔드포인트만 사용하는 비공식 SDK입니다.
토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

## Status

This repository is in the initial scaffold phase. The first MVP target is TypeScript, with Python maintained as a first-class package in the same polyglot monorepo.

## Development

Required tools are managed through `mise`.

```sh
mise install
mise run install
mise run check
```

Direct fallback commands are also available:

```sh
pnpm install
uv sync --all-packages
pnpm run check
```

## Safety Policy

- Use only the official Toss Securities OpenAPI documentation and JSON schema.
- Do not use reverse engineered, private, or internal Toss app/web APIs.
- Do not log secrets, access tokens, account identifiers, or order payloads.
- Real order APIs will require explicit opt-in and safety documentation before exposure.
