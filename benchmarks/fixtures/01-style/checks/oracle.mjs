import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('primary button declarations preserve the requested boundary', () => {
  const css = readFileSync(new URL('../src/button.css', import.meta.url), 'utf8');
  const match = css.match(/^\s*\.primary-button\s*\{([^{}]*)\}\s*$/);
  assert.ok(match, 'Expected exactly one primary-button rule');
  const entries = match[1].split(';').map(value => value.trim()).filter(Boolean).map(value => {
    const colon = value.indexOf(':');
    assert.ok(colon > 0, 'Invalid CSS declaration');
    return [value.slice(0, colon).trim(), value.slice(colon + 1).trim()];
  });
  assert.equal(entries.length, 4, 'Do not add or remove declarations');
  assert.equal(new Set(entries.map(([key]) => key)).size, 4, 'No duplicate properties');
  assert.deepEqual(Object.fromEntries(entries), {
    'background-color': '#1677ff',
    'border-radius': '6px',
    padding: '8px 12px',
    color: '#ffffff',
  });
});
