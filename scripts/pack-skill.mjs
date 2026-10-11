import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Runtime install set: never include benchmarks, docs, scripts, or profiles. */
export const RUNTIME_FILES = [
  'SKILL.md',
  'LICENSE',
  'references/clarify.md',
  'references/plan.md',
  'references/verify.md',
];

/** @description: Copy only the skill runtime files into an empty or new directory. */
export const packSkill = (destDir, root = repoRoot) => {
  const dest = path.resolve(destDir);
  if (dest === path.resolve(root) || dest.startsWith(path.resolve(root) + path.sep)) {
    throw new Error('Refusing to pack into the repository tree; pass an external --out directory.');
  }
  if (fs.existsSync(dest)) {
    const entries = fs.readdirSync(dest);
    if (entries.length > 0) {
      throw new Error(`Destination is not empty: ${dest}`);
    }
  } else {
    fs.mkdirSync(dest, { recursive: true });
  }

  const written = [];
  for (const relative of RUNTIME_FILES) {
    const source = path.join(root, relative);
    if (!fs.existsSync(source)) throw new Error(`Missing runtime file: ${relative}`);
    const target = path.join(dest, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
    written.push(relative);
  }
  return { dest, files: written };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--out') {
      throw new Error('Usage: node scripts/pack-skill.mjs --out <empty-or-new-dir> (copies runtime skill only)');
    }
    const result = packSkill(args[1]);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
