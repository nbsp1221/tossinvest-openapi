# Public Surface Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the public adoption surfaces for `tossinvest-openapi` using real SDK benchmark patterns: README, examples, API coverage, security/contribution files, issue templates, changelog, and npm metadata.

**Architecture:** This is a documentation and package metadata change only. The root README remains the project-level landing page, the TypeScript README becomes the npm adoption page, examples live with the TypeScript package, and repository operation files live at the root or under `.github`.

**Tech Stack:** Markdown, GitHub issue forms, npm package metadata, TypeScript example files, pnpm, mise.

## Global Constraints

- Do not change runtime SDK behavior.
- Do not add package dependencies.
- Do not publish or create a GitHub release.
- Do not include real credentials, account data, order IDs, holdings, or QA results.
- Keep Korean as the primary root documentation language and English as the secondary documentation language.
- Keep TypeScript examples ESM-compatible and Node.js 22-compatible.
- Keep text files ending with exactly one newline.
- Run `mise run check` after edits.
- Run `pnpm --dir packages/typescript pack --dry-run` after edits.

---

## File Structure

- Modify `README.md`: project landing page, Korean primary.
- Modify `README.en.md`: English project landing page.
- Modify `packages/typescript/README.md`: npm landing page, Korean primary.
- Modify `packages/typescript/README.en.md`: npm landing page, English secondary.
- Modify `packages/typescript/package.json`: npm keywords and package files.
- Create `packages/typescript/examples/account-holdings.ts`: account and holdings example.
- Create `packages/typescript/examples/market-prices.ts`: market price example.
- Create `packages/typescript/examples/error-handling.ts`: API and connection error handling example.
- Create `packages/typescript/examples/place-order.ts`: state-changing order example with warnings.
- Create `SECURITY.md`: vulnerability reporting and sensitive data guidance.
- Create `CONTRIBUTING.md`: setup, checks, and contribution rules.
- Create `CHANGELOG.md`: release history starting at `0.1.0`.
- Create `.github/ISSUE_TEMPLATE/bug_report.yml`: structured bug report form.
- Create `.github/ISSUE_TEMPLATE/feature_request.yml`: structured feature request form.

---

## Task 1: Package Metadata and Example Packaging

**Files:**

- Modify: `packages/typescript/package.json`

**Interfaces:**

- Consumes: Existing package metadata.
- Produces: Improved npm discovery keywords and includes `examples` in npm package dry-run output.

- [ ] **Step 1: Update npm keywords**

Set `packages/typescript/package.json` `keywords` to this exact sorted list:

```json
[
  "api-client",
  "finance",
  "korean-stock",
  "openapi",
  "sdk",
  "stock-trading",
  "toss",
  "toss-securities",
  "tossinvest",
  "trading-api",
  "typescript"
]
```

- [ ] **Step 2: Include examples in published package**

Set `packages/typescript/package.json` `files` to include `examples`:

```json
["dist", "examples", "LICENSE", "README.md", "README.en.md"]
```

- [ ] **Step 3: Validate package JSON**

Run:

```sh
node -e "JSON.parse(require('node:fs').readFileSync('packages/typescript/package.json', 'utf8')); console.log('package.json ok')"
```

Expected:

```text
package.json ok
```

---

## Task 2: TypeScript Examples

**Files:**

- Create: `packages/typescript/examples/account-holdings.ts`
- Create: `packages/typescript/examples/market-prices.ts`
- Create: `packages/typescript/examples/error-handling.ts`
- Create: `packages/typescript/examples/place-order.ts`

**Interfaces:**

- Consumes: `TossInvestClient`, `TossInvestApiError`, and `TossInvestConnectionError` from `tossinvest-openapi`.
- Produces: Runnable example source files included in the npm tarball.

- [ ] **Step 1: Create account holdings example**

Create `packages/typescript/examples/account-holdings.ts`:

```ts
import { TossInvestClient } from "tossinvest-openapi";

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;

if (clientId === undefined || clientSecret === undefined) {
  throw new Error(
    "Set TOSS_INVEST_CLIENT_ID and TOSS_INVEST_CLIENT_SECRET before running this example.",
  );
}

const client = new TossInvestClient({ clientId, clientSecret });

const accounts = await client.getAccounts();
const accountSeq = accounts[0]?.accountSeq;

if (accountSeq === undefined) {
  throw new Error("No Toss Securities account was returned.");
}

const holdings = await client.getHoldings({ accountSeq });

console.log({
  accountSeq,
  holdingCount: holdings.length,
  holdings,
});
```

- [ ] **Step 2: Create market prices example**

Create `packages/typescript/examples/market-prices.ts`:

