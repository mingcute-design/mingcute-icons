import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '@mingcute/compiler';
import { iconStyles } from '@mingcute/core';
import { svgAdapter } from '../dist/index.js';

const packageRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '../..');
const sourceRoot = path.join(workspaceRoot, 'assets/svg');
const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
let total = 0;

for (const style of iconStyles) {
  const outputRoot = path.join(packageRoot, style);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  const sources = await discoverIconSources(sourceRoot, style);
  const definitions = await mapLimit(sources, 32, async (source) => {
    const { definition } = await compileIconSource(source);
    const generated = svgAdapter.generateIcon(definition, {
      packageName: manifest.name,
      style,
      sourcePath: source.sourcePath,
    });
    await writeGeneratedFiles(generated);
    return definition;
  });
  await writeGeneratedFiles(svgAdapter.generateStyleIndex(style, definitions));
  total += definitions.length;
  console.log(`${style}: ${definitions.length}`);
}

await writeGeneratedFiles(svgAdapter.generateRootIndex(iconStyles));
console.log(`Generated SVG assets: ${total}`);

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
