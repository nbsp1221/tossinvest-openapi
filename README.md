# tossinvest-openapi

Unofficial SDK for Toss Securities Open API. This project uses only official documented OpenAPI endpoints.

이 프로젝트는 토스증권 공식 OpenAPI 문서에 공개된 엔드포인트만 사용하는 비공식 SDK입니다.
토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

## Status

This repository is in the TypeScript MVP phase, with Python maintained as a first-class package in the same polyglot monorepo.

## Development

Required tools are managed through `mise`.

```sh
mise install
mise run install
mise run check
```

## TypeScript SDK

```ts
import { TossInvestApiError, TossInvestClient } from 'tossinvest-openapi';

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

The SDK uses Toss Securities OAuth2 Client Credentials Grant internally. It lazily requests an access token on the first authenticated API call. Toss Securities does not provide refresh tokens; after the `expires_in` window has passed, the SDK calls `/oauth2/token` again before the next API request. Token reissuance invalidates the previously issued token for the same client, so reuse one SDK client instance per credential set in a process.

Business API methods return the unwrapped `result` payload by default. Use `{ withResponse: true }` when raw response access is needed:

```ts
const result = await client.getAccounts({ withResponse: true });

console.log(result.data);
console.log(result.raw);
console.log(result.response.requestId);
```

Requests time out after 30 seconds by default. Override timeout globally with `new TossInvestClient({ timeoutMs: ... })` or per call:

```ts
const result = await client.getAccounts({ timeoutMs: 10_000 });
```

Handle API errors through `TossInvestApiError`:

```ts
try {
  await client.getOrders({ accountSeq: 1, status: 'OPEN' });
} catch (error) {
  if (error instanceof TossInvestApiError) {
    console.error(error.status, error.code, error.requestId);
  }

  throw error;
}
```

Pagination stays explicit in the MVP. For paginated endpoints, pass the cursor fields returned by the API into the next request.

## Safety Policy

- Use only the official Toss Securities OpenAPI documentation and JSON schema.
- Do not use reverse engineered, private, or internal Toss app/web APIs.
- Do not log secrets, access tokens, account identifiers, or order payloads.
- Treat order APIs as state-changing operations and use explicit application-level confirmation before calling them.