```ts
import { TossInvestClient } from "tossinvest-openapi";

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;

if (clientId === undefined || clientSecret === undefined) {
  throw new Error(
    "Set TOSS_INVEST_CLIENT_ID and TOSS_INVEST_CLIENT_SECRET before running this example.",
  );
}

const client = new TossInvestClient({ clientId, clientSecret });
const symbols = process.env.TOSS_INVEST_SYMBOLS ?? "005930,AAPL";
const prices = await client.getPrices({ symbols });

console.log({
  symbols,
  prices,
});
```

- [ ] **Step 3: Create error handling example**

Create `packages/typescript/examples/error-handling.ts`:

```ts
import {
  TossInvestApiError,
  TossInvestClient,
  TossInvestConnectionError,
} from "tossinvest-openapi";

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;

if (clientId === undefined || clientSecret === undefined) {
  throw new Error(
    "Set TOSS_INVEST_CLIENT_ID and TOSS_INVEST_CLIENT_SECRET before running this example.",
  );
}

const client = new TossInvestClient({ clientId, clientSecret });

try {
  const result = await client.getPrices({ symbols: "005930" });
  console.log(result);
} catch (error) {
  if (error instanceof TossInvestApiError) {
    console.error({
      type: "api",
      status: error.status,
      code: error.code,
      requestId: error.requestId,
      message: error.message,
    });
  } else if (error instanceof TossInvestConnectionError) {
    console.error({
      type: "connection",
      message: error.message,
    });
  } else {
    throw error;
  }
}
```

- [ ] **Step 4: Create order example**

Create `packages/typescript/examples/place-order.ts`:

```ts
import { TossInvestClient } from "tossinvest-openapi";

const clientId = process.env.TOSS_INVEST_CLIENT_ID;
const clientSecret = process.env.TOSS_INVEST_CLIENT_SECRET;
const accountSeq = process.env.TOSS_INVEST_ACCOUNT_SEQ;

if (
  clientId === undefined ||
  clientSecret === undefined ||
  accountSeq === undefined
) {
  throw new Error(
    "Set TOSS_INVEST_CLIENT_ID, TOSS_INVEST_CLIENT_SECRET, and TOSS_INVEST_ACCOUNT_SEQ before running this example.",
  );
}

const symbol = process.env.TOSS_INVEST_ORDER_SYMBOL ?? "005930";
const price = process.env.TOSS_INVEST_ORDER_PRICE;

if (price === undefined) {
  throw new Error("Set TOSS_INVEST_ORDER_PRICE before running this example.");
}

const client = new TossInvestClient({ clientId, clientSecret });

// This example places a real order when pointed at a real Toss Securities account.
// Review every environment variable before running it.
const order = await client.createOrder({
  accountSeq,
  clientOrderId: `example-${Date.now()}`,
  symbol,
  side: "BUY",
  orderType: "LIMIT",
  timeInForce: "DAY",
  quantity: "1",
  price,
  confirmHighValueOrder: false,
});

console.log(order);
```

- [ ] **Step 5: Typecheck examples through package typecheck**

Run:

```sh
pnpm --dir packages/typescript typecheck
```

Expected: command exits successfully.

---

## Task 3: TypeScript Package README

**Files:**

- Modify: `packages/typescript/README.md`
- Modify: `packages/typescript/README.en.md`

**Interfaces:**

- Consumes: Public examples and existing SDK public API.
- Produces: npm-ready Korean and English package documentation.

- [ ] **Step 1: Update Korean README structure**

Rewrite `packages/typescript/README.md` with these sections in this order:

```markdown
# tossinvest-openapi

토스증권 Open API를 위한 비공식 TypeScript SDK입니다.

> [!NOTE]
> 이 패키지는 공식 문서에 공개된 OpenAPI 엔드포인트만 사용합니다.
> 토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

[English](README.en.md)

## 설치

## 첫 요청

## 요구사항

## Credentials와 인증

## 주요 호출

### 시세 데이터

### 계좌 데이터

### 주문 전 확인

## 응답

## 에러

## Timeout

## 주문

## API Coverage

## Examples

## 링크
```

Content requirements:

- Keep existing working code snippets for client creation, account lookup, market data, errors, timeouts, and orders.
- Add a package-level npm badge below the title:

```markdown
[![npm version](https://img.shields.io/npm/v/tossinvest-openapi.svg)](https://www.npmjs.com/package/tossinvest-openapi)
```

- Add API coverage table:

