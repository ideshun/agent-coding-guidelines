import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsDir = path.join(repoRoot, 'skills');

/** Export one canonical skill without installing or changing host configuration. */
export const exportSkill = (source, format) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('Canonical skill must have YAML frontmatter.');
  const name = match[1].match(/^name:\s*([a-z0-9-]+)\s*$/m)?.[1];
  if (!name) throw new Error('Skill frontmatter must declare a name.');
  const description = match[1].match(/^description:\s*(.+)\s*$/m)?.[1]?.trim();
  if (!description) throw new Error('Skill frontmatter must declare a description.');
  if (format === 'skill') return source;
  if (format === 'instructions') {
    // Drop frontmatter; the description becomes an explicit scope line.
    return `Scope: ${description}\n\n${match[2].trimStart()}`;
  }
  throw new Error(`Unknown format: ${format}. Use skill or instructions.`);
};

const listSkills = () => fs.readdirSync(skillsDir).filter(entry =>
  fs.existsSync(path.join(skillsDir, entry, 'SKILL.md')));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const skill = args[0] === '--skill' ? args[1] : undefined;
    const format = args[2] === '--format' ? args[3] : undefined;
    if (!skill || !format) {
      throw new Error(`Usage: node scripts/export.mjs --skill <name> --format skill|instructions (stdout only)\nAvailable skills: ${listSkills().join(', ')}`);
    }
    const sourcePath = path.join(skillsDir, skill, 'SKILL.md');
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Unknown skill: ${skill}. Available: ${listSkills().join(', ')}`);
    }
    process.stdout.write(exportSkill(fs.readFileSync(sourcePath, 'utf8'), format));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
