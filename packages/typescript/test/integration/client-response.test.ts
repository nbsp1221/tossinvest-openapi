import { describe, expect, it, vi } from 'vitest';

import { TossInvestClient } from '../../src/index.js';
import { brokerageAccount, oauthTokenResponse } from '../helpers/fixtures.js';
import {
  createAuthedFetch,
  getRequestInit,
  getRequestUrl,
  jsonResponse,
} from '../helpers/fetch-mock.js';

describe('TossInvestClient response handling', () => {
  it('lazily authenticates and unwraps account results', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(oauthTokenResponse))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            result: [brokerageAccount],
          },
          { status: 200, headers: { 'x-request-id': 'req_accounts' } },
        ),
      );

    const client = new TossInvestClient({
      clientId: 'client',
      clientSecret: 'secret',
      fetch: fetchImpl,
    });

    await expect(client.getAccounts()).resolves.toEqual([brokerageAccount]);

    expect(getRequestUrl(fetchImpl, 1)).toBe(
      'https://openapi.tossinvest.com/api/v1/accounts',
    );

    const accountRequest = getRequestInit(fetchImpl, 1);
    expect(accountRequest.method).toBe('GET');
    expect(accountRequest.headers).toBeInstanceOf(Headers);
    expect(accountRequest.signal).toBeInstanceOf(AbortSignal);

    const headers = accountRequest.headers as Headers;
    expect(headers.get('authorization')).toBe('Bearer token');
  });

  it('returns raw envelope and response metadata with withResponse', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(oauthTokenResponse))
      .mockResolvedValueOnce(
        jsonResponse(
          { result: [] },
          { status: 200, headers: { 'x-request-id': 'req_accounts' } },
        ),
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
});
