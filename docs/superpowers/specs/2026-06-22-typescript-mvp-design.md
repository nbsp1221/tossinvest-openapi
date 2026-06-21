# TypeScript MVP Design

## Objective

Build the first useful TypeScript SDK for Toss Securities OpenAPI. The MVP must
provide real value with a small surface area: typed access to every current
OpenAPI operation, automatic OAuth2 client-credentials token handling, predictable
errors, and a simple client API.

Python remains a future package in the polyglot workspace. This design only
implements the TypeScript package and keeps the OpenAPI contract reusable for
Python later.

## Non-Goals

- Python SDK implementation.
- npm publishing or release automation.
- Live integration tests against a real Toss Securities account.
- Runtime schema validation of API responses.
- Retry, backoff, or circuit breaker behavior.
- Auto-pagination helpers.
- Browser-focused usage. Client secrets must be used server-side.
- Supporting user-provided access tokens as a public MVP auth mode.

## Source Contract

The repository-pinned OpenAPI document at `spec/upstream/openapi.json` is the
source contract for TypeScript request and response types.

Current pinned contract summary:

- OpenAPI version: `3.1.0`
- Toss Securities API version: `1.1.1`
- Business API operations: `20`
- OpenAPI operation IDs: `21`, including `issueOAuth2Token`
- Component schemas: `53`
- Auth: OAuth2 Client Credentials Grant via `POST /oauth2/token`

The SDK must not infer API shapes from handwritten interfaces when equivalent
types can be generated from the OpenAPI document.

Public parameter types should derive field types from generated
`operations[...]` request types where practical. The handwritten SDK may reshape
those fields into a friendlier single `params` object, such as exposing the
`X-Tossinvest-Account` header as `accountSeq`.

## Public Client

Expose a single main class:

```ts
import { TossInvestClient } from 'tossinvest-openapi';

const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});
```

Constructor options:

```ts
interface TossInvestClientOptions {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  userAgent?: string;
}
```

`clientId` and `clientSecret` are required. `accessToken` is intentionally not a
public constructor option in the MVP because Toss Securities officially supports
OAuth2 Client Credentials Grant, not a separate long-lived token mode.

## Authentication

The SDK performs OAuth2 token issuance internally:

- The constructor performs no network calls.
- The first authenticated API call lazily calls `POST /oauth2/token`.
- The token request is `application/x-www-form-urlencoded`.
- The issued token is sent as `Authorization: Bearer <access_token>`.
- The SDK stores `access_token` and `expires_in` in memory per client instance.
- If the token is expired before a later request, the next request obtains a new
  token before calling the target API.
- A small expiry skew may be applied to avoid using a token at the exact
  expiration boundary.
- Concurrent token cache misses within one SDK instance must share one in-flight
  token issuance request.
- A `401` from a business API is not automatically retried. It is surfaced as
  `TossInvestApiError`.

Reasoning: Toss Securities states that each client has one valid access token
and that reissuing a token immediately invalidates the previous token. Retrying
every `401` with a new token can hide multi-process token invalidation problems.

Expose `issueOAuth2Token()` as a public method because token issuance is an
actual documented OpenAPI operation. It returns the OAuth token response shape,
not an unwrapped envelope.

## Endpoint API

Use flat methods based on OpenAPI `operationId`.

Examples:

```ts
await client.getAccounts();
await client.getPrices({ symbols: '005930,AAPL' });
await client.getHoldings({ accountSeq: 1, symbol: '005930' });
await client.createOrder({
  accountSeq: 1,
  symbol: '005930',
  side: 'BUY',
  orderType: 'LIMIT',
  quantity: '10',
  price: '70000',
});
await client.cancelOrder({ accountSeq: 1, orderId: '...' });
```

Do not introduce resource namespaces such as `client.orders.create()` in the
MVP. The current operation count is small, and flat method names preserve the
OpenAPI contract and keep future TypeScript/Python parity straightforward.

## Request Parameters

Each endpoint method accepts at most two arguments:

```ts
client.someOperation(params?, options?)
```

Operations with no request parameters accept `options` as their only argument:

```ts
client.getAccounts({ withResponse: true });
```

`params` is a single SDK-friendly object that combines path, header, query, and
body parameters. The SDK maps that object into the HTTP request.

Rules:

- `X-Tossinvest-Account` is exposed as `accountSeq`.
- Path parameters such as `orderId` and `symbol` are ordinary properties.
- Query parameters are ordinary properties.
- JSON request body fields are ordinary properties.
- Decimal, date, date-time, symbol lists, and IDs remain strings where the
  OpenAPI schema defines strings.
- Do not convert `Date`, `number`, or `string[]` into API strings in the MVP.
- Do not add runtime validation in the MVP; rely on TypeScript types and server
  validation.

This keeps the public API ergonomic without inventing semantics beyond the
official contract.

## Response Shape

