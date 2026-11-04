import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  IconValidationError,
  compileIconFile,
  compileIconSource,
  compileSvg,
  discoverIconSources,
  normalizeSourceName,
  optimiseSvg,
  validateIconDefinition,
} from '../dist/index.js';

test('compiles a canonical SVG into the shared icon definition', () => {
  const result = compileSvg(
    '<svg width="24" height="24" fill="#10161F"><g opacity=".5"><path d="M1 2h3"/></g><circle cx="12" cy="12" r="2"/></svg>',
    { name: 'camera', style: 'core-regular', metadata: { category: 'device', keywords: [' camera ', 'camera'] } },
  );
  assert.deepEqual(result.definition, {
    name: 'camera',
    componentName: 'CameraRegular',
    style: 'core-regular',
    viewBox: '0 0 24 24',
    elements: [
      { tag: 'path', attributes: { fill: 'currentColor', opacity: '.5', d: 'M1 2h3' } },
      { tag: 'circle', attributes: { fill: 'currentColor', cx: '12', cy: '12', r: '2' } },
    ],
    metadata: { category: 'device', keywords: ['camera'] },
  });
  assert.equal(result.diagnostics.length, 0);
  assert.doesNotMatch(result.optimizedSvg, /\b(?:width|height|xmlns)=/);
});

test('removes dimensions only from the SVG root and preserves shape dimensions', () => {
  const optimized = optimiseSvg(
    '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"><image width="472" height="461" href="data:image/png;base64,iVBORw0KGgo="/></svg>',
  );
  assert.doesNotMatch(optimized.match(/^<svg[^>]*>/)?.[0] ?? '', /\b(?:width|height|xmlns)=/);
  assert.match(optimized, /<image width="472" height="461"/);
});

test('preserves gradients as structured resources referenced by leaf elements', () => {
  const result = compileSvg(
    '<svg viewBox="0 0 24 24"><path fill="url(#paint)" d="M0 0h24v24H0z"/><defs><linearGradient id="paint" x1="0" x2="1"><stop stop-color="#f00"/><stop offset="1" stop-color="#00f" stop-opacity=".5"/></linearGradient></defs></svg>',
    { name: 'brand', style: 'core-regular' },
  );
  assert.equal(result.definition.elements[0].attributes.fill, 'url(#a)');
  assert.deepEqual(result.definition.gradients, [{
    id: 'a',
    type: 'linear',
    attributes: { x1: '0', x2: '1' },
    stops: [
      { offset: '0', color: 'red' },
      { offset: '1', color: '#00f', opacity: '.5' },
    ],
  }]);
});

test('normalizes Figma angular paint without including foreignObject content', () => {
  const result = compileSvg(
    '<svg viewBox="0 0 24 24"><g data-figma-skip-parse="true"><foreignObject><div/></foreignObject></g><path data-figma-gradient-fill="{&quot;type&quot;:&quot;GRADIENT_ANGULAR&quot;,&quot;stops&quot;:[{&quot;position&quot;:0,&quot;color&quot;:{&quot;r&quot;:1,&quot;g&quot;:0,&quot;b&quot;:0,&quot;a&quot;:1}},{&quot;position&quot;:1,&quot;color&quot;:{&quot;r&quot;:0,&quot;g&quot;:0,&quot;b&quot;:1,&quot;a&quot;:0.5}}]}" d="M0 0h1v1z"/></svg>',
    { name: 'loading', style: 'core-regular' },
  );
  assert.equal(result.definition.elements.length, 1);
  assert.equal(result.definition.elements[0].attributes.fill, 'url(#mgc-angular-0)');
  assert.equal(result.definition.gradients?.[0].type, 'angular');
  assert.deepEqual(result.definition.gradients?.[0].stops, [
    { offset: 0, color: 'rgb(255 0 0)' },
    { offset: 1, color: 'rgb(0 0 255 / 0.5)' },
  ]);
  assert.deepEqual(result.diagnostics.map(({ code }) => code), ['figma-paint-normalized']);
});

test('preserves masks as structured resources', () => {
  const result = compileSvg(
    '<svg viewBox="0 0 24 24"><path mask="url(#cutout)" d="M0 0h24v24H0z"/><mask id="cutout" style="mask-type:alpha"><rect width="24" height="24" fill="white"/><circle cx="12" cy="12" r="4" fill="black"/></mask></svg>',
    { name: 'masked', style: 'core-regular' },
  );
  assert.equal(result.definition.masks?.[0].id, 'a');
  assert.equal(result.definition.masks?.[0].attributes['mask-type'], 'alpha');
  assert.equal(result.definition.masks?.[0].elements.length, 2);
  assert.deepEqual(result.diagnostics, []);
});

