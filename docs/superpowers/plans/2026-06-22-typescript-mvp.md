# TypeScript MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the TypeScript MVP SDK for Toss Securities OpenAPI with generated OpenAPI types, OAuth2 client-credentials auth, flat typed methods for all operations, unwrapped success data, raw response access, and predictable errors.

**Architecture:** Generate TypeScript contract types from `spec/upstream/openapi.json`, then implement a small handwritten SDK facade over `fetch`. Keep low-level HTTP, auth, errors, and public client methods in focused modules.

**Tech Stack:** TypeScript, Node 22 global `fetch`, pnpm, Vitest, tsup, ESLint, Prettier, `openapi-typescript`.

## Global Constraints

- Work on branch `feature/typescript-mvp`.
- Do not create a separate worktree.
- Commits are allowed on `feature/typescript-mvp`; do not push unless explicitly asked.
- Keep package dependency versions exact.
- Keep TypeScript public API flat and based on OpenAPI `operationId`.
- Constructor auth supports `clientId` and `clientSecret`, not public `accessToken`.
- Business API methods return unwrapped `result` by default.
- Per-call `{ withResponse: true }` returns `{ data, raw, response }`.
- Public operation params derive field types from generated `operations[...]`
  types where practical.
- Include timeout support with a `30_000` millisecond default, client-level override, and per-call override.
- Do not add retry, runtime response validation, auto-pagination, or legacy fallback code.
- Files must end with exactly one final newline.

---

## File Map

- Modify: `packages/typescript/package.json`
  - Add `openapi-typescript`.
  - Add `generate:types` and `check:types`.
- Create: `packages/typescript/src/generated/openapi.ts`
  - Generated OpenAPI types.
- Create: `packages/typescript/src/types.ts`
  - Public options, metadata, response wrapper, and helper types.
- Create: `packages/typescript/src/errors.ts`
  - `TossInvestApiError` and `TossInvestConnectionError`.
- Create: `packages/typescript/src/http.ts`
  - Request building, URL/query serialization, JSON parsing, form encoding, error conversion.
  - Timeout signal creation and fetch abort handling.
- Create: `packages/typescript/src/auth.ts`
  - Lazy OAuth2 token manager.
- Create: `packages/typescript/src/client.ts`
  - `TossInvestClient` and all operation methods.
- Modify: `packages/typescript/src/index.ts`
  - Public exports.
- Replace: `packages/typescript/test/index.test.ts`
  - Tests for public exports.
- Create: `packages/typescript/test/auth.test.ts`
  - Lazy token issuance and expiry behavior.
- Create: `packages/typescript/test/client.test.ts`
  - Operation mapping, unwrap, raw response access.
- Create: `packages/typescript/test/errors.test.ts`
  - API and connection errors.
- Modify: `README.md`
  - TypeScript MVP usage example.

---

### Task 1: Generate OpenAPI Types

**Files:**
- Modify: `packages/typescript/package.json`
- Create: `packages/typescript/src/generated/openapi.ts`

**Interfaces:**
- Produces: `paths`, `components`, and `operations` types exported by `src/generated/openapi.ts`.
- Consumes: `spec/upstream/openapi.json`.

- [ ] **Step 1: Add exact dev dependency**

Run:

```bash
pnpm --dir packages/typescript add -D openapi-typescript@7.13.0 --save-exact
```

Expected:

```text
devDependencies:
+ openapi-typescript 7.13.0
```

- [ ] **Step 2: Add generation script**

In `packages/typescript/package.json`, add:

```json
"generate:types": "openapi-typescript ../../spec/upstream/openapi.json -o src/generated/openapi.ts --default-non-nullable false",
"check:types": "openapi-typescript ../../spec/upstream/openapi.json -o src/generated/openapi.ts --default-non-nullable false --check"
```

Expected scripts include:

```json
{
  "build": "tsup src/index.ts --format esm --dts --clean --sourcemap --target node22",
  "format": "prettier . --write",
  "format:check": "prettier . --check",
  "generate:types": "openapi-typescript ../../spec/upstream/openapi.json -o src/generated/openapi.ts --default-non-nullable false",
  "check:types": "openapi-typescript ../../spec/upstream/openapi.json -o src/generated/openapi.ts --default-non-nullable false --check",
  "lint": "eslint .",
  "test": "vitest run",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 3: Generate types**

Run:

```bash
pnpm --dir packages/typescript generate:types
```

Expected: the command exits successfully and
`packages/typescript/src/generated/openapi.ts` exists.

- [ ] **Step 4: Verify generated file is formatted and typecheckable**

Run:

```bash
mise run //packages/typescript:format
pnpm --dir packages/typescript check:types
mise run //packages/typescript:typecheck
```

Expected: all commands pass.

---

### Task 2: Public Types and Errors

**Files:**
- Create: `packages/typescript/src/types.ts`
- Create: `packages/typescript/src/errors.ts`
- Modify: `packages/typescript/src/index.ts`
- Replace: `packages/typescript/test/index.test.ts`
- Create: `packages/typescript/test/errors.test.ts`

**Interfaces:**
- Produces:
  - `TossInvestClientOptions`
  - `TossInvestRequestOptions`
  - `TossInvestResponseMeta`
  - `TossInvestWithResponse<TData, TRaw>`
  - `TossInvestApiError`
  - `TossInvestConnectionError`

- [ ] **Step 1: Write public export tests**

Create `packages/typescript/test/index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  VERSION,
  TossInvestApiError,
  TossInvestConnectionError,
  getPackageInfo,
} from '../src/index.js';

