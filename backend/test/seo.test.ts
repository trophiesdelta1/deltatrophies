import { describe, expect, it } from 'vitest';
import { buildProductSeoDescription, buildProductSeoTitle } from '../src/utils/seo.js';

describe('product SEO metadata', () => {
  it('brands concise product titles', () => {
    expect(buildProductSeoTitle('Regal Gold Cup Trophy')).toBe(
      'Regal Gold Cup Trophy | Delta Industries',
    );
  });

  it('keeps long customer names intact without an oversized brand suffix', () => {
    const name = 'Premium Multisport Achievement Trophy with Custom Emblem';
    expect(buildProductSeoTitle(name)).toBe(name);
    expect(buildProductSeoTitle(name).length).toBeLessThanOrEqual(65);
  });

  it('builds a current-name description suitable for enquiries', () => {
    expect(buildProductSeoDescription('Regal Gold Cup Trophy')).toContain('Regal Gold Cup Trophy');
  });
});
