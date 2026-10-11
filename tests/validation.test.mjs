import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRepository } from '../scripts/validate.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const required = [
  'SKILL.md',
  'README.md',
  'README.en.md',
  'LICENSE',
  'references/clarify.md',
  'references/plan.md',
  'references/verify.md',
];

const removeOwned = (target) => {
  const stat = fs.lstatSync(target);
  if (stat.isDirectory() && !stat.isSymbolicLink()) {
    for (const name of fs.readdirSync(target)) removeOwned(path.join(target, name));
    fs.rmdirSync(target);
  } else fs.unlinkSync(target);
};

const fixture = (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'acg-validator-'));
  t.after(() => removeOwned(dir));
  for (const relative of required) {
    const target = path.join(dir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const useCanonical = relative === 'SKILL.md' || relative.startsWith('references/');
    fs.writeFileSync(
      target,
      useCanonical ? fs.readFileSync(path.join(repoRoot, relative)) : '# Example\n'
    );
  }
  return dir;
};

test('current repository passes static validation', () => {
  const result = validateRepository();
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test('skill and references stay within runtime text budgets', () => {
  const skill = fs.readFileSync(path.join(repoRoot, 'SKILL.md'), 'utf8');
  const match = skill.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(match);
  const description = JSON.parse(match[1].match(/^description: ("[^\r\n]+")\s*$/m)[1]);
  assert.ok(description.length <= 1024);
  assert.ok(skill.split('\n').length <= 70);
  assert.ok(Buffer.byteLength(skill) <= 6000);
  for (const name of ['clarify.md', 'plan.md', 'verify.md']) {
    const text = fs.readFileSync(path.join(repoRoot, 'references', name), 'utf8');
    assert.ok(text.split('\n').length <= 45, name);
  }
});

test('SKILL.md links only one level into references/ and those files exist', () => {
  const skill = fs.readFileSync(path.join(repoRoot, 'SKILL.md'), 'utf8');
  const hrefs = [...skill.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1].split('#')[0]);
  assert.ok(hrefs.length >= 3);
  for (const href of hrefs) {
    assert.ok(href.startsWith('references/'));
    assert.equal(href.split('/').length, 2);
    assert.ok(fs.existsSync(path.join(repoRoot, href)), href);
  }
});

test('standard optional metadata is accepted without imposing workflow headings or language', (t) => {
  const dir = fixture(t);
  const file = path.join(dir, 'SKILL.md');
  const source = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, source.replace('license: MIT', 'license: MIT\ncompatibility: Coding agents.\nmetadata:\n  version: "1.0"\nallowed-tools: Read'));
  assert.deepEqual(validateRepository(dir).errors, []);
  fs.writeFileSync(file, '---\nname: agent-coding-guidelines\ndescription: "Use for coding."\n---\n# Different structure\nDefault to Chinese.\n');
  assert.equal(validateRepository(dir).ok, true);
});

test('missing or empty references and an empty description fail structural checks', (t) => {
  const dir = fixture(t);
  fs.unlinkSync(path.join(dir, 'references/plan.md'));
  fs.writeFileSync(path.join(dir, 'references/verify.md'), '\n  \n');
  const file = path.join(dir, 'SKILL.md');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^description: .*$/m, 'description: ""'));
  const errors = validateRepository(dir).errors;
  assert.ok(errors.some(error => error === 'references/plan.md: missing'));
  assert.ok(errors.some(error => error === 'references/verify.md: empty reference'));
  assert.ok(errors.some(error => error.includes('description must be non-empty text')));
});

test('valid portable public sources pass without reading ignored local audit files', (t) => {
  const dir = fixture(t);
  fs.mkdirSync(path.join(dir, '.local'));
  fs.writeFileSync(path.join(dir, '.local', 'audit.md'), '/' + 'Users/' + 'private-person/config');
  assert.equal(validateRepository(dir).ok, true);
});

test('public concrete user paths and malformed skill identity are rejected', (t) => {
  const dir = fixture(t);
  fs.writeFileSync(path.join(dir, 'README.en.md'), '/' + 'Users/' + 'private-person/config');
  fs.writeFileSync(path.join(dir, 'SKILL.md'), '---\nname: different-skill\ndescription: "Valid description."\n---\nBody\n');
  const result = validateRepository(dir);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.includes('concrete local user path')));
  assert.ok(result.errors.some(error => error.includes('invalid skill identity')));
});

test('broken local document references and malformed JSON are rejected', (t) => {
  const dir = fixture(t);
  fs.writeFileSync(path.join(dir, 'README.md'), '[Missing](not-present.md)\n');
  fs.writeFileSync(path.join(dir, 'example.json'), '{invalid');
  const result = validateRepository(dir);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.includes('broken or nonportable link')));
  assert.ok(result.errors.some(error => error.includes('invalid JSON')));
});

test('a second discoverable skill or an oversized root prompt fails validation', (t) => {
  const dir = fixture(t);
  fs.mkdirSync(path.join(dir, 'skills/extra'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'skills/extra/SKILL.md'), '---\nname: extra\ndescription: Another skill.\n---\nBody\n');
  assert.ok(validateRepository(dir).errors.some(error => error.includes('extra discoverable')));
  fs.unlinkSync(path.join(dir, 'skills/extra/SKILL.md'));
  fs.appendFileSync(path.join(dir, 'SKILL.md'), 'Large text. '.repeat(1000));
  assert.ok(validateRepository(dir).errors.some(error => error.includes('runtime text budget')));
});

test('Finder metadata is excluded while other binary public files still require review', (t) => {
  const dir = fixture(t);
  fs.writeFileSync(path.join(dir, '.DS_Store'), Buffer.from([0, 1, 2]));
  assert.equal(validateRepository(dir).ok, true);
  fs.writeFileSync(path.join(dir, 'unknown.bin'), Buffer.from([0, 1, 2]));
  assert.deepEqual(validateRepository(dir).errors, ['unknown.bin: binary public file requires review']);
});
