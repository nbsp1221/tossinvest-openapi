# Documentation Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the repository and package README files so the first TypeScript release has clear Korean-first documentation, an English root README, accurate package status, and practical TypeScript usage guidance.

**Architecture:** The root README is the repository entry point and stays concise. Package READMEs own package-specific user guidance. The English README mirrors root-level facts without becoming a separate API reference.

**Tech Stack:** Markdown, GitHub-flavored callouts, relative repository links, existing `mise run check` validation.

## Post-Review Amendments

The initial implementation plan was updated after review:

- Root README language links use a compact unlabeled switcher:
  `한국어 | English`.
- `packages/typescript/README.md` is Korean-first instead of English-only.
- `packages/typescript/README.en.md` contains the English TypeScript package
  README.
- `packages/typescript/package.json` includes `README.en.md` in `files` so the
  English package README is included in package contents.

## Global Constraints

- Work on the current branch without creating a git worktree.
- Do not change SDK behavior or public API.
- Do not add real credentials, access tokens, account identifiers, order IDs, live QA output, or user portfolio data.
- `README.md` is Korean-first.
- `README.en.md` mirrors root-level facts in English.
- `packages/typescript/README.md` is the Korean-first npm package usage guide.
- `packages/typescript/README.en.md` is the English TypeScript package usage
  guide.
- `packages/python/README.md` accurately states that Python is scaffolded/planned but not released as a working SDK.
- Use a precise, operational tone; avoid "production-ready", "battle-tested", "safe", "official", or endorsement-implying language.
- Badge usage is limited to meaningful trust signals: CI, license, pinned OpenAPI version, and npm version only after package publication.
- Do not add Toss logos, hero images, screenshots, or decorative images.
- Put warnings near the risky usage section: credentials near authentication, logging near errors, and state-changing behavior near orders.
- Keep file endings to exactly one final newline.
- Run `mise run check` before claiming completion.

---

## File Structure

- Modify `README.md`
  - Korean-first repository entry point.
  - Explains project identity, unofficial status, package support status, quick TypeScript start, safety notes, links, and development commands.

- Create `README.en.md`
  - English root README.
  - Mirrors the root README facts and links back to `README.md`.

- Modify `packages/typescript/README.md`
  - Korean-first npm package user guide.
  - Covers requirements, installation, credentials/authentication, common calls, responses, errors/logging safety, timeouts, orders, scope, and support.

- Create `packages/typescript/README.en.md`
  - English TypeScript package user guide.
  - Mirrors package-level usage guidance for non-Korean readers.

- Modify `packages/typescript/package.json`
  - Include `README.en.md` in package `files`.

- Modify `packages/python/README.md`
  - Python package status guide.
  - States current scaffold-only status and points users to TypeScript for working SDK usage.

## Task 1: Korean Root README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: current project facts from `packages/typescript/package.json`, `mise.toml`, `spec/upstream/openapi.json`, and the documentation design spec.
- Produces: Korean repository entry README linked by GitHub and `README.en.md`.

- [ ] **Step 1: Replace the current root README with Korean-first content**

Use this structure and content. Keep code examples concise and do not include real account data:

```markdown
# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

토스증권 Open API를 위한 비공식 SDK입니다.

> [!NOTE]
> 이 프로젝트는 토스증권 공식 OpenAPI 문서에 공개된 엔드포인트만 사용합니다.
> 토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

[English](README.en.md)

## 상태

| 패키지 | 상태 | 설명 |
| --- | --- | --- |
| TypeScript | 구현됨, pre-release | 공식 OpenAPI 1.1.1의 business operation을 flat method로 제공합니다. |
| Python | 계획됨, scaffolded | 폴리글랏 구조를 유지하기 위한 패키지이며 아직 사용 가능한 SDK는 아닙니다. |
| OpenAPI contract | pinned | `spec/upstream/openapi.json`을 기준으로 타입을 생성합니다. |

## 왜 이 SDK를 쓰나요?

- 공식 Toss Securities Open API 스키마에서 파생된 TypeScript 타입을 사용합니다.
- OAuth2 Client Credentials 인증을 SDK가 처리합니다.
- 기본 응답은 `result`를 unwrap하고, 필요하면 원본 응답도 확인할 수 있습니다.
- 주문 API는 명시적으로 노출하되 state-changing operation으로 다룹니다.

## 빠른 시작

```sh
pnpm add tossinvest-openapi
```

```ts
import { TossInvestClient } from 'tossinvest-openapi';

