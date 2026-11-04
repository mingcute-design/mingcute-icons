import { createElement, forwardRef, useId, type ElementType, type ReactNode } from 'react';
import {
  Circle, ClipPath, Defs, Ellipse, G, Image as SvgImage, Line, LinearGradient,
  Mask, Path, Pattern, Polygon, Polyline, RadialGradient, Rect, Stop,
  Svg,
} from 'react-native-svg';
import type { IconDefinition, IconElement, IconGradient, IconPattern } from '@mingcute/icons';
import { Icon } from './Icon.js';
import type { IconProps } from './types.js';

const ANGULAR_COORDINATE_SCALE = 2000;
const ANGULAR_RADIUS = 3000;
const ANGULAR_SEGMENTS = 96;
const THEME_PAINTS = new Set(['#10161f', '#363f4d', 'rgb(16 22 31)', 'rgb(54 63 77)', 'currentcolor']);
const elements: Record<IconElement['tag'], ElementType> = {
  path: Path, circle: Circle, rect: Rect, line: Line, polyline: Polyline, polygon: Polygon, ellipse: Ellipse,
};

interface PaintOptions { preserveColors: boolean; primary: string; secondary: string; secondaryOpacity: number; }

export function createIcon(definition: IconDefinition, displayName: string) {
  const Component = forwardRef<Svg, IconProps>(function MingcuteNativeIcon(props, ref) {
    const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const primary = props.primaryColor ?? props.color ?? 'currentColor';
    const paint: PaintOptions = {
      preserveColors: definition.name.endsWith('_original'),
      primary,
      secondary: props.secondaryColor ?? primary,
      secondaryOpacity: props.secondaryOpacity ?? 0.3,
    };
    const children = renderDefinition(definition, `mgc-${displayName}-${instanceId}`, paint);
    return createElement(Icon, { ...props, viewBox: props.viewBox ?? definition.viewBox, ref }, ...children);
  });
  Component.displayName = displayName;
  return Component;
}

function renderDefinition(definition: IconDefinition, prefix: string, paint: PaintOptions): ReactNode[] {
  const angularGradients = new Map(
    (definition.gradients ?? []).filter(({ type }) => type === 'angular').map((gradient) => [gradient.id, gradient]),
  );
  const angularElements = definition.elements.flatMap((element, index) => {
    const gradient = referencedAngularGradient(element, angularGradients);
    return gradient ? [{ element, gradient, index }] : [];
  });
  const angularElementsByIndex = new Map(angularElements.map((entry) => [entry.index, entry]));
  const resources: ReactNode[] = [
    ...(definition.gradients ?? []).filter(({ type }) => type !== 'angular').map((gradient) => renderGradient(gradient, prefix, paint)),
    ...(definition.masks ?? []).map((mask) => createElement(Mask,
      { key: `mask-${mask.id}`, id: scopedId(prefix, mask.id), ...nativeAttributes(mask.attributes, prefix, paint) },
      ...mask.elements.map((element, index) => renderElement(element, prefix, paint, `mask-${mask.id}-${index}`)))),
    ...(definition.clipPaths ?? []).map((clip) => createElement(ClipPath,
      { key: `clip-${clip.id}`, id: scopedId(prefix, clip.id), ...nativeAttributes(clip.attributes, prefix, paint) },
      ...clip.elements.map((element, index) => renderElement(element, prefix, paint, `clip-${clip.id}-${index}`)))),
    ...(definition.patterns ?? []).map((pattern) => renderPattern(pattern, prefix, paint)),
    ...angularElements.map(({ element, gradient, index }) => createElement(ClipPath,
      { key: `angular-clip-${index}`, id: scopedId(prefix, angularClipId(gradient.id, index)) },
      renderClipElement(element, prefix, paint, `angular-shape-${index}`))),
  ];
  const rendered: ReactNode[] = [];
  if (resources.length) rendered.push(createElement(Defs, { key: 'defs' }, ...resources));
  const body: ReactNode[] = definition.elements.map((element, index) => {
    const angular = angularElementsByIndex.get(index);
    return angular
      ? renderAngular(angular.element, angular.gradient, angular.index, prefix, paint)
      : renderElement(element, prefix, paint, `element-${index}`);
  });
  rendered.push(...(definition.groupMask ? [createElement(G, { key: 'masked-body', mask: String(scopeReferences(definition.groupMask, prefix)) }, ...body)] : body));
  return rendered;
}

