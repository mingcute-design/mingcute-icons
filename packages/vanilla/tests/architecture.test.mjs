import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { iconStyles } from '@mingcute/core';
const root = path.resolve(import.meta.dirname, '..');

test('Vanilla adapter uses the stable contract and owns no architecture policy', async () => {
  const source = await readFile(path.join(root, 'src/tooling/adapter.ts'), 'utf8');
  assert.match(source, /FrameworkAdapter/);
  assert.match(source, /from ['"]@mingcute\/core['"]/);
  assert.doesNotMatch(source, /export const iconStyles\s*=/);
  assert.doesNotMatch(source, /license(?:Key|State)|registryToken|\.npmrc/);
});

test('root is utility-only and importing it is safe without a DOM', async () => {
  const source = await readFile(path.join(root, 'dist/index.js'), 'utf8');
  assert.equal(source, "export { createIcon, toSvgString } from './runtime/render.js';\n");
  const api = await import('@mingcute/vanilla');
  assert.deepEqual(Object.keys(api), ['createIcon', 'toSvgString']);
  assert.throws(() => api.createIcon('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), /requires a DOM/);
});

test('style and direct icon package subpaths resolve', async () => {
  const style = await import('@mingcute/vanilla/core-regular');
  const direct = await import('@mingcute/vanilla/core-regular/home-1');
  assert.equal(Object.keys(style).length, 2263);
  assert.match(style.Home1Regular, /^<svg/);
  assert.deepEqual(Object.keys(direct), ['Home1Regular', 'default']);
});

test('generated icons are independent wrappers around shared definitions', async () => {
  const directory = path.join(root, 'dist/styles/core-regular');
  assert.equal((await readdir(directory)).filter((name) => name.endsWith('.js')).length, 2263);
  const home = await readFile(path.join(directory, 'home-1.js'), 'utf8');
  assert.match(home, /@mingcute\/icons\/core-regular\/home-1/);
  assert.match(home, /renderIconSource\(definition\)/);
  assert.doesNotMatch(home, /"elements":\[|User1Regular/);
});

test('published manifest has only the shared icon dependency', async () => {
  const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  assert.deepEqual(manifest.dependencies, { '@mingcute/icons': 'workspace:*' });
  assert.equal(manifest.peerDependencies, undefined);
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.exports['./*'], undefined);
  assert.deepEqual(Object.keys(manifest.exports), expectedFrameworkExportKeys());
});

function expectedFrameworkExportKeys() {
  return ['.', ...iconStyles.flatMap((style) => [`./${style}`, `./${style}/*`])];
}