describe('public exports', () => {
  it('exports package metadata', () => {
    expect(VERSION).toBe('0.0.0');
    expect(getPackageInfo()).toEqual({
      name: 'tossinvest-openapi',
      version: '0.0.0',
    });
  });

  it('exports SDK error classes', () => {
    expect(TossInvestApiError).toBeTypeOf('function');
    expect(TossInvestConnectionError).toBeTypeOf('function');
  });
});
```

- [ ] **Step 2: Write error behavior tests**

Create `packages/typescript/test/errors.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { TossInvestApiError, TossInvestConnectionError } from '../src/index.js';

describe('TossInvestApiError', () => {
  it('stores HTTP metadata and parsed error body', () => {
    const headers = new Headers({ 'x-request-id': 'req_123' });
    const body = { code: 'invalid-token', message: 'Token has expired' };

    const error = new TossInvestApiError({
      status: 401,
      headers,
      body,
      code: body.code,
      message: body.message,
      requestId: 'req_123',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TossInvestApiError');
    expect(error.message).toBe('Token has expired');
    expect(error.status).toBe(401);
    expect(error.headers).toBe(headers);
    expect(error.body).toEqual(body);
    expect(error.code).toBe('invalid-token');
    expect(error.requestId).toBe('req_123');
  });
});

describe('TossInvestConnectionError', () => {
  it('stores the original cause', () => {
    const cause = new TypeError('fetch failed');
    const error = new TossInvestConnectionError('Request failed', cause);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TossInvestConnectionError');
    expect(error.message).toBe('Request failed');
    expect(error.cause).toBe(cause);
  });
});
```

- [ ] **Step 3: Run tests and verify failure**

Run:

```bash
pnpm --dir packages/typescript test
```

Expected: fails because error classes are not exported yet.

- [ ] **Step 4: Implement types**

Create `packages/typescript/src/types.ts`:

```ts
export interface TossInvestClientOptions {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  userAgent?: string;
}

export interface TossInvestRequestOptions {
  timeoutMs?: number;
  withResponse?: boolean;
}

export interface TossInvestResponseMeta {
  status: number;
  headers: Headers;
  requestId?: string;
}

export interface TossInvestWithResponse<TData, TRaw> {
  data: TData;
  raw: TRaw;
  response: TossInvestResponseMeta;
}
```

- [ ] **Step 5: Implement errors**

Create `packages/typescript/src/errors.ts`:

```ts
export interface TossInvestApiErrorOptions {
  status: number;
  headers: Headers;
  body: unknown;
  code?: string;
  message?: string;
  requestId?: string;
}

export class TossInvestApiError extends Error {
  readonly status: number;
  readonly headers: Headers;
  readonly body: unknown;
  readonly code?: string;
  readonly requestId?: string;

  constructor(options: TossInvestApiErrorOptions) {
    super(options.message ?? `Toss Invest API request failed with status ${options.status}`);
    this.name = 'TossInvestApiError';
    this.status = options.status;
    this.headers = options.headers;
    this.body = options.body;
    this.code = options.code;
    this.requestId = options.requestId;
  }
}

export class TossInvestConnectionError extends Error {
  override readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'TossInvestConnectionError';
    this.cause = cause;
  }
}
```

- [ ] **Step 6: Export public symbols**

Modify `packages/typescript/src/index.ts`:

```ts
export const VERSION = '0.0.0';

export interface PackageInfo {
  name: 'tossinvest-openapi';
  version: typeof VERSION;
}

export function getPackageInfo(): PackageInfo {
  return {
    name: 'tossinvest-openapi',
    version: VERSION,
  };
}

export { TossInvestApiError, TossInvestConnectionError } from './errors.js';
export type {
  TossInvestClientOptions,
  TossInvestRequestOptions,
  TossInvestResponseMeta,
  TossInvestWithResponse,
} from './types.js';
```

- [ ] **Step 7: Verify**

Run:

```bash
mise run //packages/typescript:test
mise run //packages/typescript:typecheck
```

Expected: both commands pass.

---

### Task 3: HTTP Core

**Files:**
- Create: `packages/typescript/src/http.ts`
- Create: `packages/typescript/test/http.test.ts`

**Interfaces:**
- Consumes: error classes and response types.
- Produces:
  - `type FetchLike = typeof fetch`
  - `interface HttpRequest`
  - `async function requestJson<T>(fetchImpl, request): Promise<HttpSuccess<T>>`
  - `function buildUrl(baseUrl, path, query): string`
  - `function encodeForm(data): URLSearchParams`
  - `function createTimeoutSignal(timeoutMs): AbortSignal`

- [ ] **Step 1: Write HTTP tests**

Create `packages/typescript/test/http.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import { TossInvestApiError, TossInvestConnectionError } from '../src/errors.js';
import { buildUrl, encodeForm, requestJson } from '../src/http.js';

describe('buildUrl', () => {
  it('serializes defined query values and omits undefined values', () => {
    expect(
      buildUrl('https://openapi.tossinvest.com/', '/api/v1/orders', {
        status: 'OPEN',
        symbol: undefined,
        limit: 20,
      }),
    ).toBe('https://openapi.tossinvest.com/api/v1/orders?status=OPEN&limit=20');
  });
});

describe('encodeForm', () => {
  it('encodes OAuth token request form fields', () => {
    const form = encodeForm({
      grant_type: 'client_credentials',
      client_id: 'client',
      client_secret: 'secret',
    });

    expect(form.toString()).toBe(
      'grant_type=client_credentials&client_id=client&client_secret=secret',
    );
  });
});

describe('requestJson', () => {
  it('returns parsed JSON and response metadata for successful responses', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ result: [{ accountSeq: 1 }] }), {
        status: 200,
        headers: { 'x-request-id': 'req_123' },
      }),
    );

    const result = await requestJson(fetchImpl, {
      method: 'GET',
      url: 'https://example.test/accounts',
      headers: new Headers(),
      timeoutMs: 1000,
    });

    expect(result.data).toEqual({ result: [{ accountSeq: 1 }] });
    expect(result.response.status).toBe(200);
    expect(result.response.requestId).toBe('req_123');
  });

  it('throws TossInvestApiError for JSON error responses', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            requestId: 'body_req_401',
            code: 'invalid-token',
            message: 'Token has expired',
          },
        }),
        {
          status: 401,
          headers: { 'x-request-id': 'req_401' },
        },
      ),
    );

    await expect(
      requestJson(fetchImpl, {
        method: 'GET',
        url: 'https://example.test/accounts',
        headers: new Headers(),
        timeoutMs: 1000,
      }),
    ).rejects.toMatchObject({
      name: 'TossInvestApiError',
      status: 401,
      code: 'invalid-token',
      requestId: 'req_401',
    } satisfies Partial<TossInvestApiError>);
  });

  it('throws TossInvestConnectionError for fetch failures', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('fetch failed'));

    await expect(
      requestJson(fetchImpl, {
        method: 'GET',
        url: 'https://example.test/accounts',
        headers: new Headers(),
        timeoutMs: 1000,
      }),
    ).rejects.toBeInstanceOf(TossInvestConnectionError);
  });

  it('passes a timeout signal to fetch requests', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ result: [] }), {
        status: 200,
      }),
    );

    await requestJson(fetchImpl, {
      method: 'GET',
      url: 'https://example.test/accounts',
      headers: new Headers(),
      timeoutMs: 1000,
    });

    const signal = fetchImpl.mock.calls[0]?.[1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm --dir packages/typescript test -- http.test.ts
```

Expected: fails because `src/http.ts` does not exist.

- [ ] **Step 3: Implement HTTP core**

Create `packages/typescript/src/http.ts`:

```ts
import { TossInvestApiError, TossInvestConnectionError } from './errors.js';
import type { TossInvestResponseMeta } from './types.js';

export type FetchLike = typeof fetch;

export interface HttpRequest {
  method: string;
  url: string;
  headers: Headers;
  body?: BodyInit;
  timeoutMs: number;
}

export interface HttpSuccess<TData> {
  data: TData;
  response: TossInvestResponseMeta;
}

export function buildUrl(
  baseUrl: string,
  path: string,
  query: Record<string, string | number | boolean | null | undefined> = {},
): string {
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function encodeForm(data: Record<string, string>): URLSearchParams {
  const form = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    form.set(key, value);
  }

  return form;
}

export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

export async function requestJson<TData>(
  fetchImpl: FetchLike,
  request: HttpRequest,
): Promise<HttpSuccess<TData>> {
  let response: Response;

  try {
    response = await fetchImpl(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: createTimeoutSignal(request.timeoutMs),
    });
  } catch (error) {
    throw new TossInvestConnectionError('Toss Invest API request failed before receiving a response', error);
  }

  const body = await parseJsonBody(response);
  const meta = {
    status: response.status,
    headers: response.headers,
    requestId: response.headers.get('x-request-id') ?? undefined,
  };

  if (!response.ok) {
    const requestId = meta.requestId ?? extractBodyRequestId(body);

    throw new TossInvestApiError({
      status: response.status,
      headers: response.headers,
      body,
      code: extractErrorCode(body),
      message: extractErrorMessage(body),
      requestId,
    });
  }

  return {
    data: body as TData,
    response: meta,
  };
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractErrorCode(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  if ('error' in body && body.error && typeof body.error === 'object') {
    const nested = body.error;

    if ('code' in nested && typeof nested.code === 'string') {
      return nested.code;
    }
  }

  if ('code' in body && typeof body.code === 'string') {
    return body.code;
  }

  if ('error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return undefined;
}

function extractErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  if ('error' in body && body.error && typeof body.error === 'object') {
    const nested = body.error;

    if ('message' in nested && typeof nested.message === 'string') {
      return nested.message;
    }
  }

  if ('message' in body && typeof body.message === 'string') {
    return body.message;
  }

  if ('error_description' in body && typeof body.error_description === 'string') {
    return body.error_description;
  }

  return undefined;
}

function extractBodyRequestId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  if ('error' in body && body.error && typeof body.error === 'object') {
    const nested = body.error;

    if ('requestId' in nested && typeof nested.requestId === 'string') {
      return nested.requestId;
    }
  }

  return undefined;
}
```

- [ ] **Step 4: Verify**

Run:

```bash
mise run //packages/typescript:test
mise run //packages/typescript:typecheck
```

Expected: both commands pass.

---

### Task 4: OAuth2 Token Manager

**Files:**
- Create: `packages/typescript/src/auth.ts`
- Create: `packages/typescript/test/auth.test.ts`

**Interfaces:**
- Consumes: `FetchLike`, `buildUrl`, `encodeForm`, `requestJson`.
- Produces:
  - `interface OAuth2Token`
  - `class TokenManager`
  - `TokenManager.getAccessToken(): Promise<string>`
  - `TokenManager.issueToken(): Promise<OAuth2Token>`

- [ ] **Step 1: Write auth tests**

Create `packages/typescript/test/auth.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import { TokenManager } from '../src/auth.js';

