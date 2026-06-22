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
- Additional README samples reviewed for monorepo, package-status, and visual
  structure patterns: `pytorch`, `prisma`, and `aws-sdk-js-v3`.

## README Benchmark Findings

The detailed review covered section order, first-screen content, badges,
images, tone, warnings, and root/package separation.

| Project | Relevant pattern | Use for this project |
| --- | --- | --- |
| `stripe-node` | Title, npm/build/download badges, concise purpose, docs link, requirements, installation, usage, then a visible GitHub warning for secret-key initialization mistakes. | Use early badge row, short server-side SDK positioning, and early credential/order safety callouts. |
| `plaid-node` | Title with npm badge, table of contents, install, versioning/OpenAPI source, getting started, date conventions, error handling, examples, support. It explicitly warns not to log full error objects because secrets can be included. | Add explicit "do not log secrets or full request metadata" guidance near errors and safety, not only at the bottom. |
| `openai-node` | Title, package badges, short description, generated-from-OpenAPI note, docs/API reference links, installation, usage, then advanced sections. | State that this SDK is based on the pinned official OpenAPI document before examples. Keep advanced details out of the root README. |
| `modelcontextprotocol/typescript-sdk` | Important branch/status warning appears before badges. Monorepo package table comes before installation. README links to package docs and examples. | Put project status before detailed usage because this is pre-release and polyglot. Use a package status table in the root README. |
| `supabase-js` | Large logo, badge row, support policy by runtime, quick start, contributing, testing, docs, provenance, license, support. | Use support/runtime status as a trust signal, but avoid a large image because this project has no established visual brand asset. |
| `ccxt` | Heavy badge row, quick link bar, multi-language installation, usage examples, and disclaimer link for trading context. | Include a visible safety/disclaimer section because this SDK can place orders. Avoid CCXT-style visual density because this project is smaller. |
| `alpaca-trade-api-js` | Minimal title, npm/CI badges, API docs link, installation, runtime dependencies, usage, then method catalog by domain. | Include method/domain coverage in the package README, but avoid a full manual method catalog in the root README. |
| `octokit.js` | Table of contents, feature bullets, usage, constructor/authentication/proxy, generated REST API behavior, and reference screenshots. | Use feature bullets sparingly. No screenshots are needed because this SDK is not visual. |
| `google-api-nodejs-client` | Right-aligned logo, npm/download/security badges, support/maintenance policy near the top, generated API support note, authentication section. | Put support status and official API-source boundaries early. |
| `aws-sdk-js-v3` | Badges, high-level positioning, developer-guide/API-reference links, table of contents, getting started, architecture concepts, support policy, known issues. | Link users to official Toss docs and keep architecture/explanation separate from first-use instructions. |
| `prisma` | Branded image, centered link bar, "What is" section, quickstart, architecture explanation, community, security, support. | Use a short "Why this SDK exists" section, but avoid a marketing-style hero because this is a small financial SDK. |
| `pytorch` | Logo, concise capability bullets, generated table of contents, deep conceptual explanation, install, getting started, resources. | Use concise capability bullets; avoid deep conceptual sections in the root README. |

The benchmark suggests this project should not copy any one README. The best
fit is a restrained financial SDK README:

- first screen: identity, unofficial status, package/status badges, language
  link, and a package status table;
- early trust signals: official OpenAPI source, supported runtime, license,
  CI/check status, and pre-release status;
- early safety signals: server-side credential handling, no private Toss APIs,
  order APIs are state-changing;
- short quick start in the root README;
- detailed usage, errors, raw response, timeouts, and order examples in the
  TypeScript package README.

## Detail Decisions

### Post-Review Language Decisions

Repository and package README language selectors should use natural language
names without a label:

- Korean documents: `한국어 | [English](README.en.md)`
- English documents: `[한국어](README.md) | English`

This follows common README practice: place a compact language switcher near the
top, keep the current language as plain text, and link to other languages.

The TypeScript package documentation should also follow Korean-first
documentation because Toss Securities Open API is mainly used in Korea:

- `packages/typescript/README.md`: Korean package README shown by default on
  GitHub and npm.
- `packages/typescript/README.en.md`: English package README for non-Korean
  users.
- `packages/typescript/package.json` should include `README.en.md` in `files`
  so the English package README is available in the published package.

The TypeScript package README files are also rendered on npm. Links that point
outside the package directory should use stable absolute GitHub URLs instead of
monorepo-relative paths such as `../../README.md` or `../../LICENSE`.

### Section Order

The root README should optimize the first screen for trust and routing:

1. title and one-line Korean description;
2. badges;
3. official/unofficial notice;
4. language switch;
5. package status table;
6. short value proposition;
7. TypeScript quick start;
8. safety notes;
9. package/documentation links;
10. development commands;
11. license.

The TypeScript package README should optimize for task completion:

1. package title and unofficial notice;
2. badges only if package-specific badges are valid;
3. requirements;
4. installation;
5. quick start;
6. credentials/authentication;
7. common task examples;
8. response model;
9. errors and logging safety;
10. timeouts;
11. orders;
12. API coverage;
13. support and license.

### Tone

Use a precise, operational tone. This is a financial API SDK, so the language
should be closer to Stripe, Plaid, and AWS than to a marketing-heavy project
README.

