import { h, type FunctionalComponent, type VNodeChild } from 'vue';
import type { IconDefinition, IconElement, IconGradient, IconPattern } from '@mingcute/icons';
import { Icon, iconPropOptions } from './Icon.js';
import { useStableIconId } from './ids.js';
import type { IconProps } from './types.js';

const ANGULAR_COORDINATE_SCALE = 2000;
const ANGULAR_CANVAS_SIZE = 4000;

export function createIcon(definition: IconDefinition, displayName: string): FunctionalComponent<IconProps> {
  const Component: FunctionalComponent<IconProps> = (props, { attrs }) => {
    const instanceId = useStableIconId().replace(/[^a-zA-Z0-9_-]/g, '');
    const idPrefix = `mgc-${displayName}-${instanceId}`;
    return h(Icon, {
      ...attrs,
      ...props,
      viewBox: (attrs.viewBox as string | undefined) ?? definition.viewBox,
    }, { default: () => renderDefinition(definition, idPrefix) });
  };
  Component.props = iconPropOptions;
  Component.inheritAttrs = false;
  Component.displayName = displayName;
  return Component;
}

function renderDefinition(definition: IconDefinition, prefix: string): VNodeChild[] {
  const angularGradients = new Map(
    (definition.gradients ?? []).filter(({ type }) => type === 'angular').map((gradient) => [gradient.id, gradient]),
  );
  const angularElements = definition.elements.flatMap((element, index) => {
    const gradient = referencedAngularGradient(element, angularGradients);
    return gradient ? [{ element, gradient, index }] : [];
  });
  const angularElementsByIndex = new Map(angularElements.map((entry) => [entry.index, entry]));
  const resources: VNodeChild[] = [
    ...(definition.gradients ?? []).filter(({ type }) => type !== 'angular').map((gradient) => renderNativeGradient(gradient, prefix)),
    ...(definition.masks ?? []).map((mask) => h(
      'mask',
      { id: scopedId(prefix, mask.id), ...vueAttributes(mask.attributes, prefix, true) },
      mask.elements.map((element, index) => renderElement(element, prefix, `mask-${mask.id}-${index}`)),
    )),
    ...(definition.clipPaths ?? []).map((clipPath) => h(
      'clipPath',
      { id: scopedId(prefix, clipPath.id), ...vueAttributes(clipPath.attributes, prefix) },
      clipPath.elements.map((element, index) => renderElement(element, prefix, `clip-${clipPath.id}-${index}`)),
    )),
    ...(definition.patterns ?? []).map((pattern) => renderPattern(pattern, prefix)),
    ...angularElements.map(({ element, gradient, index }) => h(
      'clipPath',
      { id: scopedId(prefix, angularClipId(gradient.id, index)) },
      [renderClipElement(element, prefix, `angular-clip-shape-${index}`)],
    )),
  ];

  const rendered: VNodeChild[] = [];
  if (resources.length) rendered.push(h('defs', null, resources));
  const body: VNodeChild[] = definition.elements.map((element, index) => {
    const angular = angularElementsByIndex.get(index);
    return angular
      ? renderAngularElement(angular.element, angular.gradient, angular.index, definition.viewBox, prefix)
      : renderElement(element, prefix, `element-${index}`);
  });
  rendered.push(...(definition.groupMask ? [h('g', { key: 'masked-body', mask: vueAttributes({ mask: definition.groupMask }, prefix).mask }, body)] : body));
  return rendered;
}

function renderNativeGradient(gradient: IconGradient, prefix: string): VNodeChild {
  const tag = gradient.type === 'linear' ? 'linearGradient' : 'radialGradient';
  return h(tag, { id: scopedId(prefix, gradient.id), ...vueAttributes(gradient.attributes, prefix) },
    gradient.stops.map((stop) => h('stop', {
      offset: stop.offset,
      'stop-color': stop.color,
      ...(stop.opacity === undefined ? {} : { 'stop-opacity': stop.opacity }),
    })));
}

function renderPattern(pattern: IconPattern, prefix: string): VNodeChild {
  const image = pattern.image;
  return h('pattern', { id: scopedId(prefix, pattern.id), ...vueAttributes(pattern.attributes, prefix) }, [
    h('image', {
      ...vueAttributes(image.attributes, prefix),
      ...(image.transform ? { transform: image.transform } : {}),
      href: `data:${image.mimeType};base64,${image.data}`,
    }),
  ]);
}

function renderAngularElement(
  element: IconElement,
  gradient: IconGradient,
  index: number,
  viewBox: string,
  prefix: string,
): VNodeChild {
  const cssStops = gradient.stops.map((stop) =>
    `${angularCssColor(stop.color, stop.opacity)} ${formatNumber(Number(stop.offset) * 360)}deg`).join(',');
  const clipId = scopedId(prefix, angularClipId(gradient.id, index));
  return h('g', {
    'clip-path': `url(#${clipId})`,
    'data-mingcute-angular-gradient': gradient.id,
    ...effectAttributes(element.attributes, prefix),
  }, [
    h('foreignObject', {
      width: ANGULAR_CANVAS_SIZE,
      height: ANGULAR_CANVAS_SIZE,
      x: -ANGULAR_CANVAS_SIZE / 2,
      y: -ANGULAR_CANVAS_SIZE / 2,
      transform: angularTransform(gradient, viewBox),
    }, [
      h('div', {
        xmlns: 'http://www.w3.org/1999/xhtml',
        style: {
          color: 'inherit',
          background: `conic-gradient(from 90deg,${cssStops})`,
          height: '100%',
          width: '100%',
          opacity: gradient.attributes.opacity ?? 1,
        },
      }),
    ]),
  ]);
}

function angularCssColor(color: string, opacity: string | number | undefined): string {
  const canonical = color.match(/^rgb\(\s*16\s+22\s+31(?:\s*\/\s*([\d.]+))?\s*\)$/i);
  if (!canonical) return color;
  const alpha = Number(canonical[1] ?? opacity ?? 1);
  if (alpha >= 1) return 'currentColor';
  if (alpha <= 0) return 'transparent';
  return `color-mix(in srgb,currentColor ${formatNumber(alpha * 100)}%,transparent)`;
}

function renderElement(element: IconElement, prefix: string, key: string): VNodeChild {
  return h(element.tag, { key, ...vueAttributes(element.attributes, prefix) });
}

function renderClipElement(element: IconElement, prefix: string, key: string): VNodeChild {
  const geometry = Object.fromEntries(Object.entries(element.attributes).filter(([name]) =>
    !['fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'opacity', 'mask', 'clip-path'].includes(name)));
  return h(element.tag, { key, ...vueAttributes(geometry, prefix) });
}

function vueAttributes(
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
    result[name === 'class' ? 'class' : name] = scopeReferences(value, prefix);
  }
  return result;
}

function scopeReferences(value: string | number, prefix: string): string | number {
  return typeof value === 'string'
    ? value.replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${scopedId(prefix, id)})`)
    : value;
}

function effectAttributes(attributes: Record<string, string | number>, prefix: string): Record<string, unknown> {
  return vueAttributes(
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
