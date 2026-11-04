import assert from 'node:assert/strict';
import test from 'node:test';
import { iconStyles } from '@mingcute/core';
import { renderSvg, svgAdapter } from '../dist/index.js';

const base = {
  name: 'fixture',
  componentName: 'FixtureRegular',
  style: 'core-regular',
  viewBox: '0 0 24 24',
  metadata: { category: 'testing' },
};

test('implements the complete stabilized adapter contract', () => {
  const definition = { ...base, elements: [{ tag: 'path', attributes: { d: 'M0 0h24v24H0z' } }] };
  assert.equal(svgAdapter.name, 'svg');
  assert.equal(svgAdapter.generateIcon(definition, { packageName: '@mingcute/svg', style: 'core-regular' })[0].path, 'core-regular/fixture.svg');
  assert.equal(svgAdapter.generateStyleIndex('core-regular', [definition])[0].path, 'core-regular/metadata.json');
  assert.deepEqual(JSON.parse(svgAdapter.generateRootIndex(iconStyles)[0].contents), iconStyles);
  const manifest = svgAdapter.generatePackageManifest({
    packageName: '@mingcute/svg',
    version: '1.2.3',
    styles: iconStyles,
  });
  assert.equal(manifest.name, '@mingcute/svg');
  assert.deepEqual(manifest.exports, { './styles.json': './styles.json', './*': './*' });
  assert.deepEqual(manifest.publishConfig, { access: 'public' });
});

test('renders leaf elements and native gradients', () => {
  const output = renderSvg({
    ...base,
    elements: [{ tag: 'path', attributes: { fill: 'url(#paint)', d: 'M0 0h24v24H0z' } }],
    gradients: [{
      id: 'paint',
      type: 'linear',
      attributes: { x1: 0, x2: 24 },
      stops: [{ offset: 0, color: '#f00' }, { offset: 1, color: '#00f', opacity: 0.5 }],
    }],
  });
  assert.match(output, /<linearGradient id="paint" x1="0" x2="24">/);
  assert.match(output, /<stop offset="1" stop-color="#00f" stop-opacity="0.5"\/>/);
  assert.match(output, /<path fill="url\(#paint\)" d="M0 0h24v24H0z"\/>/);
});

test('renders masks and clipping paths with live references', () => {
  const output = renderSvg({
    ...base,
    elements: [{ tag: 'rect', attributes: { mask: 'url(#fade)', 'clip-path': 'url(#crop)', width: 24, height: 24 } }],
    masks: [{ id: 'fade', attributes: { 'mask-type': 'alpha' }, elements: [{ tag: 'circle', attributes: { cx: 12, cy: 12, r: 8 } }] }],
    clipPaths: [{ id: 'crop', attributes: {}, elements: [{ tag: 'rect', attributes: { x: 2, y: 2, width: 20, height: 20 } }] }],
  });
  assert.match(output, /<mask id="fade" style="mask-type:alpha">/);
  assert.match(output, /<clipPath id="crop">/);
  assert.match(output, /mask="url\(#fade\)" clip-path="url\(#crop\)"/);
});

test('renders embedded-image patterns without external resources', () => {
  const output = renderSvg({
    ...base,
    elements: [{ tag: 'path', attributes: { fill: 'url(#tile)', d: 'M0 0h24v24H0z' } }],
    patterns: [{
      id: 'tile',
      attributes: { patternContentUnits: 'objectBoundingBox' },
      image: {
        mimeType: 'image/png',
        data: 'iVBORw0KGgo=',
        attributes: { width: 1, height: 1 },
        transform: 'scale(.5)',
      },
    }],
  });
  assert.match(output, /<pattern id="tile" patternContentUnits="objectBoundingBox">/);
  assert.match(output, /href="data:image\/png;base64,iVBORw0KGgo="/);
  assert.match(output, /<image width="1" height="1"/);
  assert.doesNotMatch(output, /href="https?:\/\//);
});

test('renders angular gradients as clipped conic-gradient paint', () => {
  const output = renderSvg({
    ...base,
    elements: [{ tag: 'path', attributes: { fill: 'url(#spin)', d: 'M12 2a10 10 0 1 0 10 10' } }],
    gradients: [{
      id: 'spin',
      type: 'angular',
      attributes: {
        opacity: 1,
        'transform-m00': 3,
        'transform-m01': -18,
        'transform-m02': 19.5,
        'transform-m10': -18,
        'transform-m11': -3,
        'transform-m12': 22.5,
      },
      stops: [{ offset: 0, color: 'rgb(16 22 31)' }, { offset: 1, color: 'rgb(16 22 31 / 0)' }],
    }],
  });
  assert.match(output, /<clipPath id="spin-clip-0"><path d="M12 2a10 10 0 1 0 10 10"\/><\/clipPath>/);
  assert.match(output, /data-mingcute-angular-gradient="spin"/);
  assert.match(output, /<foreignObject/);
  assert.match(output, /conic-gradient\(from 90deg,currentColor 0deg,transparent 360deg\)/);
  assert.doesNotMatch(output, /fill="url\(#spin\)"/);
});

test('refuses a mismatched style context', () => {
  const definition = { ...base, elements: [{ tag: 'path', attributes: { d: 'M0 0' } }] };
  assert.throws(
    () => svgAdapter.generateIcon(definition, { packageName: '@mingcute/svg', style: 'core-filled' }),
    /does not match/,
  );
});
