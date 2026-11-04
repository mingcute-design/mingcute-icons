import path from 'node:path';
import { iconStyles } from '@mingcute/core';
import { compileIconSource, discoverIconSources } from '../dist/index.js';

const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
const svgRoot = path.join(workspaceRoot, 'assets/svg');
let total = 0;
const diagnostics = new Map();

for (const style of iconStyles) {
  const sources = await discoverIconSources(svgRoot, style);
  for (const source of sources) {
    let result;
    try {
      result = await compileIconSource(source);
    } catch (error) {
      throw new Error(`Asset audit failed for ${path.relative(workspaceRoot, source.sourcePath)}: ${error.message}`, {
        cause: error,
      });
    }
    for (const diagnostic of result.diagnostics) {
      diagnostics.set(diagnostic.code, (diagnostics.get(diagnostic.code) ?? 0) + 1);
    }
  }
  total += sources.length;
  console.log(`${style}: ${sources.length}`);
}

console.log(`Compiled and validated: ${total}`);
console.log(`Diagnostics: ${JSON.stringify(Object.fromEntries(diagnostics))}`);
