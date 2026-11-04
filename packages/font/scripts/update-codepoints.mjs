import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources } from '@mingcute/compiler';
import { iconStyles, toKebabCase } from '@mingcute/core';
import { codepointRange, formatCodepoint, validateCodepointLedger } from '../.tooling/codepoints.js';

const packageRoot = path.resolve(import.meta.dirname, '..');
const ledgerPath = path.join(packageRoot, 'metadata/codepoints.json');
const checkOnly = process.argv.includes('--check');
const ledger = await readLedger();
validateCodepointLedger(ledger);

const rawNamesByIdentity = new Map();
const sourceRoot = path.resolve(packageRoot, '../../assets/svg');
for (const style of iconStyles) {
  const definitions = await mapLimit(await discoverIconSources(sourceRoot, style), 32, async (source) =>
    (await compileIconSource(source)).definition);
  for (const definition of definitions) {
    const identity = toKebabCase(definition.name);
    const names = rawNamesByIdentity.get(identity) ?? new Set();
    names.add(definition.name);
    rawNamesByIdentity.set(identity, names);
  }
}

const collisions = [...rawNamesByIdentity].filter(([, names]) => names.size > 1);
if (collisions.length) {
  throw new Error(`Canonical font identity collisions: ${collisions.slice(0, 10).map(([identity, names]) => `${identity} (${[...names].join(', ')})`).join('; ')}`);
}

const current = new Set(rawNamesByIdentity.keys());
const absent = Object.keys(ledger.assignments).filter((identity) => !current.has(identity));
if (absent.length) throw new Error(`Retire removed identities explicitly before updating: ${absent.slice(0, 10).join(', ')}`);

const pending = [...current].filter((identity) => !ledger.assignments[identity] && !ledger.aliases[identity]).sort(compareText);
if (checkOnly) {
  if (pending.length) throw new Error(`Codepoint ledger is missing ${pending.length} identities: ${pending.slice(0, 10).join(', ')}`);
  console.log(`Codepoint ledger covers all ${current.size} canonical identities.`);
  process.exit(0);
}

const reserved = [...Object.values(ledger.assignments), ...Object.values(ledger.retired)].map((value) => Number.parseInt(value, 16));
let next = reserved.length ? Math.max(...reserved) + 1 : codepointRange.start;
for (const identity of pending) {
  if (next > codepointRange.end) throw new Error('Font private-use codepoint range is exhausted.');
  ledger.assignments[identity] = formatCodepoint(next++);
}
ledger.assignments = Object.fromEntries(Object.entries(ledger.assignments).sort(([, left], [, right]) => Number.parseInt(left, 16) - Number.parseInt(right, 16)));
validateCodepointLedger(ledger);
await mkdir(path.dirname(ledgerPath), { recursive: true });
await writeFile(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
console.log(`Codepoint ledger: ${Object.keys(ledger.assignments).length} active, ${Object.keys(ledger.retired).length} retired, ${pending.length} added.`);

async function readLedger() {
  try {
    return JSON.parse(await readFile(ledgerPath, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    return { schemaVersion: 1, range: { start: 'E001', end: 'F8FF' }, assignments: {}, aliases: {}, retired: {} };
  }
}

function compareText(left, right) { return left < right ? -1 : left > right ? 1 : 0; }
async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length); let index = 0;
  async function worker() { while (index < items.length) { const current = index++; results[current] = await mapper(items[current]); } }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
