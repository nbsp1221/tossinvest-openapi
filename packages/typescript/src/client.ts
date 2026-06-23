import { TokenManager, type OAuth2Token } from './auth.js';
import { buildUrl, requestJson, type FetchLike } from './http.js';
import type { components, operations } from './generated/openapi.js';
import type {
  TossInvestClientOptions,
  TossInvestRequestOptions,
  TossInvestWithResponse,
} from './types.js';
import { DEFAULT_USER_AGENT } from './version.js';

const DEFAULT_BASE_URL = 'https://openapi.tossinvest.com';
const DEFAULT_TIMEOUT_MS = 30_000;

type ApiEnvelope<TData> = { result?: TData };
type WithResponseOptions = TossInvestRequestOptions & { withResponse: true };

type SuccessResponse<TOperation extends keyof operations> =
  operations[TOperation] extends {
    responses: { 200: { content: { 'application/json': infer TResponse } } };
  }
    ? TResponse
    : never;

type ResultOf<TRaw> = TRaw extends { result?: infer TResult }
  ? NonNullable<TResult>
  : never;

type QueryOf<TOperation extends keyof operations> =
  operations[TOperation]['parameters'] extends { query?: infer TQuery }
    ? NonNullable<TQuery>
    : never;

type PathOf<TOperation extends keyof operations> =
  operations[TOperation]['parameters'] extends { path?: infer TPath }
    ? NonNullable<TPath>
    : never;

type RequestBody<TOperation extends keyof operations> =
  operations[TOperation] extends {
    requestBody: { content: { 'application/json': infer TBody } };
  }
    ? TBody
    : never;

type AccountSeq = components['parameters']['AccountSeq'];

type GetOrderbookRaw = SuccessResponse<'getOrderbook'>;
type GetOrderbookData = ResultOf<GetOrderbookRaw>;
type GetPricesRaw = SuccessResponse<'getPrices'>;
type GetPricesData = ResultOf<GetPricesRaw>;
type GetTradesRaw = SuccessResponse<'getTrades'>;
type GetTradesData = ResultOf<GetTradesRaw>;
type GetPriceLimitRaw = SuccessResponse<'getPriceLimit'>;
type GetPriceLimitData = ResultOf<GetPriceLimitRaw>;
type GetCandlesRaw = SuccessResponse<'getCandles'>;
type GetCandlesData = ResultOf<GetCandlesRaw>;
type GetStocksRaw = SuccessResponse<'getStocks'>;
type GetStocksData = ResultOf<GetStocksRaw>;
type GetStockWarningsRaw = SuccessResponse<'getStockWarnings'>;
type GetStockWarningsData = ResultOf<GetStockWarningsRaw>;
type GetExchangeRateRaw = SuccessResponse<'getExchangeRate'>;
type GetExchangeRateData = ResultOf<GetExchangeRateRaw>;
type GetKrMarketCalendarRaw = SuccessResponse<'getKrMarketCalendar'>;
type GetKrMarketCalendarData = ResultOf<GetKrMarketCalendarRaw>;
type GetUsMarketCalendarRaw = SuccessResponse<'getUsMarketCalendar'>;
type GetUsMarketCalendarData = ResultOf<GetUsMarketCalendarRaw>;
type GetAccountsRaw = SuccessResponse<'getAccounts'>;
type GetAccountsData = ResultOf<GetAccountsRaw>;
type GetHoldingsRaw = SuccessResponse<'getHoldings'>;
type GetHoldingsData = ResultOf<GetHoldingsRaw>;
type GetOrdersRaw = SuccessResponse<'getOrders'>;
type GetOrdersData = ResultOf<GetOrdersRaw>;
type CreateOrderRaw = SuccessResponse<'createOrder'>;
type CreateOrderData = ResultOf<CreateOrderRaw>;
type GetOrderRaw = SuccessResponse<'getOrder'>;
type GetOrderData = ResultOf<GetOrderRaw>;
type ModifyOrderRaw = SuccessResponse<'modifyOrder'>;
type ModifyOrderData = ResultOf<ModifyOrderRaw>;
type CancelOrderRaw = SuccessResponse<'cancelOrder'>;
type CancelOrderData = ResultOf<CancelOrderRaw>;
type GetBuyingPowerRaw = SuccessResponse<'getBuyingPower'>;
type GetBuyingPowerData = ResultOf<GetBuyingPowerRaw>;
type GetSellableQuantityRaw = SuccessResponse<'getSellableQuantity'>;
type GetSellableQuantityData = ResultOf<GetSellableQuantityRaw>;
type GetCommissionsRaw = SuccessResponse<'getCommissions'>;
type GetCommissionsData = ResultOf<GetCommissionsRaw>;