```markdown
| 영역                            | 지원   |
| ------------------------------- | ------ |
| OAuth2 Client Credentials 인증  | 지원   |
| 계좌 목록/잔고/보유 종목        | 지원   |
| 국내/해외 시세 조회             | 지원   |
| 주문 가능 금액/수수료 사전 확인 | 지원   |
| 주문 생성/정정/취소             | 지원   |
| 주문 목록/상세 조회             | 지원   |
| WebSocket/실시간 streaming      | 미지원 |
```

- Add examples links:

```markdown
- [계좌와 보유 종목 조회](examples/account-holdings.ts)
- [시세 조회](examples/market-prices.ts)
- [에러 처리](examples/error-handling.ts)
- [주문 생성](examples/place-order.ts)
```

- [ ] **Step 2: Update English README structure**

Rewrite `packages/typescript/README.en.md` with the English equivalent sections:

```markdown
# tossinvest-openapi

Unofficial TypeScript SDK for Toss Securities Open API.

> [!NOTE]
> This package uses only official documented OpenAPI endpoints. It is not
> provided, endorsed, or supported by Toss Securities or Viva Republica.

[한국어](README.md)

## Installation

## First Request

## Requirements

## Credentials and Authentication

## Common Calls

### Market Data

### Account Data

### Order Prechecks

## Responses

## Errors

## Timeouts

## Orders

## API Coverage

## Examples

## Links
```

Use the English equivalent of the same API coverage table:

```markdown
| Area                                     | Supported |
| ---------------------------------------- | --------- |
| OAuth2 Client Credentials authentication | Yes       |
| Accounts, balances, and holdings         | Yes       |
| Domestic and overseas market data        | Yes       |
| Buying power and commission prechecks    | Yes       |
| Create, modify, and cancel orders        | Yes       |
| Order list and order detail lookup       | Yes       |
| WebSocket/realtime streaming             | No        |
```

- [ ] **Step 3: Run README formatting check**

Run:

```sh
pnpm --dir packages/typescript format:check
```

Expected: command exits successfully. If Prettier reports Markdown formatting changes, run `pnpm --dir packages/typescript format` and inspect the diff.

---

## Task 4: Root README Files

**Files:**

- Modify: `README.md`
- Modify: `README.en.md`

**Interfaces:**

- Consumes: TypeScript README and examples links.
- Produces: Repository-level landing pages with clear project status and links.

- [ ] **Step 1: Update Korean root README**

Keep Korean primary and use this structure:

```markdown
# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tossinvest-openapi.svg)](https://www.npmjs.com/package/tossinvest-openapi)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

토스증권 Open API를 TypeScript와 Python에서 사용하기 위한 비공식 SDK 프로젝트입니다.

> [!NOTE]
> 이 프로젝트는 토스증권 공식 OpenAPI 문서에 공개된 엔드포인트만 사용합니다.
> 토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

[English](README.en.md)

## 빠른 시작

## 패키지 상태

## 지원 범위

## 왜 이 SDK를 쓰나요?

## Examples

## 개발

## 릴리즈

## 보안

## 기여

## 링크
```

Add a compact coverage summary in `지원 범위` and link to package README for full details.

- [ ] **Step 2: Update English root README**

Use the English equivalent structure:

```markdown
# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tossinvest-openapi.svg)](https://www.npmjs.com/package/tossinvest-openapi)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

Unofficial SDK project for using Toss Securities Open API from TypeScript and Python.

> [!NOTE]
> This project uses only endpoints published in the official Toss Securities Open API documentation.
> It is not provided, endorsed, or supported by Toss Securities or Viva Republica.

[한국어](README.md)

## Quick Start

## Package Status

## Supported Scope

## Why Use This SDK?

## Examples

## Development

## Release

## Security

## Contributing

## Links
```

- [ ] **Step 3: Check root README links**

Run:

```sh
rg -n "packages/typescript|SECURITY|CONTRIBUTING|CHANGELOG|examples" README.md README.en.md
```

Expected: output includes links to TypeScript package README, examples, security, contributing, and changelog.

---

## Task 5: Repository Operation Files

**Files:**

- Create: `SECURITY.md`
- Create: `CONTRIBUTING.md`
- Create: `CHANGELOG.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`

**Interfaces:**

- Consumes: Existing development commands and release process.
- Produces: Public support and maintenance surfaces.

- [ ] **Step 1: Create security policy**

Create `SECURITY.md`:

```markdown
# Security Policy

## Reporting a Vulnerability

Do not report vulnerabilities with credentials, access tokens, account numbers, order payloads, or other sensitive financial data in a public GitHub issue.

Report security-sensitive problems by opening a private security advisory on GitHub:

https://github.com/nbsp1221/tossinvest-openapi/security/advisories/new

If the advisory flow is unavailable, open a public issue with only a minimal description and state that details can be shared privately. Do not include secrets or account-specific data.

## Scope

Security reports are in scope when they affect this SDK, its generated types, package distribution, examples, documentation that can cause unsafe credential handling, or the release workflow.

Problems in Toss Securities Open API itself should be reported to Toss Securities through their official channels.

## Supported Versions

Only the latest published TypeScript package version receives security fixes.
```

