import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '@mingcute/compiler';
import { iconStyles, toKebabCase, toPascalCase } from '@mingcute/core';

const packageRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '../..');
const sourceRoot = path.join(workspaceRoot, 'assets/svg');
let total = 0;
const styles = [];

for (const style of iconStyles) {
  const sources = await discoverIconSources(sourceRoot, style);
  const definitions = await mapLimit(sources, 32, async (source) => {
    const { definition } = await compileIconSource(source);
    await writeDefinition(definition);
    return definition;
  });
  await writeStyleIndex(style, definitions);
  styles.push({ style, count: definitions.length });
  total += definitions.length;
  console.log(`${style}: ${definitions.length}`);
}

await writeFile(path.join(packageRoot, 'dist/styles.json'), `${JSON.stringify(styles, null, 2)}\n`);
console.log(`Generated shared icon definitions: ${total}`);

async function writeDefinition(definition) {
  const fileName = toKebabCase(definition.name);
  const exportName = `${toPascalCase(definition.name)}Icon`;
  const directory = path.join(packageRoot, 'dist/styles', definition.style);
  await mkdir(directory, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(directory, `${fileName}.js`),
      `const ${exportName} = ${JSON.stringify(definition)};\nexport { ${exportName} };\nexport default ${exportName};\n`,
    ),
    writeFile(
      path.join(directory, `${fileName}.d.ts`),
      `import type { IconDefinition } from '@mingcute/icons';\nexport declare const ${exportName}: IconDefinition;\nexport default ${exportName};\n`,
    ),
  ]);
}

async function writeStyleIndex(style, definitions) {
  const sorted = [...definitions].sort((left, right) => toKebabCase(left.name).localeCompare(toKebabCase(right.name)));
  const exports = sorted.map((definition) => {
    const exportName = `${toPascalCase(definition.name)}Icon`;
    return `export { ${exportName} } from './${style}/${toKebabCase(definition.name)}.js';`;
  }).join('\n');
  const metadata = sorted.map((definition) => ({
    name: definition.name,
    exportName: `${toPascalCase(definition.name)}Icon`,
    componentName: definition.componentName,
    style: definition.style,
    file: `${toKebabCase(definition.name)}.js`,
    ...definition.metadata,
  }));
  await Promise.all([
    writeFile(path.join(packageRoot, `dist/styles/${style}.js`), `${exports}\n`),
    writeFile(path.join(packageRoot, `dist/styles/${style}.d.ts`), `${exports}\n`),
    writeFile(path.join(packageRoot, `dist/styles/${style}/metadata.json`), `${JSON.stringify(metadata, null, 2)}\n`),
  ]);
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
