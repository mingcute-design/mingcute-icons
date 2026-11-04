import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '@mingcute/compiler';
import { iconStyles } from '@mingcute/core';
import { createFontAdapter, fontFamilyForStyle, fontFidelityForStyle } from '../.tooling/adapter.js';
import { iconIdentity, validateCodepointLedger, validateCorpusCoverage } from '../.tooling/codepoints.js';
import { glyphBuildStats } from '../.tooling/glyph.js';

const packageRoot = path.resolve(import.meta.dirname, '..');
const sourceRoot = path.resolve(packageRoot, '../../assets/outline');
const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
const ledgerSource = await readFile(path.join(packageRoot, 'metadata/codepoints.json'), 'utf8');
const ledger = JSON.parse(ledgerSource);
validateCodepointLedger(ledger);
const adapter = createFontAdapter(ledger, manifest.version);
const definitionsByStyle = new Map();
const identities = new Set();
const records = [];

for (const style of iconStyles) {
  const definitions = await mapLimit(await discoverIconSources(sourceRoot, style), 32, async (source) => {
    const { definition } = await compileIconSource(source);
    identities.add(iconIdentity(definition));
    const [record] = adapter.generateIcon(definition, {
      packageName: manifest.name,
      style,
      sourcePath: source.sourcePath,
    });
    records.push(JSON.parse(record.contents));
    return definition;
  });
  definitionsByStyle.set(style, definitions);
}
validateCorpusCoverage(ledger, identities);

for (const style of iconStyles) {
  const files = adapter.generateStyleIndex(style, definitionsByStyle.get(style));
  await writeFiles(files);
  const font = files.find((file) => file.path.endsWith('.woff2'));
  console.log(`${style}: ${definitionsByStyle.get(style).length} glyphs, ${font.contents.byteLength} bytes`);
}
await writeFiles(adapter.generateRootIndex(iconStyles));
await writeMetadata();
validateManifest();
console.log(`Generated Font package: ${records.length} styled glyphs, ${identities.size} stable identities.`);
console.log(`Stroke outlines: ${glyphBuildStats.expandedStrokes} direct, ${glyphBuildStats.sampledStrokeFallbacks} sampled fallbacks.`);

async function writeMetadata() {
  const grouped = new Map();
  for (const record of records) {
    const entry = grouped.get(record.name) ?? {
      name: record.name,
      codepoint: record.codepoint,
      styles: [],
      componentNames: {},
      categories: [],
    };
    if (entry.codepoint !== record.codepoint) throw new Error(`Cross-style codepoint mismatch for ${record.name}.`);
    entry.styles.push(record.style);
    entry.componentNames[record.style] = record.componentName;
    if (record.category && !entry.categories.includes(record.category)) entry.categories.push(record.category);
    grouped.set(record.name, entry);
  }
  const icons = [...grouped.values()].sort((left, right) => left.name.localeCompare(right.name));
  const styles = iconStyles.map((style) => ({
    id: style,
    fontFamily: fontFamilyForStyle(style),
    fontFile: `fonts/${style}.woff2`,
    cssFile: `css/${style}.min.css`,
    fidelity: fontFidelityForStyle(style),
    glyphs: definitionsByStyle.get(style).length,
  }));
  await writeFiles([
    { path: 'dist/metadata/codepoints.json', contents: ledgerSource },
    { path: 'dist/metadata/icons.json', contents: `${JSON.stringify({ schemaVersion: 1, icons }, null, 2)}\n` },
    { path: 'dist/metadata/styles.json', contents: `${JSON.stringify({ schemaVersion: 1, styles }, null, 2)}\n` },
  ]);
}

function validateManifest() {
  const generated = adapter.generatePackageManifest({
    packageName: manifest.name,
    version: manifest.version,
    styles: iconStyles,
    registryUrl: manifest.publishConfig.registry,
  });
  if (JSON.stringify(generated.exports) !== JSON.stringify(manifest.exports)) {
    throw new Error('Font package exports differ from the adapter-generated manifest.');
  }
  if (generated.sideEffects !== manifest.sideEffects || generated.private !== manifest.private) {
    throw new Error('Font package publication fields differ from the adapter-generated manifest.');
  }
}

async function writeFiles(files) {
  for (const file of files) {
    const destination = path.resolve(packageRoot, file.path);
    if (!destination.startsWith(`${packageRoot}${path.sep}`)) throw new Error(`Unsafe generated path: ${file.path}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, file.contents);
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length); let index = 0;
  async function worker() { while (index < items.length) { const current = index++; results[current] = await mapper(items[current]); } }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
