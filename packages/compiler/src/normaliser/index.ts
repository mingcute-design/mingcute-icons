import {
  iconElementTags,
  type IconElement,
  type IconGradient,
  type IconGradientStop,
  type IconMask,
  type IconClipPath,
  type IconPattern,
} from '@mingcute/core';
import type { CompileDiagnostic } from '../types.js';
import type { ParsedSvg, SvgNode } from '../parser/index.js';

const elementTags = new Set<string>(iconElementTags);
const containers = new Set(['g', 'a', 'switch']);
const ignored = new Set(['title', 'desc', 'metadata', 'style', 'foreignObject']);
const inherited = new Set([
  'color', 'fill', 'fill-opacity', 'fill-rule', 'opacity', 'stroke', 'stroke-dasharray',
  'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
  'stroke-opacity', 'stroke-width', 'vector-effect', 'visibility', 'clip-path', 'mask',
]);
const blockedAttributes = /^(?:on|href$|xlink:href$)/i;
const presentationStyleKeys = new Set([...inherited, 'clip-rule']);
presentationStyleKeys.add('mask-type');

export interface NormalizedSvg {
  viewBox: string;
  elements: IconElement[];
  groupMask?: string;
  gradients?: IconGradient[];
  masks?: IconMask[];
  clipPaths?: IconClipPath[];
  patterns?: IconPattern[];
  diagnostics: CompileDiagnostic[];
}

export function normalizeSvg(parsed: ParsedSvg): NormalizedSvg {
  parsed = expandGeometryUses(parsed);
  const diagnostics: CompileDiagnostic[] = [];
  const rootAttributes = sanitizeAttributes(parsed.attributes);
  const inheritedRoot = inheritedAttributes(rootAttributes);
  const nativeGradients = collectGradients(parsed.children);
  const figmaGradients = collectFigmaAngularGradients(parsed.children, nativeGradients.map(({ id }) => id));
  const gradients = [...nativeGradients, ...figmaGradients.values()];
  const masks = collectMasks(parsed.children, diagnostics, inheritedRoot);
  const clipPaths = collectClipPaths(parsed.children, diagnostics, inheritedRoot);
  const patterns = collectPatterns(parsed.children);
  const elements: IconElement[] = [];

  for (const child of parsed.children) {
    visit(child, inheritedRoot, undefined, elements, diagnostics, figmaGradients);
  }

  // A mask on the sole outer group must composite its children before masking.
  // Repeating it on each paint layer changes antialiased edge opacity.
  const bodyNodes = parsed.children.filter((node) => elementTags.has(node.name) || containers.has(node.name));
  const outerMask = bodyNodes.length === 1 && bodyNodes[0].name === 'g'
    ? bodyNodes[0].attributes.mask : undefined;
  const groupMask = outerMask && elements.every((element) => element.attributes.mask === outerMask)
    ? outerMask : undefined;
  if (groupMask) for (const element of elements) delete element.attributes.mask;

  return {
    ...(groupMask ? { groupMask } : {}),
    viewBox: resolveViewBox(parsed.attributes),
    elements,
    ...(gradients.length ? { gradients } : {}),
    ...(masks.length ? { masks } : {}),
    ...(clipPaths.length ? { clipPaths } : {}),
    ...(patterns.length ? { patterns } : {}),
    diagnostics,
  };
}


/** Inline local leaf geometry reused by optimized designer exports. */
function expandGeometryUses(parsed: ParsedSvg): ParsedSvg {
  const references = new Map<string, SvgNode>();
  const index = (node: SvgNode): void => {
    if (node.attributes.id) references.set(node.attributes.id, node);
    node.children.forEach(index);
  };
  parsed.children.forEach(index);
  const expand = (node: SvgNode): SvgNode => {
    if (node.name === 'use') {
      const reference = node.attributes.href ?? node.attributes['xlink:href'];
      const target = reference?.startsWith('#') ? references.get(reference.slice(1)) : undefined;
      // Embedded image patterns have their own resource model below.
      if (target && elementTags.has(target.name)) {
        const attributes = { ...node.attributes };
        delete attributes.href;
        delete attributes['xlink:href'];
        const translation = `translate(${attributes.x ?? '0'} ${attributes.y ?? '0'})`;
        if (attributes.x || attributes.y) attributes.transform = combineTransforms(attributes.transform, translation)!;
        delete attributes.x;
        delete attributes.y;
        const geometryAttributes = { ...target.attributes };
        delete geometryAttributes.id;
        return { name: 'g', attributes, children: [{ ...target, attributes: geometryAttributes }] };
      }
    }
    return { ...node, children: node.children.map(expand) };
  };
  return { ...parsed, children: parsed.children.map(expand) };
}

