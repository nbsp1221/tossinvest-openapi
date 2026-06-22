import { describe, expect, it } from 'vitest';

import {
  VERSION,
  TossInvestApiError,
  TossInvestConnectionError,
  getPackageInfo,
} from '../../src/index.js';

describe('public exports', () => {
  it('exports the package name and package version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    expect(getPackageInfo()).toEqual({
      name: 'tossinvest-openapi',
      version: VERSION,
    });
  });

  it('exports SDK error classes', () => {
    expect(TossInvestApiError).toBeTypeOf('function');
    expect(TossInvestConnectionError).toBeTypeOf('function');
  });
});
