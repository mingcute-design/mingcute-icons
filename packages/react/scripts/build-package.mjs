import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '@mingcute/compiler';
import { iconStyles } from '@mingcute/core';
import { reactAdapter } from '../.tooling/adapter.js';

const packageRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '../..');
const sourceRoot = path.join(workspaceRoot, 'assets/svg');
const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
let total = 0;

for (const style of iconStyles) {
  const sources = await discoverIconSources(sourceRoot, style);
  const definitions = await mapLimit(sources, 32, async (source) => {
    const { definition } = await compileIconSource(source);
    await writeGeneratedFiles(reactAdapter.generateIcon(definition, {
      packageName: manifest.name,
      style,
      sourcePath: source.sourcePath,
    }));
    return definition;
  });
  await writeGeneratedFiles(reactAdapter.generateStyleIndex(style, definitions));
  total += definitions.length;
  console.log(`${style}: ${definitions.length}`);
}

await writeGeneratedFiles(reactAdapter.generateRootIndex(iconStyles));
validateManifest();
console.log(`Generated React components: ${total}`);

function validateManifest() {
  const generated = reactAdapter.generatePackageManifest({
    packageName: manifest.name,
    version: manifest.version,
    styles: iconStyles,
    registryUrl: manifest.publishConfig.registry,
  });
  for (const field of ['exports', 'dependencies', 'peerDependencies', 'sideEffects', 'private']) {
    if (JSON.stringify(generated[field]) !== JSON.stringify(manifest[field])) {
      throw new Error(`React package ${field} differs from the adapter-generated manifest.`);
    }
  }
}

async function writeGeneratedFiles(files) {
  for (const file of files) {
    const destination = path.resolve(packageRoot, file.path);
    if (!destination.startsWith(`${packageRoot}${path.sep}`)) throw new Error(`Unsafe generated path: ${file.path}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.contents);
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await mapper(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