function visit(
  node: SvgNode,
  parentInherited: Record<string, string>,
  parentTransform: string | undefined,
  output: IconElement[],
  diagnostics: CompileDiagnostic[],
  figmaGradients: Map<SvgNode, IconGradient>,
): void {
  if (node.attributes['data-figma-skip-parse'] === 'true') return;
  if (node.name === 'defs' || node.name === 'mask' || node.name === 'clipPath' || ignored.has(node.name)) return;
  if (/^(?:script|iframe|object|embed)$/i.test(node.name)) {
    throw new Error(`Unsafe SVG element <${node.name}> is not allowed.`);
  }

  const own = sanitizeAttributes(node.attributes);
  const combinedTransform = combineTransforms(parentTransform, own.transform);
  const nextInherited = { ...parentInherited, ...inheritedAttributes(own) };

  if (elementTags.has(node.name)) {
    const attributes = { ...nextInherited, ...own };
    delete attributes.transform;
    if (combinedTransform) attributes.transform = combinedTransform;
    const figmaGradient = figmaGradients.get(node);
    if (figmaGradient) {
      delete attributes['data-figma-gradient-fill'];
      attributes.fill = `url(#${figmaGradient.id})`;
      diagnostics.push({
        code: 'figma-paint-normalized',
        element: node.name,
        message: 'Figma angular-gradient metadata was normalized to a structured paint resource.',
      });
    }
    output.push({ tag: node.name as IconElement['tag'], attributes });
    return;
  }

  if (!containers.has(node.name)) {
    diagnostics.push({
      code: 'unsupported-element-omitted',
      element: node.name,
      message: `Unsupported SVG element <${node.name}> was omitted from the normalized leaf model.`,
    });
    return;
  }
  for (const child of node.children) {
    visit(child, nextInherited, combinedTransform, output, diagnostics, figmaGradients);
  }
}

function collectGradients(nodes: SvgNode[]): IconGradient[] {
  const gradients: IconGradient[] = [];
  const walk = (node: SvgNode): void => {
    if (node.name === 'linearGradient' || node.name === 'radialGradient') {
      const attributes = sanitizeAttributes(node.attributes);
      const id = attributes.id;
      if (!id) throw new Error(`<${node.name}> must define an id.`);
      delete attributes.id;
      const stops = node.children.filter((child) => child.name === 'stop').map(normalizeStop);
      if (!stops.length) throw new Error(`Gradient #${id} must contain at least one stop.`);
      gradients.push({
        id,
        type: node.name === 'linearGradient' ? 'linear' : 'radial',
        attributes,
        stops,
      });
      return;
    }
    for (const child of node.children) walk(child);
  };
  for (const node of nodes) walk(node);
  return gradients;
}

function collectMasks(
  nodes: SvgNode[],
  diagnostics: CompileDiagnostic[],
  rootInherited: Record<string, string>,
): IconMask[] {
  const masks: IconMask[] = [];
  const walk = (node: SvgNode): void => {
    if (node.name === 'mask') {
      const attributes = sanitizeAttributes(node.attributes);
      const id = attributes.id;
      if (!id) throw new Error('<mask> must define an id.');
      delete attributes.id;
      const elements: IconElement[] = [];
      for (const child of node.children) visit(child, rootInherited, undefined, elements, diagnostics, new Map());
      if (!elements.length) throw new Error(`Mask #${id} must contain at least one supported SVG element.`);
      masks.push({ id, attributes, elements });
      return;
    }
    for (const child of node.children) walk(child);
  };
  for (const node of nodes) walk(node);
  return masks;
}

