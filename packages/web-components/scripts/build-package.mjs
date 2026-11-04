import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '@mingcute/compiler';
import { iconStyles } from '@mingcute/core';
import { webComponentsAdapter } from '../.tooling/adapter.js';
const packageRoot = path.resolve(import.meta.dirname, '..'); const sourceRoot = path.resolve(packageRoot, '../../assets/svg');
const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8')); let total = 0;
for (const style of iconStyles) {
  const definitions = await mapLimit(await discoverIconSources(sourceRoot, style), 32, async (source) => {
    const { definition } = await compileIconSource(source);
    await writeFiles(webComponentsAdapter.generateIcon(definition, {
      packageName: manifest.name,
      style,
      sourcePath: source.sourcePath,
    }));
    return definition;
  });
  await writeFiles(webComponentsAdapter.generateStyleIndex(style, definitions)); total += definitions.length; console.log(`${style}: ${definitions.length}`);
}
await writeFiles(webComponentsAdapter.generateRootIndex(iconStyles)); validateManifest(); console.log(`Generated Web Component icons: ${total}`);
function validateManifest() { const generated = webComponentsAdapter.generatePackageManifest({ packageName: manifest.name, version: manifest.version, styles: iconStyles, registryUrl: manifest.publishConfig.registry }); for (const field of ['exports','dependencies','sideEffects','private']) if (JSON.stringify(generated[field]) !== JSON.stringify(manifest[field])) throw new Error(`Web Components package ${field} differs from the adapter-generated manifest.`); }
async function writeFiles(files) { for (const file of files) { const destination = path.resolve(packageRoot, file.path); if (!destination.startsWith(`${packageRoot}${path.sep}`)) throw new Error(`Unsafe generated path: ${file.path}`); await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, file.contents); } }
async function mapLimit(items, limit, mapper) { const results = new Array(items.length); let index = 0; async function worker() { while (index < items.length) { const current = index++; results[current] = await mapper(items[current]); } } await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker)); return results; }
