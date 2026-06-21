import { describe, expect, it, vi } from 'vitest';

import {
  TossInvestApiError,
  TossInvestConnectionError,
} from '../src/errors.js';
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
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('fetch failed'));

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
