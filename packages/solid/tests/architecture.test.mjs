import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { iconStyles } from '@mingcute/core';
const packageRoot = path.resolve(import.meta.dirname, '..');

test('Solid adapter derives architecture declarations from core', async () => {
  const source = await readFile(path.join(packageRoot, 'src/tooling/adapter.ts'), 'utf8');
  assert.match(source, /FrameworkAdapter/); assert.doesNotMatch(source, /FrameworkAdapterV0/);
  assert.match(source, /@mingcute\/core/); assert.doesNotMatch(source, /export const iconStyles\s*=/);
  assert.doesNotMatch(source, /license(?:Key|State)|registryToken|\.npmrc/);
});
test('package root exports utilities only and generated modules are independent', async () => {
  assert.equal(await readFile(path.join(packageRoot, 'dist/index.js'), 'utf8'), "export { Icon } from './runtime/Icon.js';\n");
  const files = (await readdir(path.join(packageRoot, 'dist/styles/core-regular'))).filter((name) => name.endsWith('.js'));
  assert.equal(files.length, 2263);
  const home = await readFile(path.join(packageRoot, 'dist/styles/core-regular/home-1.js'), 'utf8');
  assert.match(home, /\/\* @__PURE__ \*\/ createIcon/); assert.doesNotMatch(home, /User1Regular|regular\.js/);
});
test('manifest has only Solid as peer and public subpaths resolve', async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.peerDependencies, { 'solid-js': '>=1.9.0 <2' });
  assert.deepEqual(manifest.dependencies, { '@mingcute/icons': 'workspace:*' });
  assert.equal(manifest.exports['./*'], undefined);
  assert.deepEqual(Object.keys(manifest.exports), expectedFrameworkExportKeys());
  const root = await import('@mingcute/solid'); const style = await import('@mingcute/solid/core-regular'); const direct = await import('@mingcute/solid/core-regular/home-1');
  assert.deepEqual(Object.keys(root), ['Icon']); assert.equal(Object.keys(style).length, 2263);
  assert.equal(typeof style.Home1Regular, 'function'); assert.deepEqual(Object.keys(direct), ['Home1Regular', 'default']);
});

function expectedFrameworkExportKeys() {
  return ['.', ...iconStyles.flatMap((style) => [`./${style}`, `./${style}/*`])];
}
