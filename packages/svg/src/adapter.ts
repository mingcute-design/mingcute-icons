import {
  iconStyles,
  toKebabCase,
  type AdapterContext,
  type FrameworkAdapter,
  type GeneratedFile,
  type IconDefinition,
  type IconElement,
  type IconGradient,
  type IconPattern,
  type PackageContext,
  type IconStyle,
} from '@mingcute/core';

const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const ANGULAR_COORDINATE_SCALE = 2000;
const ANGULAR_CANVAS_SIZE = 4000;

export const svgAdapter: FrameworkAdapter = {
  name: 'svg',

  generateIcon(definition: IconDefinition, context: AdapterContext): GeneratedFile[] {
    assertStyleContext(definition, context);
    return [{
      path: `${context.style}/${toKebabCase(definition.name)}.svg`,
      contents: renderSvg(definition),
      kind: 'asset',
    }];
  },

  generateStyleIndex(style: IconStyle, icons: readonly IconDefinition[]): GeneratedFile[] {
    const metadata = icons
      .map((icon) => ({
        name: icon.name,
        componentName: icon.componentName,
        style: icon.style,
        file: `${toKebabCase(icon.name)}.svg`,
        ...icon.metadata,
      }))
      .sort((a, b) => a.file.localeCompare(b.file));
    return [{
      path: `${style}/metadata.json`,
      contents: `${JSON.stringify(metadata, null, 2)}\n`,
      kind: 'metadata',
    }];
  },

  generateRootIndex(styles: readonly IconStyle[]): GeneratedFile[] {
    return [{
      path: 'styles.json',
      contents: `${JSON.stringify(styles, null, 2)}\n`,
      kind: 'metadata',
    }];
  },

  generatePackageManifest(context: PackageContext): Record<string, unknown> {
    return {
      name: context.packageName,
      version: context.version,
      description: 'Optimized Carefully crafted Mingcute SVG icons for Core Regular and Filled.',
      license: 'Apache-2.0',
      private: false,
      type: 'module',
      exports: {
        './styles.json': './styles.json',
        './*': './*',
      },
      files: [
        'styles.json',
        ...context.styles.flatMap((style) => [style, `${style}/metadata.json`]),
        'README.md',
        'LICENSE',
      ],
      publishConfig: { access: 'public' },
      sideEffects: false,
    };
  },
};

export function renderSvg(definition: IconDefinition): string {
  const angularGradients = new Map(
    (definition.gradients ?? []).filter((gradient) => gradient.type === 'angular').map((gradient) => [gradient.id, gradient]),
  );
  const angularElements = definition.elements.flatMap((element, index) => {
    const gradient = referencedAngularGradient(element, angularGradients);
    return gradient ? [{ element, gradient, index }] : [];
  });
  const angularElementsByIndex = new Map(angularElements.map((entry) => [entry.index, entry]));
  const definitions = renderDefinitions(definition, angularElements);
  const body = definition.elements.map((element, index) => {
    const angular = angularElementsByIndex.get(index);
    return angular ? renderAngularElement(angular.element, angular.gradient, angular.index, definition.viewBox) : renderElement(element);
  }).join('');
  const compositedBody = definition.groupMask ? `<g mask="${escapeXml(definition.groupMask)}">${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(definition.viewBox)}">${definitions}${compositedBody}</svg>\n`;
}

function renderDefinitions(
  definition: IconDefinition,
  angularElements: Array<{ element: IconElement; gradient: IconGradient; index: number }>,
): string {
  const resources = [
    ...(definition.gradients ?? []).filter(({ type }) => type !== 'angular').map(renderNativeGradient),
    ...(definition.masks ?? []).map((mask) => renderMask(mask)),
    ...(definition.clipPaths ?? []).map((clipPath) =>
      `<clipPath id="${escapeXml(clipPath.id)}"${renderAttributes(clipPath.attributes)}>${clipPath.elements.map(renderElement).join('')}</clipPath>`),
    ...(definition.patterns ?? []).map(renderPattern),
    ...angularElements.map(({ element, gradient, index }) =>
      `<clipPath id="${angularClipId(gradient.id, index)}">${renderClipElement(element)}</clipPath>`),
  ];
  return resources.length ? `<defs>${resources.join('')}</defs>` : '';
}

