import paper from 'paper';
import { PaperOffset, type OffsetOptions } from 'paperjs-offset';
import svgpath from 'svgpath';
import type { IconDefinition, IconElement } from '@mingcute/core';

// Keep the metrics used by the established Mingcute webfont build. Mapping the
// 24px source viewBox directly onto a 300-unit em avoids shrinking the artwork
// a second time; the SVGs already contain their intended optical padding.
const UNITS_PER_EM = 300;
const ASCENT = 300;
const DESCENT = 0;

paper.setup(new paper.Size(24, 24));

export interface FontMetrics {
  unitsPerEm: number;
  ascent: number;
  descent: number;
  advanceWidth: number;
}

export const fontMetrics: FontMetrics = Object.freeze({
  unitsPerEm: UNITS_PER_EM,
  ascent: ASCENT,
  descent: DESCENT,
  advanceWidth: UNITS_PER_EM,
});

export const glyphBuildStats = { expandedStrokes: 0, sampledStrokeFallbacks: 0 };

export type GlyphLayer = 'all' | 'primary' | 'secondary';

export function definitionToOutlineDefinition(definition: IconDefinition): IconDefinition {
  const elements: IconElement[] = [];
  for (const element of definition.elements) {
    const pathData = elementToPath(element);
    const fillOpacity = paintedOpacity(element.attributes.fill, element.attributes['fill-opacity'], element.attributes.opacity);
    if (fillOpacity > 0) {
      elements.push({ tag: 'path', attributes: {
        ...outlineAttributes(element.attributes), fill: 'currentColor',
        d: element.attributes['fill-rule'] === 'evenodd' ? normalizeFillPath(pathData, element.attributes['fill-rule']) : pathData,
      } });
    }
    const strokeOpacity = paintedOpacity(element.attributes.stroke, element.attributes['stroke-opacity'], element.attributes.opacity);
    if (strokeOpacity > 0) {
      elements.push({ tag: 'path', attributes: { ...outlineAttributes(element.attributes), fill: 'currentColor', d: expandStroke(pathData, element) } });
    }
  }
  return { ...definition, elements, gradients: undefined, masks: undefined, clipPaths: undefined, patterns: undefined };
}

export function definitionToGlyphPath(definition: IconDefinition, layer: GlyphLayer = 'all'): string {
  const paths: string[] = [];
  const outlined = definitionToOutlineDefinition(definition);
  try {
    for (const element of outlined.elements) {
      try {
        const pathData = String(element.attributes.d);
        const fillOpacity = paintedOpacity(element.attributes.fill, element.attributes['fill-opacity'], element.attributes.opacity);
        if (belongsToLayer(fillOpacity, layer)) {
          paths.push(pathData);
        }
      } catch (cause) {
        const reason = cause instanceof Error ? cause.message : String(cause);
        throw new Error(`Unable to create font outline for ${definition.name}/${definition.style} ${element.tag}: ${reason}`);
      }
    }
    if (!paths.length && layer === 'all') throw new Error(`Font glyph ${definition.name}/${definition.style} has no visible geometry.`);
    const transform = glyphTransform(definition.viewBox);
    return paths.map((pathData) => svgpath(pathData)
      .scale(transform.scale, -transform.scale)
      .translate(transform.translateX, transform.translateY)
      .round(2)
      .toString()).join('');
  } finally {
    paper.project.activeLayer.removeChildren();
  }
}

function outlineAttributes(attributes: IconElement['attributes']): Record<string, string | number> {
  const output: Record<string, string | number> = {};
  for (const key of ['opacity', 'fill-opacity', 'stroke-opacity', 'fill-rule', 'clip-rule']) {
    if (attributes[key] !== undefined) output[key] = attributes[key];
  }
  return output;
}

function paintedOpacity(
  value: string | number | undefined,
  paintOpacity: string | number | undefined,
  elementOpacity: string | number | undefined,
): number {
  if (value === undefined || String(value).toLowerCase() === 'none') return 0;
  const opacity = numeric(paintOpacity, 1) * numeric(elementOpacity, 1);
  return opacity > 0.01 ? opacity : 0;
}

function belongsToLayer(opacity: number, layer: GlyphLayer): boolean {
  if (opacity <= 0) return false;
  if (layer === 'all') return true;
  if (layer === 'primary') return opacity >= 0.99;
  return opacity < 0.99;
}

function normalizeFillPath(pathData: string, fillRule: string | number | undefined): string {
  if (fillRule !== 'evenodd') return pathData;
  const item = paper.PathItem.create(pathData);
  try {
    // Interpret the source as even-odd before assigning nonzero font winding.
    item.reorient(false, true);
    return item.pathData;
  } finally {
    item.remove();
  }
}

function expandStroke(pathData: string, element: IconElement): string {
  const width = numeric(element.attributes['stroke-width'], 1);
  if (!(width > 0)) throw new Error('Stroke width must be positive when creating a font glyph.');
  const item = paper.PathItem.create(pathData);
  const roundCap = element.attributes['stroke-linecap'] === 'round';
  const options: OffsetOptions = {
    cap: roundCap ? 'round' : 'butt',
    join: strokeJoin(element.attributes['stroke-linejoin']),
    insert: false,
  };
  try {
    const minimumLength = Math.max(1e-7, width * 0.01);
    const dots = removeDegenerateSubpaths(item, width / 2, minimumLength);
    if (!hasDrawableSegments(item, minimumLength)) return dots;
    const sourcePaths: paper.Path[] = item instanceof paper.CompoundPath ? [...item.children] as paper.Path[] : [item];
    const outlines = sourcePaths.filter((path) => path.length > minimumLength && path.segments.length > 1).map((path) => {
      let outline: paper.Path | paper.CompoundPath | undefined;
      try {
        outline = PaperOffset.offsetStroke(path, width / 2, options);
        if (!outline?.pathData) throw new Error('Stroke expansion returned empty geometry.');
        if (hasDegenerateSegments(outline)) throw new Error('Stroke expansion returned degenerate geometry.');
        glyphBuildStats.expandedStrokes += 1;
        return outline.pathData;
      } catch {
        glyphBuildStats.sampledStrokeFallbacks += 1;
        return sampleStroke(path, width);
      } finally {
        outline?.remove();
      }
    });
    return `${dots}${outlines.join('')}`;
  } finally {
    item.remove();
  }
}

