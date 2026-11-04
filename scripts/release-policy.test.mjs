import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { discoverReleasePackages, loadReleasePolicy, validateRelease } from './release-policy.mjs';

const rootDir = path.resolve(import.meta.dirname, '..');

test('the free release contains exactly ten public Apache packages', async () => {
  const policy = await loadReleasePolicy(rootDir);
  const packages = await discoverReleasePackages(rootDir);
  const release = validateRelease(policy, packages);
  assert.equal(release.length, 10);
  assert.equal(new Set(release.map(({ version }) => version)).size, 1);
  assert.equal(packages.every(({ manifest }) =>
    manifest.publishConfig?.registry === 'https://registry.npmjs.org/' &&
    manifest.publishConfig?.access === 'public'), true);
});

test('internal build packages cannot be published', async () => {
  for (const [directory, packageName] of [['core', '@mingcute/core'], ['compiler', '@mingcute/compiler']]) {
    const manifest = JSON.parse(await readFile(path.join(rootDir, 'packages', directory, 'package.json'), 'utf8'));
    assert.equal(manifest.private, true);
    assert.equal(manifest.publishConfig, undefined);
    assert.equal(manifest.name, packageName);
  }
});

test('the public asset corpus contains only Core Regular and Filled', async () => {
  const manifest = JSON.parse(await readFile(path.join(rootDir, 'assets/svg/manifest.json'), 'utf8'));
  assert.equal(manifest.count, 4526);
  assert.equal(manifest.entries.length, 4526);
  assert.deepEqual([...new Set(manifest.entries.map(({ packageStyle }) => packageStyle))].sort(), ['core-filled', 'core-regular']);
  assert.equal(manifest.entries.every(({ path: sourcePath }) => /^core\/(?:regular|filled)\//.test(sourcePath)), true);
  assert.deepEqual((await readdir(path.join(rootDir, 'assets/svg/core'))).sort(), ['filled', 'regular']);
});

test('the public repository contains no private delivery infrastructure', async () => {
  const topLevel = await readdir(rootDir);
  for (const forbidden of ['apps', 'registry-assets', '.npmrc']) assert.equal(topLevel.includes(forbidden), false);
});
