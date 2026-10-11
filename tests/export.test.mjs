import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { exportGuidelines } from '../scripts/export.mjs';
import { packSkill, RUNTIME_FILES } from '../scripts/pack-skill.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonical = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8');

test('native export preserves the exact canonical bytes and multilingual metadata', () => {
  assert.equal(exportGuidelines(canonical, 'skill'), canonical);
  assert.equal(exportGuidelines(canonical.replaceAll('\n', '\r\n'), 'skill'), canonical.replaceAll('\n', '\r\n'));
});

test('instruction export folds every references/*.md link into a self-contained hint', () => {
  const exported = exportGuidelines(canonical, 'instructions');
  assert.ok(exported.startsWith('Scope / 适用范围: '));
  assert.ok(!exported.startsWith('---'));
  assert.ok(!exported.includes('references/clarify.md'));
  assert.ok(!exported.includes('references/plan.md'));
  assert.ok(!exported.includes('references/verify.md'));
  assert.ok(exported.includes('Clarify (goals, non-goals, anti-goals, constraints, success criteria, meaningful trade-offs)'));
  assert.ok(exported.includes('Plan (scope, approach, steps with per-step verify, risks; prefer host Plan mode)'));
  assert.ok(exported.includes('Verify (V0/V1/V2 by risk, real output and exit codes, honest gaps)'));
  assert.ok(exported.includes('## Route by risk'));
});

test('bad source or unsupported format cannot silently generate an alternate rule', () => {
  assert.throws(() => exportGuidelines('body without metadata', 'instructions'));
  assert.throws(() => exportGuidelines(canonical.replace('name: agent-coding-guidelines', 'name: other-skill'), 'skill'));
  assert.throws(() => exportGuidelines(canonical, 'unknown'));
});

test('CLI export is read-only and fails cleanly on unsupported format', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-export-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  const invoke = args => spawnSync(process.execPath, [path.join(root, 'scripts/export.mjs'), ...args], { cwd: dir, encoding: 'utf8' });
  const ok = invoke(['--format', 'instructions']);
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout, exportGuidelines(canonical, 'instructions'));
  const bad = invoke(['--format', 'other']);
  assert.equal(bad.status, 1);
  assert.deepEqual(fs.readdirSync(dir), []);
});

test('pack-skill copies only the runtime install set and refuses the repo tree', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-pack-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  const result = packSkill(dir);
  assert.deepEqual(result.files, RUNTIME_FILES);
  for (const relative of RUNTIME_FILES) {
    assert.equal(
      fs.readFileSync(path.join(dir, relative), 'utf8'),
      fs.readFileSync(path.join(root, relative), 'utf8')
    );
  }
  assert.deepEqual(
    fs.readdirSync(dir).sort(),
    ['LICENSE', 'SKILL.md', 'references'].sort()
  );
  assert.throws(() => packSkill(root), /Refusing to pack into the repository tree/);
  const nested = path.join(root, 'tmp-pack-dest');
  assert.throws(() => packSkill(nested), /Refusing to pack into the repository tree/);
  const invoke = args => spawnSync(process.execPath, [path.join(root, 'scripts/pack-skill.mjs'), ...args], { encoding: 'utf8' });
  const packed = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-pack-cli-'));
  t.after(() => fs.rmSync(packed, { recursive: true }));
  const cli = invoke(['--out', packed]);
  assert.equal(cli.status, 0);
  assert.deepEqual(JSON.parse(cli.stdout).files, RUNTIME_FILES);
});