function collectClipPaths(
  nodes: SvgNode[],
  diagnostics: CompileDiagnostic[],
  rootInherited: Record<string, string>,
): IconClipPath[] {
  const clipPaths: IconClipPath[] = [];
  const walk = (node: SvgNode): void => {
    if (node.name === 'clipPath') {
      const attributes = sanitizeAttributes(node.attributes);
      const id = attributes.id;
      if (!id) throw new Error('<clipPath> must define an id.');
      delete attributes.id;
      const elements: IconElement[] = [];
      for (const child of node.children) visit(child, rootInherited, undefined, elements, diagnostics, new Map());
      if (!elements.length) throw new Error(`Clip path #${id} must contain at least one supported SVG element.`);
      clipPaths.push({ id, attributes, elements });
      return;
    }
    for (const child of node.children) walk(child);
  };
  for (const node of nodes) walk(node);
  return clipPaths;
}

function collectFigmaAngularGradients(nodes: SvgNode[], reservedIds: string[]): Map<SvgNode, IconGradient> {
  const result = new Map<SvgNode, IconGradient>();
  const ids = new Set(reservedIds);
  let index = 0;
  const walk = (node: SvgNode): void => {
    const encoded = node.attributes['data-figma-gradient-fill'];
    if (encoded) {
      const payload = parseFigmaGradient(encoded);
      let id: string;
      do id = `mgc-angular-${index++}`;
      while (ids.has(id));
      ids.add(id);
      result.set(node, {
        id,
        type: 'angular',
        attributes: {
          ...(typeof payload.opacity === 'number' ? { opacity: payload.opacity } : {}),
          ...(payload.blendMode ? { 'blend-mode': payload.blendMode } : {}),
          ...normalizeFigmaTransform(payload.transform),
        },
        stops: payload.stops.map((stop) => ({
          offset: stop.position,
          color: figmaColor(stop.color),
        })),
      });
    }
    for (const child of node.children) walk(child);
  };
  for (const node of nodes) walk(node);
  return result;
}

interface FigmaGradientPayload {
  type: string;
  stops: Array<{
    position: number;
    color: { r: number; g: number; b: number; a: number };
  }>;
  transform?: Record<string, number>;
  opacity?: number;
  blendMode?: string;
}

function parseFigmaGradient(value: string): FigmaGradientPayload {
  let payload: unknown;
  try {
    payload = JSON.parse(value);
  } catch {
    throw new Error('Figma gradient metadata is not valid JSON.');
  }
  const candidate = payload as Partial<FigmaGradientPayload>;
  if (candidate.type !== 'GRADIENT_ANGULAR' || !Array.isArray(candidate.stops) || !candidate.stops.length) {
    throw new Error('Unsupported Figma gradient metadata.');
  }
  for (const stop of candidate.stops) {
    if (!Number.isFinite(stop.position) || !stop.color ||
        ![stop.color.r, stop.color.g, stop.color.b, stop.color.a].every(Number.isFinite)) {
      throw new Error('Figma gradient contains an invalid stop.');
    }
  }
  return candidate as FigmaGradientPayload;
}

function normalizeFigmaTransform(transform: Record<string, number> | undefined): Record<string, number> {
  if (!transform) return {};
  return Object.fromEntries(
    Object.entries(transform)
      .filter(([, value]) => Number.isFinite(value))
      .map(([name, value]) => [`transform-${name}`, value]),
  );
}

