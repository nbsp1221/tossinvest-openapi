export const VERSION = '0.0.0';

export interface PackageInfo {
  name: 'tossinvest-openapi';
  version: typeof VERSION;
}

export function getPackageInfo(): PackageInfo {
  return {
    name: 'tossinvest-openapi',
    version: VERSION,
  };
}

export { TossInvestClient } from './client.js';
export { TossInvestApiError, TossInvestConnectionError } from './errors.js';
export type {
  CancelOrderParams,
  CreateOrderParams,
  GetBuyingPowerParams,
  GetCandlesParams,
  GetCommissionsParams,
  GetExchangeRateParams,
  GetHoldingsParams,
  GetKrMarketCalendarParams,
  GetOrderParams,
  GetOrderbookParams,
  GetOrdersParams,
  GetPriceLimitParams,
  GetPricesParams,
  GetSellableQuantityParams,
  GetStockWarningsParams,
  GetStocksParams,
  GetTradesParams,
  GetUsMarketCalendarParams,
  ModifyOrderParams,
} from './client.js';
export type {
  TossInvestClientOptions,
  TossInvestRequestOptions,
  TossInvestResponseMeta,
  TossInvestWithResponse,
} from './types.js';
