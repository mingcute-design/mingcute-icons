import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { iconStyles } from '@mingcute/core';

const packageRoot = path.resolve(import.meta.dirname, '..');

test('Vue adapter derives architecture declarations from core', async () => {
  const source = await readFile(path.join(packageRoot, 'src/tooling/adapter.ts'), 'utf8');
  assert.match(source, /FrameworkAdapter/);
  assert.doesNotMatch(source, /FrameworkAdapterV0/);
  assert.match(source, /from ['"]@mingcute\/core['"]/);
  assert.doesNotMatch(source, /export const iconStyles\s*=/);
  assert.doesNotMatch(source, /license(?:Key|State)|registryToken|\.npmrc/);
});

test('package root exports utilities only and style modules remain isolated', async () => {
  const root = await readFile(path.join(packageRoot, 'dist/index.js'), 'utf8');
  assert.equal(root, "export { Icon } from './runtime/Icon.js';\n");
  assert.doesNotMatch(root, /styles\/|Regular|Filled|Duotone/);

  const regular = await readFile(path.join(packageRoot, 'dist/styles/core-regular.js'), 'utf8');
  assert.match(regular, /Home1Regular/);
  assert.doesNotMatch(regular, /\.\/filled|\.\/cute-|\.\/sharp-/);
});

test('every generated icon is an independent pure module', async () => {
  const iconDirectory = path.join(packageRoot, 'dist/styles/core-regular');
  const iconFiles = (await readdir(iconDirectory)).filter((name) => name.endsWith('.js'));
  assert.equal(iconFiles.length, 2263);
  const home = await readFile(path.join(iconDirectory, 'home-1.js'), 'utf8');
  assert.match(home, /\/\* @__PURE__ \*\/ createIcon/);
  assert.doesNotMatch(home, /User1Regular|\.\/regular\.js/);
});

test('published manifest has Vue as a peer and only the shared icon dependency', async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.peerDependencies, { vue: '^3.5.0' });
  assert.deepEqual(manifest.dependencies, { '@mingcute/icons': 'workspace:*' });
  assert.equal(manifest.exports['./*'], undefined);
  assert.deepEqual(Object.keys(manifest.exports), expectedFrameworkExportKeys());
  for (const style of iconStyles) {
    assert.deepEqual(manifest.exports[`./${style}`], {
      types: `./dist/styles/${style}.d.ts`,
      import: `./dist/styles/${style}.js`,
    });
    assert.deepEqual(manifest.exports[`./${style}/*`], {
      types: `./dist/styles/${style}/*.d.ts`,
      import: `./dist/styles/${style}/*.js`,
    });
  }
});

test('public package subpaths resolve while the root remains utility-only', async () => {
  const root = await import('@mingcute/vue');
  const style = await import('@mingcute/vue/core-regular');
  const direct = await import('@mingcute/vue/core-regular/home-1');
  assert.deepEqual(Object.keys(root), ['Icon']);
  assert.equal(Object.keys(style).length, 2263);
  assert.equal(typeof style.Home1Regular, 'function');
  assert.deepEqual(Object.keys(direct), ['Home1Regular', 'default']);
});

function expectedFrameworkExportKeys() {
  return [
    '.',
    ...iconStyles.flatMap((style) => [`./${style}`, `./${style}/*`]),
  ];
}
