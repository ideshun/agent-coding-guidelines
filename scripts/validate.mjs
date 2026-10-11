import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKILL_MAX_LINES = 70;
const SKILL_MAX_BYTES = 6000;
const REFERENCE_MAX_LINES = 45;
const DESCRIPTION_MAX_CHARS = 1024;
const REQUIRED_REFERENCES = ['clarify.md', 'plan.md', 'verify.md'];

/** @description: Check public repository content without following links or reading local audit data. */
export const validateRepository = (repoRoot = sourceRoot) => {
  const errors = [];
  const files = [];
  const excluded = new Set(['.git', '.local', 'node_modules', '.results']);
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (excluded.has(entry.name)) continue;
      if (entry.isFile() && entry.name === '.DS_Store') continue;
      const target = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        errors.push(`${path.relative(repoRoot, target)}: public symlinks require separate review`);
      } else if (entry.isDirectory()) visit(target);
      else if (entry.isFile()) files.push(target);
    }
  };
  visit(repoRoot);
  for (const required of ['SKILL.md', 'README.md', 'README.en.md', 'LICENSE']) {
    if (!fs.existsSync(path.join(repoRoot, required))) errors.push(`${required}: missing`);
  }
  for (const name of REQUIRED_REFERENCES) {
    if (!fs.existsSync(path.join(repoRoot, 'references', name))) {
      errors.push(`references/${name}: missing`);
    }
  }
  const privatePath = new RegExp('/' + '(?:Users|home)/[A-Za-z0-9_.-]+/');
  const privateKey = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
  const assignedSecret = /(?:api[_-]?key|access[_-]?token|password)\s*[:=]\s*["']?[A-Za-z0-9_\-/+.]{20,}/i;
  const unresolvedScaffold = new RegExp('\\b(?:TODO:' + ' replace|INSERT_' + 'YOUR|PLACEHOLDER_' + 'TEXT)\\b');
  for (const file of files) {
    const relative = path.relative(repoRoot, file);
    const buffer = fs.readFileSync(file);
    if (buffer.includes(0)) { errors.push(`${relative}: binary public file requires review`); continue; }
    const text = buffer.toString('utf8');
    if (privatePath.test(text)) errors.push(`${relative}: contains a concrete local user path`);
    if (privateKey.test(text) || assignedSecret.test(text)) errors.push(`${relative}: potential secret; inspect locally`);
    if (unresolvedScaffold.test(text)) errors.push(`${relative}: unfinished scaffold`);
    if (file.endsWith('.json')) {
      try { JSON.parse(text); } catch { errors.push(`${relative}: invalid JSON`); }
    }
    if (path.basename(file) === 'SKILL.md') {
      const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      if (!match) errors.push(`${relative}: missing YAML frontmatter`);
      else {
        const name = match[1].match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
        if (!name || (relative === 'SKILL.md' ? name !== 'agent-coding-guidelines' : name !== path.basename(path.dirname(file)))) {
          errors.push(`${relative}: invalid skill identity`);
        }
        const descriptionLine = match[1].match(/^description:\s*(".*"|.*)$/m)?.[1]?.trim();
        if (!descriptionLine) errors.push(`${relative}: description required`);
        else {
          let description = descriptionLine;
          if (description.startsWith('"')) {
            try { description = JSON.parse(description); }
            catch { errors.push(`${relative}: description is not valid JSON-quoted text`); }
          }
          if (typeof description === 'string' && description.length > DESCRIPTION_MAX_CHARS) {
            errors.push(`${relative}: description exceeds ${DESCRIPTION_MAX_CHARS} characters`);
          }
        }
        if (relative === 'SKILL.md') {
          const keys = [...match[1].matchAll(/^([A-Za-z0-9_-]+):/gm)].map(item => item[1]);
          for (const key of keys) {
            if (!['name', 'description', 'license'].includes(key)) {
              errors.push(`${relative}: unexpected frontmatter key ${key}`);
            }
          }
        }
      }
      if (relative === 'SKILL.md') {
        const lines = text.split('\n').length;
        if (buffer.length > SKILL_MAX_BYTES || lines > SKILL_MAX_LINES) {
          errors.push(`${relative}: exceeds runtime text budget (${lines} lines / ${buffer.length} bytes); this is not a token measurement`);
        }
        for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
          const href = match[1].split('#')[0];
          if (!href || /^[a-z]+:/i.test(href)) continue;
          if (!href.startsWith('references/') || href.split('/').length !== 2) {
            errors.push(`${relative}: reference links must be one-level references/*.md (got ${href})`);
          }
        }
      }
      if (relative !== 'SKILL.md') {
        errors.push(`${relative}: extra discoverable skill; keep optional material outside SKILL.md`);
      }
    }
    if (relative.startsWith(`references${path.sep}`) && relative.endsWith('.md')) {
      const lines = text.split('\n').length;
      if (lines > REFERENCE_MAX_LINES) {
        errors.push(`${relative}: exceeds reference budget (${lines} > ${REFERENCE_MAX_LINES} lines)`);
      }
    }
    if (file.endsWith('.mdc') && !/^---\r?\n[\s\S]*?\balwaysApply:\s*(true|false)\b[\s\S]*?\r?\n---/.test(text)) {
      errors.push(`${relative}: invalid MDC frontmatter`);
    }
    if (/\.(md|mdc)$/.test(file)) {
      for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const href = match[1].split('#')[0];
        if (!href || /^[a-z]+:|^~|^\{\{/i.test(href)) continue;
        const target = path.resolve(path.dirname(file), href);
        if (!target.startsWith(repoRoot + path.sep) || !fs.existsSync(target)) {
          errors.push(`${relative}: broken or nonportable link ${href}`);
        }
      }
    }
  }

  const skillPath = path.join(repoRoot, 'SKILL.md');
  const clarifyPath = path.join(repoRoot, 'references', 'clarify.md');
  const planPath = path.join(repoRoot, 'references', 'plan.md');
  const verifyPath = path.join(repoRoot, 'references', 'verify.md');
  if (fs.existsSync(skillPath) && fs.existsSync(clarifyPath) && fs.existsSync(planPath) && fs.existsSync(verifyPath)) {
    const skill = fs.readFileSync(skillPath, 'utf8');
    const clarify = fs.readFileSync(clarifyPath, 'utf8');
    const plan = fs.readFileSync(planPath, 'utf8');
    const verify = fs.readFileSync(verifyPath, 'utf8');
    if (/Default to Chinese/i.test(skill)) errors.push('SKILL.md: personal language default must not appear in the shared skill');
    if (/## Tiers|V0 \| T0|reproduce-first/i.test(skill)) {
      errors.push('SKILL.md: verification tier details belong only in references/verify.md');
    }
    if (/## Brief \(required output\)|Anti-goals/i.test(skill)) {
      errors.push('SKILL.md: clarify brief details belong only in references/clarify.md');
    }
    if (/Steps with checks|overlapping planning/i.test(skill)) {
      errors.push('SKILL.md: plan details belong only in references/plan.md');
    }
    if (!/Route by risk/.test(skill)) errors.push('SKILL.md: missing risk route table');
    if (!/Goal|Non-goals|Anti-goals|Constraints|Success criteria/.test(clarify)) {
      errors.push('references/clarify.md: missing brief fields');
    }
    if (!/verify:/i.test(plan)) errors.push('references/plan.md: missing step → verify pairing');
    if (!/V0|V1|V2/.test(verify)) errors.push('references/verify.md: missing V0/V1/V2 tiers');
    if (!/prefer project or user verification/i.test(verify)) {
      errors.push('references/verify.md: missing project/user override hook');
    }
  }

  return { ok: errors.length === 0, filesChecked: files.length, errors,
    limits: ['Pattern checks cannot certify absence of all secrets.', 'Static validation does not prove native loading or model performance.'] };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = validateRepository();
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exitCode = result.ok ? 0 : 1;
  } catch (error) {
    process.stderr.write(`Validation failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
