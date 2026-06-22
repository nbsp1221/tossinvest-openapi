import { expect, vi } from 'vitest';

import { oauthTokenResponse } from './fixtures.js';

export type MockFetch = ReturnType<typeof vi.fn<typeof fetch>>;

export interface ExpectedRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export function createAuthedFetch(body: unknown): MockFetch {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(jsonResponse(oauthTokenResponse))
    .mockResolvedValueOnce(jsonResponse(body));
}

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), init);
}

export function expectRequest(
  fetchImpl: MockFetch,
  index: number,
  expected: ExpectedRequest,
): void {
  expect(getRequestUrl(fetchImpl, index)).toBe(expected.url);

  const request = getRequestInit(fetchImpl, index);
  expect(request.method).toBe(expected.method);

  if (expected.headers) {
    expect(request.headers).toBeInstanceOf(Headers);
    const headers = request.headers as Headers;

    for (const [name, value] of Object.entries(expected.headers)) {
      expect(headers.get(name)).toBe(value);
    }
  }

  if ('body' in expected) {
    expect(request.body).toBe(JSON.stringify(expected.body));
  }
}

export function getRequestInit(
  fetchImpl: MockFetch,
  index: number,
): RequestInit {
  const init = getFetchCall(fetchImpl, index)[1];
  if (init === undefined) {
    throw new Error(`Missing fetch init for call ${index}`);
  }

  return init;
}

export function getRequestUrl(fetchImpl: MockFetch, index: number): string {
  const input = getFetchCall(fetchImpl, index)[0];
  if (typeof input !== 'string') {
    throw new Error(`Expected string fetch input for call ${index}`);
  }

  return input;
}

function getFetchCall(
  fetchImpl: MockFetch,
  index: number,
): readonly [RequestInfo | URL, RequestInit | undefined] {
  const calls = fetchImpl.mock.calls as unknown as ReadonlyArray<
    readonly [RequestInfo | URL, RequestInit | undefined]
  >;
  const call = calls[index];
  if (call === undefined) {
    throw new Error(`Missing fetch call ${index}`);
  }

  return call;
}
