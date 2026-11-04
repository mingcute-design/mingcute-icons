import type { IconStyle } from '../styles/catalogue.js';
import type { IconMetadata } from './metadata.js';

export const iconElementTags = [
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'ellipse',
] as const;

export type IconElementTag = (typeof iconElementTags)[number];

export interface IconElement {
  tag: IconElementTag;
  attributes: Record<string, string | number>;
}

export interface IconGradientStop {
  offset: string | number;
  color: string;
  opacity?: string | number;
}

export interface IconGradient {
  id: string;
  type: 'angular' | 'linear' | 'radial';
  attributes: Record<string, string | number>;
  stops: IconGradientStop[];
}

export interface IconMask {
  id: string;
  attributes: Record<string, string | number>;
  elements: IconElement[];
}

export interface IconClipPath {
  id: string;
  attributes: Record<string, string | number>;
  elements: IconElement[];
}

export interface IconEmbeddedImage {
  mimeType: 'image/gif' | 'image/jpeg' | 'image/png' | 'image/webp';
  data: string;
  attributes: Record<string, string | number>;
  transform?: string;
}

export interface IconPattern {
  id: string;
  attributes: Record<string, string | number>;
  image: IconEmbeddedImage;
}

export interface IconDefinition {
  name: string;
  componentName: string;
  style: IconStyle;
  viewBox: string;
  elements: IconElement[];
  /** A mask applied once to the composited icon body. */
  groupMask?: string;
  /** Structured SVG paint servers referenced by element attributes such as fill="url(#id)". */
  gradients?: IconGradient[];
  /** Structured masks referenced by element attributes such as mask="url(#id)". */
  masks?: IconMask[];
  /** Structured clipping paths referenced by element attributes such as clip-path="url(#id)". */
  clipPaths?: IconClipPath[];
  /** Embedded raster patterns required by original-color brand artwork. */
  patterns?: IconPattern[];
  metadata: IconMetadata;
}
