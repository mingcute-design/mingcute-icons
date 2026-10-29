import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { compile } from 'svelte/compiler';
import { iconStyles } from '@mingcute/core';

const packageRoot = path.resolve(import.meta.dirname, '..');

test('Svelte adapter uses the stable contract without owning architecture policy', async () => {
  const source = await readFile(path.join(packageRoot, 'src/tooling/adapter.ts'), 'utf8');
  assert.match(source, /FrameworkAdapter/);
  assert.match(source, /from ['"]@mingcute\/core['"]/);
  assert.doesNotMatch(source, /export const iconStyles\s*=/);
  assert.doesNotMatch(source, /license(?:Key|State)|registryToken|\.npmrc/);
});

test('root exports only the shared Icon utility and types', async () => {
  const root = await readFile(path.join(packageRoot, 'dist/index.js'), 'utf8');
  assert.equal(root, "export { default as Icon } from './runtime/Icon.svelte';\n");
  assert.doesNotMatch(root, /styles\/|Regular|Filled|Duotone/);
});

test('generated components are isolated and package subpaths resolve', async () => {
  const directory = path.join(packageRoot, 'dist/styles/core-regular');
  assert.equal((await readdir(directory)).filter((name) => name.endsWith('.svelte')).length, 2263);
  const home = await readFile(path.join(directory, 'home-1.svelte'), 'utf8');
  assert.match(home, /<Icon \{source\} \{viewBox\}/);
  assert.doesNotMatch(home, /User1Regular|@mingcute\/core/);
  assert.match(import.meta.resolve('@mingcute/svelte/core-regular'), /dist\/styles\/core-regular\.js$/);
  assert.match(import.meta.resolve('@mingcute/svelte/core-regular/home-1'), /dist\/styles\/core-regular\/home-1\.svelte$/);
});

test('runtime and representative resource components compile for server and client', async () => {
  const files = [
    'dist/runtime/Icon.svelte',
    'dist/styles/core-regular/home-1.svelte',
    'dist/styles/core-regular/loading.svelte',
    'dist/styles/core-filled/home-1.svelte',
  ];
  for (const relative of files) {
    const filename = path.join(packageRoot, relative);
    const source = await readFile(filename, 'utf8');
    for (const generate of ['server', 'client']) {
      assert.doesNotThrow(() => compile(source, { filename, generate, dev: false }));
    }
  }
});

test('manifest declares the Svelte 5.20 peer floor and shared icon dependency', async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.peerDependencies, { svelte: '>=5.20.0' });
  assert.deepEqual(manifest.dependencies, { '@mingcute/icons': 'workspace:*' });
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.exports['./*'], undefined);
  assert.deepEqual(Object.keys(manifest.exports), expectedSvelteExportKeys());
  for (const style of iconStyles) {
    assert.deepEqual(manifest.exports[`./${style}`], {
      types: `./dist/styles/${style}.d.ts`,
      svelte: `./dist/styles/${style}.js`,
      import: `./dist/styles/${style}.js`,
    });
    assert.deepEqual(manifest.exports[`./${style}/*`], {
      types: `./dist/styles/${style}/*.d.ts`,
      svelte: `./dist/styles/${style}/*.svelte`,
      import: `./dist/styles/${style}/*.svelte`,
    });
  }
});

function expectedSvelteExportKeys() {
  return ['.', ...iconStyles.flatMap((style) => [`./${style}`, `./${style}/*`])];
}
