# tossinvest-openapi

토스증권 Open API를 위한 비공식 TypeScript SDK입니다.

> [!NOTE]
> 이 패키지는 공식 문서에 공개된 OpenAPI 엔드포인트만 사용합니다.
> 토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

한국어 | [English](README.en.md)

## 요구사항

- Node.js 22 이상
- Toss Securities Open API client credentials

## 설치

```sh
pnpm add tossinvest-openapi
```

## 빠른 시작

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

## Credentials와 인증

토스증권 Open API에서 발급받은 `clientId`와 `clientSecret`으로 `TossInvestClient`를 생성합니다.

```ts
const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});
```

SDK는 OAuth2 Client Credentials Grant를 내부에서 처리합니다. 첫 인증 API 호출 시 access token을 lazy하게 발급받고, 메모리에 캐시하며, `expires_in` 시간이 지나면 새 token을 발급받습니다.

Toss Securities는 refresh token을 제공하지 않습니다. 같은 client credentials로 token을 재발급하면 이전 token이 무효화되므로, 한 프로세스 안에서는 credential set마다 하나의 `TossInvestClient` 인스턴스를 재사용하는 것을 권장합니다.

> [!WARNING]
> `clientSecret`은 서버 사이드에서만 보관하세요. 브라우저 번들, 모바일 앱,
> 공개 저장소, 로그, crash report에 노출하면 안 됩니다.

## 주요 호출

### 시세 데이터

```ts
const orderbook = await client.getOrderbook({ symbol: '005930' });
const prices = await client.getPrices({ symbols: '005930,AAPL' });
const priceLimit = await client.getPriceLimit({ symbol: '005930' });
```

### 계좌 데이터

```ts
const accounts = await client.getAccounts();
const accountSeq = accounts[0]?.accountSeq;

if (accountSeq === undefined) {
  throw new Error('No Toss Securities account was returned.');
}

const holdings = await client.getHoldings({ accountSeq });
const openOrders = await client.getOrders({ accountSeq, status: 'OPEN' });
```

### 주문 전 확인

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

## 응답

Business API 메서드는 기본적으로 `result` payload를 unwrap해서 반환합니다.

```ts
const accounts = await client.getAccounts();
```

원본 응답 envelope 또는 HTTP metadata가 필요하면 `{ withResponse: true }`를 사용하세요.

```ts
const result = await client.getAccounts({ withResponse: true });

console.log(result.data);
console.log(result.raw);
console.log(result.response.status);
console.log(result.response.requestId);
```

## 에러

API 실패는 `TossInvestApiError`를 throw합니다. 네트워크 레벨 실패는 `TossInvestConnectionError`를 throw합니다.

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
> 에러 객체나 HTTP request metadata 전체를 그대로 로그에 남기지 마세요.
> secret, access token, 계좌 식별자, 주문 payload가 포함될 수 있습니다.

## Timeout

요청은 기본적으로 30초 후 timeout됩니다. client 단위 또는 개별 호출 단위로 timeout을 바꿀 수 있습니다.

```ts
const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
  timeoutMs: 10_000,
});

await client.getAccounts({ timeoutMs: 5_000 });
```

## 주문

주문 API는 공식 Toss Securities OpenAPI 문서에 포함되어 있어 SDK에서 노출합니다. 주문 호출은 계좌 상태를 바꿀 수 있는 state-changing operation으로 다루세요.

> [!WARNING]
> `createOrder`, `modifyOrder`, `cancelOrder`는 계좌 상태를 바꿀 수 있습니다.
> 호출 전에 사용자 또는 애플리케이션 레벨의 명시적 확인 절차를 두세요.

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

## 범위

TypeScript SDK는 pinned Toss Securities OpenAPI 1.1.1 문서의 모든 business operation을 flat method로 제공합니다. 계좌, 시세, 주문, 주문 정보 API를 포함합니다.

Python은 같은 polyglot repository 안에서 별도 패키지로 관리됩니다.

## 링크

- [Repository README](https://github.com/nbsp1221/tossinvest-openapi#readme)
- [Official Toss Securities Open API docs](https://developers.tossinvest.com/docs)
- [LICENSE](https://github.com/nbsp1221/tossinvest-openapi/blob/main/LICENSE)
