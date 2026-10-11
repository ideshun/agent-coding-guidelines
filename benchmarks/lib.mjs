import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const fixturesRoot = fileURLToPath(new URL('./fixtures/', import.meta.url));
export const resultSchema = JSON.parse(readFileSync(new URL('./result.schema.json', import.meta.url), 'utf8'));
export const taskSchema = JSON.parse(readFileSync(new URL('./task.schema.json', import.meta.url), 'utf8'));

/** @description: Validate the deliberately small JSON Schema vocabulary used by this framework. */
export const validateSchema = (value, schema, path = '$') => {
  const errors = [];
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  const allowedTypes = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  if (allowedTypes.length && !allowedTypes.some(item => item === type || item === 'integer' && type === 'number' && Number.isInteger(value))) {
    return [`${path}: invalid type`];
  }
  if ('const' in schema && value !== schema.const) errors.push(`${path}: unexpected constant`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: unsupported value`);
  if (type === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: too short`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${path}: too long`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: invalid format`);
  }
  if (type === 'number') {
    if (!Number.isFinite(value)) errors.push(`${path}: must be finite`);
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: below minimum`);
  }
  if (type === 'array') {
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: too many items`);
    value.forEach((item, index) => errors.push(...validateSchema(item, schema.items, `${path}[${index}]`)));
  }
  if (type === 'object') {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) errors.push(`${path}.${key}: required`);
    for (const key of Object.keys(value)) {
      if (schema.properties?.[key]) errors.push(...validateSchema(value[key], schema.properties[key], `${path}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${path}: unexpected field`);
    }
  }
  return errors;
};

/** @description: Read the eight fixed public tasks, without inspecting user configuration. */
export const loadTasks = () => readdirSync(fixturesRoot, { withFileTypes: true })
  .filter(entry => !(entry.isFile() && entry.name === '.DS_Store'))
  .sort((a, b) => a.name.localeCompare(b.name, 'en')).map(entry => {
  if (!entry.isDirectory()) throw new Error('Fixture root must contain task directories only');
  const id = entry.name;
  const task = JSON.parse(readFileSync(join(fixturesRoot, id, 'task.json'), 'utf8'));
  const errors = validateSchema(task, taskSchema);
  if (errors.length || task.id !== id) throw new Error(`Invalid public fixture: ${id}`);
  return task;
});

/** @description: Fingerprint the original fixture bytes, including its oracle and prompt. */
export const fixtureFingerprint = taskId => {
  if (!loadTasks().some(task => task.id === taskId)) throw new Error('Unknown fixture');
  const digest = createHash('sha256');
  const visit = (directory, prefix = '') => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      if (entry.isFile() && entry.name === '.DS_Store') continue;
      const relative = `${prefix}${entry.name}`;
      if (entry.isDirectory()) visit(join(directory, entry.name), `${relative}/`);
      else if (entry.isFile()) {
        const bytes = readFileSync(join(directory, entry.name));
        digest.update(`${relative.length}:${relative}:${bytes.length}:`).update(bytes);
      } else throw new Error('Fixture must not contain symlinks or special files');
    }
  };
  visit(join(fixturesRoot, taskId));
  return digest.digest('hex');
};

/** @description: Make an unmeasured record template; no model or command is invoked. */
export const makeTemplate = ({ taskId, group = 'new', runId = 'unmeasured-run', repetition = 1 }) => {
  const task = loadTasks().find(item => item.id === taskId);
  if (!task) throw new Error('Unknown fixture');
  return {
    schemaVersion: 1, runId, taskId, group, repetition,
    fixtureFingerprint: fixtureFingerprint(taskId),
    model: null,
    environment: {
      toolInterface: 'unmeasured', toolVersion: null, toolCapabilities: [],
      budget: { maxToolCalls: null, maxTokens: null, maxTimeMs: null },
      ruleSetFingerprint: null, ambientFingerprint: null, isolation: 'unverified',
      ambient: { instructions: 'uncontrolled', skills: 'uncontrolled', hooks: 'uncontrolled' },
    },
    metrics: {
      completion: null, testPass: null, unrelatedDiff: null, changedFiles: null,
      tokens: null, toolCalls: null, elapsedMs: null, userConfirmations: null, ruleViolations: null,
    },
    evidence: {
      kind: 'manual-only',
      checks: [...task.passChecks, ...(task.optionalChecks ?? [])].map(check => ({
        id: check.id, kind: check.kind, status: 'pending', exitCode: null,
        details: check.pendingReason ?? 'Not executed.',
      })),
      notes: ['Unmeasured template. Fill values only from execution evidence.'],
    },
  };
};