const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});

const accounts = await client.getAccounts();
const prices = await client.getPrices({ symbols: '005930,AAPL' });

console.log({ accounts, prices });
```

> [!WARNING]
> `clientSecret`은 서버 사이드 환경에서만 사용하세요. 브라우저, 모바일 앱,
> 공개 저장소, 클라이언트 번들에 포함하면 안 됩니다.

## 사용 시 주의사항

- 하나의 credential set마다 하나의 `TossInvestClient` 인스턴스를 재사용하는 것을 권장합니다.
- 에러 객체나 HTTP metadata 전체를 그대로 로그에 남기지 마세요. secret, token, 계좌 정보, 주문 정보가 포함될 수 있습니다.
- 주문 메서드는 실제 계좌 상태를 바꿀 수 있는 API입니다. 애플리케이션 레벨에서 사용자 확인 절차를 두세요.
- 이 프로젝트는 reverse engineered API, private Toss app/web API, 비공개 엔드포인트를 사용하지 않습니다.

## 문서

- [TypeScript package](packages/typescript/README.md)
- [Python package](packages/python/README.md)
- [토스증권 Open API 공식 문서](https://developers.tossinvest.com/docs)
- [LICENSE](LICENSE)

## 개발

필요한 도구는 `mise`로 관리합니다.

```sh
mise install
mise run install
mise run check
```
```

- [ ] **Step 2: Verify the root README structure**

Run:

```sh
rg --no-heading '^#{1,3} ' README.md
```

Expected headings:

```text
# tossinvest-openapi
## 상태
## 왜 이 SDK를 쓰나요?
## 빠른 시작
## 사용 시 주의사항
## 문서
## 개발
```

## Task 2: English Root README

**Files:**
- Create: `README.en.md`

**Interfaces:**
- Consumes: `README.md` root facts.
- Produces: English repository entry README linked from `README.md`.

- [ ] **Step 1: Create `README.en.md`**

Use this structure and content:

```markdown
# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

Unofficial SDK for Toss Securities Open API.

> [!NOTE]
> This project uses only endpoints published in the official Toss Securities Open API documentation.
> It is not provided, endorsed, or supported by Toss Securities or Viva Republica.

[한국어](README.md)

## Status

| Package | Status | Description |
| --- | --- | --- |
| TypeScript | Implemented, pre-release | Provides flat methods for the business operations in the official OpenAPI 1.1.1 document. |
| Python | Planned, scaffolded | Kept as part of the polyglot workspace, but not yet a usable SDK. |
| OpenAPI contract | Pinned | Types are generated from `spec/upstream/openapi.json`. |

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
import { TossInvestClient } from 'tossinvest-openapi';

const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});

const accounts = await client.getAccounts();
const prices = await client.getPrices({ symbols: '005930,AAPL' });

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
```

- [ ] **Step 2: Verify root README language links**

Run:

```sh
rg -n "English|한국어|README.en.md|README.md" README.md README.en.md
```

Expected:

```text
README.md:[line]:[English](README.en.md)
README.en.md:[line]:[한국어](README.md)
```

## Task 3: TypeScript Package README

**Files:**
- Modify: `packages/typescript/README.md`

**Interfaces:**
- Consumes: public API from `packages/typescript/src/index.ts`, method names from `packages/typescript/src/client.ts`, and package metadata from `packages/typescript/package.json`.
- Produces: npm package README for TypeScript users.

- [ ] **Step 1: Replace TypeScript README with usage guide**

Use this structure and content:

```markdown
# tossinvest-openapi

Unofficial TypeScript SDK for Toss Securities Open API.

> [!NOTE]
> This package uses only official documented OpenAPI endpoints. It is not
> provided, endorsed, or supported by Toss Securities or Viva Republica.

## Requirements

- Node.js 22 or newer
- Toss Securities Open API client credentials

## Installation

```sh
pnpm add tossinvest-openapi
```

## Quick Start

```ts
import { TossInvestClient } from 'tossinvest-openapi';