export type GetOrderbookParams = QueryOf<'getOrderbook'>;
export type GetPricesParams = QueryOf<'getPrices'>;
export type GetTradesParams = QueryOf<'getTrades'>;
export type GetPriceLimitParams = QueryOf<'getPriceLimit'>;
export type GetCandlesParams = QueryOf<'getCandles'>;
export type GetStocksParams = QueryOf<'getStocks'>;
export type GetStockWarningsParams = PathOf<'getStockWarnings'>;
export type GetExchangeRateParams = QueryOf<'getExchangeRate'>;
export type GetKrMarketCalendarParams = QueryOf<'getKrMarketCalendar'>;
export type GetUsMarketCalendarParams = QueryOf<'getUsMarketCalendar'>;
export type GetHoldingsParams = QueryOf<'getHoldings'> & {
  accountSeq: AccountSeq;
};
export type GetOrdersParams = QueryOf<'getOrders'> & { accountSeq: AccountSeq };
export type CreateOrderParams = RequestBody<'createOrder'> & {
  accountSeq: AccountSeq;
};
export type GetOrderParams = PathOf<'getOrder'> & { accountSeq: AccountSeq };
export type ModifyOrderParams = PathOf<'modifyOrder'> &
  RequestBody<'modifyOrder'> & { accountSeq: AccountSeq };
export type CancelOrderParams = PathOf<'cancelOrder'> & {
  accountSeq: AccountSeq;
};
export type GetBuyingPowerParams = QueryOf<'getBuyingPower'> & {
  accountSeq: AccountSeq;
};
export type GetSellableQuantityParams = QueryOf<'getSellableQuantity'> & {
  accountSeq: AccountSeq;
};
export interface GetCommissionsParams {
  accountSeq: AccountSeq;
}

