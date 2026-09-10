import { describe, expect, it } from 'vitest';
import { createInquiryRequestSchema } from '../src/validation/inquiry.schemas.js';
import { productListRequestSchema } from '../src/validation/product.schemas.js';

describe('request schemas', () => {
  it('normalizes catalogue pagination and booleans', () => {
    const result = productListRequestSchema.parse({
      body: {},
      params: {},
      query: { page: '2', limit: '25', in_stock: 'false' },
    });

    expect(result.query).toEqual({ page: 2, limit: 25, in_stock: false });
  });

  it('normalizes inquiry contact data', () => {
    const result = createInquiryRequestSchema.parse({
      body: {
        name: '  Test User ',
        email: ' TEST@EXAMPLE.COM ',
        phone: '+91 99999 99999',
        message: ' Need a trophy ',
      },
      params: {},
      query: {},
    });

    expect(result.body.email).toBe('test@example.com');
    expect(result.body.name).toBe('Test User');
  });
});