const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});

const accounts = await client.getAccounts();
const accountSeq = accounts[0]?.accountSeq;

if (accountSeq === undefined) {
  throw new Error('No Toss Securities account was returned.');
}

const holdings = await client.getHoldings({ accountSeq });
const prices = await client.getPrices({ symbols: '005930,AAPL' });

console.log({ holdings, prices });
```

## Credentials and Authentication

Create `TossInvestClient` with the `clientId` and `clientSecret` issued by Toss Securities Open API.

```ts
const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});
```

The SDK uses OAuth2 Client Credentials Grant internally. It lazily requests an access token on the first authenticated API call, caches it in memory, and reissues a token after the `expires_in` window.

Toss Securities does not provide refresh tokens. Token reissuance invalidates the previous token for the same client credentials, so prefer one `TossInvestClient` instance per credential set in a process.

> [!WARNING]
> Keep `clientSecret` on the server side. Do not expose it in browser bundles,
> mobile apps, public repositories, logs, or crash reports.

## Common Calls

### Market Data

```ts
const orderbook = await client.getOrderbook({ symbol: '005930' });
const prices = await client.getPrices({ symbols: '005930,AAPL' });
const priceLimit = await client.getPriceLimit({ symbol: '005930' });
```

### Account Data

```ts
const accounts = await client.getAccounts();
const accountSeq = accounts[0]?.accountSeq;

if (accountSeq === undefined) {
  throw new Error('No Toss Securities account was returned.');
}

const holdings = await client.getHoldings({ accountSeq });
const openOrders = await client.getOrders({ accountSeq, status: 'OPEN' });
```

### Order Prechecks

```ts
const buyingPower = await client.getBuyingPower({
  accountSeq,
  symbol: '005930',
  side: 'BUY',
  orderType: 'LIMIT',
  price: '70000',
});

const commissions = await client.getCommissions({
  accountSeq,
  symbol: '005930',
  side: 'BUY',
  orderType: 'LIMIT',
  quantity: '1',
  price: '70000',
});
```

## Responses

Business API methods return the unwrapped `result` payload by default.

```ts
const accounts = await client.getAccounts();
```

Use `{ withResponse: true }` when you need the original response envelope or HTTP metadata.

```ts
const result = await client.getAccounts({ withResponse: true });

console.log(result.data);
console.log(result.raw);
console.log(result.response.status);
console.log(result.response.requestId);
```

## Errors

API failures throw `TossInvestApiError`. Network-level failures throw `TossInvestConnectionError`.

```ts
import {
  TossInvestApiError,
  TossInvestConnectionError,
} from 'tossinvest-openapi';

try {
  await client.getOrders({ accountSeq, status: 'OPEN' });
} catch (error) {
  if (error instanceof TossInvestApiError) {
    console.error(error.status, error.code, error.requestId);
  } else if (error instanceof TossInvestConnectionError) {
    console.error(error.cause);
  }

  throw error;
}
```

> [!WARNING]
> Do not log full error objects or full HTTP request metadata. They may include
> secrets, access tokens, account identifiers, or order payloads.

## Timeouts

Requests time out after 30 seconds by default. You can override the timeout globally or per call.

```ts
const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
  timeoutMs: 10_000,
});

await client.getAccounts({ timeoutMs: 5_000 });
```

## Orders

Order APIs are exposed because they are part of the official Toss Securities OpenAPI document. Treat order calls as state-changing operations.

> [!WARNING]
> `createOrder`, `modifyOrder`, and `cancelOrder` can change account state.
> Add explicit user or application-level confirmation before calling them.

```ts
const order = await client.createOrder({
  accountSeq,
  clientOrderId: 'example-order-001',
  symbol: '005930',
  side: 'BUY',
  orderType: 'LIMIT',
  timeInForce: 'DAY',
  quantity: '1',
  price: '70000',
  confirmHighValueOrder: false,
});

const detail = await client.getOrder({
  accountSeq,
  orderId: order.orderId,
});
```

## Scope

The TypeScript SDK exposes flat methods for every business operation in the pinned Toss Securities OpenAPI 1.1.1 document, including account, market data, order, and order-info APIs.

Python is maintained separately in the same polyglot repository.

## Links

- [Repository README](../../README.md)
- [Official Toss Securities Open API docs](https://developers.tossinvest.com/docs)
- [LICENSE](../../LICENSE)
```

