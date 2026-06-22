import { describe, expect, it, vi } from 'vitest';

import { TossInvestClient } from '../../src/index.js';
import {
  createAuthedFetch,
  expectRequest,
  type ExpectedRequest,
} from '../helpers/fetch-mock.js';

interface ClientRequestMappingCase {
  name: string;
  invoke: (client: TossInvestClient) => Promise<unknown>;
  expected: ExpectedRequest;
}

const accountHeaders = {
  authorization: 'Bearer token',
  'x-tossinvest-account': '1',
};

const cases: ClientRequestMappingCase[] = [
  {
    name: 'getOrderbook',
    invoke: (client) => client.getOrderbook({ symbol: '005930' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/orderbook?symbol=005930',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getPrices',
    invoke: (client) => client.getPrices({ symbols: '005930,AAPL' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/prices?symbols=005930%2CAAPL',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getTrades',
    invoke: (client) => client.getTrades({ symbol: 'AAPL', count: 2 }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/trades?symbol=AAPL&count=2',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getPriceLimit',
    invoke: (client) => client.getPriceLimit({ symbol: '005930' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/price-limits?symbol=005930',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getCandles',
    invoke: (client) =>
      client.getCandles({ symbol: '005930', interval: '1d', count: 10 }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/candles?symbol=005930&interval=1d&count=10',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getStocks',
    invoke: (client) => client.getStocks({ symbols: '005930,AAPL' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/stocks?symbols=005930%2CAAPL',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getStockWarnings',
    invoke: (client) => client.getStockWarnings({ symbol: 'BRK.B' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/stocks/BRK.B/warnings',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getExchangeRate',
    invoke: (client) =>
      client.getExchangeRate({
        dateTime: '2026-03-25T09:30:00+09:00',
        baseCurrency: 'USD',
        quoteCurrency: 'KRW',
      }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/exchange-rate?dateTime=2026-03-25T09%3A30%3A00%2B09%3A00&baseCurrency=USD&quoteCurrency=KRW',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getKrMarketCalendar',
    invoke: (client) => client.getKrMarketCalendar({ date: '2026-03-25' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/market-calendar/KR?date=2026-03-25',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getUsMarketCalendar',
    invoke: (client) => client.getUsMarketCalendar({ date: '2026-03-25' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/market-calendar/US?date=2026-03-25',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getAccounts',
    invoke: (client) => client.getAccounts(),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/accounts',
      headers: { authorization: 'Bearer token' },
    },
  },
  {
    name: 'getHoldings',
    invoke: (client) => client.getHoldings({ accountSeq: 1, symbol: '005930' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/holdings?symbol=005930',
      headers: accountHeaders,
    },
  },
  {
    name: 'getOrders',
    invoke: (client) =>
      client.getOrders({
        accountSeq: 1,
        status: 'CLOSED',
        symbol: '005930',
        from: '2026-03-01',
        to: '2026-03-31',
        cursor: 'next',
        limit: 20,
      }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/orders?status=CLOSED&symbol=005930&from=2026-03-01&to=2026-03-31&cursor=next&limit=20',
      headers: accountHeaders,
    },
  },
  {
    name: 'createOrder',
    invoke: (client) =>
      client.createOrder({
        accountSeq: 1,
        symbol: '005930',
        side: 'BUY',
        orderType: 'LIMIT',
        quantity: '10',
        price: '70000',
      }),
    expected: {
      method: 'POST',
      url: 'https://openapi.tossinvest.com/api/v1/orders',
      headers: { ...accountHeaders, 'content-type': 'application/json' },
      body: {
        symbol: '005930',
        side: 'BUY',
        orderType: 'LIMIT',
        quantity: '10',
        price: '70000',
      },
    },
  },
  {
    name: 'getOrder',
    invoke: (client) => client.getOrder({ accountSeq: 1, orderId: 'order/1' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/orders/order%2F1',
      headers: accountHeaders,
    },
  },
  {
    name: 'modifyOrder',
    invoke: (client) =>
      client.modifyOrder({
        accountSeq: 1,
        orderId: 'order/1',
        orderType: 'LIMIT',
        quantity: '15',
        price: '71000',
      }),
    expected: {
      method: 'POST',
      url: 'https://openapi.tossinvest.com/api/v1/orders/order%2F1/modify',
      headers: { ...accountHeaders, 'content-type': 'application/json' },
      body: {
        orderType: 'LIMIT',
        quantity: '15',
        price: '71000',
      },
    },
  },
  {
    name: 'cancelOrder',
    invoke: (client) =>
      client.cancelOrder({ accountSeq: 1, orderId: 'order/1' }),
    expected: {
      method: 'POST',
      url: 'https://openapi.tossinvest.com/api/v1/orders/order%2F1/cancel',
      headers: { ...accountHeaders, 'content-type': 'application/json' },
      body: {},
    },
  },
  {
    name: 'getBuyingPower',
    invoke: (client) =>
      client.getBuyingPower({ accountSeq: 1, currency: 'KRW' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/buying-power?currency=KRW',
      headers: accountHeaders,
    },
  },
  {
    name: 'getSellableQuantity',
    invoke: (client) =>
      client.getSellableQuantity({ accountSeq: 1, symbol: '005930' }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/sellable-quantity?symbol=005930',
      headers: accountHeaders,
    },
  },
  {
    name: 'getCommissions',
    invoke: (client) => client.getCommissions({ accountSeq: 1 }),
    expected: {
      method: 'GET',
      url: 'https://openapi.tossinvest.com/api/v1/commissions',
      headers: accountHeaders,
    },
  },
];

describe('TossInvestClient request mapping', () => {
  it.each(cases)(
    'maps $name to the expected HTTP request',
    async (testCase) => {
      const fetchImpl = createAuthedFetch({ result: [] });
      const client = new TossInvestClient({
        clientId: 'client',
        clientSecret: 'secret',
        fetch: fetchImpl,
      });

      await testCase.invoke(client);

      expectRequest(fetchImpl, 1, testCase.expected);
    },
  );

  it('exposes all OpenAPI operation methods', () => {
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: vi.fn<typeof fetch>(),
    });

    const prototype = Object.getPrototypeOf(client) as Record<string, unknown>;

    for (const testCase of cases) {
      expect(prototype[testCase.name]).toBeTypeOf('function');
    }
    expect(prototype['issueOAuth2Token']).toBeTypeOf('function');
  });
});