test('mask geometry inherits root paint attributes', () => {
  const result = compileSvg(
    '<svg viewBox="0 0 24 24" fill="none"><g mask="url(#outline)"><rect width="24" height="24" fill="red"/></g><mask id="outline" style="mask-type:alpha"><path stroke="black" d="M2 12h20"/></mask></svg>',
    { name: 'outline-mask', style: 'core-regular' },
  );
  assert.equal(result.definition.masks?.[0].elements[0].attributes.fill, 'none');
  assert.equal(result.definition.masks?.[0].elements[0].attributes.stroke, '#000');
  assert.equal(result.definition.groupMask, 'url(#a)');
  assert.equal(result.definition.elements[0].attributes.mask, undefined);
});

test('preserves group-level clip paths on normalized leaves', () => {
  const result = compileSvg(
    '<svg viewBox="0 0 24 24"><g clip-path="url(#crop)"><path d="M0 0h24v24H0z"/></g><defs><clipPath id="crop"><circle cx="12" cy="12" r="8"/></clipPath></defs></svg>',
    { name: 'clipped', style: 'core-regular' },
  );
  assert.equal(result.definition.elements[0].attributes['clip-path'], 'url(#a)');
  assert.equal(result.definition.clipPaths?.[0].id, 'a');
  assert.equal(result.definition.clipPaths?.[0].elements[0].tag, 'circle');
});

test('preserves an embedded image pattern without allowing external URLs', () => {
  const result = compileSvg(
    '<svg viewBox="0 0 24 24" xmlns:xlink="http://www.w3.org/1999/xlink"><path fill="url(#tile)" d="M0 0h24v24H0z"/><defs><pattern id="tile"><use xlink:href="#pixel" transform="scale(2)"/></pattern><image id="pixel" width="1" height="1" xlink:href="data:image/png;base64,iVBORw0KGgo="/></defs></svg>',
    { name: 'pattern', style: 'core-regular' },
  );
  assert.equal(result.definition.patterns?.[0].id, 'a');
  assert.equal(result.definition.patterns?.[0].image.mimeType, 'image/png');
  assert.equal(result.definition.patterns?.[0].image.transform, 'scale(2)');
  assert.equal(result.definition.patterns?.[0].image.attributes.width, '1');
  assert.equal(result.definition.patterns?.[0].image.attributes.height, '1');
  assert.throws(
    () => compileSvg('<svg viewBox="0 0 24 24"><image href="https://example.com/a.png"/></svg>', { name: 'external', style: 'core-regular' }),
    /external|Unsafe|supported image source|must contain/i,
  );
});

test('rejects active content and malformed SVG', () => {
  assert.throws(
    () => compileSvg('<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M0 0"/></svg>', { name: 'bad', style: 'core-regular' }),
    /script|active content|disallowed/i,
  );
  assert.throws(
    () => compileSvg('<svg viewBox="0 0 24 24"><defs><script>alert(1)</script></defs><path d="M0 0"/></svg>', { name: 'nested-bad', style: 'core-regular' }),
    /script|active content|disallowed/i,
  );
  assert.throws(
    () => compileSvg('<svg viewBox="0 0 24 24"><path d="M0 0"></svg>', { name: 'bad', style: 'core-regular' }),
    /unexpected close tag/i,
  );
  assert.throws(
    () => compileSvg('<svg viewBox="0 0 0 24"><path d="M0 0"/></svg>', { name: 'bad', style: 'core-regular' }),
    IconValidationError,
  );
  assert.throws(
    () => compileSvg('<svg viewBox="0 0 24 24"><foreignObject><div>unsafe</div></foreignObject></svg>', { name: 'bad', style: 'core-regular' }),
    /foreignObject|Unsafe SVG element/i,
  );
});

