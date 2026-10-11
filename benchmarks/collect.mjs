#!/usr/bin/env node
import { readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { compareRuns, makeTemplate, validateRun } from './lib.mjs';

const help = `Local benchmark record collector (Node.js 20+; no model invocation)

  node benchmarks/collect.mjs template --task ID --group none|legacy|new --run-id ID --repetition 1
  node benchmarks/collect.mjs validate RUN.json [RUN.json ...]
  node benchmarks/collect.mjs record --input RUN.json --out NEW.json
  node benchmarks/collect.mjs compare RUN.json [RUN.json ...]

Template prints unmeasured JSON. Record creates one new file and refuses overwrite.
Only explicitly selected run JSON is read. No configuration, auth, history, or environment is inspected.
Comparison requires three repetitions per task/group and controlled native ambient conditions.
`;

/** @description: Parse explicit options without evaluating a shell command. */
const options = args => {
  const result = {};
  for (let index = 0; index < args.length; index += 2) {
    if (!args[index]?.startsWith('--') || !args[index + 1] || args[index + 1].startsWith('--') || Object.hasOwn(result, args[index])) throw new Error('Expected unique --option value pairs');
    result[args[index]] = args[index + 1];
  }
  return result;
};

/** @description: Reject config and credential locations before reading or creating a result file. */
const assertRunPath = absolute => {
  if (extname(absolute) !== '.json' || /(?:auth|credential|secret|history|cookie|settings|config)/i.test(basename(absolute)) || /[/\\]\.(?:codex|claude|cursor|ssh|aws|config)(?:[/\\]|$)/i.test(absolute)) throw new Error('Select a benchmark run JSON file, not a configuration or credential path');
};

/** @description: Read only a selected regular result file; never follow a link into private configuration. */
const readRun = path => {
  const absolute = resolve(path);
  assertRunPath(absolute);
  assertRunPath(realpathSync(absolute));
  const stat = statSync(absolute);
  if (!stat.isFile() || stat.size > 1024 * 1024) throw new Error('Result must be a regular JSON file smaller than 1 MiB');
  return JSON.parse(readFileSync(absolute, 'utf8'));
};

/** @description: Validate collection records; no execution or network calls occur. */
const main = () => {
  const [command, ...args] = process.argv.slice(2);
  if (!command || ['--help', '-h', 'help'].includes(command)) return process.stdout.write(help);
  if (command === 'template') {
    const opts = options(args);
    if (Object.keys(opts).some(key => !['--task', '--group', '--run-id', '--repetition'].includes(key))) throw new Error('Unsupported template option');
    const run = makeTemplate({ taskId: opts['--task'], group: opts['--group'], runId: opts['--run-id'], repetition: opts['--repetition'] === undefined ? 1 : Number(opts['--repetition']) });
    const errors = validateRun(run);
    if (errors.length) throw new Error(errors.join('; '));
    process.stdout.write(`${JSON.stringify(run, null, 2)}\n`);
    return;
  }
  if (command === 'record') {
    const opts = options(args);
    if (!opts['--input'] || !opts['--out'] || Object.keys(opts).some(key => !['--input', '--out'].includes(key))) throw new Error('Record requires only --input and --out');
    const run = readRun(opts['--input']);
    const errors = validateRun(run);
    if (errors.length) throw new Error(errors.join('; '));
    const output = resolve(opts['--out']);
    assertRunPath(output);
    assertRunPath(join(realpathSync(dirname(output)), basename(output)));
    writeFileSync(output, `${JSON.stringify(run, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    process.stdout.write('Recorded one validated run. Existing files were not overwritten.\n');
    return;
  }
  if (['validate', 'compare'].includes(command)) {
    if (!args.length || args.some(arg => arg.startsWith('--'))) throw new Error('Supply explicit run JSON files');
    const runs = args.map(readRun);
    if (command === 'compare') {
      const result = compareRuns(runs);
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (result.status === 'blocked') process.exitCode = 1;
    } else {
      const results = runs.map((run, index) => ({ file: basename(args[index]), valid: validateRun(run).length === 0, errors: validateRun(run) }));
      process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
      if (results.some(result => !result.valid)) process.exitCode = 1;
    }
    return;
  }
  throw new Error('Unknown command; use --help');
};

try { main(); }
catch (error) {
  // File-system errors may contain private absolute paths; print only their code.
  process.stderr.write(`Benchmark collection failed: ${error.code ?? (error instanceof SyntaxError ? 'invalid JSON' : error.message)}\n`);
  process.exitCode = 1;
}