/** @description: Reject structurally invalid records and misleading evidence combinations. */
export const validateRun = run => {
  const errors = validateSchema(run, resultSchema);
  if (errors.length) return errors;
  const task = loadTasks().find(item => item.id === run.taskId);
  if (run.fixtureFingerprint !== fixtureFingerprint(run.taskId)) errors.push('fixtureFingerprint: not the current original fixture');
  if (run.metrics.tokens && run.metrics.tokens.total !== run.metrics.tokens.input + run.metrics.tokens.output) errors.push('tokens: total differs from input plus output');
  if (run.metrics.changedFiles && new Set(run.metrics.changedFiles).size !== run.metrics.changedFiles.length) errors.push('changedFiles: duplicates');
  if (run.metrics.unrelatedDiff === 0 && run.metrics.changedFiles?.some(path => !task.changeAllowlist.includes(path))) errors.push('unrelatedDiff: files outside the change allowlist cannot be reported as zero unrelated changes');
  const checks = run.evidence.checks;
  if (new Set(checks.map(check => check.id)).size !== checks.length) errors.push('checks: duplicate IDs');
  for (const check of checks) {
    const expected = [...task.passChecks, ...(task.optionalChecks ?? [])].find(item => item.id === check.id);
    if (!expected || expected.kind !== check.kind) errors.push('checks: unknown ID or wrong kind');
    if (check.kind === 'manual' && check.exitCode !== null) errors.push('checks: manual assessment has no exit code');
    if (check.kind === 'automated' && check.status === 'passed' && check.exitCode !== 0) errors.push('checks: passing automated check requires exit code 0');
    if (check.kind === 'automated' && check.status === 'failed' && (check.exitCode === null || check.exitCode === 0)) errors.push('checks: failed automated check requires a nonzero exit code');
    if (['pending', 'not-applicable'].includes(check.status) && check.exitCode !== null) errors.push('checks: unexecuted check has no exit code');
  }
  if (run.metrics.testPass === true) {
    const required = task.passChecks.filter(check => check.kind === 'automated');
    if (!required.length || required.some(check => !checks.some(item => item.id === check.id && item.status === 'passed'))) errors.push('testPass: all required automated checks need passing evidence');
  }
  if (run.metrics.testPass === false && !checks.some(check => check.kind === 'automated' && check.status === 'failed')) errors.push('testPass: a failed test claim needs failed automated evidence');
  if (run.metrics.completion === true && task.passChecks.some(check => !checks.some(item => item.id === check.id && item.status === 'passed'))) errors.push('completion: every required check needs passing evidence');
  if (run.metrics.completion === true) {
    if (run.metrics.changedFiles === null || run.metrics.unrelatedDiff === null) errors.push('completion: change scope must be assessed before claiming completion');
    if (run.metrics.unrelatedDiff > 0 || run.metrics.changedFiles?.some(path => !task.changeAllowlist.includes(path))) errors.push('completion: unrelated or disallowed changes prevent task completion');
  }
  if (run.evidence.kind !== 'native-run' && run.metrics.completion !== null) errors.push('completion: offline or manual-only records cannot claim model task completion');
  if (run.evidence.kind === 'native-run' && run.model === null) errors.push('model: native runs require an observed model ID');
  return errors;
};

