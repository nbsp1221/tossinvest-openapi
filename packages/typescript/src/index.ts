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

export { TossInvestApiError, TossInvestConnectionError } from './errors.js';
export type {
  TossInvestClientOptions,
  TossInvestRequestOptions,
  TossInvestResponseMeta,
  TossInvestWithResponse,
} from './types.js';
