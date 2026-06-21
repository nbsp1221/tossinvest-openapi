import { describe, expect, it } from 'vitest';

import { VERSION, getPackageInfo } from '../src/index.js';

describe('package metadata', () => {
  it('exports the package name and scaffold version', () => {
    expect(VERSION).toBe('0.0.0');
    expect(getPackageInfo()).toEqual({
      name: 'tossinvest-openapi',
      version: '0.0.0',
    });
  });
});