function figmaColor(color: { r: number; g: number; b: number; a: number }): string {
  const channels = [color.r, color.g, color.b].map((value) => Math.round(clamp(value) * 255));
  const alpha = Number(clamp(color.a).toFixed(4));
  return alpha === 1
    ? `rgb(${channels.join(' ')})`
    : `rgb(${channels.join(' ')} / ${alpha})`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function collectPatterns(nodes: SvgNode[]): IconPattern[] {
  const allNodes: SvgNode[] = [];
  const gather = (node: SvgNode): void => {
    allNodes.push(node);
    for (const child of node.children) gather(child);
  };
  for (const node of nodes) gather(node);

  const images = new Map(
    allNodes
      .filter((node) => node.name === 'image' && node.attributes.id)
      .map((node) => [node.attributes.id, node]),
  );
  return allNodes.filter((node) => node.name === 'pattern').map((pattern) => {
    const attributes = sanitizeAttributes(pattern.attributes);
    const id = attributes.id;
    if (!id) throw new Error('<pattern> must define an id.');
    delete attributes.id;
    const use = pattern.children.find((child) => child.name === 'use');
    const reference = use?.attributes.href ?? use?.attributes['xlink:href'];
    const imageNode = reference?.startsWith('#') ? images.get(reference.slice(1)) : undefined;
    if (!imageNode) throw new Error(`Pattern #${id} must reference an embedded image.`);
    const dataUrl = imageNode.attributes.href ?? imageNode.attributes['xlink:href'];
    const dataMatch = dataUrl?.match(/^data:(image\/(?:gif|jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/);
    if (!dataMatch) throw new Error(`Pattern #${id} contains an unsupported image source.`);
    const imageAttributes = sanitizeEmbeddedImageAttributes(imageNode.attributes);
    return {
      id,
      attributes,
      image: {
        mimeType: dataMatch[1] as IconPattern['image']['mimeType'],
        data: dataMatch[2].replace(/\s+/g, ''),
        attributes: imageAttributes,
        ...(use?.attributes.transform ? { transform: use.attributes.transform } : {}),
      },
    };
  });
}

function sanitizeEmbeddedImageAttributes(attributes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (['id', 'href', 'xlink:href'].includes(name)) continue;
    if (/^on/i.test(name)) throw new Error(`Unsafe SVG image attribute ${name} is not allowed.`);
    result[name] = value;
  }
  return result;
}

function normalizeStop(node: SvgNode): IconGradientStop {
  const attributes = sanitizeAttributes(node.attributes);
  const style = parseStyle(node.attributes.style);
  const offset = attributes.offset ?? '0';
  const color = attributes['stop-color'] ?? style['stop-color'] ?? 'currentColor';
  const opacity = attributes['stop-opacity'] ?? style['stop-opacity'];
  return { offset, color, ...(opacity === undefined ? {} : { opacity }) };
}

function sanitizeAttributes(attributes: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [rawName, rawValue] of Object.entries(attributes)) {
    const name = rawName === 'className' ? 'class' : rawName;
    if (blockedAttributes.test(name)) {
      if (/^(?:href|xlink:href)$/i.test(name) && rawValue.startsWith('#')) continue;
      throw new Error(`Unsafe SVG attribute ${name} is not allowed.`);
    }
    if (name === 'style') {
      Object.assign(result, parseStyle(rawValue));
      continue;
    }
    if (name.startsWith('data-')) continue;
    result[name] = rawValue;
  }
  return result;
}

function parseStyle(value: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!value) return result;
  for (const declaration of value.split(';')) {
    const separator = declaration.indexOf(':');
    if (separator < 0) continue;
    const name = declaration.slice(0, separator).trim().toLowerCase();
    const styleValue = declaration.slice(separator + 1).trim();
    if (presentationStyleKeys.has(name) && styleValue) result[name] = styleValue;
  }
  return result;
}

function inheritedAttributes(attributes: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(attributes).filter(([name]) => inherited.has(name)));
}

function combineTransforms(parent: string | undefined, own: string | undefined): string | undefined {
  return [parent, own].filter(Boolean).join(' ') || undefined;
}

function resolveViewBox(attributes: Record<string, string>): string {
  if (attributes.viewBox?.trim()) return attributes.viewBox.trim().replace(/\s+/g, ' ');
  const width = parseDimension(attributes.width);
  const height = parseDimension(attributes.height);
  if (width && height) return `0 0 ${width} ${height}`;
  throw new Error('SVG must define viewBox or numeric width and height attributes.');
}

function parseDimension(value: string | undefined): string | undefined {
  const match = value?.trim().match(/^([0-9]+(?:\.[0-9]+)?)(?:px)?$/);
  return match?.[1];
}