Business API operations return the `result` payload by default. Raw access is
available per call:

```ts
const accounts = await client.getAccounts();

const detailed = await client.getAccounts({ withResponse: true });
// detailed.data      -> unwrapped result
// detailed.raw       -> original API envelope
// detailed.response  -> HTTP metadata
```

Types:

```ts
interface TossInvestResponseMeta {
  status: number;
  headers: Headers;
  requestId?: string;
}

interface TossInvestWithResponse<TData, TRaw> {
  data: TData;
  raw: TRaw;
  response: TossInvestResponseMeta;
}
```

Public methods should use overloads so calls with `{ withResponse: true }` return
`TossInvestWithResponse<...>` and ordinary calls return unwrapped data.

Reasoning: This follows mature SDK patterns: ergonomic parsed data by default
while keeping access to original response details for debugging and integration
needs. Arrays and objects must not be mutated to attach hidden `.raw` fields.

`issueOAuth2Token()` is the exception because its response is an OAuth2 standard
body, not the Toss BFF `ApiResponse` envelope.

## Errors

## Timeout

The SDK includes request timeouts as a baseline HTTP safety feature:

- `TossInvestClientOptions.timeoutMs?: number`
- `TossInvestRequestOptions.timeoutMs?: number`
- Default timeout: `30_000` milliseconds.
- Per-call `timeoutMs` overrides the client default.
- Timeout applies to both token issuance and business API requests.
- Timeout failures throw `TossInvestConnectionError`.
- Retry remains out of scope.
- Direct external `AbortSignal` injection is out of scope for the MVP.

Reasoning: a server-side API SDK should not allow requests to hang forever by
default. Timeout is a bounded HTTP safety guard, unlike retry/backoff behavior
that can change mutation semantics.

## Errors

Expose two main error classes:

```ts
class TossInvestApiError extends Error {
  status: number;
  headers: Headers;
  body: unknown;
  code?: string;
  requestId?: string;
}

class TossInvestConnectionError extends Error {
  cause: unknown;
}
```

Behavior:

- Non-2xx HTTP responses throw `TossInvestApiError`.
- Toss `ErrorResponse` bodies should populate `code`, `message`, and
  `requestId` from nested `error` fields when present.
- OAuth2 error bodies should populate `code` from the OAuth `error` field when
  present.
- Network-level failures from `fetch`, including timeout aborts, throw
  `TossInvestConnectionError`.
- Do not implement retry behavior in the MVP.

## Generated Types

Use `openapi-typescript`:

- Input: `spec/upstream/openapi.json`
- Output: `packages/typescript/src/generated/openapi.ts`
- Script: `pnpm generate:types`
- Generated file is committed to the repository.
- Build does not implicitly regenerate types.
- Generated type drift is checked with `openapi-typescript --check`.

Reasoning: the package should build independently from checked-in source, but
type regeneration should remain explicit and reviewable when the upstream
OpenAPI document changes.

## File Structure

Create focused TypeScript modules:

- `src/generated/openapi.ts`: generated OpenAPI types.
- `src/types.ts`: public option, response, and operation helper types.
- `src/errors.ts`: exported error classes.
- `src/http.ts`: low-level request building, JSON parsing, form encoding, and
  error conversion.
- `src/auth.ts`: OAuth2 token manager.
- `src/client.ts`: `TossInvestClient` and operation methods.
- `src/index.ts`: public exports.

Tests should mirror the same responsibilities:

- auth lazy issuance and expiry behavior.
- request mapping for path, query, header, JSON body, and form body.
- success unwrap and `withResponse`.
- API and connection errors.
- representative operation methods, including account header mapping and order
  request bodies.

## Tooling Constraints

- Keep exact dependency versions.
- Keep pnpm `saveExact: true` and `savePrefix: ""`.
- Keep ESLint for lint and Prettier for format.
- Keep root orchestration through `mise`.
- Do not add fallback or legacy shim code.
- Do not commit, stage, or split worktrees unless the user explicitly asks.

## Acceptance Criteria

- `pnpm generate:types` creates `src/generated/openapi.ts` from the pinned
  OpenAPI document.
- All 21 OpenAPI operation IDs have public TypeScript methods.
- The SDK authenticates with `clientId` and `clientSecret` using lazy OAuth2
  token issuance.
- Business methods return unwrapped `result` by default.
- Business methods support `{ withResponse: true }` for raw envelope and HTTP
  metadata.
- Requests time out after `30_000` milliseconds by default and support
  client-level and per-call `timeoutMs` overrides.
- Errors are surfaced as `TossInvestApiError` or `TossInvestConnectionError`.
- `mise run //packages/typescript:lint` passes.
- `mise run //packages/typescript:format` passes.
- `mise run //packages/typescript:typecheck` passes.
- `mise run //packages/typescript:test` passes.
- `mise run //packages/typescript:build` passes.
- `mise run check` passes.
