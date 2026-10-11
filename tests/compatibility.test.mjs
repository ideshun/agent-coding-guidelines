import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readRegistry, findTool } from '../scripts/compatibility.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('catalog distinguishes domestic product variants, shared discovery and UI-only imports', () => {
  const registry = readRegistry();
  assert.notEqual(findTool(registry, 'trae').user, findTool(registry, 'trae-cn').user);
  assert.notEqual(findTool(registry, 'qoder').user, findTool(registry, 'qoder-cn').user);
  assert.equal(findTool(registry, 'qoder-ide').mode, 'skill-import');
  assert.equal(findTool(registry, 'qoder-ide').user, null);
  assert.equal(findTool(registry, 'qoderwork').user, '~/.qoderwork/skills');
  assert.equal(findTool(registry, 'codebuddy').project, '.codebuddy/skills');
  assert.equal(findTool(registry, 'codebuddy-ide').user, null);
  assert.equal(findTool(registry, 'codex').user, findTool(registry, 'cursor').user);
  assert.equal(findTool(registry, 'amazon-q-ide').selection, 'always');
  assert.throws(() => findTool(registry, 'qoder IDE maybe CLI'));
});

test('every catalog record has a unique identity, resolvable evidence and safe relative project target', () => {
  const registry = readRegistry();
  assert.equal(registry.canonical, 'skills/<name>/SKILL.md');
  assert.equal(new Set(registry.tools.map(tool => tool.id)).size, registry.tools.length);
  for (const tool of registry.tools) {
    assert.ok(['skill', 'skill-import', 'instructions', 'instructions-ui'].includes(tool.mode), tool.id);
    assert.ok(['vendor-docs', 'installer-registry'].includes(tool.evidence), tool.id);
    assert.ok(tool.sources.length, tool.id);
    for (const source of tool.sources) assert.ok(new URL(registry.sources[source].url).protocol === 'https:', tool.id);
    if (tool.project !== null) {
      assert.ok(!path.isAbsolute(tool.project), tool.id);
      assert.ok(!tool.project.split('/').includes('..'), tool.id);
    }
    if (tool.mode === 'skill') assert.ok(tool.user !== null || tool.project !== null, tool.id);
  }
});

test('catalog lookup CLI writes no files and fails cleanly on unknown profiles', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-compat-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  const invoke = args => spawnSync(process.execPath, [path.join(root, 'scripts/compatibility.mjs'), ...args], { cwd: dir, encoding: 'utf8' });
  const lookup = invoke(['--tool', 'codebuddy']);
  assert.equal(lookup.status, 0);
  assert.equal(JSON.parse(lookup.stdout).user, '~/.codebuddy/skills');
  const list = invoke(['--list']);
  assert.equal(list.status, 0);
  assert.equal(list.stdout.trim().split('\n').length, readRegistry().tools.length);
  const unknown = invoke(['--tool', 'nonexistent-client']);
  assert.equal(unknown.status, 1);
  assert.equal(unknown.stdout, '');
  assert.ok(unknown.stderr.includes('Unknown tool profile'));
  assert.deepEqual(fs.readdirSync(dir), []);
});
