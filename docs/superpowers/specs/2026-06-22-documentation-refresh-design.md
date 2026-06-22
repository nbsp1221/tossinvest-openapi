# Documentation Refresh Design

## Objective

Improve the public documentation before the first TypeScript release so that
new users can quickly understand what this project is, whether it fits their
use case, how to install it, how to authenticate, and how to make safe first
API calls.

The documentation should support Korean and English. Korean is the primary
language because Toss Securities Open API is mainly used in Korea. English
should still be available for package consumers, search, and future
international contributors.

## Source Research

The design is based on:

- GitHub README guidance: README files should explain what the project does,
  why it is useful, how users get started, where to get help, and who maintains
  it.
- GitHub repository best practices: README, license, security expectations, and
  repository navigation are part of baseline open-source quality.
- Write the Docs and Diataxis: documentation should separate learning,
  task-oriented guides, reference, and explanation instead of mixing every
  purpose into one page.
- SDK README examples reviewed under `/tmp/tossinvest-doc-examples`:
  `stripe-node`, `openai-node`, `octokit.js`, `supabase-js`,
  `google-api-nodejs-client`, `plaid-node`, `ccxt`,
  `alpaca-trade-api-js`, `modelcontextprotocol/typescript-sdk`, and
  `anthropic-sdk-typescript`.

## Current Problems

- The root README starts in English, which does not match the project direction
  of Korean-first documentation.
- The root README and TypeScript package README repeat similar concepts without
  clear ownership.
- The first-use flow is not strong enough: project identity, installation,
  credentials, first account call, market-data call, errors, and order safety
  are not arranged as a guided path.
- The root README does not clearly explain the polyglot repository model or the
  current package status.
- The Python README is a placeholder and does not explain that Python is
  first-class but not implemented yet.
- There is no English root README that can remain stable after Python support is
  added.

## Documentation Architecture

Use four documentation entry points:

1. `README.md`
   - Korean-first repository README.
   - Explains project identity, official/unofficial status, supported packages,
     quick TypeScript start, safe usage, development commands, and links.
   - Stays polyglot and should not be rewritten when Python support lands.

2. `README.en.md`
   - English counterpart for the root README.
   - Mirrors the core Korean README content rather than becoming a separate
     technical reference.
   - Keeps the project discoverable and understandable for non-Korean users.

3. `packages/typescript/README.md`
   - npm package README.
   - Focuses on TypeScript users: requirements, installation, credentials,
     client setup, common calls, response handling, errors, timeouts, order
     safety, API coverage, and support policy.
   - Contains more SDK-specific examples than the root README.

4. `packages/python/README.md`
   - Python package status README.
   - States that Python is planned as a first-class package but not released
     yet.
   - Keeps Python tooling and future direction visible without pretending the
     SDK exists.

## Root README Structure

`README.md` should use this Korean-first structure:

1. Project title and one-sentence description.
2. Official/unofficial notice.
3. Language link to `README.en.md`.
4. Status table:
   - TypeScript: implemented, pre-release.
   - Python: planned, scaffolded, not released.
   - OpenAPI contract: pinned official Toss Securities OpenAPI document.
5. Why this SDK exists:
   - typed access to Toss Securities Open API.
   - automatic OAuth2 client credentials handling.
   - raw response access when needed.
   - explicit order API safety.
6. Quick Start for TypeScript:
   - install command.
   - environment variable names.
   - account and price example.
7. Important usage notes:
   - server-side secrets only.
   - one client instance per credential set.
   - order methods are state-changing.
   - no private or reverse-engineered Toss APIs.
8. Development:
   - `mise install`
   - `mise run install`
   - `mise run check`
9. Links:
   - TypeScript package README.
   - Python package README.
   - official Toss Securities Open API docs.
   - license.

The root README should stay concise. Detailed API examples belong in package
READMEs.

## English README Structure

`README.en.md` should mirror the Korean root README:

- Same sections and facts.
- English prose.
- Link back to `README.md`.
- Avoid TypeScript-only positioning in the title or project description.

## TypeScript Package README Structure

`packages/typescript/README.md` should use this structure:

1. Package title and short purpose.
2. Official/unofficial notice.
3. Requirements:
   - Node.js 22 or newer.
   - Toss Securities Open API client credentials.
4. Installation:
   - `pnpm add tossinvest-openapi`
   - mention npm/yarn equivalents only if useful and concise.
5. Quick Start:
   - construct `TossInvestClient`.
   - fetch accounts.
   - fetch holdings.
   - fetch prices.
6. Credentials and authentication:
   - `clientId` and `clientSecret`.
   - OAuth2 Client Credentials Grant handled internally.
   - lazy token issuance.
   - token reissue behavior and one-client-instance guidance.
7. Common examples:
   - market data.
   - account holdings.
   - open orders.
   - buying power or order-related precheck.
8. Responses:
   - default unwrapped `result`.
   - `{ withResponse: true }` for `data`, `raw`, and `response`.
9. Errors:
   - `TossInvestApiError`.
   - `TossInvestConnectionError`.
10. Timeouts:
    - default 30 seconds.
    - client-level and per-call override.
11. Orders:
    - state-changing warning.
    - minimal example.
    - recommend user/application confirmation before calling order methods.
12. Scope and API coverage:
    - flat methods for every business operation in the pinned OpenAPI 1.1.1
      document.
    - official documented APIs only.
13. License and support links.

## Python Package README Structure

`packages/python/README.md` should not be empty or misleading. It should state:

- Python SDK is planned but not released.
- The package currently exists to keep the polyglot workspace stable.
- Current Python checks are available through the package `mise` tasks.
- Users who need working SDK functionality should use the TypeScript package for
  now.

## Style Rules

- Korean root README should be natural Korean, not literal translation from
  English.
- English README should be concise and clear, not a machine-like mirror.
- Avoid marketing-heavy copy. This is a financial API SDK, so the tone should be
  precise and operational.
- Keep code examples copy-pasteable.
- Do not include real credentials, tokens, account IDs, or order IDs.
- Use official example symbols such as `005930` and `AAPL` only as examples.
- State order examples as examples, not recommendations to trade.
- Prefer relative links for repository-local documents.
- Keep the root README short enough that users can scan it quickly on GitHub.

## Non-Goals

- Building a full documentation site.
- Generating API reference pages.
- Adding a changelog, contribution guide, security policy, or release workflow.
- Changing SDK behavior or public API.
- Adding new runtime examples that require real credentials.

## Acceptance Criteria

- `README.md` is Korean-first and clearly positions the repository as a
  polyglot unofficial SDK for Toss Securities Open API.
- `README.en.md` exists and reflects the same root-level facts in English.
- `packages/typescript/README.md` gives TypeScript users enough information to
  install, authenticate, make common calls, handle errors, inspect raw
  responses, and understand order safety.
- `packages/python/README.md` accurately communicates current Python status.
- Links are relative where possible and valid within the repository.
- No secrets, real account data, or live QA output is added.
- Existing lint, typecheck, test, and build checks still pass after the
  documentation changes.
