import { describe, expect, it } from 'vitest';

import {
  TossInvestApiError,
  TossInvestConnectionError,
} from '../../src/index.js';

describe('TossInvestApiError', () => {
  it('stores HTTP metadata and parsed error body', () => {
    const headers = new Headers({ 'x-request-id': 'req_123' });
    const body = { code: 'invalid-token', message: 'Token has expired' };

    const error = new TossInvestApiError({
      status: 401,
      headers,
      body,
      code: body.code,
      message: body.message,
      requestId: 'req_123',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TossInvestApiError');
    expect(error.message).toBe('Token has expired');
    expect(error.status).toBe(401);
    expect(error.headers).toBe(headers);
    expect(error.body).toEqual(body);
    expect(error.code).toBe('invalid-token');
    expect(error.requestId).toBe('req_123');
  });
});

describe('TossInvestConnectionError', () => {
  it('stores the original cause', () => {
    const cause = new TypeError('fetch failed');
    const error = new TossInvestConnectionError('Request failed', cause);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('TossInvestConnectionError');
    expect(error.message).toBe('Request failed');
    expect(error.cause).toBe(cause);
  });
});
