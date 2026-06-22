import { describe, expect, it, vi } from 'vitest';

import { TokenManager } from '../../src/auth.js';

describe('TokenManager', () => {
  it('lazily issues a token and caches it until expiry', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'token-1',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );

    const manager = new TokenManager({
      clientId: 'client',
      clientSecret: 'secret',
      baseUrl: 'https://openapi.tossinvest.com',
      fetch: fetchImpl,
      timeoutMs: 1000,
      now: () => 1_000_000,
    });

    await expect(manager.getAccessToken()).resolves.toBe('token-1');
    await expect(manager.getAccessToken()).resolves.toBe('token-1');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('reissues a token after expiry', async () => {
    let now = 1_000_000;
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'token-1',
            token_type: 'Bearer',
            expires_in: 1,
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            access_token: 'token-2',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
          { status: 200 },
        ),
      );

    const manager = new TokenManager({
      clientId: 'client',
      clientSecret: 'secret',
      baseUrl: 'https://openapi.tossinvest.com',
      fetch: fetchImpl,
      timeoutMs: 1000,
      expirySkewMs: 0,
      now: () => now,
    });

    await expect(manager.getAccessToken()).resolves.toBe('token-1');
    now += 1001;
    await expect(manager.getAccessToken()).resolves.toBe('token-2');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent token cache misses into one token request', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'token-1',
          token_type: 'Bearer',
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );

    const manager = new TokenManager({
      clientId: 'client',
      clientSecret: 'secret',
      baseUrl: 'https://openapi.tossinvest.com',
      fetch: fetchImpl,
      timeoutMs: 1000,
      now: () => 1_000_000,
    });

    await expect(
      Promise.all([manager.getAccessToken(), manager.getAccessToken()]),
    ).resolves.toEqual(['token-1', 'token-1']);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
