# tossinvest-openapi

[![npm version](https://img.shields.io/npm/v/tossinvest-openapi.svg)](https://www.npmjs.com/package/tossinvest-openapi)

Unofficial TypeScript SDK for Toss Securities Open API.

> [!NOTE]
> This package uses only official documented OpenAPI endpoints. It is not
> provided, endorsed, or supported by Toss Securities or Viva Republica.

[한국어](README.md)

## Installation

```sh
pnpm add tossinvest-openapi
```

## First Request

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

## Requirements

- Node.js 22 or newer
- ESM-only runtime
- Toss Securities Open API client credentials

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

## API Coverage

The TypeScript SDK exposes flat methods for the business operations in the pinned Toss Securities OpenAPI 1.1.1 document.

| Area                                                      | Supported |
| --------------------------------------------------------- | --------- |
| OAuth2 Client Credentials authentication                  | Yes       |
| Accounts, balances, and holdings                          | Yes       |
| Domestic and overseas market data                         | Yes       |
| Buying power, sellable quantity, and commission prechecks | Yes       |
| Create, modify, and cancel orders                         | Yes       |
| Order list and order detail lookup                        | Yes       |
| WebSocket/realtime streaming                              | No        |

## Examples

- [Account and holdings lookup](examples/account-holdings.ts)
- [Market price lookup](examples/market-prices.ts)
- [Error handling](examples/error-handling.ts)
- [Place an order](examples/place-order.ts)

## Links

- [Repository README](https://github.com/nbsp1221/tossinvest-openapi#readme)
- [Official Toss Securities Open API docs](https://developers.tossinvest.com/docs)
- [CHANGELOG](https://github.com/nbsp1221/tossinvest-openapi/blob/main/CHANGELOG.md)
- [SECURITY](https://github.com/nbsp1221/tossinvest-openapi/blob/main/SECURITY.md)
- [LICENSE](https://github.com/nbsp1221/tossinvest-openapi/blob/main/LICENSE)
