import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
  for (const required of ['README.md', 'README.en.md', 'LICENSE']) {
    if (!fs.existsSync(path.join(repoRoot, required))) errors.push(`${required}: missing`);
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
        if (!name || name !== path.basename(path.dirname(file))) errors.push(`${relative}: invalid skill identity`);
        if (!/^description:\s*\S.+$/m.test(match[1])) errors.push(`${relative}: description required`);
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
