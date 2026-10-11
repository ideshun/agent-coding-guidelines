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

test('compact instructions preserve the entire root body except optional file links', () => {
  const exported = exportGuidelines(canonical, 'instructions');
  const body = canonical.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/)[1].trim();
  const expectedBody = body.replace(/\[([^\]]+)\]\(references\/[a-z0-9-]+\.md\)/g, '$1');
  assert.ok(exported.endsWith(expectedBody + '\n'));
  assert.ok(exported.startsWith('Scope / 适用范围: '));
  assert.ok(!exported.includes('references/'));
  assert.ok(!exported.includes('## Optional detail:'));
});

test('full instruction export includes each source reference and preserves the core body', () => {
  const exported = exportGuidelines(canonical, 'instructions-full');
  assert.ok(exported.startsWith('Scope / 适用范围: '));
  assert.ok(!exported.startsWith('---'));
  assert.ok(!exported.includes('references/clarify.md'));
  assert.ok(!exported.includes('references/plan.md'));
  assert.ok(!exported.includes('references/verify.md'));
  for (const name of ['clarify', 'plan', 'verify']) {
    const body = fs.readFileSync(path.join(root, 'references', `${name}.md`), 'utf8').replace(/^# [^\r\n]+\r?\n/, '').trim();
    assert.ok(exported.includes(body), name);
    assert.ok(exported.includes(`](#optional-detail-${name})`), name);
  }
  const core = canonical.split('## Conditional detail')[0].split(/---\r?\n/).slice(2).join('---\n').trim();
  assert.ok(exported.includes(core));
});

test('reference edits flow into full exports once; compact exports do not grow with optional detail', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-export-ref-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  fs.mkdirSync(path.join(dir, 'references'));
  const file = path.join(dir, 'references', 'example.md');
  const source = '---\nname: agent-coding-guidelines\ndescription: "Use for coding."\n---\n# Core\n\nKeep this rule.\n---\n[One](references/example.md) and [Two](references/example.md).\n';
  fs.writeFileSync(file, '# Example\n\nFirst actual guidance.\n');
  const compact = exportGuidelines(source, 'instructions', dir);
  const first = exportGuidelines(source, 'instructions-full', dir);
  assert.equal(first.split('First actual guidance.').length - 1, 1);
  assert.ok(first.includes('Keep this rule.\n---\n'));
  fs.writeFileSync(file, '# Example\n\nUpdated actual guidance.\n');
  const next = exportGuidelines(source, 'instructions-full', dir);
  assert.ok(next.includes('Updated actual guidance.'));
  assert.ok(!next.includes('First actual guidance.'));
  assert.equal(exportGuidelines(source, 'instructions', dir), compact);
  fs.writeFileSync(file, '# Example\n\n[Unbundled context](../docs/context.md)\n');
  assert.throws(() => exportGuidelines(source, 'instructions', dir), /explicit export strategy/);
  fs.writeFileSync(file, '\n');
  assert.throws(() => exportGuidelines(source, 'instructions', dir), /Reference is empty/);
  const target = path.join(dir, 'other.md');
  fs.writeFileSync(target, '# Outside\nDo not silently inline a symlink.\n');
  fs.unlinkSync(file);
  fs.symlinkSync(target, file);
  assert.throws(() => exportGuidelines(source, 'instructions', dir), /regular file/);
  fs.unlinkSync(file);
  assert.throws(() => exportGuidelines(source, 'instructions', dir), /ENOENT/);
  assert.throws(() => exportGuidelines(source.replaceAll('references/example.md', 'references/nested/example.md'), 'instructions', dir), /one-level/);
});

test('bad source or unsupported format cannot silently generate an alternate rule', () => {
  assert.throws(() => exportGuidelines('body without metadata', 'instructions'));
  assert.throws(() => exportGuidelines(canonical.replace('name: agent-coding-guidelines', 'name: other-skill'), 'skill'));
  assert.throws(() => exportGuidelines(canonical.replace(/^description: .*$/m, 'description: ""'), 'skill'));
  assert.throws(() => exportGuidelines(canonical, 'unknown'));
});

test('CLI export is read-only and fails cleanly on unsupported format', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-export-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  const invoke = args => spawnSync(process.execPath, [path.join(root, 'scripts/export.mjs'), ...args], { cwd: dir, encoding: 'utf8' });
  for (const format of ['instructions', 'instructions-full']) {
    const ok = invoke(['--format', format]);
    assert.equal(ok.status, 0);
    assert.equal(ok.stdout, exportGuidelines(canonical, format));
  }
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
  assert.throws(() => packSkill(dir), /Destination is not empty/);
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