function renderGradient(gradient: IconGradient, prefix: string, paint: PaintOptions): ReactNode {
  const Component: ElementType = gradient.type === 'linear' ? LinearGradient : RadialGradient;
  return createElement(Component,
    { key: `gradient-${gradient.id}`, id: scopedId(prefix, gradient.id), ...nativeAttributes(gradient.attributes, prefix, paint) },
    ...gradient.stops.map((stop, index) => createElement(Stop, {
      key: `stop-${index}`, offset: stop.offset, stopColor: paint.preserveColors ? stop.color : themedGradientColor(stop.color, paint.primary),
      ...(stop.opacity === undefined ? {} : { stopOpacity: stop.opacity }),
    })));
}

function renderPattern(pattern: IconPattern, prefix: string, paint: PaintOptions): ReactNode {
  return createElement(Pattern,
    { key: `pattern-${pattern.id}`, id: scopedId(prefix, pattern.id), ...nativeAttributes(pattern.attributes, prefix, paint) },
    createElement(SvgImage, {
      ...nativeAttributes(pattern.image.attributes, prefix, paint),
      ...(pattern.image.transform ? { transform: pattern.image.transform } : {}),
      href: `data:${pattern.image.mimeType};base64,${pattern.image.data}`,
    }));
}

function renderAngular(element: IconElement, gradient: IconGradient, index: number, prefix: string, paint: PaintOptions): ReactNode {
  const clipPath = `url(#${scopedId(prefix, angularClipId(gradient.id, index))})`;
  const wedges = Array.from({ length: ANGULAR_SEGMENTS }, (_, segment) => {
    const start = segment / ANGULAR_SEGMENTS;
    const end = (segment + 1.02) / ANGULAR_SEGMENTS;
    const a1 = start * Math.PI * 2;
    const a2 = end * Math.PI * 2;
    const d = `M0 0 L${formatNumber(Math.cos(a1) * ANGULAR_RADIUS)} ${formatNumber(Math.sin(a1) * ANGULAR_RADIUS)} A${ANGULAR_RADIUS} ${ANGULAR_RADIUS} 0 0 1 ${formatNumber(Math.cos(a2) * ANGULAR_RADIUS)} ${formatNumber(Math.sin(a2) * ANGULAR_RADIUS)} Z`;
    const wedgePaint = angularPaint(gradient, (start + end) / 2, paint.primary);
    return createElement(Path, { key: `wedge-${segment}`, d, fill: wedgePaint.color, fillOpacity: wedgePaint.opacity });
  });
  return createElement(G, {
    key: `angular-${index}`, clipPath,
    ...effectAttributes(element.attributes, prefix, paint),
  }, createElement(G, { transform: angularTransform(gradient) }, ...wedges));
}

function renderElement(element: IconElement, prefix: string, paint: PaintOptions, key: string): ReactNode {
  return createElement(elements[element.tag], { key, ...nativeAttributes(element.attributes, prefix, paint) });
}

