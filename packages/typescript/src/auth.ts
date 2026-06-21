import { buildUrl, encodeForm, requestJson, type FetchLike } from './http.js';

export interface OAuth2Token {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface TokenManagerOptions {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  fetch: FetchLike;
  userAgent?: string;
  timeoutMs: number;
  expirySkewMs?: number;
  now?: () => number;
}

export class TokenManager {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly userAgent: string | undefined;
  private readonly timeoutMs: number;
  private readonly expirySkewMs: number;
  private readonly now: () => number;
  private token?: { value: OAuth2Token; expiresAt: number };
  private inFlightToken: Promise<OAuth2Token> | undefined;

  constructor(options: TokenManagerOptions) {
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.baseUrl = options.baseUrl;
    this.fetchImpl = options.fetch;
    this.userAgent = options.userAgent;
    this.timeoutMs = options.timeoutMs;
    this.expirySkewMs = options.expirySkewMs ?? 30_000;
    this.now = options.now ?? Date.now;
  }

  async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > this.now()) {
      return this.token.value.access_token;
    }

    this.inFlightToken ??= this.issueToken().finally(() => {
      this.inFlightToken = undefined;
    });

    const token = await this.inFlightToken;
    this.token = {
      value: token,
      expiresAt: this.now() + token.expires_in * 1000 - this.expirySkewMs,
    };

    return token.access_token;
  }

  async issueToken(): Promise<OAuth2Token> {
    const headers = new Headers({
      'content-type': 'application/x-www-form-urlencoded',
    });

    if (this.userAgent) {
      headers.set('user-agent', this.userAgent);
    }

    const { data } = await requestJson<OAuth2Token>(this.fetchImpl, {
      method: 'POST',
      url: buildUrl(this.baseUrl, '/oauth2/token'),
      headers,
      body: encodeForm({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
      timeoutMs: this.timeoutMs,
    });

    return data;
  }
}
