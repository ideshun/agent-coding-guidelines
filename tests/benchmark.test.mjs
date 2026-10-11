import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compareRuns, fixtureFingerprint, fixturesRoot, loadTasks, makeTemplate, taskSchema, validateRun, validateSchema } from '../benchmarks/lib.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const collector = join(repository, 'benchmarks/collect.mjs');

/** @description: Build synthetic records solely for comparison-gate tests, never performance claims. */
const nativeRecordsForGateTest = () => ['none', 'legacy', 'new'].flatMap(group => [1, 2, 3].map(repetition => {
  const run = makeTemplate({ taskId: '04-bug', group, runId: `${group}-${repetition}`, repetition });
  run.model = { id: 'synthetic-test-model', version: 'fixture' };
  run.environment = {
    toolInterface: 'synthetic-test-interface', toolVersion: 'fixture', toolCapabilities: ['filesystem', 'shell'],
    budget: { maxToolCalls: 30, maxTokens: 10000, maxTimeMs: 120000 },
    ruleSetFingerprint: group === 'none' ? null : (group === 'legacy' ? 'a' : 'b').repeat(64),
    ambientFingerprint: 'c'.repeat(64), isolation: 'verified',
    ambient: { instructions: 'controlled', skills: 'controlled', hooks: 'disabled' },
  };
  run.metrics.completion = true;
  run.metrics.testPass = true;
  run.metrics.changedFiles = ['src/sort-scores.mjs'];
  run.metrics.unrelatedDiff = 0;
  run.metrics.tokens = null;
  run.evidence.kind = 'native-run';
  run.evidence.checks = [{ id: 'sorting', kind: 'automated', status: 'passed', exitCode: 0, details: 'Synthetic validator input, not a measured native run.' }];
  return run;
}));

test('all eight public task schemas are valid and declared files exist', () => {
  const tasks = loadTasks();
  assert.equal(tasks.length, 8);
  assert.equal(new Set(tasks.map(task => task.category)).size, 8);
  for (const task of tasks) {
    assert.deepEqual(validateSchema(task, taskSchema), []);
    for (const path of task.contextFiles) assert.ok(readFileSync(join(fixturesRoot, task.id, path)).length > 0);
    for (const check of task.passChecks) {
      assert.ok(check.criteria.length > 0);
      if (check.status === 'pending') assert.ok(check.pendingReason);
    }
    for (const check of task.optionalChecks ?? []) assert.ok(check.criteria.length > 0);
    assert.match(fixtureFingerprint(task.id), /^[a-f0-9]{64}$/);
    assert.deepEqual(validateRun(makeTemplate({ taskId: task.id })), []);
  }
});