function renderClipElement(element: IconElement, prefix: string, paint: PaintOptions, key: string): ReactNode {
  const geometry = Object.fromEntries(Object.entries(element.attributes).filter(([name]) =>
    !['fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'opacity', 'mask', 'clip-path'].includes(name)));
  return createElement(elements[element.tag], { key, ...nativeAttributes(geometry, prefix, paint) });
}

function nativeAttributes(attributes: Record<string, string | number>, prefix: string, paint: PaintOptions): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const secondary = isSecondary(attributes);
  for (const [name, rawValue] of Object.entries(attributes)) {
    if (name === 'mask-type') continue;
    let value: string | number = scopeReferences(rawValue, prefix);
    if ((name === 'fill' || name === 'stroke') && typeof value === 'string' && !paint.preserveColors && isThemePaint(value)) {
      value = secondary ? paint.secondary : paint.primary;
    }
    if (name === 'opacity' && secondary) value = paint.secondaryOpacity;
    result[camelCase(name)] = value;
  }
  return result;
}

function effectAttributes(attributes: Record<string, string | number>, prefix: string, paint: PaintOptions): Record<string, unknown> {
  return nativeAttributes(Object.fromEntries(Object.entries(attributes).filter(([name]) => ['mask', 'clip-path'].includes(name))), prefix, paint);
}

function isSecondary(attributes: Record<string, string | number>): boolean {
  return ['opacity', 'fill-opacity', 'stroke-opacity'].some((name) => {
    const value = Number(attributes[name]); return Number.isFinite(value) && value < 1;
  });
}

function isThemePaint(value: string): boolean { return THEME_PAINTS.has(value.toLowerCase().trim()); }
function camelCase(name: string): string { return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()); }
function scopeReferences(value: string | number, prefix: string): string | number {
  return typeof value === 'string' ? value.replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${scopedId(prefix, id)})`) : value;
}
function referencedAngularGradient(element: IconElement, gradients: Map<string, IconGradient>): IconGradient | undefined {
  for (const value of Object.values(element.attributes)) {
    const match = String(value).match(/^url\(#([^)]+)\)$/); if (match && gradients.has(match[1])) return gradients.get(match[1]);
  }
  return undefined;
}
function angularTransform(gradient: IconGradient): string {
  const value = (name: string) => Number(gradient.attributes[`transform-${name}`]);
  const [m00, m01, m02, m10, m11, m12] = ['m00', 'm01', 'm02', 'm10', 'm11', 'm12'].map(value);
  if ([m00, m01, m02, m10, m11, m12].every(Number.isFinite)) {
    const centerX = m02 + (m00 + m01) / 2; const centerY = m12 + (m10 + m11) / 2;
    return `matrix(${formatNumber(m00 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m10 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m01 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m11 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(centerX)} ${formatNumber(centerY)})`;
  }
  return 'translate(12 12) scale(0.006 0.006)';
}
function angularColor(gradient: IconGradient, offset: number, primary: string): string {
  const stops = gradient.stops.map((stop) => ({ offset: Number(stop.offset), color: parseColor(stop.color, primary) })).sort((a, b) => a.offset - b.offset);
  const right = stops.findIndex((stop) => stop.offset >= offset);
  if (right <= 0) return rgba(stops[0]?.color ?? [16, 22, 31, 1]);
  if (right < 0) return rgba(stops.at(-1)?.color ?? [16, 22, 31, 1]);
  const left = stops[right - 1]; const next = stops[right]; const span = next.offset - left.offset;
  const ratio = span === 0 ? 0 : (offset - left.offset) / span;
  return rgba(left.color.map((channel, index) => channel + (next.color[index] - channel) * ratio) as Color);
}
function angularPaint(gradient: IconGradient, offset: number, primary: string): { color: string; opacity: number } {
  if (gradient.stops.every((stop) => /^rgb\(\s*16\s+22\s+31(?:\s*\/\s*[\d.]+)?\s*\)$/i.test(stop.color))) {
    const opacityStops = gradient.stops.map((stop) => {
      const alpha = stop.color.match(/\/\s*([\d.]+)\s*\)$/)?.[1];
      return { offset: Number(stop.offset), opacity: Number(alpha ?? 1) };
    }).sort((a, b) => a.offset - b.offset);
    const right = opacityStops.findIndex((stop) => stop.offset >= offset);
    if (right <= 0) return { color: primary, opacity: opacityStops[0]?.opacity ?? 1 };
    if (right < 0) return { color: primary, opacity: opacityStops.at(-1)?.opacity ?? 1 };
    const left = opacityStops[right - 1]; const next = opacityStops[right];
    const ratio = next.offset === left.offset ? 0 : (offset - left.offset) / (next.offset - left.offset);
    return { color: primary, opacity: left.opacity + (next.opacity - left.opacity) * ratio };
  }
  return { color: angularColor(gradient, offset, primary), opacity: 1 };
}
type Color = [number, number, number, number];
function parseColor(value: string, primary: string): Color {
  const rgb = value.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*([\d.]+))?\s*\)$/i);
  const original: Color = rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4] ?? 1)] : hexColor(value) ?? [16, 22, 31, 1];
  if (original[0] === 16 && original[1] === 22 && original[2] === 31) {
    const themed = hexColor(primary); if (themed) return [themed[0], themed[1], themed[2], original[3] * themed[3]];
  }
  return original;
}
function hexColor(value: string): Color | undefined {
  const match = value.match(/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i); if (!match) return undefined;
  let hex = match[1]; if (hex.length === 3) hex = [...hex].map((part) => part + part).join('');
  const alpha = hex.length === 8 ? parseInt(hex.slice(6), 16) / 255 : 1;
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16), alpha];
}
function rgba(color: Color): string { return `rgba(${color[0].toFixed(0)},${color[1].toFixed(0)},${color[2].toFixed(0)},${formatNumber(color[3])})`; }
function themedGradientColor(value: string, primary: string): string {
  const parsed = parseColor(value, primary); return rgba(parsed);
}
function angularClipId(id: string, index: number): string { return `${id}-clip-${index}`; }
function scopedId(prefix: string, id: string): string { return `${prefix}-${id}`; }
function formatNumber(value: number): string { return Number(value.toFixed(6)).toString(); }