function renderMask(mask: NonNullable<IconDefinition['masks']>[number]): string {
  const attributes = { ...mask.attributes };
  const maskType = attributes['mask-type'];
  delete attributes['mask-type'];
  if (maskType !== undefined) {
    const existingStyle = attributes.style ? `${attributes.style};` : '';
    attributes.style = `${existingStyle}mask-type:${maskType}`;
  }
  return `<mask id="${escapeXml(mask.id)}"${renderAttributes(attributes)}>${mask.elements.map(renderElement).join('')}</mask>`;
}

function renderNativeGradient(gradient: IconGradient): string {
  const tag = gradient.type === 'linear' ? 'linearGradient' : 'radialGradient';
  const stops = gradient.stops.map((stop) =>
    `<stop offset="${escapeXml(String(stop.offset))}" stop-color="${escapeXml(stop.color)}"${
      stop.opacity === undefined ? '' : ` stop-opacity="${escapeXml(String(stop.opacity))}"`
    }/>`).join('');
  return `<${tag} id="${escapeXml(gradient.id)}"${renderAttributes(gradient.attributes)}>${stops}</${tag}>`;
}

function renderPattern(pattern: IconPattern): string {
  const image = pattern.image;
  const href = `data:${image.mimeType};base64,${image.data}`;
  const attributes = {
    ...image.attributes,
    ...(image.transform ? { transform: image.transform } : {}),
    href,
  };
  return `<pattern id="${escapeXml(pattern.id)}"${renderAttributes(pattern.attributes)}><image${renderAttributes(attributes)}/></pattern>`;
}

function renderAngularElement(
  element: IconElement,
  gradient: IconGradient,
  index: number,
  viewBox: string,
): string {
  const transform = angularTransform(gradient, viewBox);
  const cssStops = gradient.stops.map((stop) =>
    `${angularCssColor(stop.color, stop.opacity)} ${formatNumber(Number(stop.offset) * 360)}deg`).join(',');
  const opacity = gradient.attributes.opacity ?? 1;
  const wrapperAttributes = effectAttributes(element.attributes);
  const style = `color:inherit;background:conic-gradient(from 90deg,${cssStops});height:100%;width:100%;opacity:${escapeXml(String(opacity))}`;
  return `<g clip-path="url(#${angularClipId(gradient.id, index)})" data-mingcute-angular-gradient="${escapeXml(gradient.id)}"${renderAttributes(wrapperAttributes)}>` +
    `<foreignObject width="${ANGULAR_CANVAS_SIZE}" height="${ANGULAR_CANVAS_SIZE}" x="-${ANGULAR_CANVAS_SIZE / 2}" y="-${ANGULAR_CANVAS_SIZE / 2}" transform="${transform}">` +
    `<div xmlns="${XHTML_NAMESPACE}" style="${style}"/>` +
    '</foreignObject></g>';
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
  const values = (name: string) => Number(gradient.attributes[`transform-${name}`]);
  const [minX, minY, width, height] = viewBox.split(/\s+/).map(Number);
  const m00 = values('m00');
  const m01 = values('m01');
  const m02 = values('m02');
  const m10 = values('m10');
  const m11 = values('m11');
  const m12 = values('m12');
  const matrix = [m00, m01, m02, m10, m11, m12];
  if (matrix.every(Number.isFinite)) {
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

function renderElement(element: IconElement): string {
  return `<${element.tag}${renderAttributes(element.attributes)}/>`;
}

function renderAttributes(attributes: Record<string, string | number>): string {
  return Object.entries(attributes)
    .map(([name, value]) => ` ${name}="${escapeXml(String(value))}"`)
    .join('');
}

function effectAttributes(attributes: Record<string, string | number>): Record<string, string | number> {
  return Object.fromEntries(Object.entries(attributes).filter(([name]) => ['mask', 'clip-path'].includes(name)));
}

function angularClipId(gradientId: string, index: number): string {
  return `${gradientId}-clip-${index}`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatNumber(value: number): string {
  return Number(value.toFixed(6)).toString();
}

function assertStyleContext(definition: IconDefinition, context: AdapterContext): void {
  if (definition.style !== context.style) {
    throw new Error(`Icon style ${definition.style} does not match adapter context ${context.style}.`);
  }
  if (!iconStyles.includes(context.style)) throw new Error(`Unsupported icon style: ${context.style}`);
}
