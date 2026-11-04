import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '../packages/compiler/dist/index.js';
import { definitionToOutlineDefinition } from '../packages/font/.tooling/glyph.js';

const root = path.resolve(import.meta.dirname, '..');
const strokeRoot = path.join(root, 'assets/stroke');
const outlineRoot = path.join(root, 'assets/outline');
const manifest = JSON.parse(await readFile(path.join(strokeRoot, 'manifest.json'), 'utf8'));
const styles = ['core-regular', 'core-filled'];

await rm(outlineRoot, { recursive: true, force: true, maxRetries: 8, retryDelay: 100 });
await mkdir(outlineRoot, { recursive: true });
let generated = 0;
for (const style of styles) {
  for (const source of await discoverIconSources(strokeRoot, style)) {
    const { definition } = await compileIconSource(source);
    const outline = definitionToOutlineDefinition(definition);
    const destination = path.join(outlineRoot, path.relative(strokeRoot, source.sourcePath));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, serialize(outline));
    generated += 1;
  }
}
await writeFile(path.join(outlineRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated outline assets: ${generated}`);

function serialize(definition) {
  const paths = definition.elements.map((element) => {
    const attributes = Object.entries(element.attributes).filter(([key]) => key !== 'd')
      .map(([key, value]) => `${key}="${escapeXml(String(value))}"`).join(' ');
    return `<path ${attributes} d="${escapeXml(String(element.attributes.d))}"/>`;
  }).join('');
  return `<svg width="24" height="24" viewBox="${escapeXml(definition.viewBox)}" fill="none" xmlns="http://www.w3.org/2000/svg">${paths}</svg>\n`;
}

function escapeXml(value) { return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