describe('TokenManager', () => {
  it('lazily issues a token and caches it until expiry', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'token-1',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );

    const manager = new TokenManager({
      clientId: 'client',
      clientSecret: 'secret',
      baseUrl: 'https://openapi.tossinvest.com',
      fetch: fetchImpl,
      timeoutMs: 1000,
      now: () => 1_000_000,
    });

    await expect(manager.getAccessToken()).resolves.toBe('token-1');
    await expect(manager.getAccessToken()).resolves.toBe('token-1');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('reissues a token after expiry', async () => {
    let now = 1_000_000;
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'token-1',
            token_type: 'Bearer',
            expires_in: 1,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'token-2',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
          { status: 200 },
        ),
      );

    const manager = new TokenManager({
      clientId: 'client',
      clientSecret: 'secret',
      baseUrl: 'https://openapi.tossinvest.com',
      fetch: fetchImpl,
      timeoutMs: 1000,
      expirySkewMs: 0,
      now: () => now,
    });

    await expect(manager.getAccessToken()).resolves.toBe('token-1');
    now += 1001;
    await expect(manager.getAccessToken()).resolves.toBe('token-2');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent token cache misses into one token request', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'token-1',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );

    const manager = new TokenManager({
      clientId: 'client',
      clientSecret: 'secret',
      baseUrl: 'https://openapi.tossinvest.com',
      fetch: fetchImpl,
      timeoutMs: 1000,
      now: () => 1_000_000,
    });

    await expect(Promise.all([manager.getAccessToken(), manager.getAccessToken()])).resolves.toEqual([
      'token-1',
      'token-1',
    ]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm --dir packages/typescript test -- auth.test.ts
```

Expected: fails because `src/auth.ts` does not exist.

- [ ] **Step 3: Implement token manager**

Create `packages/typescript/src/auth.ts`:

```ts
import { buildUrl, encodeForm, requestJson, type FetchLike } from './http.js';

export interface OAuth2Token {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface TokenManagerOptions {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  fetch: FetchLike;
  userAgent?: string;
  timeoutMs: number;
  expirySkewMs?: number;
  now?: () => number;
}

export class TokenManager {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly userAgent?: string;
  private readonly timeoutMs: number;
  private readonly expirySkewMs: number;
  private readonly now: () => number;
  private token?: { value: OAuth2Token; expiresAt: number };
  private inFlightToken?: Promise<OAuth2Token>;

  constructor(options: TokenManagerOptions) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetch;
    this.userAgent = options.userAgent;
    this.timeoutMs = options.timeoutMs;
    this.expirySkewMs = options.expirySkewMs ?? 30_000;
    this.now = options.now ?? Date.now;
  }

  async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > this.now()) {
      return this.token.value.access_token;
    }

    this.inFlightToken ??= this.issueToken().finally(() => {
      this.inFlightToken = undefined;
    });

    const token = await this.inFlightToken;
    this.token = {
      value: token,
      expiresAt: this.now() + token.expires_in * 1000 - this.expirySkewMs,
    };

    return token.access_token;
  }

  async issueToken(): Promise<OAuth2Token> {
    const headers = new Headers({
      'content-type': 'application/x-www-form-urlencoded',
    });

    if (this.userAgent) {
      headers.set('user-agent', this.userAgent);
    }

    const { data } = await requestJson<OAuth2Token>(this.fetchImpl, {
      method: 'POST',
      url: buildUrl(this.baseUrl, '/oauth2/token'),
      headers,
      body: encodeForm({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      timeoutMs: this.timeoutMs,
    });

    return data;
  }
}
```

- [ ] **Step 4: Verify**

Run:

```bash
mise run //packages/typescript:test
mise run //packages/typescript:typecheck
```

Expected: both commands pass.

---

### Task 5: Client Core and Representative Operations

**Files:**
- Create: `packages/typescript/src/client.ts`
- Modify: `packages/typescript/src/index.ts`
- Create: `packages/typescript/test/client.test.ts`

**Interfaces:**
- Consumes: `TokenManager`, HTTP helpers, generated OpenAPI `operations`.
- Produces:
  - `class TossInvestClient`
  - `getAccounts(options?)`
  - `getPrices(params, options?)`
  - `getHoldings(params, options?)`
  - `createOrder(params, options?)`
  - `cancelOrder(params, options?)`
  - `issueOAuth2Token()`

- [ ] **Step 1: Write client tests for representative operations**

Create `packages/typescript/test/client.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';

import { TossInvestClient } from '../src/index.js';

describe('TossInvestClient', () => {
  it('lazily authenticates and unwraps account results', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'token',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            result: [{ accountNo: '12345678901', accountSeq: 1, accountType: 'BROKERAGE' }],
          }),
          { status: 200, headers: { 'x-request-id': 'req_accounts' } },
        ),
      );

    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await expect(client.getAccounts()).resolves.toEqual([
      { accountNo: '12345678901', accountSeq: 1, accountType: 'BROKERAGE' },
    ]);

    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://openapi.tossinvest.com/api/v1/accounts',
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers),
      }),
    );

    const headers = fetchImpl.mock.calls[1]?.[1]?.headers;
    expect(headers).toBeInstanceOf(Headers);
    expect((headers as Headers).get('authorization')).toBe('Bearer token');
  });

  it('returns raw envelope and response metadata with withResponse', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ access_token: 'token', token_type: 'Bearer', expires_in: 3600 }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ result: [] }), {
          status: 200,
          headers: { 'x-request-id': 'req_accounts' },
        }),
      );

    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await expect(client.getAccounts({ withResponse: true })).resolves.toEqual({
      data: [],
      raw: { result: [] },
      response: expect.objectContaining({
        status: 200,
        requestId: 'req_accounts',
      }),
    });
  });

  it('maps query parameters', async () => {
    const fetchImpl = createAuthedFetch({ result: [] });
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await client.getPrices({ symbols: '005930,AAPL' });

    expect(fetchImpl.mock.calls[1]?.[0]).toBe(
      'https://openapi.tossinvest.com/api/v1/prices?symbols=005930%2CAAPL',
    );
  });

  it('maps accountSeq to X-Tossinvest-Account and sends JSON order bodies', async () => {
    const fetchImpl = createAuthedFetch({ result: { orderId: 'order-1' } });
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await client.createOrder({
      accountSeq: 1,
      symbol: '005930',
      side: 'BUY',
      orderType: 'LIMIT',
      quantity: '10',
      price: '70000',
    });

    const request = fetchImpl.mock.calls[1]?.[1];
    const headers = request?.headers as Headers;

    expect(fetchImpl.mock.calls[1]?.[0]).toBe('https://openapi.tossinvest.com/api/v1/orders');
    expect(request?.method).toBe('POST');
    expect(headers.get('x-tossinvest-account')).toBe('1');
    expect(headers.get('content-type')).toBe('application/json');
    expect(request?.body).toBe(
      JSON.stringify({
        symbol: '005930',
        side: 'BUY',
        orderType: 'LIMIT',
        quantity: '10',
        price: '70000',
      }),
    );
  });
});

