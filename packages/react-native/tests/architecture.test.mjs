import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { iconStyles } from '@mingcute/core';
const packageRoot = path.resolve(import.meta.dirname, '..');

test('React Native adapter uses the stable core contract without owning architecture policy', async () => {
  const source = await readFile(path.join(packageRoot, 'src/tooling/adapter.ts'), 'utf8');
  assert.match(source, /FrameworkAdapter/);
  assert.match(source, /from ['"]@mingcute\/core['"]/);
  assert.doesNotMatch(source, /export const iconStyles\s*=/);
  assert.doesNotMatch(source, /license(?:Key|State)|registryToken|\.npmrc/);
});

test('root exports utilities only and style modules remain isolated', async () => {
  const root = await readFile(path.join(packageRoot, 'dist/index.js'), 'utf8');
  assert.equal(root, "export { Icon } from './runtime/Icon.js';\n");
  assert.doesNotMatch(root, /styles\/|Regular|Filled|Duotone/);
  const regular = await readFile(path.join(packageRoot, 'dist/styles/core-regular.js'), 'utf8');
  assert.match(regular, /Home1Regular/);
  assert.doesNotMatch(regular, /\.\/filled|\.\/cute-|\.\/sharp-/);
});

test('generated icons are independent pure modules', async () => {
  const directory = path.join(packageRoot, 'dist/styles/core-regular');
  assert.equal((await readdir(directory)).filter((name) => name.endsWith('.js')).length, 2263);
  const home = await readFile(path.join(directory, 'home-1.js'), 'utf8');
  assert.match(home, /\/\* @__PURE__ \*\/ createIcon/);
  assert.doesNotMatch(home, /User1Regular|\.\/regular\.js/);
});

test('manifest declares the architecture peer floor and shared icon dependency', async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.peerDependencies, { react: '>=18', 'react-native': '>=0.72', 'react-native-svg': '>=13' });
  assert.deepEqual(manifest.dependencies, { '@mingcute/icons': 'workspace:*' });
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.exports['./*'], undefined);
  assert.deepEqual(Object.keys(manifest.exports), expectedFrameworkExportKeys());
});

function expectedFrameworkExportKeys() {
  return ['.', ...iconStyles.flatMap((style) => [`./${style}`, `./${style}/*`])];
}
