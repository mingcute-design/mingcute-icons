import type { IconDefinition, IconElement, IconGradient, IconPattern } from './types.js';

const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const ANGULAR_COORDINATE_SCALE = 2000;
const ANGULAR_CANVAS_SIZE = 4000;

export function renderIconBody(
  definition: IconDefinition,
  idPrefix = defaultIdPrefix(definition),
): string {
  const angularGradients = new Map(
    (definition.gradients ?? []).filter(({ type }) => type === 'angular').map((gradient) => [gradient.id, gradient]),
  );
  const angularElements = definition.elements.flatMap((element, index) => {
    const gradient = referencedAngularGradient(element, angularGradients);
    return gradient ? [{ element, gradient, index }] : [];
  });
  const angularElementsByIndex = new Map(angularElements.map((entry) => [entry.index, entry]));
  const resources = [
    ...(definition.gradients ?? []).filter(({ type }) => type !== 'angular').map((gradient) =>
      renderNativeGradient(gradient, idPrefix)),
    ...(definition.masks ?? []).map((mask) => renderMask(mask, idPrefix)),
    ...(definition.clipPaths ?? []).map((clip) =>
      `<clipPath id="${escapeXml(scopedId(idPrefix, clip.id))}"${renderAttributes(scopeReferences(clip.attributes, idPrefix))}>${
        clip.elements.map((element) => renderElement(element, idPrefix)).join('')
      }</clipPath>`),
    ...(definition.patterns ?? []).map((pattern) => renderPattern(pattern, idPrefix)),
    ...angularElements.map(({ element, gradient, index }) =>
      `<clipPath id="${scopedId(idPrefix, angularClipId(gradient.id, index))}">${renderClipElement(element)}</clipPath>`),
  ];
  const definitions = resources.length ? `<defs>${resources.join('')}</defs>` : '';
  const body = definition.elements.map((element, index) => {
    const angular = angularElementsByIndex.get(index);
    return angular
      ? renderAngularElement(angular.element, angular.gradient, angular.index, definition.viewBox, idPrefix)
      : renderElement(element, idPrefix);
  }).join('');
  const compositedBody = definition.groupMask
    ? `<g mask="${escapeXml(String(scopeReferences({ mask: definition.groupMask }, idPrefix).mask))}">${body}</g>`
    : body;
  return `${definitions}${compositedBody}`;
}

export function renderIconSource(definition: IconDefinition, idPrefix = defaultIdPrefix(definition)): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(definition.viewBox)}">${renderIconBody(definition, idPrefix)}</svg>`;
}

function renderMask(mask: NonNullable<IconDefinition['masks']>[number], prefix: string): string {
  const attributes = { ...mask.attributes };
  const maskType = attributes['mask-type'];
  delete attributes['mask-type'];
  if (maskType !== undefined) {
    const existing = attributes.style ? `${attributes.style};` : '';
    attributes.style = `${existing}mask-type:${maskType}`;
  }
  return `<mask id="${escapeXml(scopedId(prefix, mask.id))}"${renderAttributes(scopeReferences(attributes, prefix))}>${
    mask.elements.map((element) => renderElement(element, prefix)).join('')
  }</mask>`;
}

function renderNativeGradient(gradient: IconGradient, prefix: string): string {
  const tag = gradient.type === 'linear' ? 'linearGradient' : 'radialGradient';
  const stops = gradient.stops.map((stop) =>
    `<stop offset="${escapeXml(String(stop.offset))}" stop-color="${escapeXml(stop.color)}"${
      stop.opacity === undefined ? '' : ` stop-opacity="${escapeXml(String(stop.opacity))}"`
    }/>`).join('');
  return `<${tag} id="${escapeXml(scopedId(prefix, gradient.id))}"${renderAttributes(scopeReferences(gradient.attributes, prefix))}>${stops}</${tag}>`;
}

function renderPattern(pattern: IconPattern, prefix: string): string {
  const image = pattern.image;
  const attributes = {
    ...image.attributes,
    ...(image.transform ? { transform: image.transform } : {}),
    href: `data:${image.mimeType};base64,${image.data}`,
  };
  return `<pattern id="${escapeXml(scopedId(prefix, pattern.id))}"${renderAttributes(scopeReferences(pattern.attributes, prefix))}><image${renderAttributes(scopeReferences(attributes, prefix))}/></pattern>`;
}

