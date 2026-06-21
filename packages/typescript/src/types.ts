export interface TossInvestClientOptions {
  clientId: string;
  clientSecret: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  userAgent?: string;
}

export interface TossInvestRequestOptions {
  timeoutMs?: number;
  withResponse?: boolean;
}

export interface TossInvestResponseMeta {
  status: number;
  headers: Headers;
  requestId?: string;
}

export interface TossInvestWithResponse<TData, TRaw> {
  data: TData;
  raw: TRaw;
  response: TossInvestResponseMeta;
}
