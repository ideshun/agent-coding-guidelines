import assert from 'node:assert/strict';
import test from 'node:test';
import { total } from '../.benchmark-build/total.js';

test('total preserves numeric summation', () => {
  assert.equal(total([]), 0);
  assert.equal(total([1, 2, 3]), 6);
  assert.equal(total([-3, 1]), -2);
  assert.equal(total([0.25, 0.5]), 0.75);
  assert.equal(typeof total([1]), 'number');
});