/** @description: Gate fair comparison before returning descriptive measurements. */
export const compareRuns = runs => {
  const reasons = [];
  if (!runs.length) return { status: 'blocked', reasons: ['No run records supplied.'], summaries: [] };
  for (const run of runs) {
    const errors = validateRun(run);
    if (errors.length) reasons.push(...errors);
  }
  if (reasons.length) return { status: 'blocked', reasons: [...new Set(reasons)], summaries: [] };
  if (new Set(runs.map(run => run.runId)).size !== runs.length) reasons.push('Run IDs must be unique.');
  const tasks = [...new Set(runs.map(run => run.taskId))];
  for (const taskId of tasks) {
    const taskRuns = runs.filter(run => run.taskId === taskId);
    const signature = run => JSON.stringify({
      fixture: run.fixtureFingerprint, model: run.model === null ? null : { id: run.model.id, version: run.model.version },
      toolInterface: run.environment.toolInterface, toolVersion: run.environment.toolVersion,
      capabilities: [...run.environment.toolCapabilities].sort(),
      budget: { maxToolCalls: run.environment.budget.maxToolCalls, maxTokens: run.environment.budget.maxTokens, maxTimeMs: run.environment.budget.maxTimeMs },
      ambientFingerprint: run.environment.ambientFingerprint,
      ambient: { instructions: run.environment.ambient.instructions, skills: run.environment.ambient.skills, hooks: run.environment.ambient.hooks },
    });
    if (new Set(taskRuns.map(signature)).size !== 1) reasons.push(`${taskId}: fixture, model, tools, budget, or ambient conditions differ.`);
    for (const run of taskRuns) {
      const env = run.environment;
      if (run.evidence.kind !== 'native-run') reasons.push(`${taskId}: offline/manual records do not measure model performance.`);
      if (env.isolation !== 'verified' || env.ambient.instructions !== 'controlled' || env.ambient.skills !== 'controlled' || !['disabled', 'controlled'].includes(env.ambient.hooks) || env.ambientFingerprint === null) reasons.push(`${taskId}: native instructions, skills, or hooks are not demonstrably isolated.`);
      if (run.metrics.completion === null) reasons.push(`${taskId}: completion was not assessed.`);
      if (Object.values(env.budget).every(value => value === null)) reasons.push(`${taskId}: execution budget was not recorded.`);
      if (run.group !== 'none' && env.ruleSetFingerprint === null) reasons.push(`${taskId}: rule set fingerprint is missing.`);
      if (run.group === 'none' && env.ruleSetFingerprint !== null) reasons.push(`${taskId}: no-added-rules baseline must have a null rule set fingerprint.`);
    }
    for (const group of ['none', 'legacy', 'new']) {
      const members = taskRuns.filter(run => run.group === group);
      if (members.length < 3) reasons.push(`${taskId}/${group}: at least three independent repetitions are required.`);
      if (new Set(members.map(run => run.repetition)).size !== members.length) reasons.push(`${taskId}/${group}: repeated repetition number.`);
      if (new Set(members.map(run => run.environment.ruleSetFingerprint)).size > 1) reasons.push(`${taskId}/${group}: rule set changed between repetitions.`);
    }
  }
  if (reasons.length) return { status: 'blocked', reasons: [...new Set(reasons)], summaries: [] };
  const mean = values => values.every(value => value !== null) ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  const summaries = tasks.flatMap(taskId => ['none', 'legacy', 'new'].map(group => {
    const members = runs.filter(run => run.taskId === taskId && run.group === group);
    return {
      taskId, group, repetitions: members.length,
      completionPasses: members.filter(run => run.metrics.completion === true).length,
      testsMeasured: members.filter(run => run.metrics.testPass !== null).length,
      testPasses: members.filter(run => run.metrics.testPass === true).length,
      meanTokens: mean(members.map(run => run.metrics.tokens?.total ?? null)),
      meanToolCalls: mean(members.map(run => run.metrics.toolCalls)),
      meanElapsedMs: mean(members.map(run => run.metrics.elapsedMs)),
      meanUserConfirmations: mean(members.map(run => run.metrics.userConfirmations)),
      meanUnrelatedDiff: mean(members.map(run => run.metrics.unrelatedDiff)),
      meanChangedFiles: mean(members.map(run => run.metrics.changedFiles?.length ?? null)),
      meanRuleViolations: mean(members.map(run => run.metrics.ruleViolations?.length ?? null)),
    };
  }));
  return { status: 'ready-for-analysis', reasons: [], summaries };
};
