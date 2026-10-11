import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @description: Validate references and optionally inline their source; compact exports keep the core guidance. */
const adaptReferences = (body, root, includeDetails) => {
  const sections = new Map();
  const rewritten = body.replace(/\[([^\]]+)\]\((references\/[^)]+)\)/g, (_, label, relative) => {
    const name = relative.match(/^references\/([a-z0-9-]+)\.md$/)?.[1];
    if (!name) throw new Error(`Expected a one-level reference file: ${relative}`);
    if (!sections.has(name)) {
      const file = path.join(root, relative);
      if (!fs.lstatSync(file).isFile()) throw new Error(`Reference must be a regular file: ${relative}`);
      const text = fs.readFileSync(file, 'utf8').replace(/^# [^\r\n]+\r?\n/, '').trim();
      if (!text) throw new Error(`Reference is empty: ${relative}`);
      for (const link of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        if (!/^(?:#|[a-z][a-z0-9+.-]*:)/i.test(link[1])) {
          throw new Error(`Local links inside ${relative} need an explicit export strategy: ${link[1]}`);
        }
      }
      sections.set(name, `## Optional detail: ${name}\n\n${text}`);
    }
    return includeDetails ? `[${label}](#optional-detail-${name})` : label;
  });
  return rewritten.trimEnd() + (includeDetails && sections.size ? '\n\n' + [...sections.values()].join('\n\n') : '') + '\n';
};

/** @description: Export the canonical skill without installing or changing host configuration. */
export const exportGuidelines = (source, format, root = repoRoot) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Canonical skill must have YAML frontmatter.');
  if (!/^name: agent-coding-guidelines\s*$/m.test(match[1])) throw new Error('Unexpected skill identity.');
  const descriptionLine = match[1].match(/^description: ("[^\r\n]+")\s*$/m)?.[1];
  if (!descriptionLine) throw new Error('Expected the canonical quoted description.');
  const description = JSON.parse(descriptionLine);
  if (typeof description !== 'string' || !description.trim()) throw new Error('Description must be non-empty text.');
  if (format === 'skill') return source;
  if (format === 'instructions' || format === 'instructions-full') {
    return `Scope / 适用范围: ${description}\n\n${adaptReferences(match[2].trimStart(), root, format === 'instructions-full')}`;
  }
  throw new Error(`Unknown format: ${format}. Use skill, instructions or instructions-full.`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--format') {
      throw new Error('Usage: node scripts/export.mjs --format skill|instructions|instructions-full (stdout only)');
    }
    process.stdout.write(exportGuidelines(fs.readFileSync(path.join(repoRoot, 'SKILL.md'), 'utf8'), args[1]));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
