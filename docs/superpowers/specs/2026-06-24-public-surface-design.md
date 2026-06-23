# Public Surface Improvements Design

## Goal

Make `tossinvest-openapi` easier to discover, evaluate, install, and trust by improving the public surfaces that real SDK users see before adoption: GitHub README, npm README, examples, API coverage, security guidance, issue templates, changelog, contribution guidance, and package metadata.

## Context

The TypeScript package has been released as `tossinvest-openapi@0.1.0`. The repository already has a clean polyglot structure, CI, release workflow, bilingual README files, and npm metadata. The next adoption bottleneck is not core SDK implementation. It is whether a developer who finds the repository or npm package can quickly answer these questions:

- What is this package?
- Is it unofficial or official?
- Which Toss Securities Open API features are covered?
- How do I install it and make my first successful request?
- How do I handle credentials, errors, timeouts, raw responses, and orders?
- Where do I report bugs or security issues?

## Benchmark Findings

The benchmark set covered mature SDKs, financial/trading SDKs, and direct Toss Open API competitors:

- Mature SDKs: `stripe/stripe-node`, `openai/openai-node`, `octokit/rest.js`, `plaid/plaid-node`
- Financial/trading SDKs: `alpacahq/typescript-sdk`, `polygon-io/client-js`, `tigerfintech/openapi-typescript-sdk`, `coinbase-samples/advanced-sdk-ts`, `koreainvestment/open-trading-api`
- Direct and adjacent competitors: `injoonH/toss-invest-sdk`, `haeminmoon/toss-cli`

Repeated real-world patterns:

- README starts with badges, one-line purpose, install command, and minimal usage.
- Package README is the npm adoption surface and must stand alone.
- Examples directories are common and more useful than publishing internal QA reports.
- Mature repos expose support, security, contribution, and release history surfaces.
- Financial/trading SDKs explicitly document credentials, account state changes, order behavior, and risk warnings.
- npm package metadata uses keywords for discovery, not only package identity.
- Public API coverage tables are useful when a SDK wraps an external API surface.

Rejected pattern:

- Publishing a QA report is not a common adoption surface for SDKs of this size. QA evidence should be absorbed into automated tests, release checks, and private verification notes. Public docs should show supported features, usage examples, and safety boundaries instead.

## Scope

### In Scope

- Improve root README as the repository landing page.
- Improve TypeScript package README as the npm package landing page.
- Add runnable examples under the TypeScript package.
- Add API coverage documentation for the pinned Toss Securities OpenAPI 1.1.1 scope.
- Add repository support surfaces: `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, and GitHub issue templates.
- Improve TypeScript package keywords for npm discovery.
- Keep Korean as the primary root documentation language and maintain English counterparts where public users will see them.
- Run repository checks after edits.

### Out of Scope

- No new runtime SDK behavior.
- No CLI or MCP package.
- No documentation website.
- No public QA report.
- No unofficial Toss private API or fallback implementation.
- No Python SDK implementation.
- No actual release or npm publish in this task.

## Public Surface Responsibilities

### Root README

The root README is the project-level entry point. It should explain the polyglot direction, current package status, official/unofficial boundary, quick install path, high-level supported scope, and links to package-specific docs and examples.

### TypeScript Package README

The TypeScript README is the npm package entry point. It should stand alone for a developer who opens npm and does not read the root README. It should prioritize install, first successful request, credentials, common calls, responses, errors, timeouts, orders, coverage, and links.

### Examples

Examples should be small, copyable, and focused. They should avoid framework setup and avoid requiring a committed `.env` file. They should read credentials from environment variables and fail early with clear local errors when credentials are missing.

Recommended examples:

- `packages/typescript/examples/account-holdings.ts`
- `packages/typescript/examples/market-prices.ts`
- `packages/typescript/examples/error-handling.ts`
- `packages/typescript/examples/place-order.ts`

The order example must include explicit warning comments. It exists because order APIs are part of the SDK, but it should not be the first example a new user sees.

### API Coverage

Coverage should be public product information, not a QA report. It should state the pinned official OpenAPI version and summarize whether authentication, account, market data, order precheck, order, and order lookup operations are supported.

### Repository Operation Files

Add practical maintenance surfaces:

- `SECURITY.md`: how to report vulnerabilities and what not to include in public issues.
- `CONTRIBUTING.md`: local setup, checks, docs expectations, generated OpenAPI type rule, and no-credential rule.
- `CHANGELOG.md`: current `0.1.0` release summary and future release format.
- `.github/ISSUE_TEMPLATE/bug_report.yml`: structured SDK bug reports.
- `.github/ISSUE_TEMPLATE/feature_request.yml`: structured feature/API support requests.

## Metadata

The TypeScript package metadata should use exact, relevant npm keywords. Add discovery terms without keyword stuffing:

- `api-client`
- `finance`
- `korean-stock`
- `openapi`
- `sdk`
- `stock-trading`
- `toss`
- `toss-securities`
- `tossinvest`
- `trading-api`
- `typescript`

Do not describe the package as official.

## Constraints

- Follow existing polyglot repository structure.
- Do not change runtime SDK behavior.
- Do not add package dependencies.
- Do not include real credentials, account data, order IDs, holdings, or QA results.
- Keep text files ending with exactly one newline.
- Keep TypeScript examples ESM-compatible and Node.js 22-compatible.
- Preserve Korean-first root documentation and English secondary documentation.
- Keep TypeScript package README usable on npm without requiring root README context.

## Verification

After implementation:

- Run `mise run check`.
- Run `pnpm --dir packages/typescript pack --dry-run`.
- Run a local grep check for obvious leaked credential names or sample secrets.
- Inspect `npm pack --dry-run` output to ensure examples and intended docs are included only if `package.json` `files` includes them.
- Check git status for unintentional generated artifacts.

## Open Decisions

The recommended implementation approach is to include examples in the npm package tarball because examples are part of the package adoption surface. This requires adding `examples` to `packages/typescript/package.json` `files`.
