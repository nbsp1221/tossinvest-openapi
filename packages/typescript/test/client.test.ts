import { describe, expect, it, vi } from 'vitest';

import { TossInvestClient } from '../src/index.js';

type MockFetch = ReturnType<typeof vi.fn<typeof fetch>>;

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
            result: [
              {
                accountNo: '12345678901',
                accountSeq: 1,
                accountType: 'BROKERAGE',
              },
            ],
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

    expect(getRequestUrl(fetchImpl, 1)).toBe(
      'https://openapi.tossinvest.com/api/v1/accounts',
    );
    const accountRequest = getRequestInit(fetchImpl, 1);
    expect(accountRequest.method).toBe('GET');
    expect(accountRequest.headers).toBeInstanceOf(Headers);
    expect(accountRequest.signal).toBeInstanceOf(AbortSignal);

    const headers = accountRequest.headers;
    expect(headers).toBeInstanceOf(Headers);
    expect((headers as Headers).get('authorization')).toBe('Bearer token');
  });

  it('returns raw envelope and response metadata with withResponse', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'token',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
          {
            status: 200,
          },
        ),
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

    const result = await client.getAccounts({ withResponse: true });

    expect(result.data).toEqual([]);
    expect(result.raw).toEqual({ result: [] });
    expect(result.response.status).toBe(200);
    expect(result.response.requestId).toBe('req_accounts');
  });

  it('maps query parameters', async () => {
    const fetchImpl = createAuthedFetch({ result: [] });
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await client.getPrices({ symbols: '005930,AAPL' });

    expect(getRequestUrl(fetchImpl, 1)).toBe(
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

    const request = getRequestInit(fetchImpl, 1);
    const headers = request.headers as Headers;

    expect(getRequestUrl(fetchImpl, 1)).toBe(
      'https://openapi.tossinvest.com/api/v1/orders',
    );
    expect(request.method).toBe('POST');
    expect(headers.get('x-tossinvest-account')).toBe('1');
    expect(headers.get('content-type')).toBe('application/json');
    expect(request.body).toBe(
      JSON.stringify({
        symbol: '005930',
        side: 'BUY',
        orderType: 'LIMIT',
        quantity: '10',
        price: '70000',
      }),
    );
  });

  it('maps path parameters', async () => {
    const fetchImpl = createAuthedFetch({ result: [] });
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await client.getStockWarnings({ symbol: 'BRK.B' });

    expect(getRequestUrl(fetchImpl, 1)).toBe(
      'https://openapi.tossinvest.com/api/v1/stocks/BRK.B/warnings',
    );
  });

  it('uses per-call timeout overrides', async () => {
    const fetchImpl = createAuthedFetch({ result: [] });
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
      timeoutMs: 30_000,
    });

    await client.getAccounts({ timeoutMs: 1000 });

    const request = getRequestInit(fetchImpl, 1);
    expect(request.signal).toBeInstanceOf(AbortSignal);
  });

  it('exposes all OpenAPI operation methods', () => {
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: vi.fn<typeof fetch>(),
    });

    const prototype = Object.getPrototypeOf(client) as Record<string, unknown>;

    expect(prototype['issueOAuth2Token']).toBeTypeOf('function');
    expect(prototype['getOrderbook']).toBeTypeOf('function');
    expect(prototype['getPrices']).toBeTypeOf('function');
    expect(prototype['getTrades']).toBeTypeOf('function');
    expect(prototype['getPriceLimit']).toBeTypeOf('function');
    expect(prototype['getCandles']).toBeTypeOf('function');
    expect(prototype['getStocks']).toBeTypeOf('function');
    expect(prototype['getStockWarnings']).toBeTypeOf('function');
    expect(prototype['getExchangeRate']).toBeTypeOf('function');
    expect(prototype['getKrMarketCalendar']).toBeTypeOf('function');
    expect(prototype['getUsMarketCalendar']).toBeTypeOf('function');
    expect(prototype['getAccounts']).toBeTypeOf('function');
    expect(prototype['getHoldings']).toBeTypeOf('function');
    expect(prototype['getOrders']).toBeTypeOf('function');
    expect(prototype['createOrder']).toBeTypeOf('function');
    expect(prototype['getOrder']).toBeTypeOf('function');
    expect(prototype['modifyOrder']).toBeTypeOf('function');
    expect(prototype['cancelOrder']).toBeTypeOf('function');
    expect(prototype['getBuyingPower']).toBeTypeOf('function');
    expect(prototype['getSellableQuantity']).toBeTypeOf('function');
    expect(prototype['getCommissions']).toBeTypeOf('function');
  });
});

function createAuthedFetch(body: unknown): MockFetch {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'token',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
        {
          status: 200,
        },
      ),
    )
    .mockResolvedValueOnce(new Response(JSON.stringify(body), { status: 200 }));
}

function getRequestInit(fetchImpl: MockFetch, index: number): RequestInit {
  const calls = fetchImpl.mock.calls as unknown as ReadonlyArray<
    readonly [RequestInfo | URL, RequestInit | undefined]
  >;
  const init = calls[index]?.[1];
  if (init === undefined) {
    throw new Error(`Missing fetch init for call ${index}`);
  }
  return init;
}

function getRequestUrl(fetchImpl: MockFetch, index: number): string {
  const calls = fetchImpl.mock.calls as unknown as ReadonlyArray<
    readonly [RequestInfo | URL, RequestInit | undefined]
  >;
  const input = calls[index]?.[0];
  if (typeof input !== 'string') {
    throw new Error(`Expected string fetch input for call ${index}`);
  }

  return input;
}
