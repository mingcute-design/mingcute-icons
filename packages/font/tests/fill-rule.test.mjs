import assert from 'node:assert/strict';
import test from 'node:test';
import paper from 'paper';
import { definitionToGlyphPath } from '../.tooling/glyph.js';

test('even-odd holes remain holes when font contours use nonzero winding', () => {
  const path = definitionToGlyphPath({
    name: 'counter', componentName: 'CounterRegular', style: 'core-regular', viewBox: '0 0 24 24', metadata: {},
    elements: [{ tag: 'path', attributes: { fill: 'currentColor', 'fill-rule': 'evenodd', d: 'M2 2h20v20H2z M8 8h8v8H8z' } }],
  });
  const geometry = paper.PathItem.create(path);
  try {
    geometry.fillRule = 'nonzero';
    assert.equal(geometry.contains(new paper.Point(150, 150)), false, 'center counter must stay open');
    assert.equal(geometry.contains(new paper.Point(50, 150)), true, 'outer shape must stay filled');
  } finally { geometry.remove(); }
});