- [ ] **Step 2: Verify TypeScript README headings**

Run:

```sh
rg --no-heading '^#{1,3} ' packages/typescript/README.md
```

Expected headings:

```text
# tossinvest-openapi
## Requirements
## Installation
## Quick Start
## Credentials and Authentication
## Common Calls
### Market Data
### Account Data
### Order Prechecks
## Responses
## Errors
## Timeouts
## Orders
## Scope
## Links
```

## Task 4: Python Package README

**Files:**
- Modify: `packages/python/README.md`

**Interfaces:**
- Consumes: current Python package scaffold state.
- Produces: accurate Python package status README.

- [ ] **Step 1: Replace Python README with status guide**

Use this content:

```markdown
# tossinvest-openapi for Python

Python support is planned as a first-class package in this polyglot repository, but the Python SDK is not implemented or released yet.

The current package exists to keep the Python workspace, tooling, and future package boundary in place.

## Current Status

| Area | Status |
| --- | --- |
| Package scaffold | Available |
| Lint and format | Ruff |
| Type checking | ty |
| Tests | pytest |
| Runtime SDK | Not implemented |
| Release package | Not published |

## Development

From this package directory:

```sh
mise run check
```

From the repository root:

```sh
mise run check
```

## Working SDK

Use the TypeScript package for current SDK functionality:

- [Repository README](../../README.md)
- [TypeScript package](../typescript/README.md)
```

- [ ] **Step 2: Verify Python README does not imply released SDK support**

Run:

```sh
rg -n "not implemented|not released|Not implemented|Not published|TypeScript package" packages/python/README.md
```

Expected: all phrases are present.

## Task 5: Cross-Document Verification

**Files:**
- Verify: `README.md`
- Verify: `README.en.md`
- Verify: `packages/typescript/README.md`
- Verify: `packages/python/README.md`

**Interfaces:**
- Consumes: all documentation changes.
- Produces: verified documentation ready for review.

- [ ] **Step 1: Check final newlines**

Run:

```sh
python - <<'PY'
from pathlib import Path

paths = [
    Path('README.md'),
    Path('README.en.md'),
    Path('packages/typescript/README.md'),
    Path('packages/python/README.md'),
]

for path in paths:
    data = path.read_bytes()
    ok = data.endswith(b'\n') and not data.endswith(b'\n\n')
    print(f'{path}: {ok}')
    if not ok:
        raise SystemExit(1)
PY
```

Expected:

```text
README.md: True
README.en.md: True
packages/typescript/README.md: True
packages/python/README.md: True
```

- [ ] **Step 2: Check for disallowed claims and sensitive material**

Run:

```sh
rg -n "production-ready|battle-tested|official SDK|officially supported|sk_live|sk_test|access_token|SECRET_KEY|API_KEY|계좌번호|주민|account number" README.md README.en.md packages/typescript/README.md packages/python/README.md
```

Expected: no matches, except `access token` as prose in the TypeScript authentication/error sections if lowercase and not a literal token value.

- [ ] **Step 3: Check links that should exist**

Run:

```sh
rg -n "README.en.md|packages/typescript/README.md|packages/python/README.md|developers.tossinvest.com/docs|LICENSE" README.md
rg -n "README.md|packages/typescript/README.md|packages/python/README.md|developers.tossinvest.com/docs|LICENSE" README.en.md
rg -n "../../README.md|../../LICENSE|developers.tossinvest.com/docs" packages/typescript/README.md
rg -n "../../README.md|../typescript/README.md" packages/python/README.md
```

Expected: each command prints at least one matching line.

- [ ] **Step 4: Run full project verification**

Run:

```sh
mise run check
```

Expected: OpenAPI spec check, TypeScript format/lint/test/typecheck/build, and Python lint/test/typecheck/build all pass.

- [ ] **Step 5: Review git diff**

Run:

```sh
git diff --stat
git diff -- README.md README.en.md packages/typescript/README.md packages/python/README.md
```

Expected: only the planned README files changed.
