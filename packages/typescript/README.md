# tossinvest-openapi

Unofficial TypeScript SDK for Toss Securities Open API.

This package uses only official documented OpenAPI endpoints. It is not provided, endorsed, or supported by Toss Securities or Viva Republica.

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

## Authentication

The SDK uses OAuth2 Client Credentials Grant internally. It requests an access token lazily on the first authenticated API call, caches it in memory, and reissues a token after the `expires_in` window.

Toss Securities does not provide refresh tokens. Token reissuance invalidates the previous token for the same client credentials, so prefer one `TossInvestClient` instance per credential set in a process.

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

## Orders

Order APIs are exposed because they are part of the official Toss Securities OpenAPI document. Treat order calls as state-changing operations.

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
    console.error(error.status, error.code, error.requestId, error.body);
  }

  if (error instanceof TossInvestConnectionError) {
    console.error(error.cause);
  }

  throw error;
}
```

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

## Scope

The TypeScript SDK exposes flat methods for every operation ID in the pinned Toss Securities OpenAPI 1.1.1 document, including account, market data, order, and order-info APIs.

Python is maintained separately in the same polyglot repository.
