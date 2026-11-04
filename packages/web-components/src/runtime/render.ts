import type { IconDefinitionData, IconElementData, IconGradientData, IconPatternData } from './types.js';

const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const ANGULAR_COORDINATE_SCALE = 2000;
const ANGULAR_CANVAS_SIZE = 4000;

export function renderIconBody(definition: IconDefinitionData): string {
  const angularGradients = new Map((definition.gradients ?? []).filter(({ type }) => type === 'angular').map((gradient) => [gradient.id, gradient]));
  const angularElements = definition.elements.flatMap((element, index) => { const gradient = referencedAngularGradient(element, angularGradients); return gradient ? [{ element, gradient, index }] : []; });
  const angularElementsByIndex = new Map(angularElements.map((entry) => [entry.index, entry]));
  const resources = [
    ...(definition.gradients ?? []).filter(({ type }) => type !== 'angular').map(renderNativeGradient),
    ...(definition.masks ?? []).map(renderMask),
    ...(definition.clipPaths ?? []).map((clip) => `<clipPath id="${escapeXml(clip.id)}"${renderAttributes(clip.attributes)}>${clip.elements.map(renderElement).join('')}</clipPath>`),
    ...(definition.patterns ?? []).map(renderPattern),
    ...angularElements.map(({ element, gradient, index }) => `<clipPath id="${angularClipId(gradient.id, index)}">${renderClipElement(element)}</clipPath>`),
  ];
  const definitions = resources.length ? `<defs>${resources.join('')}</defs>` : '';
  const body = definition.elements.map((element, index) => { const angular = angularElementsByIndex.get(index); return angular ? renderAngularElement(angular.element, angular.gradient, angular.index, definition.viewBox) : renderElement(element); }).join('');
  return `${definitions}${definition.groupMask ? `<g mask="${escapeXml(definition.groupMask)}">${body}</g>` : body}`;
}
function renderMask(mask: NonNullable<IconDefinitionData['masks']>[number]): string {
  const attributes = { ...mask.attributes }; const maskType = attributes['mask-type']; delete attributes['mask-type'];
  if (maskType !== undefined) attributes.style = `${attributes.style ? `${attributes.style};` : ''}mask-type:${maskType}`;
  return `<mask id="${escapeXml(mask.id)}"${renderAttributes(attributes)}>${mask.elements.map(renderElement).join('')}</mask>`;
}
function renderNativeGradient(gradient: IconGradientData): string {
  const tag = gradient.type === 'linear' ? 'linearGradient' : 'radialGradient';
  const stops = gradient.stops.map((stop) => `<stop offset="${escapeXml(String(stop.offset))}" stop-color="${escapeXml(stop.color)}"${stop.opacity === undefined ? '' : ` stop-opacity="${escapeXml(String(stop.opacity))}"`}/>`).join('');
  return `<${tag} id="${escapeXml(gradient.id)}"${renderAttributes(gradient.attributes)}>${stops}</${tag}>`;
}
function renderPattern(pattern: IconPatternData): string {
  const image = pattern.image; const attributes = { ...image.attributes, ...(image.transform ? { transform: image.transform } : {}), href: `data:${image.mimeType};base64,${image.data}` };
  return `<pattern id="${escapeXml(pattern.id)}"${renderAttributes(pattern.attributes)}><image${renderAttributes(attributes)}/></pattern>`;
}
function renderAngularElement(element: IconElementData, gradient: IconGradientData, index: number, viewBox: string): string {
  const stops = gradient.stops.map((stop) => `${angularCssColor(stop.color, stop.opacity)} ${formatNumber(Number(stop.offset) * 360)}deg`).join(',');
  const style = `color:inherit;background:conic-gradient(from 90deg,${stops});height:100%;width:100%;opacity:${escapeXml(String(gradient.attributes.opacity ?? 1))}`;
  return `<g clip-path="url(#${angularClipId(gradient.id, index)})" data-mingcute-angular-gradient="${escapeXml(gradient.id)}"${renderAttributes(effectAttributes(element.attributes))}><foreignObject width="${ANGULAR_CANVAS_SIZE}" height="${ANGULAR_CANVAS_SIZE}" x="-${ANGULAR_CANVAS_SIZE / 2}" y="-${ANGULAR_CANVAS_SIZE / 2}" transform="${angularTransform(gradient, viewBox)}"><div xmlns="${XHTML_NAMESPACE}" style="${style}"></div></foreignObject></g>`;
}
function angularCssColor(color: string, opacity: string | number | undefined): string {
  const canonical = color.match(/^rgb\(\s*16\s+22\s+31(?:\s*\/\s*([\d.]+))?\s*\)$/i);
  if (!canonical) return color;
  const alpha = Number(canonical[1] ?? opacity ?? 1);
  if (alpha >= 1) return 'currentColor';
  if (alpha <= 0) return 'transparent';
  return `color-mix(in srgb,currentColor ${formatNumber(alpha * 100)}%,transparent)`;
}
function angularTransform(gradient: IconGradientData, viewBox: string): string {
  const value = (name: string) => Number(gradient.attributes[`transform-${name}`]); const [minX, minY, width, height] = viewBox.split(/\s+/).map(Number); const [m00,m01,m02,m10,m11,m12] = ['m00','m01','m02','m10','m11','m12'].map(value);
  if ([m00,m01,m02,m10,m11,m12].every(Number.isFinite)) { const centerX = m02 + (m00 + m01) / 2; const centerY = m12 + (m10 + m11) / 2; return `matrix(${formatNumber(m00 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m10 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m01 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(m11 / ANGULAR_COORDINATE_SCALE)} ${formatNumber(centerX)} ${formatNumber(centerY)})`; }
  return `translate(${formatNumber(minX + width / 2)} ${formatNumber(minY + height / 2)}) scale(${formatNumber(width / ANGULAR_CANVAS_SIZE)} ${formatNumber(height / ANGULAR_CANVAS_SIZE)})`;
}
function referencedAngularGradient(element: IconElementData, gradients: Map<string, IconGradientData>): IconGradientData | undefined { for (const value of Object.values(element.attributes)) { const match = String(value).match(/^url\(#([^)]+)\)$/); if (match && gradients.has(match[1])) return gradients.get(match[1]); } return undefined; }
function renderClipElement(element: IconElementData): string { const geometry = Object.fromEntries(Object.entries(element.attributes).filter(([name]) => !['fill','fill-opacity','stroke','stroke-opacity','opacity','mask','clip-path'].includes(name))); return `<${element.tag}${renderAttributes(geometry)}/>`; }
function renderElement(element: IconElementData): string { return `<${element.tag}${renderAttributes(element.attributes)}/>`; }
function renderAttributes(attributes: Record<string, string | number>): string { return Object.entries(attributes).map(([name, value]) => ` ${name}="${escapeXml(String(value))}"`).join(''); }
function effectAttributes(attributes: Record<string, string | number>): Record<string, string | number> { return Object.fromEntries(Object.entries(attributes).filter(([name]) => ['mask','clip-path'].includes(name))); }
function angularClipId(id: string, index: number): string { return `${id}-clip-${index}`; }
export function escapeXml(value: string): string { return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function formatNumber(value: number): string { return Number(value.toFixed(6)).toString(); }
