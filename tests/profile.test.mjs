import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { exportProfile } from '../scripts/export-profile.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const profile = fs.readFileSync(path.join(root, 'profiles/react-typescript.md'), 'utf8');

test('opt-in project profile exports the same body with native file scopes', () => {
  const cursor = exportProfile(profile, 'cursor');
  const vscode = exportProfile(profile, 'vscode');
  assert.match(cursor, /^---\ndescription: .+\nglobs: '\*\*\/\*\.ts,\*\*\/\*\.tsx'\nalwaysApply: false\n---\n\n/);
  assert.match(vscode, /^---\ndescription: .+\napplyTo: '\*\*\/\*\.tsx'\n---\n\n/);
  assert.equal(cursor.split('---\n\n')[1], profile);
  assert.equal(vscode.split('---\n\n')[1], profile);
  assert.equal(exportProfile(profile, 'plain'), profile);
  assert.throws(() => exportProfile(profile, 'unknown'));
});

test('profile CLI is read-only and rejects unknown formats', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-profile-'));
  t.after(() => fs.rmSync(dir, { recursive: true }));
  const invoke = format => spawnSync(process.execPath, [path.join(root, 'scripts/export-profile.mjs'), '--format', format], { cwd: dir, encoding: 'utf8' });
  assert.equal(invoke('cursor').stdout, exportProfile(profile, 'cursor'));
  const bad = invoke('other');
  assert.equal(bad.status, 1);
  assert.deepEqual(fs.readdirSync(dir), []);
});
