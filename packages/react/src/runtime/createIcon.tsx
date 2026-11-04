import { createElement, forwardRef, useId, type ReactNode } from 'react';
import type {
  IconDefinition,
  IconElement,
  IconGradient,
  IconPattern,
} from '@mingcute/icons';
import { Icon } from './Icon.js';
import type { IconProps } from './types.js';

const ANGULAR_COORDINATE_SCALE = 2000;
const ANGULAR_CANVAS_SIZE = 4000;

export function createIcon(definition: IconDefinition, displayName: string) {
  const Component = forwardRef<SVGSVGElement, IconProps>(function MingcuteIcon(props, ref) {
    const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const idPrefix = `mgc-${displayName}-${instanceId}`;
    const children = renderDefinition(definition, idPrefix);
    return createElement(Icon, { viewBox: definition.viewBox, ...props, ref }, ...children);
  });
  Component.displayName = displayName;
  return Component;
}

function renderDefinition(definition: IconDefinition, prefix: string): ReactNode[] {
  const angularGradients = new Map(
    (definition.gradients ?? []).filter(({ type }) => type === 'angular').map((gradient) => [gradient.id, gradient]),
  );
  const angularElements = definition.elements.flatMap((element, index) => {
    const gradient = referencedAngularGradient(element, angularGradients);
    return gradient ? [{ element, gradient, index }] : [];
  });
  const angularElementsByIndex = new Map(angularElements.map((entry) => [entry.index, entry]));
  const resources: ReactNode[] = [
    ...(definition.gradients ?? []).filter(({ type }) => type !== 'angular').map((gradient) => renderNativeGradient(gradient, prefix)),
    ...(definition.masks ?? []).map((mask) => createElement(
      'mask',
      { key: `mask-${mask.id}`, id: scopedId(prefix, mask.id), ...reactAttributes(mask.attributes, prefix, true) },
      ...mask.elements.map((element, index) => renderElement(element, prefix, `mask-${mask.id}-${index}`)),
    )),
    ...(definition.clipPaths ?? []).map((clipPath) => createElement(
      'clipPath',
      { key: `clip-${clipPath.id}`, id: scopedId(prefix, clipPath.id), ...reactAttributes(clipPath.attributes, prefix) },
      ...clipPath.elements.map((element, index) => renderElement(element, prefix, `clip-${clipPath.id}-${index}`)),
    )),
    ...(definition.patterns ?? []).map((pattern) => renderPattern(pattern, prefix)),
    ...angularElements.map(({ element, gradient, index }) => createElement(
      'clipPath',
      { key: `angular-clip-${index}`, id: scopedId(prefix, angularClipId(gradient.id, index)) },
      renderClipElement(element, prefix, `angular-clip-shape-${index}`),
    )),
  ];

  const rendered: ReactNode[] = [];
  if (resources.length) rendered.push(createElement('defs', { key: 'defs' }, ...resources));
  const body: ReactNode[] = definition.elements.map((element, index) => {
    const angular = angularElementsByIndex.get(index);
    return angular
      ? renderAngularElement(angular.element, angular.gradient, angular.index, definition.viewBox, prefix)
      : renderElement(element, prefix, `element-${index}`);
  });
  rendered.push(...(definition.groupMask ? [createElement('g', { key: 'masked-body', mask: reactAttributes({ mask: definition.groupMask }, prefix).mask }, ...body)] : body));
  return rendered;
}

function renderNativeGradient(gradient: IconGradient, prefix: string): ReactNode {
  const tag = gradient.type === 'linear' ? 'linearGradient' : 'radialGradient';
  return createElement(
    tag,
    { key: `gradient-${gradient.id}`, id: scopedId(prefix, gradient.id), ...reactAttributes(gradient.attributes, prefix) },
    ...gradient.stops.map((stop, index) => createElement('stop', {
      key: `stop-${index}`,
      offset: stop.offset,
      stopColor: stop.color,
      ...(stop.opacity === undefined ? {} : { stopOpacity: stop.opacity }),
    })),
  );
}

function renderPattern(pattern: IconPattern, prefix: string): ReactNode {
  const image = pattern.image;
  return createElement(
    'pattern',
    { key: `pattern-${pattern.id}`, id: scopedId(prefix, pattern.id), ...reactAttributes(pattern.attributes, prefix) },
    createElement('image', {
      ...reactAttributes(image.attributes, prefix),
      ...(image.transform ? { transform: image.transform } : {}),
      href: `data:${image.mimeType};base64,${image.data}`,
    }),
  );
}

