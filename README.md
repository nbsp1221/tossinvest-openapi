# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/tossinvest-openapi.svg)](https://www.npmjs.com/package/tossinvest-openapi)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

토스증권 Open API를 위한 비공식 SDK 프로젝트입니다. 현재 사용 가능한 패키지는 TypeScript SDK이며, Python SDK는 계획 중입니다.

> [!NOTE]
> 이 프로젝트는 토스증권 공식 OpenAPI 문서에 공개된 엔드포인트만 사용합니다.
> 토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

[English](README.en.md)

## 빠른 시작

현재 사용 가능한 패키지는 TypeScript SDK입니다.

```sh
npm install tossinvest-openapi
# or
pnpm add tossinvest-openapi
```

```ts
import { TossInvestClient } from "tossinvest-openapi";

const client = new TossInvestClient({
  clientId: process.env.TOSS_INVEST_CLIENT_ID!,
  clientSecret: process.env.TOSS_INVEST_CLIENT_SECRET!,
});

const accounts = await client.getAccounts();
const prices = await client.getPrices({ symbols: "005930,AAPL" });

console.log({
  accountCount: accounts.length,
  priceCount: prices.length,
});
```

> [!WARNING]
> `clientSecret`은 서버 사이드 환경에서만 사용하세요. 브라우저, 모바일 앱,
> 공개 저장소, 클라이언트 번들에 포함하면 안 됩니다.

## 패키지 상태

| 패키지     | 상태           | 설명                                                              |
| ---------- | -------------- | ----------------------------------------------------------------- |
| TypeScript | 사용 가능, 0.x | 공식 OpenAPI 1.1.1의 계좌, 시세, 주문 API를 제공합니다.           |
| Python     | 계획됨         | 폴리글랏 구조를 유지하기 위한 패키지이며 아직 사용할 수 없습니다. |
| OpenAPI    | 1.1.1 기준     | 공식 OpenAPI 문서를 기준으로 타입과 메서드를 관리합니다.          |

## 지원 범위

TypeScript SDK는 Toss Securities OpenAPI 1.1.1 문서의 주요 API를 지원합니다.

| 영역                                           | 지원   |
| ---------------------------------------------- | ------ |
| OAuth2 Client Credentials 인증                 | 지원   |
| 계좌 목록/잔고/보유 종목                       | 지원   |
| 국내/해외 시세 조회                            | 지원   |
| 주문 가능 금액/매도 가능 수량/수수료 사전 확인 | 지원   |
| 주문 생성/정정/취소                            | 지원   |
| 주문 목록/상세 조회                            | 지원   |
| WebSocket/실시간 streaming                     | 미지원 |

자세한 사용법은 [TypeScript package README](packages/typescript/README.md)를 확인하세요.

## 왜 이 SDK를 쓰나요?

- 공식 Toss Securities Open API 스키마에서 파생된 TypeScript 타입을 사용합니다.
- OAuth2 Client Credentials 인증을 SDK가 처리합니다.
- 기본 응답은 `result`를 unwrap하고, 필요하면 원본 응답과 HTTP metadata도 확인할 수 있습니다.
- 주문 API는 명시적으로 노출하되 state-changing operation으로 다룹니다.
- reverse engineered API, private Toss app/web API, 비공개 엔드포인트를 사용하지 않습니다.

## Examples

- [계좌와 보유 종목 조회](packages/typescript/examples/account-holdings.ts)
- [시세 조회](packages/typescript/examples/market-prices.ts)
- [에러 처리](packages/typescript/examples/error-handling.ts)
- [주문 생성](packages/typescript/examples/place-order.ts)

## 개발

필요한 도구는 `mise`로 관리합니다.

```sh
mise install
mise run install
mise run check
```

## 릴리즈

TypeScript 패키지는 npm에 `tossinvest-openapi`로 배포됩니다. 버전별 변경 사항은 [CHANGELOG](CHANGELOG.md)를 확인하세요.

## 보안

credential, access token, 계좌 정보, 주문 payload를 public issue에 올리지 마세요. 보안 이슈는 [SECURITY](SECURITY.md)를 따라 보고하세요.

## 기여

개발 환경, 검증 명령, 문서 규칙은 [CONTRIBUTING](CONTRIBUTING.md)을 확인하세요.

## 링크

- [TypeScript package](packages/typescript/README.md)
- [Python package](packages/python/README.md)
- [토스증권 Open API 공식 문서](https://developers.tossinvest.com/docs)
- [CHANGELOG](CHANGELOG.md)
- [SECURITY](SECURITY.md)
- [CONTRIBUTING](CONTRIBUTING.md)
- [LICENSE](LICENSE)
