import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const readRegistry = () => JSON.parse(fs.readFileSync(path.join(repoRoot, 'docs/tool-registry.json'), 'utf8'));

/** Reject ambiguous names instead of guessing an IDE/CLI or regional profile. */
export const findTool = (registry, id) => {
  const tool = registry.tools.find(entry => entry.id === id);
  if (!tool) throw new Error(`Unknown tool profile: ${id}. Use --list, then verify the host's native customization for an unlisted client.`);
  return { ...tool, sourceDetails: tool.sources.map(source => registry.sources[source]), pathSyntax: registry.pathSyntax };
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    const registry = readRegistry();
    if (args.length === 1 && args[0] === '--list') {
      process.stdout.write(registry.tools.map(tool => `${tool.id}\t${tool.name}\t${tool.mode}\t${tool.evidence}`).join('\n') + '\n');
    } else if (args.length === 2 && args[0] === '--tool') {
      process.stdout.write(JSON.stringify(findTool(registry, args[1]), null, 2) + '\n');
    } else throw new Error('Usage: node scripts/compatibility.mjs --list | --tool ID (read-only)');
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