export class TossInvestClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: FetchLike;
  private readonly timeoutMs: number;
  private readonly userAgent: string;
  private readonly tokenManager: TokenManager;

  constructor(options: TossInvestClientOptions) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
    this.tokenManager = new TokenManager({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      baseUrl: this.baseUrl,
      fetch: this.fetchImpl,
      timeoutMs: this.timeoutMs,
      userAgent: this.userAgent,
    });
  }

  issueOAuth2Token(): Promise<OAuth2Token> {
    return this.tokenManager.issueToken();
  }

  getOrderbook(params: GetOrderbookParams): Promise<GetOrderbookData>;
  getOrderbook(
    params: GetOrderbookParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetOrderbookData, GetOrderbookRaw>>;
  getOrderbook(params: GetOrderbookParams, options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      '/api/v1/orderbook',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getPrices(params: GetPricesParams): Promise<GetPricesData>;
  getPrices(
    params: GetPricesParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetPricesData, GetPricesRaw>>;
  getPrices(params: GetPricesParams, options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      '/api/v1/prices',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getTrades(params: GetTradesParams): Promise<GetTradesData>;
  getTrades(
    params: GetTradesParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetTradesData, GetTradesRaw>>;
  getTrades(params: GetTradesParams, options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      '/api/v1/trades',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getPriceLimit(params: GetPriceLimitParams): Promise<GetPriceLimitData>;
  getPriceLimit(
    params: GetPriceLimitParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetPriceLimitData, GetPriceLimitRaw>>;
  getPriceLimit(
    params: GetPriceLimitParams,
    options?: TossInvestRequestOptions,
  ) {
    return this.requestEnvelope(
      '/api/v1/price-limits',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getCandles(params: GetCandlesParams): Promise<GetCandlesData>;
  getCandles(
    params: GetCandlesParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetCandlesData, GetCandlesRaw>>;
  getCandles(params: GetCandlesParams, options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      '/api/v1/candles',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getStocks(params: GetStocksParams): Promise<GetStocksData>;
  getStocks(
    params: GetStocksParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetStocksData, GetStocksRaw>>;
  getStocks(params: GetStocksParams, options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      '/api/v1/stocks',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getStockWarnings(
    params: GetStockWarningsParams,
  ): Promise<GetStockWarningsData>;
  getStockWarnings(
    params: GetStockWarningsParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetStockWarningsData, GetStockWarningsRaw>>;
  getStockWarnings(
    params: GetStockWarningsParams,
    options?: TossInvestRequestOptions,
  ) {
    return this.requestEnvelope(
      `/api/v1/stocks/${encodeURIComponent(params.symbol)}/warnings`,
      'GET',
      undefined,
      undefined,
      options,
    );
  }

  getExchangeRate(params: GetExchangeRateParams): Promise<GetExchangeRateData>;
  getExchangeRate(
    params: GetExchangeRateParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetExchangeRateData, GetExchangeRateRaw>>;
  getExchangeRate(
    params: GetExchangeRateParams,
    options?: TossInvestRequestOptions,
  ) {
    return this.requestEnvelope(
      '/api/v1/exchange-rate',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getKrMarketCalendar(
    params?: GetKrMarketCalendarParams,
  ): Promise<GetKrMarketCalendarData>;
  getKrMarketCalendar(
    params: GetKrMarketCalendarParams | undefined,
    options: WithResponseOptions,
  ): Promise<
    TossInvestWithResponse<GetKrMarketCalendarData, GetKrMarketCalendarRaw>
  >;
  getKrMarketCalendar(
    params?: GetKrMarketCalendarParams,
    options?: TossInvestRequestOptions,
  ) {
    return this.requestEnvelope(
      '/api/v1/market-calendar/KR',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getUsMarketCalendar(
    params?: GetUsMarketCalendarParams,
  ): Promise<GetUsMarketCalendarData>;
  getUsMarketCalendar(
    params: GetUsMarketCalendarParams | undefined,
    options: WithResponseOptions,
  ): Promise<
    TossInvestWithResponse<GetUsMarketCalendarData, GetUsMarketCalendarRaw>
  >;
  getUsMarketCalendar(
    params?: GetUsMarketCalendarParams,
    options?: TossInvestRequestOptions,
  ) {
    return this.requestEnvelope(
      '/api/v1/market-calendar/US',
      'GET',
      params,
      undefined,
      options,
    );
  }

  getAccounts(): Promise<GetAccountsData>;
  getAccounts(
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetAccountsData, GetAccountsRaw>>;
  getAccounts(options?: TossInvestRequestOptions): Promise<GetAccountsData>;
  getAccounts(options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      '/api/v1/accounts',
      'GET',
      undefined,
      undefined,
      options,
    );
  }

  getHoldings(params: GetHoldingsParams): Promise<GetHoldingsData>;
  getHoldings(
    params: GetHoldingsParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetHoldingsData, GetHoldingsRaw>>;
  getHoldings(params: GetHoldingsParams, options?: TossInvestRequestOptions) {
    const { accountSeq, ...query } = params;
    return this.requestEnvelope(
      '/api/v1/holdings',
      'GET',
      query,
      accountSeq,
      options,
    );
  }

  getOrders(params: GetOrdersParams): Promise<GetOrdersData>;
  getOrders(
    params: GetOrdersParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetOrdersData, GetOrdersRaw>>;
  getOrders(params: GetOrdersParams, options?: TossInvestRequestOptions) {
    const { accountSeq, ...query } = params;
    return this.requestEnvelope(
      '/api/v1/orders',
      'GET',
      query,
      accountSeq,
      options,
    );
  }

  createOrder(params: CreateOrderParams): Promise<CreateOrderData>;
  createOrder(
    params: CreateOrderParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<CreateOrderData, CreateOrderRaw>>;
  createOrder(params: CreateOrderParams, options?: TossInvestRequestOptions) {
    const { accountSeq, ...body } = params;
    return this.requestEnvelope(
      '/api/v1/orders',
      'POST',
      undefined,
      accountSeq,
      options,
      body,
    );
  }

  getOrder(params: GetOrderParams): Promise<GetOrderData>;
  getOrder(
    params: GetOrderParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetOrderData, GetOrderRaw>>;
  getOrder(params: GetOrderParams, options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      `/api/v1/orders/${encodeURIComponent(params.orderId)}`,
      'GET',
      undefined,
      params.accountSeq,
      options,
    );
  }

  modifyOrder(params: ModifyOrderParams): Promise<ModifyOrderData>;
  modifyOrder(
    params: ModifyOrderParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<ModifyOrderData, ModifyOrderRaw>>;
  modifyOrder(params: ModifyOrderParams, options?: TossInvestRequestOptions) {
    const { accountSeq, orderId, ...body } = params;
    return this.requestEnvelope(
      `/api/v1/orders/${encodeURIComponent(orderId)}/modify`,
      'POST',
      undefined,
      accountSeq,
      options,
      body,
    );
  }

  cancelOrder(params: CancelOrderParams): Promise<CancelOrderData>;
  cancelOrder(
    params: CancelOrderParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<CancelOrderData, CancelOrderRaw>>;
  cancelOrder(params: CancelOrderParams, options?: TossInvestRequestOptions) {
    return this.requestEnvelope(
      `/api/v1/orders/${encodeURIComponent(params.orderId)}/cancel`,
      'POST',
      undefined,
      params.accountSeq,
      options,
      {},
    );
  }

  getBuyingPower(params: GetBuyingPowerParams): Promise<GetBuyingPowerData>;
  getBuyingPower(
    params: GetBuyingPowerParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetBuyingPowerData, GetBuyingPowerRaw>>;
  getBuyingPower(
    params: GetBuyingPowerParams,
    options?: TossInvestRequestOptions,
  ) {
    const { accountSeq, ...query } = params;
    return this.requestEnvelope(
      '/api/v1/buying-power',
      'GET',
      query,
      accountSeq,
      options,
    );
  }

  getSellableQuantity(
    params: GetSellableQuantityParams,
  ): Promise<GetSellableQuantityData>;
  getSellableQuantity(
    params: GetSellableQuantityParams,
    options: WithResponseOptions,
  ): Promise<
    TossInvestWithResponse<GetSellableQuantityData, GetSellableQuantityRaw>
  >;
  getSellableQuantity(
    params: GetSellableQuantityParams,
    options?: TossInvestRequestOptions,
  ) {
    const { accountSeq, ...query } = params;
    return this.requestEnvelope(
      '/api/v1/sellable-quantity',
      'GET',
      query,
      accountSeq,
      options,
    );
  }

  getCommissions(params: GetCommissionsParams): Promise<GetCommissionsData>;
  getCommissions(
    params: GetCommissionsParams,
    options: WithResponseOptions,
  ): Promise<TossInvestWithResponse<GetCommissionsData, GetCommissionsRaw>>;
  getCommissions(
    params: GetCommissionsParams,
    options?: TossInvestRequestOptions,
  ) {
    return this.requestEnvelope(
      '/api/v1/commissions',
      'GET',
      undefined,
      params.accountSeq,
      options,
    );
  }

  private async requestEnvelope<TData, TRaw extends ApiEnvelope<TData>>(
    path: string,
    method: string,
    query:
      | Record<string, string | number | boolean | null | undefined>
      | undefined,
    accountSeq: number | undefined,
    options: TossInvestRequestOptions | undefined,
    body?: unknown,
  ): Promise<TData | TossInvestWithResponse<TData, TRaw>> {
    const headers = new Headers({
      authorization: `Bearer ${await this.tokenManager.getAccessToken()}`,
      'user-agent': this.userAgent,
    });

    if (accountSeq !== undefined) {
      headers.set('x-tossinvest-account', String(accountSeq));
    }

    let requestBody: BodyInit | undefined;

    if (body !== undefined) {
      headers.set('content-type', 'application/json');
      requestBody = JSON.stringify(body);
    }

    const request = {
      method,
      url: buildUrl(this.baseUrl, path, query),
      headers,
      timeoutMs: options?.timeoutMs ?? this.timeoutMs,
    };

    const { data: raw, response } = await requestJson<TRaw>(
      this.fetchImpl,
      requestBody === undefined ? request : { ...request, body: requestBody },
    );

    const data = raw.result as TData;

    if (options?.withResponse === true) {
      return { data, raw, response };
    }

    return data;
  }
}
