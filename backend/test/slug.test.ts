import { describe, expect, it } from 'vitest';
import { createSlug, updateSlug } from '../src/utils/slug.js';

describe('product slugs', () => {
  it('creates a readable slug with a stable identity suffix', () => {
    expect(createSlug('Regal Gold Cup', 'PC-101')).toMatch(/^regal-gold-cup-pc-101-[a-f\d]{8}$/);
  });

  it('updates the readable name while preserving the stable suffix', () => {
    expect(updateSlug('old-technical-name-pc-101-a1b2c3d4', 'Regal Gold Cup', 'PC-101')).toBe(
      'regal-gold-cup-pc-101-a1b2c3d4',
    );
  });
});
