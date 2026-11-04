export const iconStyles = ['core-regular', 'core-filled'] as const;

export type IconStyle = (typeof iconStyles)[number];

export interface IconMetadata {
  category?: string;
  keywords?: string[];
  tags?: string[];
  version?: string;
}

export interface IconRecord extends IconMetadata {
  name: string;
  componentName: string;
  style: IconStyle;
}

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
  gradients?: IconGradient[];
  masks?: IconMask[];
  clipPaths?: IconClipPath[];
  patterns?: IconPattern[];
  metadata: IconMetadata;
}