- [ ] **Step 2: Create contributing guide**

Create `CONTRIBUTING.md`:

````markdown
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
````

- [ ] **Step 3: Create changelog**

Create `CHANGELOG.md`:

```markdown
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
```

- [ ] **Step 4: Create bug report issue form**

Create `.github/ISSUE_TEMPLATE/bug_report.yml`:

```yaml
name: Bug report
description: Report a reproducible SDK bug
title: "bug: "
labels:
  - bug
body:
  - type: markdown
    attributes:
      value: |
        Do not include credentials, access tokens, account numbers, holdings, order IDs, or other sensitive financial data.
  - type: input
    id: package
    attributes:
      label: Package
      description: Package name and version
      placeholder: tossinvest-openapi@0.1.0
    validations:
      required: true
  - type: input
    id: runtime
    attributes:
      label: Runtime
      description: Node.js, pnpm, and operating system versions
      placeholder: Node.js 22.x, pnpm 10.x, macOS/Linux/Windows
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Minimal reproduction
      description: Include only sanitized code and responses.
      render: ts
    validations:
      required: true
```

- [ ] **Step 5: Create feature request issue form**

Create `.github/ISSUE_TEMPLATE/feature_request.yml`:

```yaml
name: Feature request
description: Suggest SDK behavior, documentation, or API coverage improvements
title: "feat: "
labels:
  - enhancement
body:
  - type: textarea
    id: problem
    attributes:
      label: Problem
      description: What are you trying to do?
    validations:
      required: true
  - type: textarea
    id: proposal
    attributes:
      label: Proposal
      description: What should change?
    validations:
      required: true
  - type: input
    id: api
    attributes:
      label: Related Toss Securities Open API endpoint
      placeholder: GET /...
  - type: textarea
    id: notes
    attributes:
      label: Additional context
      description: Do not include credentials, account data, holdings, or order details.
```

---

## Task 6: Final Verification

**Files:**

- Validate all changed files.

**Interfaces:**

- Consumes: Tasks 1-5 outputs.
- Produces: Verified branch ready for review or PR.

- [ ] **Step 1: Run full repository check**

Run:

```sh
mise run check
```

Expected: command exits successfully.

- [ ] **Step 2: Run npm pack dry-run**

Run:

```sh
pnpm --dir packages/typescript pack --dry-run
```

Expected: output includes `examples/account-holdings.ts`, `examples/market-prices.ts`, `examples/error-handling.ts`, and `examples/place-order.ts`.

- [ ] **Step 3: Scan for obvious credential leaks**

Run:

```sh
rg -n "API_KEY=|SECRET_KEY=|access_token|Bearer [A-Za-z0-9._-]+|clientSecret: ['\\\"][^'\\\"]+" README.md README.en.md packages/typescript/README.md packages/typescript/README.en.md packages/typescript/examples SECURITY.md CONTRIBUTING.md CHANGELOG.md .github || true
```

Expected: no real credential values. Mentions of variable names and warning text are acceptable.

- [ ] **Step 4: Inspect git status**

Run:

```sh
git status --short
```

Expected: only intended documentation, metadata, example, and issue template files are modified or added.

- [ ] **Step 5: Commit**

Use the commit skill guard script and a Gitmoji message matching the repository convention:

```sh
/home/retn0/.codex/skills/commit/scripts/commit-guard.py git add README.md README.en.md packages/typescript/README.md packages/typescript/README.en.md packages/typescript/package.json packages/typescript/examples/account-holdings.ts packages/typescript/examples/market-prices.ts packages/typescript/examples/error-handling.ts packages/typescript/examples/place-order.ts SECURITY.md CONTRIBUTING.md CHANGELOG.md .github/ISSUE_TEMPLATE/bug_report.yml .github/ISSUE_TEMPLATE/feature_request.yml docs/superpowers/specs/2026-06-24-public-surface-design.md docs/superpowers/plans/2026-06-24-public-surface-improvements.md
/home/retn0/.codex/skills/commit/scripts/commit-guard.py git commit -m "📝 Improve public SDK adoption surface"
```

---

## Self-Review

- Spec coverage: All in-scope design items map to Tasks 1-6.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps are present.
- Type consistency: Example code imports only current public exports and uses existing public method names from the TypeScript README.
- Scope check: No runtime SDK behavior, new dependencies, publishing, CLI, MCP, or Python implementation is included.
