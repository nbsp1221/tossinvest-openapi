export interface TossInvestApiErrorOptions {
  status: number;
  headers: Headers;
  body: unknown;
  code?: string;
  message?: string;
  requestId?: string;
}

export class TossInvestApiError extends Error {
  readonly status: number;
  readonly headers: Headers;
  readonly body: unknown;
  readonly code: string | undefined;
  readonly requestId: string | undefined;

  constructor(options: TossInvestApiErrorOptions) {
    super(options.message ?? `Toss Invest API request failed with status ${options.status}`);
    this.name = 'TossInvestApiError';
    this.status = options.status;
    this.headers = options.headers;
    this.body = options.body;
    this.code = options.code;
    this.requestId = options.requestId;
  }
}

export class TossInvestConnectionError extends Error {
  override readonly cause: unknown;

  constructor(message: string, cause: unknown) {
    super(message);
    this.name = 'TossInvestConnectionError';
    this.cause = cause;
  }
}
