import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const packageRoot = path.resolve(import.meta.dirname, '..');

test('exports a framework-neutral definition', async () => {
  const module = await import(path.join(packageRoot, 'dist/styles/core-regular/home-1.js'));
  assert.equal(module.Home1Icon.name, 'home_1');
  assert.equal(module.Home1Icon.style, 'core-regular');
  assert.ok(module.Home1Icon.elements.length > 0);
});

test('keeps metadata in the shared package', async () => {
  const metadata = JSON.parse(await readFile(
    path.join(packageRoot, 'dist/styles/core-regular/metadata.json'),
    'utf8',
  ));
  assert.ok(metadata.some(({ name, exportName }) => name === 'home_1' && exportName === 'Home1Icon'));
});

test('serializes angular-gradient XHTML safely for HTML parsing', async () => {
  const [{ default: loading }, { renderIconSource }] = await Promise.all([
    import('../../../tests/angular-definition.mjs'),
    import(path.join(packageRoot, 'dist/index.js')),
  ]);
  const source = renderIconSource(loading);
  assert.match(source, /<foreignObject\b/);
  assert.match(source, /<div xmlns="http:\/\/www\.w3\.org\/1999\/xhtml"[^>]*><\/div>/);
  assert.match(source, /id="mgc-core-filled-loading_2-mgc-angular-0-clip-0"/);
  assert.match(source, /clip-path="url\(#mgc-core-filled-loading_2-mgc-angular-0-clip-0\)"/);
  assert.doesNotMatch(source, /<div\b[^>]*\/>/);
});
