import assert from 'node:assert/strict';
import test from 'node:test';
import { formatPrice, legacyLabel } from '../src/format-price.mjs';

test('currency prefix and decimal behavior', () => {
  assert.equal(formatPrice(0), 'CNY 0.00');
  assert.equal(formatPrice(12), 'CNY 12.00');
  assert.equal(formatPrice(1.25), 'CNY 1.25');
  assert.equal(formatPrice(-2), 'CNY -2.00');
  assert.equal(legacyLabel(7), '7');
});
