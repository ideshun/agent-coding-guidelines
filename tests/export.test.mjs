import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { exportSkill } from '../scripts/export.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = path.join(root, 'skills');
const skillNames = fs.readdirSync(skillsDir).filter(entry =>
  fs.existsSync(path.join(skillsDir, entry, 'SKILL.md')));

test('every skill has valid frontmatter identity and exports byte-identical in skill format', () => {
  assert.ok(skillNames.includes('global-coding-principles'));
  for (const name of skillNames) {
    const source = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
    assert.equal(exportSkill(source, 'skill'), source, name);
  }
});

test('instruction export drops frontmatter and keeps the full body', () => {
  const source = '---\nname: example\ndescription: Use for coding tasks only.\n---\n\n# Example\n\nBody line.\n';
  assert.equal(exportSkill(source, 'instructions'), 'Scope: Use for coding tasks only.\n\n# Example\n\nBody line.\n');
  for (const name of skillNames) {
    const source = fs.readFileSync(path.join(skillsDir, name, 'SKILL.md'), 'utf8');
    const exported = exportSkill(source, 'instructions');
    assert.ok(!exported.startsWith('---'), name);
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').trimStart();
    assert.ok(exported.endsWith(body.trimEnd()) || exported.includes(body.slice(0, 80)), name);
  }
});

test('bad source or unsupported format cannot silently generate an alternate rule', () => {
  assert.throws(() => exportSkill('body without metadata', 'instructions'));
  assert.throws(() => exportSkill('---\ndescription: no name\n---\nBody\n', 'skill'));
  const source = fs.readFileSync(path.join(skillsDir, 'global-coding-principles', 'SKILL.md'), 'utf8');
  assert.throws(() => exportSkill(source, 'unknown'));
});

test('CLI is read-only, exports per skill and fails cleanly on unknown skill or format', (t) => {
  const dir = fs.mkdtempSync(path.join(process.env.TEMPDIR || '/tmp', 'acg-export-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  const invoke = args => spawnSync(process.execPath, [path.join(root, 'scripts/export.mjs'), ...args], { cwd: dir, encoding: 'utf8' });
  const ok = invoke(['--skill', 'global-coding-principles', '--format', 'instructions']);
  assert.equal(ok.status, 0);
  const canonical = fs.readFileSync(path.join(skillsDir, 'global-coding-principles', 'SKILL.md'), 'utf8');
  assert.equal(ok.stdout, exportSkill(canonical, 'instructions'));
  const badSkill = invoke(['--skill', 'no-such-skill', '--format', 'skill']);
  assert.equal(badSkill.status, 1);
  assert.ok(badSkill.stderr.includes('Unknown skill'));
  const badFormat = invoke(['--skill', 'plan', '--format', 'other']);
  assert.equal(badFormat.status, 1);
  assert.deepEqual(fs.readdirSync(dir), []);
});
