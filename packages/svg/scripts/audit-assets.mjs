import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { compileIconSource, discoverIconSources, parseSvg } from '@mingcute/compiler';
import { iconStyles, toKebabCase } from '@mingcute/core';

const packageRoot = path.resolve(import.meta.dirname, '..');
const workspaceRoot = path.resolve(packageRoot, '../..');
const sourceRoot = path.join(workspaceRoot, 'assets/svg');
const totals = {
  files: 0,
  angularFiles: 0,
  angularPaints: 0,
  conicPaints: 0,
  nativeGradients: 0,
  masks: 0,
  maskReferences: 0,
  clipPaths: 0,
  patterns: 0,
  embeddedImages: 0,
  danglingReferences: 0,
};

for (const style of iconStyles) {
  const sources = await discoverIconSources(sourceRoot, style);
  const metadata = JSON.parse(await readFile(path.join(packageRoot, style, 'metadata.json'), 'utf8'));
  if (metadata.length !== sources.length) throw new Error(`${style}: metadata count does not match source count.`);

  for (const source of sources) {
    const { definition } = await compileIconSource(source);
    const outputPath = path.join(packageRoot, style, `${toKebabCase(definition.name)}.svg`);
    const output = await readFile(outputPath, 'utf8');
    const parsed = parseSvg(output, { allowMingcuteAngularPaint: true });
    const nodes = flatten(parsed.children);
    const ids = new Set(nodes.map((node) => node.attributes.id).filter(Boolean));
    const references = nodes.flatMap((node) =>
      Object.values(node.attributes).flatMap((value) => [...value.matchAll(/url\(#([^)]+)\)/g)].map((match) => match[1])));
    totals.danglingReferences += references.filter((id) => !ids.has(id)).length;

    const angular = (definition.gradients ?? []).filter(({ type }) => type === 'angular').length;
    const generatedAngular = nodes.filter((node) => node.attributes['data-mingcute-angular-gradient']).length;
    const generatedConic = nodes.filter((node) => node.name === 'div' && node.attributes.style?.includes('conic-gradient(')).length;
    if (generatedAngular !== angular || generatedConic !== angular) {
      throw new Error(`${path.relative(workspaceRoot, outputPath)}: angular paint count mismatch.`);
    }
    if (angular) totals.angularFiles++;
    for (const gradient of (definition.gradients ?? []).filter(({ type }) => type === 'angular')) {
      const paintedElements = definition.elements
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => Object.values(element.attributes).some((value) => String(value) === `url(#${gradient.id})`));
      for (const { element, index } of paintedElements) {
        const group = nodes.find((node) => node.attributes['data-mingcute-angular-gradient'] === gradient.id &&
          node.attributes['clip-path'] === `url(#${gradient.id}-clip-${index})`);
        if (!group) throw new Error(`${outputPath}: missing angular paint group for ${gradient.id}.`);
        const foreignObject = group.children.find(({ name }) => name === 'foreignObject');
        const div = foreignObject?.children.find(({ name }) => name === 'div');
        if (!foreignObject || !validMatrix(foreignObject.attributes.transform) || !div) {
          throw new Error(`${outputPath}: angular paint ${gradient.id} has invalid geometry.`);
        }
        const styleValue = div.attributes.style ?? '';
        for (const stop of gradient.stops) {
          const expectedStop = `${stop.color} ${formatNumber(Number(stop.offset) * 360)}deg`;
          if (!styleValue.includes(expectedStop)) throw new Error(`${outputPath}: angular stop ${expectedStop} is missing.`);
        }
        const clip = nodes.find((node) => node.name === 'clipPath' && node.attributes.id === `${gradient.id}-clip-${index}`);
        const clipElement = clip?.children[0];
        if (!clipElement || clipElement.name !== element.tag || clipElement.attributes.d !== element.attributes.d) {
          throw new Error(`${outputPath}: angular clip geometry does not match its painted element.`);
        }
      }
    }
    totals.angularPaints += angular;
    totals.conicPaints += generatedConic;

    const nativeGradients = (definition.gradients ?? []).filter(({ type }) => type !== 'angular').length;
    if (nodes.filter(({ name }) => name === 'linearGradient' || name === 'radialGradient').length !== nativeGradients) {
      throw new Error(`${path.relative(workspaceRoot, outputPath)}: native gradient count mismatch.`);
    }
    totals.nativeGradients += nativeGradients;
    for (const gradient of (definition.gradients ?? []).filter(({ type }) => type !== 'angular')) {
      const node = nodes.find(({ attributes }) => attributes.id === gradient.id);
      const expectedTag = gradient.type === 'linear' ? 'linearGradient' : 'radialGradient';
      if (node?.name !== expectedTag || node.children.filter(({ name }) => name === 'stop').length !== gradient.stops.length) {
        throw new Error(`${outputPath}: gradient #${gradient.id} was not rendered faithfully.`);
      }
    }

    const masks = definition.masks?.length ?? 0;
    const maskReferences = definition.elements.filter(({ attributes }) => String(attributes.mask ?? '').startsWith('url(#')).length + (definition.groupMask ? 1 : 0);
    if (definition.groupMask && !nodes.some((node) => node.name === 'g' && node.attributes.mask === definition.groupMask)) {
      throw new Error(`${outputPath}: composited body mask is missing.`);
    }
    if (nodes.filter(({ name }) => name === 'mask').length !== masks) throw new Error(`${outputPath}: mask count mismatch.`);
    totals.masks += masks;
    totals.maskReferences += maskReferences;
    for (const mask of definition.masks ?? []) {
      const node = nodes.find((candidate) => candidate.name === 'mask' && candidate.attributes.id === mask.id);
      if (!sameLeafGeometry(node?.children ?? [], mask.elements)) throw new Error(`${outputPath}: mask #${mask.id} geometry mismatch.`);
    }

    const clipPaths = definition.clipPaths?.length ?? 0;
    if (nodes.filter(({ name }) => name === 'clipPath').length !== clipPaths + angular) {
      throw new Error(`${outputPath}: clip-path count mismatch.`);
    }
    totals.clipPaths += clipPaths;

    const patterns = definition.patterns?.length ?? 0;
    if (nodes.filter(({ name }) => name === 'pattern').length !== patterns) throw new Error(`${outputPath}: pattern count mismatch.`);
    if (nodes.filter(({ name }) => name === 'image').length !== patterns) throw new Error(`${outputPath}: embedded-image count mismatch.`);
    totals.patterns += patterns;
    totals.embeddedImages += patterns;
    for (const pattern of definition.patterns ?? []) {
      const node = nodes.find((candidate) => candidate.name === 'pattern' && candidate.attributes.id === pattern.id);
      const image = node?.children.find(({ name }) => name === 'image');
      if (image?.attributes.href !== `data:${pattern.image.mimeType};base64,${pattern.image.data}`) {
        throw new Error(`${outputPath}: pattern #${pattern.id} embedded image data mismatch.`);
      }
    }
    totals.files++;
  }
  console.log(`${style}: ${sources.length} rendered and audited`);
}

if (totals.danglingReferences) throw new Error(`Generated SVGs contain ${totals.danglingReferences} dangling resource references.`);
console.table(totals);
console.log('SVG generated-output audit passed.');

function flatten(nodes) {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

function validMatrix(value = '') {
  const match = value.match(/^matrix\(([^)]+)\)$/);
  return Boolean(match && match[1].trim().split(/\s+/).length === 6 && match[1].trim().split(/\s+/).every((part) => Number.isFinite(Number(part))));
}

function sameLeafGeometry(nodes, elements) {
  return nodes.length === elements.length && nodes.every((node, index) =>
    node.name === elements[index].tag && Object.entries(elements[index].attributes)
      .every(([name, value]) => node.attributes[name] === String(value)));
}

function formatNumber(value) {
  return Number(value.toFixed(6)).toString();
}
