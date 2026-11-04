import {
  iconStyles,
  type AdapterContext,
  type FrameworkAdapter,
  type GeneratedFile,
  type IconDefinition,
  type PackageContext,
  type IconStyle,
} from '@mingcute/core';
import { buildWoff2Font } from './font-builder.js';
import {
  iconIdentity,
  resolveCodepoint,
  type CodepointLedger,
} from './codepoints.js';

export interface FontIconRecord {
  name: string;
  sourceName: string;
  componentName: string;
  style: IconStyle;
  codepoint: string;
  category?: string;
}

export function createFontAdapter(ledger: CodepointLedger, version = '0.1.0'): FrameworkAdapter {
  return {
    name: 'font',
    generateIcon(definition: IconDefinition, context: AdapterContext): GeneratedFile[] {
      assertStyleContext(definition, context);
      const identity = iconIdentity(definition);
      const record: FontIconRecord = {
        name: identity,
        sourceName: definition.name,
        componentName: definition.componentName,
        style: definition.style,
        codepoint: resolveCodepoint(ledger, identity).toString(16).toUpperCase().padStart(4, '0'),
        ...(definition.metadata.category ? { category: definition.metadata.category } : {}),
      };
      return [{
        path: `.font-records/${context.style}/${identity}.json`,
        contents: JSON.stringify(record),
        kind: 'metadata',
      }];
    },
    generateStyleIndex(style: IconStyle, icons: readonly IconDefinition[]): GeneratedFile[] {
      const sorted = [...icons].sort((left, right) => iconIdentity(left).localeCompare(iconIdentity(right)));
      const familyName = fontFamilyForStyle(style);
      const glyphs = sorted.map((definition) => ({
        definition,
        identity: iconIdentity(definition),
        codepoint: resolveCodepoint(ledger, iconIdentity(definition)),
      }));
      return [
        {
          path: `dist/fonts/${style}.woff2`,
          // Preserve every visible contour. A monochrome font cannot retain
          // per-contour opacity, but dropping low-opacity geometry entirely
          // produces incomplete glyphs such as loading-3.
          contents: buildWoff2Font(familyName, glyphs, 'all', version),
          kind: 'asset',
        },
        { path: `dist/css/${style}.min.css`, contents: styleCss(style, familyName, glyphs), kind: 'source' },
      ];
    },
    generateRootIndex(styles: readonly IconStyle[]): GeneratedFile[] {
      assertCanonicalStyles(styles);
      return [bundleFile('bundle', styles)];
    },
    generatePackageManifest(context: PackageContext): Record<string, unknown> {
      assertCanonicalStyles(context.styles);
      const exports = Object.fromEntries([
        ...context.styles.map((style) => [`./${style}.min.css`, `./dist/css/${style}.min.css`]),
        ['./bundle.min.css', './dist/css/bundle.min.css'],
        ['./fonts/*', './dist/fonts/*'],
        ['./metadata/*', './dist/metadata/*'],
      ]);
      return {
        name: context.packageName,
        version: context.version,
        description: 'Mingcute WOFF2 icon fonts, CSS mappings, and codepoint metadata.',
        license: 'Apache-2.0',
        private: false,
        type: 'module',
        exports,
        files: ['dist', 'README.md', 'LICENSE'],
        publishConfig: { access: 'public' },
        sideEffects: true,
      };
    },
  };
}

export function fontFamilyForStyle(style: IconStyle): string {
  return `Mingcute ${style.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')}`;
}

export function fontFidelityForStyle(style: IconStyle): 'single-color' | 'layered-two-color' {
  void style;
  return 'single-color';
}

function styleCss(
  style: IconStyle,
  familyName: string,
  glyphs: readonly { identity: string; codepoint: number }[],
): string {
  const face = `@font-face{font-family:"${familyName}";src:url("../fonts/${style}.woff2") format("woff2");font-style:normal;font-weight:normal;font-display:block}`;
  const base = '.mgc{display:inline-block;font-style:normal;font-weight:normal;line-height:1;speak:never;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}';
  const mappings = glyphs.map(({ identity, codepoint }) =>
    `.mgc-${identity}-${style}::before{font-family:"${familyName}"!important;font-style:normal;font-weight:normal;content:"\\${codepoint.toString(16)}"}`).join('');
  return `${face}${base}${mappings}\n`;
}

function bundleFile(name: string, styles: readonly IconStyle[]): GeneratedFile {
  const contents = styles.map((style) => `@import "./${style}.min.css";`).join('');
  return { path: `dist/css/${name}.min.css`, contents: `${contents}\n`, kind: 'source' };
}

function assertStyleContext(definition: IconDefinition, context: AdapterContext): void {
  if (definition.style !== context.style) {
    throw new Error(`Icon style ${definition.style} does not match adapter context ${context.style}.`);
  }
  if (!iconStyles.includes(context.style)) throw new Error(`Unsupported icon style: ${context.style}`);
}

function assertCanonicalStyles(styles: readonly IconStyle[]): void {
  if (styles.length !== iconStyles.length || styles.some((style, index) => style !== iconStyles[index])) {
    throw new Error('Font package styles must derive from the canonical iconStyles order.');
  }
}