function createAuthedFetch(body: unknown): ReturnType<typeof vi.fn<typeof fetch>> {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'token', token_type: 'Bearer', expires_in: 3600 }), {
        status: 200,
      }),
    )
    .mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 200 }));
}
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm --dir packages/typescript test -- client.test.ts
```

Expected: fails because `TossInvestClient` is not exported yet.

- [ ] **Step 3: Implement client core and representative operations**

Create `packages/typescript/src/client.ts` with these exported types and class. Use generated operation types for request and response aliases where possible:

```ts
import { TokenManager, type OAuth2Token } from './auth.js';
import { buildUrl, requestJson, type FetchLike } from './http.js';
import type { operations } from './generated/openapi.js';
import type {
  TossInvestClientOptions,
  TossInvestRequestOptions,
  TossInvestWithResponse,
} from './types.js';

const DEFAULT_BASE_URL = 'https://openapi.tossinvest.com';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_USER_AGENT = 'tossinvest-openapi-js/0.0.0';

type ApiEnvelope<TData> = { result: TData };
type WithResponseOptions = TossInvestRequestOptions & { withResponse: true };

type GetAccountsRaw = SuccessResponse<'getAccounts'>;
type GetAccountsData = ResultOf<GetAccountsRaw>;
type GetPricesRaw = SuccessResponse<'getPrices'>;
type GetPricesData = ResultOf<GetPricesRaw>;
type GetHoldingsRaw = SuccessResponse<'getHoldings'>;
type GetHoldingsData = ResultOf<GetHoldingsRaw>;
type CreateOrderRaw = SuccessResponse<'createOrder'>;
type CreateOrderData = ResultOf<CreateOrderRaw>;
type CancelOrderRaw = SuccessResponse<'cancelOrder'>;
type CancelOrderData = ResultOf<CancelOrderRaw>;