test('Finder metadata does not change tasks or source fingerprints; real source changes do', async () => {
  const temporary = mkdtempSync(join(tmpdir(), 'acg-metadata-'));
  try {
    const copy = join(temporary, 'benchmarks');
    cpSync(join(repository, 'benchmarks'), copy, { recursive: true });
    const isolated = await import(pathToFileURL(join(copy, 'lib.mjs')).href);
    const originalIds = isolated.loadTasks().map(task => task.id);
    const originalHash = isolated.fixtureFingerprint('01-style');
    writeFileSync(join(copy, 'fixtures/.DS_Store'), Buffer.from([0, 1, 2]));
    writeFileSync(join(copy, 'fixtures/01-style/.DS_Store'), Buffer.from([0, 1, 2]));
    assert.deepEqual(isolated.loadTasks().map(task => task.id), originalIds);
    assert.equal(isolated.fixtureFingerprint('01-style'), originalHash);
    const source = join(copy, 'fixtures/01-style/src/button.css');
    writeFileSync(source, readFileSync(source, 'utf8') + '\nbutton { color: red; }\n');
    assert.notEqual(isolated.fixtureFingerprint('01-style'), originalHash);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});

test('unknown metrics remain null and offline data cannot claim model completion', () => {
  const run = makeTemplate({ taskId: '04-bug' });
  assert.equal(run.metrics.tokens, null);
  assert.equal(run.metrics.completion, null);
  run.evidence.kind = 'offline-oracle';
  run.metrics.completion = true;
  assert.ok(validateRun(run).some(error => error.startsWith('completion:')));
});

test('rejects estimated tokens, inconsistent totals, unsafe paths and undeclared fields', () => {
  const variants = [
    run => { run.metrics.tokens = { input: 10, output: 5, total: 15, source: 'estimated' }; },
    run => { run.metrics.tokens = { input: 10, output: 5, total: 1, source: 'native-report' }; },
    run => { run.metrics.changedFiles = ['../outside.mjs']; },
    run => { run.metrics.changedFiles = ['/outside.mjs']; },
    run => { run.metrics.changedFiles = ['C:\\outside.mjs']; },
    run => { run.auth = 'This unexpected field must be rejected.'; },
    run => { run.fixtureFingerprint = 'd'.repeat(64); },
    run => { run.metrics.elapsedMs = -1; },
    run => { run.metrics.changedFiles = ['context/unrequested.md']; run.metrics.unrelatedDiff = 0; },
    run => { run.metrics.testPass = false; },
  ];
  for (const mutate of variants) {
    const run = makeTemplate({ taskId: '04-bug' });
    mutate(run);
    assert.ok(validateRun(run).length > 0);
  }
});

test('passing test claims require real exit-code-shaped evidence for every automated check', () => {
  const run = makeTemplate({ taskId: '04-bug' });
  run.metrics.testPass = true;
  assert.ok(validateRun(run).some(error => error.startsWith('testPass:')));
  run.evidence.checks[0].status = 'passed';
  assert.ok(validateRun(run).some(error => error.startsWith('checks:')));
  run.evidence.checks[0].exitCode = 0;
  assert.deepEqual(validateRun(run), []);
  run.evidence.checks[0].exitCode = 2;
  assert.ok(validateRun(run).some(error => error.startsWith('checks:')));
});

test('small style completion does not require a browser check', () => {
  const run = makeTemplate({ taskId: '01-style' });
  run.evidence.kind = 'native-run';
  run.model = { id: 'synthetic-test-model', version: 'fixture' };
  run.metrics.completion = true;
  run.metrics.testPass = true;
  run.metrics.changedFiles = ['src/button.css'];
  run.metrics.unrelatedDiff = 0;
  const declarations = run.evidence.checks.find(check => check.id === 'declarations');
  declarations.status = 'passed';
  declarations.exitCode = 0;
  assert.equal(run.evidence.checks.find(check => check.id === 'browser').status, 'pending');
  assert.deepEqual(validateRun(run), []);
});

test('completion rejects known scope violations or unassessed diff while retaining null metrics', () => {
  const base = makeTemplate({ taskId: '08-narrow-scope' });
  base.evidence.kind = 'native-run';
  base.model = { id: 'synthetic-test-model', version: 'fixture' };
  base.metrics.completion = true;
  base.metrics.testPass = true;
  base.metrics.changedFiles = ['src/format-price.mjs'];
  base.metrics.unrelatedDiff = 0;
  for (const check of base.evidence.checks) {
    check.status = 'passed';
    check.exitCode = check.kind === 'automated' ? 0 : null;
  }
  assert.deepEqual(validateRun(base), []);
  for (const mutate of [
    run => { run.metrics.changedFiles.push('context/protected.md'); run.metrics.unrelatedDiff = 1; },
    run => { run.metrics.unrelatedDiff = 1; },
    run => { run.metrics.changedFiles = null; },
    run => { run.metrics.unrelatedDiff = null; },
  ]) {
    const run = structuredClone(base);
    mutate(run);
    assert.ok(validateRun(run).some(error => error.startsWith('completion:')));
  }
  const pending = structuredClone(base);
  pending.metrics.completion = null;
  pending.metrics.changedFiles = null;
  pending.metrics.unrelatedDiff = null;
  assert.deepEqual(validateRun(pending), []);
  assert.equal(pending.metrics.tokens, null);
  assert.equal(pending.metrics.elapsedMs, null);
});

test('checked-in offline example is valid but never eligible for model comparison', () => {
  const example = JSON.parse(readFileSync(join(repository, 'benchmarks/examples/offline-oracle.json'), 'utf8'));
  assert.deepEqual(validateRun(example), []);
  assert.equal(example.evidence.kind, 'offline-oracle');
  assert.equal(example.metrics.completion, null);
  assert.equal(example.metrics.tokens, null);
  assert.equal(compareRuns([example]).status, 'blocked');
});

test('comparison requires three distinct repetitions for all three groups', () => {
  const records = nativeRecordsForGateTest();
  assert.equal(compareRuns(records).status, 'ready-for-analysis');
  const summary = compareRuns(records).summaries[0];
  assert.equal(summary.repetitions, 3);
  assert.equal(summary.meanTokens, null);
  assert.equal(compareRuns(records.slice(0, 8)).status, 'blocked');
  records[1].repetition = 1;
  assert.equal(compareRuns(records).status, 'blocked');
});

test('comparison rejects uncontrolled native ambient instructions, skills or hooks', () => {
  for (const key of ['instructions', 'skills', 'hooks']) {
    const records = nativeRecordsForGateTest();
    for (const run of records) run.environment.ambient[key] = 'uncontrolled';
    assert.equal(compareRuns(records).status, 'blocked');
  }
  const records = nativeRecordsForGateTest();
  for (const run of records) run.evidence.kind = 'offline-oracle';
  for (const run of records) run.metrics.completion = null;
  assert.equal(compareRuns(records).status, 'blocked');
});

test('comparison rejects different models, budgets, tools or changed within-group rule sets', () => {
  const variants = [
    run => { run.model.id = 'different-model'; },
    run => { run.environment.budget.maxToolCalls = 99; },
    run => { run.environment.toolCapabilities = ['filesystem']; },
    run => { run.environment.toolVersion = 'different-version'; },
    run => { run.environment.ambientFingerprint = 'e'.repeat(64); },
    run => { run.environment.ruleSetFingerprint = 'f'.repeat(64); },
  ];
  for (const mutate of variants) {
    const records = nativeRecordsForGateTest();
    mutate(records[4]);
    assert.equal(compareRuns(records).status, 'blocked');
  }
});

test('semantically identical schema fields compare equally regardless of JSON object key order', () => {
  const records = nativeRecordsForGateTest();
  records[4].model = { version: 'fixture', id: 'synthetic-test-model' };
  records[4].environment.budget = { maxTimeMs: 120000, maxTokens: 10000, maxToolCalls: 30 };
  records[4].environment.ambient = { hooks: 'disabled', skills: 'controlled', instructions: 'controlled' };
  records[4].environment.toolCapabilities = ['shell', 'filesystem'];
  assert.equal(compareRuns(records).status, 'ready-for-analysis');
});

const referenceCorrections = {
  '01-style': { 'src/button.css': value => value.replace('#1f2937', '#1677ff') },
  '04-bug': { 'src/sort-scores.mjs': () => "export const sortScores = scores => [...scores].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'en'));\n" },
  '05-cross-file': {
    'src/pricing.mjs': value => value.replace('subtotal > 100', 'subtotal >= 100'),
    'src/checkout.mjs': value => value.replace('freeShipping: subtotal > 100', 'freeShipping: shippingCost(subtotal) === 0'),
  },
  '08-narrow-scope': { 'src/format-price.mjs': value => value.replace('`USD ', '`CNY ') },
};

for (const [taskId, corrections] of Object.entries(referenceCorrections)) {
  test(`${taskId}: behavioral oracle fails the starter and passes a minimal reference correction`, () => {
    const temporary = mkdtempSync(join(tmpdir(), 'acg-oracle-'));
    try {
      const workspace = join(temporary, taskId);
      cpSync(join(fixturesRoot, taskId), workspace, { recursive: true });
      const oracle = join(workspace, 'checks/oracle.mjs');
      // Do not inherit the parent test-runner context or user environment.
      const baseline = spawnSync(process.execPath, ['--test', oracle], { cwd: workspace, encoding: 'utf8', env: {} });
      assert.ifError(baseline.error);
      assert.equal(baseline.status, 1, 'Known starter behavior must fail');
      for (const [path, correct] of Object.entries(corrections)) {
        const target = join(workspace, path);
        writeFileSync(target, correct(readFileSync(target, 'utf8')));
      }
      const corrected = spawnSync(process.execPath, ['--test', oracle], { cwd: workspace, encoding: 'utf8', env: {} });
      assert.ifError(corrected.error);
      assert.equal(corrected.status, 0, corrected.stdout);
      if (taskId === '04-bug') {
        writeFileSync(join(workspace, 'src/sort-scores.mjs'), 'export const sortScores = scores => [...scores].sort((a, b) => b.score - a.score);\n');
        const missingTieSort = spawnSync(process.execPath, ['--test', oracle], { cwd: workspace, encoding: 'utf8', env: {} });
        assert.equal(missingTieSort.status, 1, 'Oracle must actually check same-score names');
      }
      if (taskId === '08-narrow-scope') {
        assert.equal(readFileSync(join(workspace, 'context/protected.md'), 'utf8'), readFileSync(join(fixturesRoot, taskId, 'context/protected.md'), 'utf8'));
        const actual = readFileSync(join(workspace, 'src/format-price.mjs'), 'utf8');
        const original = readFileSync(join(fixturesRoot, taskId, 'src/format-price.mjs'), 'utf8');
        assert.equal(actual.replace('`CNY ', '`USD '), original, 'Reference correction changes only the requested prefix');
      }
    } finally { rmSync(temporary, { recursive: true, force: true }); }
  });
}

test('collector templates and records operate only on explicitly selected new files', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'acg-record-'));
  try {
    const template = spawnSync(process.execPath, [collector, 'template', '--task', '04-bug', '--group', 'new', '--run-id', 'collector-example'], { encoding: 'utf8' });
    assert.equal(template.status, 0, template.stderr);
    const record = JSON.parse(template.stdout);
    assert.equal(record.metrics.tokens, null);
    const input = join(temporary, 'run-input.json');
    const output = join(temporary, 'recorded-run.json');
    writeFileSync(input, template.stdout);
    const args = [collector, 'record', '--input', input, '--out', output];
    assert.equal(spawnSync(process.execPath, args, { encoding: 'utf8' }).status, 0);
    assert.deepEqual(JSON.parse(readFileSync(output, 'utf8')), record);
    const second = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(second.status, 1, 'Existing results must not be overwritten');
    assert.equal(second.stderr.includes(temporary), false, 'Errors must not print private temporary paths');
    assert.equal(spawnSync(process.execPath, [collector, 'validate', output], { encoding: 'utf8' }).status, 0);
    assert.equal(spawnSync(process.execPath, [collector, 'compare', output], { encoding: 'utf8' }).status, 1);
    assert.equal(spawnSync(process.execPath, [collector, 'validate', join(temporary, 'auth.json')], { encoding: 'utf8' }).status, 1);
    const forbidden = join(temporary, 'auth.json');
    const link = join(temporary, 'linked-run.json');
    writeFileSync(forbidden, template.stdout);
    symlinkSync(forbidden, link);
    assert.equal(spawnSync(process.execPath, [collector, 'validate', link], { encoding: 'utf8' }).status, 1, 'A run symlink must not bypass the sensitive path check');
    assert.equal(spawnSync(process.execPath, [collector, 'record', '--input', input, '--out', join(temporary, 'new-auth.json')], { encoding: 'utf8' }).status, 1);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
});
