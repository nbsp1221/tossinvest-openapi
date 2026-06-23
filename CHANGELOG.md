# Changelog

All notable changes to this project are documented in this file.

This project uses separate package versions for each language package. TypeScript release tags use the `typescript-v<version>` format.

## tossinvest-openapi@0.1.0 - 2026-06-24

### Added

- Initial TypeScript SDK for Toss Securities Open API.
- OAuth2 Client Credentials authentication with in-memory token caching.
- Flat methods for the pinned Toss Securities OpenAPI 1.1.1 business operations.
- Unwrapped `result` responses by default with raw response access through `{ withResponse: true }`.
- API and connection error classes.
- Node.js 22 ESM package build.
- npm package publication as `tossinvest-openapi`.