function renderAngularElement(
  element: IconElement,
  gradient: IconGradient,
  index: number,
  viewBox: string,
  prefix: string,
): ReactNode {
  const cssStops = gradient.stops.map((stop) =>
    `${angularCssColor(stop.color, stop.opacity)} ${formatNumber(Number(stop.offset) * 360)}deg`).join(',');
  const clipId = scopedId(prefix, angularClipId(gradient.id, index));
  return createElement(
    'g',
    {
      key: `angular-${index}`,
      clipPath: `url(#${clipId})`,
      'data-mingcute-angular-gradient': gradient.id,
      ...effectAttributes(element.attributes, prefix),
    },
    createElement(
      'foreignObject',
      {
        width: ANGULAR_CANVAS_SIZE,
        height: ANGULAR_CANVAS_SIZE,
        x: -ANGULAR_CANVAS_SIZE / 2,
        y: -ANGULAR_CANVAS_SIZE / 2,
        transform: angularTransform(gradient, viewBox),
      },
      createElement('div', {
        xmlns: 'http://www.w3.org/1999/xhtml',
        style: {
          color: 'inherit',
          background: `conic-gradient(from 90deg,${cssStops})`,
          height: '100%',
          width: '100%',
          opacity: gradient.attributes.opacity ?? 1,
        },
      }),
    ),
  );
}

function angularCssColor(color: string, opacity: string | number | undefined): string {
  const canonical = color.match(/^rgb\(\s*16\s+22\s+31(?:\s*\/\s*([\d.]+))?\s*\)$/i);
  if (!canonical) return color;
  const alpha = Number(canonical[1] ?? opacity ?? 1);
  if (alpha >= 1) return 'currentColor';
  if (alpha <= 0) return 'transparent';
  return `color-mix(in srgb,currentColor ${formatNumber(alpha * 100)}%,transparent)`;
}

function renderElement(element: IconElement, prefix: string, key: string): ReactNode {
  return createElement(element.tag, { key, ...reactAttributes(element.attributes, prefix) });
}

function renderClipElement(element: IconElement, prefix: string, key: string): ReactNode {
  const geometry = Object.fromEntries(Object.entries(element.attributes).filter(([name]) =>
    !['fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'opacity', 'mask', 'clip-path'].includes(name)));
  return createElement(element.tag, { key, ...reactAttributes(geometry, prefix) });
}

function reactAttributes(
  attributes: Record<string, string | number>,
  prefix: string,
  mask = false,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attributes)) {
    if (mask && name === 'mask-type') {
      result.style = { ...(result.style as object | undefined), maskType: value };
      continue;
    }
    result[reactAttributeName(name)] = scopeReferences(value, prefix);
  }
  return result;
}

function reactAttributeName(name: string): string {
  if (name.startsWith('aria-') || name.startsWith('data-')) return name;
  if (name === 'class') return 'className';
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function scopeReferences(value: string | number, prefix: string): string | number {
  return typeof value === 'string'
    ? value.replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${scopedId(prefix, id)})`)
    : value;
}

function effectAttributes(attributes: Record<string, string | number>, prefix: string): Record<string, unknown> {
  return reactAttributes(
    Object.fromEntries(Object.entries(attributes).filter(([name]) => ['mask', 'clip-path'].includes(name))),
    prefix,
  );
}

function referencedAngularGradient(element: IconElement, gradients: Map<string, IconGradient>): IconGradient | undefined {
  for (const value of Object.values(element.attributes)) {
    const match = String(value).match(/^url\(#([^)]+)\)$/);
    if (match && gradients.has(match[1])) return gradients.get(match[1]);
  }
  return undefined;
}

function angularTransform(gradient: IconGradient, viewBox: string): string {
  const value = (name: string) => Number(gradient.attributes[`transform-${name}`]);
  const [minX, minY, width, height] = viewBox.split(/\s+/).map(Number);
  const m00 = value('m00');
  const m01 = value('m01');
  const m02 = value('m02');
  const m10 = value('m10');
  const m11 = value('m11');
  const m12 = value('m12');
  if ([m00, m01, m02, m10, m11, m12].every(Number.isFinite)) {
    const centerX = m02 + (m00 + m01) / 2;
    const centerY = m12 + (m10 + m11) / 2;
    return `matrix(${formatNumber(m00 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m10 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m01 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m11 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(centerX)} ${formatNumber(centerY)})`;
  }
  return `translate(${formatNumber(minX + width / 2)} ${formatNumber(minY + height / 2)}) scale(${formatNumber(width / ANGULAR_CANVAS_SIZE)} ${formatNumber(height / ANGULAR_CANVAS_SIZE)})`;
}

function angularClipId(gradientId: string, index: number): string {
  return `${gradientId}-clip-${index}`;
}

function scopedId(prefix: string, id: string): string {
  return `${prefix}-${id}`;
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}
