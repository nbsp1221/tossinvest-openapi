export const PACKAGE_NAME = 'tossinvest-openapi';
export const VERSION = '0.1.0';
export const DEFAULT_USER_AGENT = `${PACKAGE_NAME}-js/${VERSION}`;

export interface PackageInfo {
  name: typeof PACKAGE_NAME;
  version: typeof VERSION;
}

export function getPackageInfo(): PackageInfo {
  return {
    name: PACKAGE_NAME,
    version: VERSION,
  };
}
