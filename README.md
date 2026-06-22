# tossinvest-openapi

[![CI](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml/badge.svg)](https://github.com/nbsp1221/tossinvest-openapi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Toss Securities OpenAPI](https://img.shields.io/badge/Toss%20Securities%20OpenAPI-1.1.1-blue)

토스증권 Open API를 위한 비공식 SDK입니다.

> [!NOTE]
> 이 프로젝트는 토스증권 공식 OpenAPI 문서에 공개된 엔드포인트만 사용합니다.
> 토스증권 또는 비바리퍼블리카가 공식 제공하거나 보증하는 라이브러리가 아닙니다.

한국어 | [English](README.en.md)

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
