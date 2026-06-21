import { describe, expect, it } from 'vitest';

import {
  VERSION,
  TossInvestApiError,
  TossInvestConnectionError,
  getPackageInfo,
} from '../src/index.js';

describe('public exports', () => {
  it('exports the package name and scaffold version', () => {
    expect(VERSION).toBe('0.0.0');
    expect(getPackageInfo()).toEqual({
      name: 'tossinvest-openapi',
      version: '0.0.0',
    });
  });

  it('exports SDK error classes', () => {
    expect(TossInvestApiError).toBeTypeOf('function');
    expect(TossInvestConnectionError).toBeTypeOf('function');
  });
});
