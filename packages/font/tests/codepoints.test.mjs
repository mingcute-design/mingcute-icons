import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  assertAppendOnlyCodepoints,
  validateCodepointLedger,
} from '../.tooling/codepoints.js';

const packageRoot = path.resolve(import.meta.dirname, '..');
const ledgerSource = await readFile(path.join(packageRoot, 'metadata/codepoints.json'), 'utf8');
const ledger = JSON.parse(ledgerSource);

test('checked-in ledger is complete, unique, and copied byte-for-byte to the package', async () => {
  validateCodepointLedger(ledger);
  assert.equal(Object.keys(ledger.assignments).length, 2263);
  assert.equal(new Set(Object.values(ledger.assignments)).size, 2263);
  assert.equal(Math.min(...Object.values(ledger.assignments).map(hex)), 0xE001);
  assert.equal(await readFile(path.join(packageRoot, 'dist/metadata/codepoints.json'), 'utf8'), ledgerSource);
});

test('generated metadata and every style CSS consume the shared codepoint ledger', async () => {
  const metadata = JSON.parse(await readFile(path.join(packageRoot, 'dist/metadata/icons.json'), 'utf8'));
  assert.equal(metadata.icons.length, 2263);
  const cssByStyle = new Map();
  for (const icon of metadata.icons) {
    assert.equal(icon.codepoint, ledger.assignments[icon.name]);
    for (const style of icon.styles) {
      let css = cssByStyle.get(style);
      if (!css) {
        css = await readFile(path.join(packageRoot, `dist/css/${style}.min.css`), 'utf8');
        cssByStyle.set(style, css);
      }
      const marker = `.mgc-${icon.name}-${style}::before`;
      const start = css.indexOf(marker);
      assert.ok(start >= 0, `${icon.name}/${style} CSS class missing`);
      const rule = css.slice(start, css.indexOf('}', start) + 1);
      assert.match(rule, new RegExp(`content:"\\\\${icon.codepoint.toLowerCase()}"`));
    }
  }
});

test('compatibility rejects reassignment, deletion, alias removal, and retired reuse', () => {
  const previous = sampleLedger({ assignments: { home: 'E001' }, aliases: { house: 'home' }, retired: { legacy: 'E002' } });
  assert.doesNotThrow(() => assertAppendOnlyCodepoints(previous, sampleLedger({
    assignments: { home: 'E001', user: 'E003' }, aliases: { house: 'home' }, retired: { legacy: 'E002' },
  })));
  assert.throws(() => assertAppendOnlyCodepoints(previous, sampleLedger({
    assignments: { home: 'E003' }, aliases: { house: 'home' }, retired: { legacy: 'E002' },
  })), /changed or disappeared/);
  assert.throws(() => assertAppendOnlyCodepoints(previous, sampleLedger({
    assignments: { home: 'E001' }, aliases: {}, retired: { legacy: 'E002' },
  })), /alias changed or disappeared/);
  assert.throws(() => assertAppendOnlyCodepoints(previous, sampleLedger({
    assignments: { home: 'E001', user: 'E002' }, aliases: { house: 'home' }, retired: {},
  })), /Retired codepoint|assigned to both/);
});

function hex(value) { return Number.parseInt(value, 16); }
function sampleLedger(overrides) {
  return { schemaVersion: 1, range: { start: 'E001', end: 'F8FF' }, ...overrides };
}
