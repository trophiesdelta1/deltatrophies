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

  it('distinguishes products that share a customer-facing name', () => {
    expect(buildProductSeoTitle('Winner Trophy Cup', 'FC-24')).not.toBe(
      buildProductSeoTitle('Winner Trophy Cup', 'FC-25'),
    );
    expect(buildProductSeoDescription('Winner Trophy Cup', 'FC-24')).not.toBe(
      buildProductSeoDescription('Winner Trophy Cup', 'FC-25'),
    );
  });

  it('keeps the full current name when a long SKU would overwhelm the title', () => {
    const name = 'Golden Aluminium Name Plate ( also present in silver )';
    const title = buildProductSeoTitle(name, 'ALUMINIUM BADGE 03 ALSO IN SILVER');
    expect(title).toBe(name);
    expect(title.length).toBeLessThanOrEqual(65);
  });
});