Rules:

- Prefer short declarative sentences.
- Avoid exaggerated claims such as "production-ready", "battle-tested", or
  "safe" before release history supports them.
- Say what the SDK does and what it does not do.
- Use Korean naturally in `README.md`; do not mirror English sentence order.
- Use English in `README.en.md` for discoverability and package consumers.

### Badges

Use badges as trust signals, not decoration.

Recommended root badge set:

- GitHub Actions CI status badge for `ci.yml`.
- npm version badge for `tossinvest-openapi` once the package is published.
- License badge.
- OpenAPI version badge using the pinned Toss Securities OpenAPI version
  `1.1.1`.

Before npm publication, omit the npm version badge rather than showing a broken
or misleading badge.

Avoid:

- download count badges before meaningful adoption;
- coverage badges unless coverage is actually measured and enforced;
- social/community badges;
- excessive badge rows like large multi-language projects use.

### Images and Logos

Do not add a logo, hero image, or screenshot in this iteration.

Reasons:

- The project does not have an official visual identity.
- Using Toss Securities branding could imply endorsement.
- SDK usage is code-oriented, so screenshots would not clarify the product.

Small text badges and tables are enough for the first release documentation.

### Callouts and Warnings

Use GitHub callout blocks sparingly:

- `[!NOTE]` for unofficial status or pre-release status.
- `[!WARNING]` for order APIs and secret/logging safety.

Warnings should appear near the relevant usage section, not only in a final
"Safety Policy" section. For example:

- credential warning near authentication;
- do-not-log warning near errors;
- state-changing warning near order examples.

### Code Examples

Root README examples should be short enough to scan without scrolling through a
manual:

- install;
- create client;
- fetch accounts;
- fetch prices.

Package README examples can be longer and should cover:

- holdings;
- open orders;
- buying power;
- raw response access;
- error handling;
- a clearly marked order example.

Examples must use placeholders or environment variables, never real credentials,
real account identifiers, real order IDs, or live QA output.

### Table of Contents

Do not add a table of contents to the root README unless it grows beyond the
planned structure. The root README should stay short.

Add no manual table of contents to the TypeScript package README initially.
GitHub's outline is sufficient at the expected size. If the package README grows
substantially later, use a collapsible table of contents similar to the MCP
TypeScript SDK.

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
2. Minimal trust-signal badges:
   - CI status.
   - license.
   - pinned OpenAPI version.
   - npm version only after publication.
3. Official/unofficial notice.
4. Language link to `README.en.md`.
5. Status table:
   - TypeScript: implemented, pre-release.
   - Python: planned, scaffolded, not released.
   - OpenAPI contract: pinned official Toss Securities OpenAPI document.
6. Why this SDK exists:
   - typed access to Toss Securities Open API.
   - automatic OAuth2 client credentials handling.
   - raw response access when needed.
   - explicit order API safety.
7. Quick Start for TypeScript:
   - install command.
   - environment variable names.
   - account and price example.
8. Important usage notes:
   - server-side secrets only.
   - one client instance per credential set.
   - order methods are state-changing.
   - no private or reverse-engineered Toss APIs.
9. Links:
   - TypeScript package README.
   - Python package README.
   - official Toss Securities Open API docs.
   - license.
10. Development:
   - `mise install`
   - `mise run install`
   - `mise run check`

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

1. Package title and Korean short purpose.
2. Official/unofficial notice.
3. `ko | en` language selector.
4. Requirements:
   - Node.js 22 or newer.
   - Toss Securities Open API client credentials.
5. Installation:
   - `pnpm add tossinvest-openapi`
   - mention npm/yarn equivalents only if useful and concise.
6. Quick Start:
   - construct `TossInvestClient`.
   - fetch accounts.
   - fetch holdings.
   - fetch prices.
7. Credentials and authentication:
   - `clientId` and `clientSecret`.
   - OAuth2 Client Credentials Grant handled internally.
   - lazy token issuance.
   - token reissue behavior and one-client-instance guidance.
8. Common examples:
   - market data.
   - account holdings.
   - open orders.
   - buying power or order-related precheck.
9. Responses:
   - default unwrapped `result`.
   - `{ withResponse: true }` for `data`, `raw`, and `response`.
10. Errors:
   - `TossInvestApiError`.
   - `TossInvestConnectionError`.
   - do not log secrets or full request metadata.
11. Timeouts:
    - default 30 seconds.
    - client-level and per-call override.
12. Orders:
    - state-changing warning.
    - minimal example.
    - recommend user/application confirmation before calling order methods.
13. Scope and API coverage:
    - flat methods for every business operation in the pinned OpenAPI 1.1.1
      document.
    - official documented APIs only.
14. License and support links.

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
- Badges are limited to meaningful trust signals and do not imply unsupported
  maturity or adoption.
- `packages/typescript/README.md` gives TypeScript users enough information to
  install, authenticate, make common calls, handle errors, inspect raw
  responses, and understand order safety.
- `packages/python/README.md` accurately communicates current Python status.
- Links are relative where possible and valid within the repository.
- No secrets, real account data, or live QA output is added.
- Existing lint, typecheck, test, and build checks still pass after the
  documentation changes.
