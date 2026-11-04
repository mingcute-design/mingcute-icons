import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { type IconDefinition, type IconStyle } from '@mingcute/core';
import { generateComponentName, generateMetadata, normalizeSourceName } from './metadata/index.js';
import { normalizeSvg } from './normaliser/index.js';
import { extractSvgInner, optimiseSvg } from './optimiser/index.js';
import { parseSvg } from './parser/index.js';
import type { CompileFileOptions, CompileOptions, CompileResult } from './types.js';
import { validateIconDefinition } from './validator/index.js';

/** Parses, sanitizes, optimizes, and normalizes one SVG into the stable icon-definition contract. */
export function compileSvg(source: string, options: CompileOptions): CompileResult {
  parseSvg(source);
  const optimizedSvg = optimiseSvg(source, options.sourcePath, options.name.endsWith('_original'));
  const normalized = normalizeSvg(parseSvg(optimizedSvg));
  const definition: IconDefinition = validateIconDefinition({
    name: options.name,
    componentName: generateComponentName(options.name, options.style),
    style: options.style,
    viewBox: normalized.viewBox,
    elements: normalized.elements,
    ...(normalized.groupMask ? { groupMask: normalized.groupMask } : {}),
    ...(normalized.gradients ? { gradients: normalized.gradients } : {}),
    ...(normalized.masks ? { masks: normalized.masks } : {}),
    ...(normalized.clipPaths ? { clipPaths: normalized.clipPaths } : {}),
    ...(normalized.patterns ? { patterns: normalized.patterns } : {}),
    metadata: generateMetadata(options.metadata),
  });
  return {
    definition,
    optimizedSvg,
    innerSvg: extractSvgInner(optimizedSvg),
    diagnostics: normalized.diagnostics,
  };
}

/** Compiles one SVG file and derives its canonical icon name and optional source category. */
export async function compileIconFile(filePath: string, options: CompileFileOptions): Promise<CompileResult> {
  const source = await readFile(filePath, 'utf8');
  const fileBaseName = path.basename(filePath, path.extname(filePath));
  const name = normalizeSourceName(fileBaseName, options.style);
  const category = options.sourceRoot
    ? firstDirectory(path.relative(options.sourceRoot, filePath))
    : options.metadata?.category;
  return compileSvg(source, {
    name,
    style: options.style,
    sourcePath: filePath,
    metadata: { ...options.metadata, ...(category ? { category } : {}) },
  });
}

/** Recursively discovers SVG files in deterministic path order. */
export async function discoverSvgFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  async function walk(current: string): Promise<void> {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) files.push(fullPath);
    }
  }
  await walk(directory);
  return files.sort((a, b) => a.localeCompare(b));
}

/** Compiles every SVG in a style directory while retaining category metadata. */
export async function compileStyleDirectory(directory: string, style: IconStyle): Promise<CompileResult[]> {
  const files = await discoverSvgFiles(directory);
  return Promise.all(files.map((filePath) => compileIconFile(filePath, { style, sourceRoot: directory })));
}

function firstDirectory(relativePath: string): string | undefined {
  const parts = relativePath.split(path.sep);
  return parts.length > 1 ? parts[0] : undefined;
}