function renderAngularElement(
  element: IconElement,
  gradient: IconGradient,
  index: number,
  viewBox: string,
  prefix: string,
): string {
  const stops = gradient.stops.map((stop) => `${angularCssColor(stop.color, stop.opacity)} ${formatNumber(Number(stop.offset) * 360)}deg`).join(',');
  const style = `color:inherit;background:conic-gradient(from 90deg,${stops});height:100%;width:100%;opacity:${escapeXml(String(gradient.attributes.opacity ?? 1))}`;
  return `<g clip-path="url(#${scopedId(prefix, angularClipId(gradient.id, index))})" data-mingcute-angular-gradient="${escapeXml(gradient.id)}"${renderAttributes(scopeReferences(effectAttributes(element.attributes), prefix))}>` +
    `<foreignObject width="${ANGULAR_CANVAS_SIZE}" height="${ANGULAR_CANVAS_SIZE}" x="-${ANGULAR_CANVAS_SIZE / 2}" y="-${ANGULAR_CANVAS_SIZE / 2}" transform="${angularTransform(gradient, viewBox)}">` +
    `<div xmlns="${XHTML_NAMESPACE}" style="${style}"></div></foreignObject></g>`;
}

function angularCssColor(color: string, opacity: string | number | undefined): string {
  const canonical = color.match(/^rgb\(\s*16\s+22\s+31(?:\s*\/\s*([\d.]+))?\s*\)$/i);
  if (!canonical) return color;
  const alpha = Number(canonical[1] ?? opacity ?? 1);
  if (alpha >= 1) return 'currentColor';
  if (alpha <= 0) return 'transparent';
  return `color-mix(in srgb,currentColor ${formatNumber(alpha * 100)}%,transparent)`;
}

function angularTransform(gradient: IconGradient, viewBox: string): string {
  const value = (name: string) => Number(gradient.attributes[`transform-${name}`]);
  const [minX, minY, width, height] = viewBox.split(/\s+/).map(Number);
  const [m00, m01, m02, m10, m11, m12] = ['m00', 'm01', 'm02', 'm10', 'm11', 'm12'].map(value);
  if ([m00, m01, m02, m10, m11, m12].every(Number.isFinite)) {
    const centerX = m02 + (m00 + m01) / 2;
    const centerY = m12 + (m10 + m11) / 2;
    return `matrix(${formatNumber(m00 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m10 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m01 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m11 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(centerX)} ${formatNumber(centerY)})`;
  }
  return `translate(${formatNumber(minX + width / 2)} ${formatNumber(minY + height / 2)}) scale(${formatNumber(width / ANGULAR_CANVAS_SIZE)} ${formatNumber(height / ANGULAR_CANVAS_SIZE)})`;
}

function referencedAngularGradient(element: IconElement, gradients: Map<string, IconGradient>): IconGradient | undefined {
  for (const value of Object.values(element.attributes)) {
    const match = String(value).match(/^url\(#([^)]+)\)$/);
    if (match && gradients.has(match[1])) return gradients.get(match[1]);
  }
  return undefined;
}

function renderClipElement(element: IconElement): string {
  const geometry = Object.fromEntries(Object.entries(element.attributes).filter(([name]) =>
    !['fill', 'fill-opacity', 'stroke', 'stroke-opacity', 'opacity', 'mask', 'clip-path'].includes(name)));
  return `<${element.tag}${renderAttributes(geometry)}/>`;
}

function renderElement(element: IconElement, prefix: string): string {
  return `<${element.tag}${renderAttributes(scopeReferences(element.attributes, prefix))}/>`;
}

function renderAttributes(attributes: Record<string, string | number>): string {
  return Object.entries(attributes).map(([name, value]) => ` ${name}="${escapeXml(String(value))}"`).join('');
}

function effectAttributes(attributes: Record<string, string | number>): Record<string, string | number> {
  return Object.fromEntries(Object.entries(attributes).filter(([name]) => ['mask', 'clip-path'].includes(name)));
}

function angularClipId(id: string, index: number): string {
  return `${id}-clip-${index}`;
}

function defaultIdPrefix(definition: IconDefinition): string {
  return `mgc-${definition.style}-${definition.name}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function scopedId(prefix: string, id: string): string {
  return `${prefix}-${id}`;
}

function scopeReferences(
  attributes: Record<string, string | number>,
  prefix: string,
): Record<string, string | number> {
  return Object.fromEntries(Object.entries(attributes).map(([name, value]) => {
    const stringValue = String(value);
    const urlMatch = stringValue.match(/^url\(#([^)]+)\)$/);
    if (urlMatch) return [name, `url(#${scopedId(prefix, urlMatch[1])})`];
    if ((name === 'href' || name === 'xlink:href') && stringValue.startsWith('#')) {
      return [name, `#${scopedId(prefix, stringValue.slice(1))}`];
    }
    return [name, value];
  }));
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}
