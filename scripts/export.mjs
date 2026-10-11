import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @description: Fold every references/*.md link into a short self-contained hint for rule hosts. */
const foldReferenceLinks = (body) => body.replace(
  /\[([^\]]+)\]\(references\/([a-z0-9-]+)\.md\)/g,
  (_, label, name) => {
    const hints = {
      clarify: 'Clarify (goals, non-goals, anti-goals, constraints, success criteria, meaningful trade-offs)',
      plan: 'Plan (scope, approach, steps with per-step verify, risks; prefer host Plan mode)',
      verify: 'Verify (V0/V1/V2 by risk, real output and exit codes, honest gaps)',
      brainstorming: 'Clarify (goals, non-goals, anti-goals, constraints and meaningful trade-offs)',
    };
    return hints[name] || `${label} (see ${name} guidance)`;
  }
);

/** @description: Export the canonical skill without installing or changing host configuration. */
export const exportGuidelines = (source, format) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Canonical skill must have YAML frontmatter.');
  if (!/^name: agent-coding-guidelines\s*$/m.test(match[1])) throw new Error('Unexpected skill identity.');
  const descriptionLine = match[1].match(/^description: ("[^\r\n]+")\s*$/m)?.[1];
  if (!descriptionLine) throw new Error('Expected the canonical quoted description.');
  const description = JSON.parse(descriptionLine);
  if (format === 'skill') return source;
  if (format === 'instructions') {
    return `Scope / 适用范围: ${description}\n\n${foldReferenceLinks(match[2].trimStart())}`;
  }
  throw new Error(`Unknown format: ${format}. Use skill or instructions.`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--format') {
      throw new Error('Usage: node scripts/export.mjs --format skill|instructions (stdout only)');
    }
    process.stdout.write(exportGuidelines(fs.readFileSync(path.join(repoRoot, 'SKILL.md'), 'utf8'), args[1]));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
