import assert from 'node:assert/strict';
import test from 'node:test';
import { shippingCost } from '../src/pricing.mjs';
import { checkoutSummary } from '../src/checkout.mjs';

for (const [subtotal, shipping, expected] of [
  [99, 10, { total: 109, freeShipping: false }],
  [100, 0, { total: 100, freeShipping: true }],
  [101, 0, { total: 101, freeShipping: true }],
]) {
  test(`checkout at subtotal ${subtotal}`, () => {
    assert.equal(shippingCost(subtotal), shipping);
    assert.deepEqual(checkoutSummary(subtotal), expected);
  });
}
