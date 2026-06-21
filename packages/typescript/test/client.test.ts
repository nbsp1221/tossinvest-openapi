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
        signal: expect.any(AbortSignal),
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

  it('maps path parameters', async () => {
    const fetchImpl = createAuthedFetch({ result: [] });
    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await client.getStockWarnings({ symbol: 'BRK.B' });

    expect(fetchImpl.mock.calls[1]?.[0]).toBe(
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

    const request = fetchImpl.mock.calls[1]?.[1];
    expect(request?.signal).toBeInstanceOf(AbortSignal);
  });

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
