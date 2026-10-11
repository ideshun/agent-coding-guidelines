import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRepository } from '../scripts/validate.mjs';

// 验证当前仓库自身的公开内容：身份、链接、JSON、敏感模式。
test('current repository passes static validation', () => {
  const result = validateRepository();
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});