test('validates nested mask and clip-path geometry at the public definition boundary', () => {
  const base = {
    name: 'nested',
    componentName: 'NestedRegular',
    style: 'core-regular',
    viewBox: '0 0 24 24',
    elements: [{ tag: 'path', attributes: { d: 'M0 0' } }],
    metadata: {},
  };
  assert.throws(
    () => validateIconDefinition({
      ...base,
      masks: [{
        id: 'mask',
        attributes: {},
        elements: [{ tag: 'path', attributes: { d: 'M0 0', onclick: 'alert(1)' } }],
      }],
    }),
    /Unsafe SVG attribute/,
  );
  assert.throws(
    () => validateIconDefinition({
      ...base,
      clipPaths: [{
        id: 'clip',
        attributes: {},
        elements: [{ tag: 'path', attributes: {} }],
      }],
    }),
    /must define a d attribute/,
  );
  assert.throws(
    () => validateIconDefinition({
      ...base,
      gradients: [{
        id: 'bad id',
        type: 'linear',
        attributes: {},
        stops: [{ offset: 0, color: '#000' }],
      }],
    }),
    /Invalid or duplicate gradient id/,
  );
  assert.throws(
    () => validateIconDefinition({
      ...base,
      gradients: [{
        id: 'paint',
        type: 'linear',
        attributes: {},
        stops: [{ offset: 0, color: 'red;display:none' }],
      }],
    }),
    /unsafe color value/,
  );
  assert.throws(
    () => validateIconDefinition({
      ...base,
      masks: [{
        id: 'mask',
        attributes: {},
        elements: [{ tag: 'path', attributes: { d: 'M0 0', fill: 'url(#missing)' } }],
      }],
    }),
    /missing SVG resource #missing/,
  );
});

test('derives names, category, and component names from a source file', async () => {
  const fixture = path.resolve(import.meta.dirname, 'fixtures/arrows/arrow_left_regular.svg');
  const result = await compileIconFile(fixture, { style: 'core-regular', sourceRoot: path.resolve(import.meta.dirname, 'fixtures') });
  assert.equal(result.definition.name, 'arrow_left');
  assert.equal(result.definition.componentName, 'ArrowLeftRegular');
  assert.equal(result.definition.metadata.category, 'arrows');
  assert.equal(normalizeSourceName('shape_regular', 'core-regular'), 'shape');
});

test('compiles representative real sources with leaf, gradient, and Figma paint forms', async () => {
  const workspace = path.resolve(import.meta.dirname, '../../..');
  const sourceRoot = path.join(workspace, 'assets/stroke');
  const sources = await discoverIconSources(sourceRoot, 'core-regular');
  for (const name of ['camera', 'loading']) {
    const source = sources.find((candidate) => candidate.name === name);
    assert.ok(source, name);
    await readFile(source.sourcePath);
    const result = await compileIconSource(source);
    assert.ok(result.definition.elements.length > 0, name);
  }
});


test('designer use references retain every gradient-painted path and placement', () => {
  const { definition, diagnostics } = compileSvg(
    '<svg viewBox="0 0 24 24"><use href="#shape" fill="url(#paint)" x="2" y="3"/><use href="#shape" fill="red"/><defs><path id="shape" d="M0 0h2v2z"/><linearGradient id="paint"><stop stop-color="blue"/><stop offset="1" stop-color="red"/></linearGradient></defs></svg>',
    { name: 'copilot_original', style: 'core-regular' },
  );
  assert.equal(definition.elements.length, 2);
  assert.equal(definition.elements[0].attributes.fill, `url(#${definition.gradients[0].id})`);
  assert.equal(definition.elements[0].attributes.transform, 'translate(2 3)');
  assert.equal(definition.elements[1].attributes.fill, 'red');
  assert.equal(definition.elements[0].attributes.id, undefined);
  assert.deepEqual(diagnostics, []);
});

test('an outer mask composites all paint layers once', () => {
  const { definition } = compileSvg(
    '<svg viewBox="0 0 24 24"><mask id="shape" style="mask-type:alpha"><circle cx="12" cy="12" r="8" fill="white"/></mask><g mask="url(#shape)"><path fill="red" d="M0 0h24v24H0z"/><path fill="blue" opacity=".5" d="M0 0h24v24H0z"/></g></svg>',
    { name: 'siri_original', style: 'core-regular' },
  );
  assert.ok(definition.groupMask);
  assert.equal(definition.elements.length, 2);
  assert.ok(definition.elements.every((element) => element.attributes.mask === undefined));
  assert.equal(definition.groupMask, `url(#${definition.masks[0].id})`);
});

test('Original brand colors remain fixed while regular icons inherit color', () => {
  const source = '<svg viewBox="0 0 24 24"><path fill="#10161f" d="M0 0h24v24H0z"/></svg>';
  const original = compileSvg(source, { name: 'linux_original', style: 'core-regular' }).definition;
  const regular = compileSvg(source, { name: 'home', style: 'core-regular' }).definition;
  assert.equal(original.elements[0].attributes.fill, '#10161f');
  assert.equal(regular.elements[0].attributes.fill, 'currentColor');
});