export interface GetPricesParams {
  symbols: string;
}

export interface GetHoldingsParams {
  accountSeq: number;
  symbol?: string;
}

export type CreateOrderParams = RequestBody<'createOrder'> & {
  accountSeq: number;
};

export interface CancelOrderParams {
  accountSeq: number;
  orderId: string;
}

export class TossInvestClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private readonly userAgent: string;
  private readonly tokenManager: TokenManager;

  constructor(options: TossInvestClientOptions) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.tokenManager = new TokenManager({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      baseUrl: this.baseUrl,
      fetch: this.fetchImpl,
      timeoutMs: this.timeoutMs,
      userAgent: this.userAgent,
    });
  }

  issueOAuth2Token(): Promise<OAuth2Token> {
    return this.tokenManager.issueToken();
  }

  getAccounts(options: WithResponseOptions): Promise<TossInvestWithResponse<GetAccountsData, GetAccountsRaw>>;
  getAccounts(options?: TossInvestRequestOptions): Promise<GetAccountsData>;
  getAccounts(
    options?: TossInvestRequestOptions,
  ): Promise<GetAccountsData | TossInvestWithResponse<GetAccountsData, GetAccountsRaw>> {
    return this.requestEnvelope('/api/v1/accounts', 'GET', undefined, undefined, options);
  }

  getPrices(
    params: GetPricesParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetPricesData, GetPricesRaw>>;
  getPrices(params: GetPricesParams, options?: TossInvestRequestOptions): Promise<GetPricesData>;
  getPrices(
    params: GetPricesParams,
    options?: TossInvestRequestOptions,
  ): Promise<GetPricesData | TossInvestWithResponse<GetPricesData, GetPricesRaw>> {
    return this.requestEnvelope('/api/v1/prices', 'GET', { symbols: params.symbols }, undefined, options);
  }

  getHoldings(
    params: GetHoldingsParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetHoldingsData, GetHoldingsRaw>>;
  getHoldings(params: GetHoldingsParams, options?: TossInvestRequestOptions): Promise<GetHoldingsData>;
  getHoldings(
    params: GetHoldingsParams,
    options?: TossInvestRequestOptions,
  ): Promise<GetHoldingsData | TossInvestWithResponse<GetHoldingsData, GetHoldingsRaw>> {
    return this.requestEnvelope(
      '/api/v1/holdings',
      'GET',
      { symbol: params.symbol },
      params.accountSeq,
      options,
    );
  }

  createOrder(
    params: CreateOrderParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<CreateOrderData, CreateOrderRaw>>;
  createOrder(params: CreateOrderParams, options?: TossInvestRequestOptions): Promise<CreateOrderData>;
  createOrder(
    params: CreateOrderParams,
    options?: TossInvestRequestOptions,
  ): Promise<CreateOrderData | TossInvestWithResponse<CreateOrderData, CreateOrderRaw>> {
    const { accountSeq, ...body } = params;
    return this.requestEnvelope('/api/v1/orders', 'POST', undefined, accountSeq, options, body);
  }

  cancelOrder(
    params: CancelOrderParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<CancelOrderData, CancelOrderRaw>>;
  cancelOrder(params: CancelOrderParams, options?: TossInvestRequestOptions): Promise<CancelOrderData>;
  cancelOrder(
    params: CancelOrderParams,
    options?: TossInvestRequestOptions,
  ): Promise<CancelOrderData | TossInvestWithResponse<CancelOrderData, CancelOrderRaw>> {
    return this.requestEnvelope(
      `/api/v1/orders/${encodeURIComponent(params.orderId)}/cancel`,
      'POST',
      undefined,
      params.accountSeq,
      options,
      {},
    );
  }

  private async requestEnvelope<TData, TRaw extends ApiEnvelope<TData>>(
    path: string,
    method: string,
    query: Record<string, string | number | boolean | null | undefined> | undefined,
    accountSeq: number | undefined,
    options: TossInvestRequestOptions | undefined,
    body?: unknown,
  ): Promise<TData | TossInvestWithResponse<TData, TRaw>> {
    const headers = new Headers({
      authorization: `Bearer ${await this.tokenManager.getAccessToken()}`,
      'user-agent': this.userAgent,
    });

    if (accountSeq !== undefined) {
      headers.set('x-tossinvest-account', String(accountSeq));
    }

    let requestBody: BodyInit | undefined;

    if (body !== undefined) {
      headers.set('content-type', 'application/json');
      requestBody = JSON.stringify(body);
    }

    const { data: raw, response } = await requestJson<TRaw>(this.fetchImpl, {
      method,
      url: buildUrl(this.baseUrl, path, query),
      headers,
      body: requestBody,
      timeoutMs: options?.timeoutMs ?? this.timeoutMs,
    });

    const data = raw.result;

    if (options?.withResponse === true) {
      return { data, raw, response };
    }

    return data;
  }
}

type SuccessResponse<TOperation extends keyof operations> =
  operations[TOperation] extends {
    responses: { 200: { content: { 'application/json': infer TResponse } } };
  }
    ? TResponse
    : never;

type ResultOf<TRaw> = TRaw extends { result: infer TResult } ? TResult : never;

type RequestBody<TOperation extends keyof operations> =
  operations[TOperation] extends {
    requestBody: { content: { 'application/json': infer TBody } };
  }
    ? TBody
    : never;
```

- [ ] **Step 4: Export client**

Modify `packages/typescript/src/index.ts`:

```ts
export const VERSION = '0.0.0';

export interface PackageInfo {
  name: 'tossinvest-openapi';
  version: typeof VERSION;
}

export function getPackageInfo(): PackageInfo {
  return {
    name: 'tossinvest-openapi',
    version: VERSION,
  };
}

export { TossInvestClient } from './client.js';
export { TossInvestApiError, TossInvestConnectionError } from './errors.js';
export type {
  CancelOrderParams,
  CreateOrderParams,
  GetHoldingsParams,
  GetPricesParams,
} from './client.js';
export type {
  TossInvestClientOptions,
  TossInvestRequestOptions,
  TossInvestResponseMeta,
  TossInvestWithResponse,
} from './types.js';
```

- [ ] **Step 5: Verify**

Run:

```bash
mise run //packages/typescript:test
mise run //packages/typescript:typecheck
```

Expected: both commands pass.

---

### Task 6: Complete All Operation Methods

**Files:**
- Modify: `packages/typescript/src/client.ts`
- Modify: `packages/typescript/src/index.ts`
- Modify: `packages/typescript/test/client.test.ts`

**Interfaces:**
- Produces flat methods for all OpenAPI operation IDs:
  - `issueOAuth2Token`
  - `getOrderbook`
  - `getPrices`
  - `getTrades`
  - `getPriceLimit`
  - `getCandles`
  - `getStocks`
  - `getStockWarnings`
  - `getExchangeRate`
  - `getKrMarketCalendar`
  - `getUsMarketCalendar`
  - `getAccounts`
  - `getHoldings`
  - `getOrders`
  - `createOrder`
  - `getOrder`
  - `modifyOrder`
  - `cancelOrder`
  - `getBuyingPower`
  - `getSellableQuantity`
  - `getCommissions`

- [ ] **Step 1: Add compile-time method coverage test**

Append to `packages/typescript/test/client.test.ts`:

```ts
describe('operation coverage', () => {
  it('exposes all OpenAPI operation methods', () => {
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: vi.fn<typeof fetch>(),
    });

    expect(client.issueOAuth2Token).toBeTypeOf('function');
    expect(client.getOrderbook).toBeTypeOf('function');
    expect(client.getPrices).toBeTypeOf('function');
    expect(client.getTrades).toBeTypeOf('function');
    expect(client.getPriceLimit).toBeTypeOf('function');
    expect(client.getCandles).toBeTypeOf('function');
    expect(client.getStocks).toBeTypeOf('function');
    expect(client.getStockWarnings).toBeTypeOf('function');
    expect(client.getExchangeRate).toBeTypeOf('function');
    expect(client.getKrMarketCalendar).toBeTypeOf('function');
    expect(client.getUsMarketCalendar).toBeTypeOf('function');
    expect(client.getAccounts).toBeTypeOf('function');
    expect(client.getHoldings).toBeTypeOf('function');
    expect(client.getOrders).toBeTypeOf('function');
    expect(client.createOrder).toBeTypeOf('function');
    expect(client.getOrder).toBeTypeOf('function');
    expect(client.modifyOrder).toBeTypeOf('function');
    expect(client.cancelOrder).toBeTypeOf('function');
    expect(client.getBuyingPower).toBeTypeOf('function');
    expect(client.getSellableQuantity).toBeTypeOf('function');
    expect(client.getCommissions).toBeTypeOf('function');
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm --dir packages/typescript test -- client.test.ts
```

Expected: fails because remaining methods are missing.

- [ ] **Step 3: Add params interfaces and operation methods**

Extend `packages/typescript/src/client.ts` with params types for every operation
that needs input. Derive query, path, header, and request body field types from
generated `operations[...]` types where practical. The handwritten public params
types may only reshape the generated contract, such as exposing
`X-Tossinvest-Account` as `accountSeq` and merging path/query/body fields into
one object.

Required method behavior:

```ts
getOrderbook({ symbol }) -> GET /api/v1/orderbook?symbol=...
getTrades({ symbol, count? }) -> GET /api/v1/trades?symbol=...&count=...
getPriceLimit({ symbol }) -> GET /api/v1/price-limits?symbol=...
getCandles({ symbol, interval, count?, before?, adjusted? }) -> GET /api/v1/candles
getStocks({ symbols }) -> GET /api/v1/stocks?symbols=...
getStockWarnings({ symbol }) -> GET /api/v1/stocks/{symbol}/warnings
getExchangeRate({ dateTime?, baseCurrency, quoteCurrency }) -> GET /api/v1/exchange-rate
getKrMarketCalendar({ date? }?) -> GET /api/v1/market-calendar/KR
getUsMarketCalendar({ date? }?) -> GET /api/v1/market-calendar/US
getOrders({ accountSeq, status, symbol?, from?, to?, cursor?, limit? }) -> GET /api/v1/orders
getOrder({ accountSeq, orderId }) -> GET /api/v1/orders/{orderId}
modifyOrder({ accountSeq, orderId, ...body }) -> POST /api/v1/orders/{orderId}/modify
getBuyingPower({ accountSeq, currency }) -> GET /api/v1/buying-power
getSellableQuantity({ accountSeq, symbol }) -> GET /api/v1/sellable-quantity
getCommissions({ accountSeq }) -> GET /api/v1/commissions
```

For every method, call `requestEnvelope` and provide overloads so ordinary calls
return unwrapped data while calls with `{ withResponse: true }` return
`TossInvestWithResponse<...>`.

- [ ] **Step 4: Export operation params**

Export all new params types from `packages/typescript/src/index.ts`.

- [ ] **Step 5: Verify all methods**

Run:

```bash
mise run //packages/typescript:test
mise run //packages/typescript:typecheck
```

Expected: both commands pass.

---

### Task 7: README and Package Verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: final public API from `src/index.ts`.
- Produces: minimal TypeScript usage documentation.

- [ ] **Step 1: Add README usage**

Add a TypeScript section to `README.md`:

````md
## TypeScript SDK

```ts
import { TossInvestClient } from 'tossinvest-openapi';

const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
  timeoutMs: 30_000,
});

const accounts = await client.getAccounts();

const prices = await client.getPrices({
  symbols: '005930,AAPL',
});
```

The SDK uses Toss Securities OAuth2 Client Credentials Grant internally. It
lazily requests an access token on the first authenticated API call. Toss
Securities does not provide refresh tokens; after the `expires_in` window has
passed, the SDK calls `/oauth2/token` again before the next API request. Token
reissuance invalidates the previously issued token for the same client, so reuse
one SDK client instance per credential set in a process. Business API methods
return the unwrapped `result` payload by default.

Requests time out after 30 seconds by default. Override timeout globally with
`new TossInvestClient({ timeoutMs: ... })` or per call:

```ts
const accounts = await client.getAccounts({ timeoutMs: 10_000 });
```

Use `{ withResponse: true }` when raw response access is needed:

```ts
const result = await client.getAccounts({ withResponse: true });

console.log(result.data);
console.log(result.raw);
console.log(result.response.requestId);
```
````

- [ ] **Step 2: Run full package checks**

Run:

```bash
mise run //packages/typescript:format
pnpm --dir packages/typescript check:types
mise run //packages/typescript:lint
mise run //packages/typescript:typecheck
mise run //packages/typescript:test
mise run //packages/typescript:build
```

Expected: all commands pass.

- [ ] **Step 3: Run repository check**

Run:

```bash
mise run check
```

Expected: full repository check passes.

- [ ] **Step 4: Inspect working tree**

Run:

```bash
git status --short --branch
```

Expected: modified and untracked implementation files are visible; no files are staged by the agent.