function hasDegenerateSegments(item: paper.Path | paper.CompoundPath): boolean {
  const paths: paper.Path[] = item instanceof paper.CompoundPath ? [...item.children] as paper.Path[] : [item];
  return paths.some((path) => path.segments.some((segment, index) =>
    index > 0 && segment.point.getDistance(path.segments[index - 1].point) < 1e-8));
}

function sampleStroke(path: paper.Path, width: number): string {
  const radius = width / 2;
  const spacing = Math.max(width * 0.4, 0.2);
  const steps = Math.max(1, Math.ceil(path.length / spacing));
  const circles: string[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const point = path.getPointAt(path.length * index / steps);
    if (point) circles.push(ellipsePath(point.x, point.y, radius, radius));
  }
  if (!circles.length) throw new Error('Unable to sample fallback stroke geometry.');
  return circles.join('');
}

function removeDegenerateSubpaths(item: paper.Path | paper.CompoundPath, dotRadius: number, minimumLength: number): string {
  const paths: paper.Path[] = item instanceof paper.CompoundPath ? [...item.children] as paper.Path[] : [item];
  const dots: string[] = [];
  for (const path of paths) {
    if (path.length > minimumLength && path.segments.length > 1) continue;
    const point = path.firstSegment?.point;
    if (dotRadius > 0 && point) dots.push(ellipsePath(point.x, point.y, dotRadius, dotRadius));
    if (path !== item) path.remove();
  }
  return dots.join('');
}

function hasDrawableSegments(item: paper.Path | paper.CompoundPath, minimumLength: number): boolean {
  if (item instanceof paper.CompoundPath) return (item.children as paper.Path[]).some((path) => path.length > minimumLength && path.segments.length > 1);
  return item.length > minimumLength && item.segments.length > 1;
}

function strokeJoin(value: string | number | undefined): NonNullable<OffsetOptions['join']> {
  return value === 'round' || value === 'bevel' ? value : 'miter';
}

function elementToPath(element: IconElement): string {
  const attributes = element.attributes;
  switch (element.tag) {
    case 'path': {
      const pathData = attributes.d;
      if (typeof pathData !== 'string' || !pathData) throw new Error('Path element is missing d data.');
      return pathData;
    }
    case 'circle': {
      const cx = numeric(attributes.cx); const cy = numeric(attributes.cy); const r = numeric(attributes.r);
      return ellipsePath(cx, cy, r, r);
    }
    case 'ellipse':
      return ellipsePath(numeric(attributes.cx), numeric(attributes.cy), numeric(attributes.rx), numeric(attributes.ry));
    case 'rect':
      return rectPath(attributes);
    case 'line':
      return `M${numeric(attributes.x1)} ${numeric(attributes.y1)}L${numeric(attributes.x2)} ${numeric(attributes.y2)}`;
    case 'polyline':
    case 'polygon': {
      const points = String(attributes.points ?? '').trim();
      if (!points) throw new Error(`${element.tag} element is missing points.`);
      return `M${points}${element.tag === 'polygon' ? 'Z' : ''}`;
    }
  }
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  if (!(rx > 0) || !(ry > 0)) throw new Error('Ellipse radii must be positive.');
  return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0Z`;
}

function rectPath(attributes: IconElement['attributes']): string {
  const x = numeric(attributes.x); const y = numeric(attributes.y);
  const width = numeric(attributes.width); const height = numeric(attributes.height);
  let rx = numeric(attributes.rx, numeric(attributes.ry, 0));
  let ry = numeric(attributes.ry, rx);
  rx = Math.min(Math.max(rx, 0), width / 2); ry = Math.min(Math.max(ry, 0), height / 2);
  if (!rx && !ry) return `M${x} ${y}H${x + width}V${y + height}H${x}Z`;
  return `M${x + rx} ${y}H${x + width - rx}A${rx} ${ry} 0 0 1 ${x + width} ${y + ry}` +
    `V${y + height - ry}A${rx} ${ry} 0 0 1 ${x + width - rx} ${y + height}` +
    `H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + height - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
}

function numeric(value: string | number | undefined, fallback?: number): number {
  if (value === undefined && fallback !== undefined) return fallback;
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(parsed)) throw new Error(`Expected a finite SVG number, received ${String(value)}.`);
  return parsed;
}

function glyphTransform(viewBox: string): { scale: number; translateX: number; translateY: number } {
  const values = viewBox.trim().split(/[ ,]+/).map(Number);
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) throw new Error(`Invalid icon viewBox: ${viewBox}`);
  const [minX, minY, width, height] = values;
  const scale = Math.min(UNITS_PER_EM / width, UNITS_PER_EM / height);
  const translateX = (UNITS_PER_EM - width * scale) / 2 - minX * scale;
  const verticalCenter = (ASCENT + DESCENT) / 2;
  const top = verticalCenter + height * scale / 2;
  const translateY = top + minY * scale;
  return { scale, translateX, translateY };
}
