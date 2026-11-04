import { optimize } from 'svgo';

const canonicalColors = /#(?:09244b|10161f)\b/gi;

/** Optimizes SVG markup and maps canonical line colours to `currentColor`. */
export function optimiseSvg(source: string, sourcePath?: string, preserveColors = false): string {
  const result = optimize(source, {
    path: sourcePath,
    multipass: true,
    plugins: [
      'preset-default',
      'removeDimensions',
      'removeXMLNS',
    ],
  });
  return preserveColors ? result.data : result.data.replace(canonicalColors, 'currentColor');
}

/** Returns the renderable contents of an optimized SVG root. */
export function extractSvgInner(source: string): string {
  const match = source.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/i);
  if (!match) throw new Error('Optimized output does not contain an SVG root.');
  return match[1].trim();
}
