import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const profilePath = path.join(root, 'profiles/react-typescript.md');

/** @description: Render an opt-in project rule from one canonical profile; never write host configuration. */
export const exportProfile = (source, format) => {
  if (!source.startsWith('# React and TypeScript conventions\n')) throw new Error('Unexpected profile source.');
  if (format === 'plain') return source;
  if (format === 'cursor') {
    return `---\ndescription: React and TypeScript conventions for an opted-in project\nglobs: '**/*.ts,**/*.tsx'\nalwaysApply: false\n---\n\n${source}`;
  }
  if (format === 'vscode') {
    return `---\ndescription: React and TypeScript conventions for an opted-in project\napplyTo: '**/*.tsx'\n---\n\n${source}`;
  }
  throw new Error('Use --format plain|cursor|vscode.');
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 2 || args[0] !== '--format') throw new Error('Usage: node scripts/export-profile.mjs --format plain|cursor|vscode (stdout only)');
    process.stdout.write(exportProfile(fs.readFileSync(profilePath, 'utf8'), args[1]));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
