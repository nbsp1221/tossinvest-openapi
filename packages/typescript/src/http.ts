import { TossInvestApiError, TossInvestConnectionError } from './errors.js';
import type { TossInvestResponseMeta } from './types.js';

export type FetchLike = typeof fetch;

export interface HttpRequest {
  method: string;
  url: string;
  headers: Headers;
  body?: BodyInit;
  timeoutMs: number;
}

export interface HttpSuccess<TData> {
  data: TData;
  response: TossInvestResponseMeta;
}

export function buildUrl(
  baseUrl: string,
  path: string,
  query: Record<string, string | number | boolean | null | undefined> = {},
): string {
  const url = new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function encodeForm(data: Record<string, string>): URLSearchParams {
  const form = new URLSearchParams();

  for (const [key, value] of Object.entries(data)) {
    form.set(key, value);
  }

  return form;
}

export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

export async function requestJson<TData>(
  fetchImpl: FetchLike,
  request: HttpRequest,
): Promise<HttpSuccess<TData>> {
  let response: Response;

  try {
    const init: RequestInit = {
      method: request.method,
      headers: request.headers,
      signal: createTimeoutSignal(request.timeoutMs),
    };

    if (request.body !== undefined) {
      init.body = request.body;
    }

    response = await fetchImpl(request.url, init);
  } catch (error) {
    throw new TossInvestConnectionError(
      'Toss Invest API request failed before receiving a response',
      error,
    );
  }

  const body = await parseJsonBody(response);
  const meta = {
    status: response.status,
    headers: response.headers,
    requestId: response.headers.get('x-request-id') ?? undefined,
  };

  if (!response.ok) {
    const requestId = meta.requestId ?? extractBodyRequestId(body);

    throw new TossInvestApiError({
      status: response.status,
      headers: response.headers,
      body,
      code: extractErrorCode(body),
      message: extractErrorMessage(body),
      requestId,
    });
  }

  return {
    data: body as TData,
    response: meta,
  };
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function extractErrorCode(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  if ('error' in body && body.error && typeof body.error === 'object') {
    const nested = body.error;

    if ('code' in nested && typeof nested.code === 'string') {
      return nested.code;
    }
  }

  if ('code' in body && typeof body.code === 'string') {
    return body.code;
  }

  if ('error' in body && typeof body.error === 'string') {
    return body.error;
  }

  return undefined;
}

function extractErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  if ('error' in body && body.error && typeof body.error === 'object') {
    const nested = body.error;

    if ('message' in nested && typeof nested.message === 'string') {
      return nested.message;
    }
  }

  if ('message' in body && typeof body.message === 'string') {
    return body.message;
  }

  if (
    'error_description' in body &&
    typeof body.error_description === 'string'
  ) {
    return body.error_description;
  }

  return undefined;
}

function extractBodyRequestId(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  if ('error' in body && body.error && typeof body.error === 'object') {
    const nested = body.error;

    if ('requestId' in nested && typeof nested.requestId === 'string') {
      return nested.requestId;
    }
  }

  return undefined;
}
