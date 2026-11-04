import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '@mingcute/compiler';
import { iconStyles, toKebabCase } from '@mingcute/core';

const packageRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '../..');
const sourceRoot = path.join(workspaceRoot, 'assets/svg');
const fixturePath = path.join(packageRoot, 'tests/render-fixtures.html');
const angular = [];
const masked = [];
const patterns = [];
let nativeGradientExample;

for (const style of iconStyles) {
  for (const iconSource of await discoverIconSources(sourceRoot, style)) {
    const { definition } = await compileIconSource(iconSource);
    if (!definition.gradients?.length && !definition.masks?.length && !definition.patterns?.length) continue;
    const fixture = {
      name: definition.name,
      style,
      category: definition.metadata.category ?? '',
      sourcePath: iconSource.sourcePath,
      generatedPath: path.join(packageRoot, style, `${toKebabCase(definition.name)}.svg`),
    };
    if (definition.gradients?.some(({ type }) => type === 'angular')) angular.push(fixture);
    if (definition.masks?.length) masked.push(fixture);
    if (definition.patterns?.length) patterns.push(fixture);
    if (!nativeGradientExample && definition.gradients?.some(({ type }) => type !== 'angular')) {
      nativeGradientExample = fixture;
    }
  }
}

angular.sort(compareFixture);
masked.sort(compareFixture);
patterns.sort(compareFixture);

await writeFile(fixturePath, renderPage({ angular, masked, patterns, nativeGradientExample }));
console.log(`Render fixture generated: ${angular.length} angular, ${masked.length} masked, ${patterns.length} embedded-image.`);

function renderPage(fixtures) {
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mingcute SVG adapter render fixtures</title>
<style>
  :root { color-scheme: light; }
  body { font: 14px/1.45 system-ui, sans-serif; margin: 24px; color: #182230; background: #f5f7fa; }
  h1 { margin: 0 0 6px; }
  h2 { margin: 30px 0 12px; }
  p { margin: 0 0 20px; color: #526173; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(390px, 1fr)); gap: 16px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; border: 1px solid #ccd5e0; border-radius: 10px; background: white; }
  figure { min-width: 0; margin: 0; }
  img { display: block; width: 150px; height: 150px; max-width: 100%; margin: 0 auto 8px; background: repeating-conic-gradient(#eef2f6 0 25%, white 0 50%) 50% / 20px 20px; }
  figcaption { overflow-wrap: anywhere; text-align: center; font-size: 12px; }
  .label { display: block; color: #748196; }
  .name { font-weight: 650; }
</style>
<h1>Canonical source → generated SVG</h1>
<p>Complete comparison set for compiler resource-backed SVGs. Each card shows the canonical source on the left and adapter output on the right.</p>
${renderSection('Angular gradients', fixtures.angular, 'angular')}
${renderSection('Masks', fixtures.masked, 'mask')}
${renderSection('Embedded-image patterns', fixtures.patterns, 'pattern')}
${renderSection('Native gradient reference', fixtures.nativeGradientExample ? [fixtures.nativeGradientExample] : [], 'native-gradient')}
</html>
`;
}

function renderSection(title, fixtures, resource) {
  return `<h2>${escapeHtml(title)} (${fixtures.length})</h2>
<div class="grid" data-section="${resource}">
${fixtures.map((fixture) => renderPair(fixture, resource)).join('\n')}
</div>`;
}

function renderPair(fixture, resource) {
  const sourceUrl = relativeUrl(fixture.sourcePath);
  const generatedUrl = relativeUrl(fixture.generatedPath);
  const label = `${fixture.style}/${fixture.category}/${fixture.name}`.replace('//', '/');
  return `  <article class="pair" data-resource="${resource}" data-icon="${escapeHtml(label)}">
    <figure><img loading="lazy" src="${sourceUrl}"><figcaption><span class="label">Canonical</span><span class="name">${escapeHtml(label)}</span></figcaption></figure>
    <figure><img loading="lazy" src="${generatedUrl}"><figcaption><span class="label">Generated</span><span class="name">${escapeHtml(label)}</span></figcaption></figure>
  </article>`;
}

function relativeUrl(filePath) {
  return path.relative(path.dirname(fixturePath), filePath).split(path.sep).join('/');
}

function compareFixture(left, right) {
  return `${left.style}/${left.category}/${left.name}`.localeCompare(`${right.style}/${right.category}/${right.name}`);
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
