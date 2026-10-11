import assert from 'node:assert/strict';
import test from 'node:test';
import { sortScores } from '../src/sort-scores.mjs';

test('sorts scores and tie names without mutating input', () => {
  const input = [{ name: 'Charlie', score: 90 }, { name: 'Bob', score: 100 }, { name: 'Alice', score: 100 }];
  const original = structuredClone(input);
  const result = sortScores(input);
  assert.deepEqual(result.map(item => item.name), ['Alice', 'Bob', 'Charlie']);
  assert.deepEqual(result.map(item => item.score), [100, 100, 90]);
  assert.deepEqual(input, original, 'Input must remain unchanged');
  assert.notEqual(result, input, 'Return a separate array');
});

test('handles zero and one item', () => {
  assert.deepEqual(sortScores([]), []);
  assert.deepEqual(sortScores([{ name: 'Solo', score: -1 }]), [{ name: 'Solo', score: -1 }]);
});
