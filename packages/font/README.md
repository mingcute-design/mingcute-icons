<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/font</h1>

<h3 align="center">MingCute WOFF2 fonts, CSS classes, and stable codepoints</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/font"><img src="https://img.shields.io/npm/v/@mingcute/font?color=007AFF&label=version" alt="@mingcute/font npm version" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/font"><img src="https://img.shields.io/npm/unpacked-size/%40mingcute%2Ffont?color=007AFF&label=size" alt="@mingcute/font unpacked package size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/font"><img src="https://img.shields.io/npm/dm/@mingcute/font?color=23AF5F&label=downloads" alt="@mingcute/font monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/font` provides MingCute icons as WOFF2 fonts with generated CSS classes and stable codepoint metadata.

It is designed for stylesheet-based applications, server-rendered templates, legacy interfaces, and environments where framework components are not practical.

## Highlights

- **4,526 styled glyphs:** 2,263 icons in Core Regular and Core Filled.
- **WOFF2 output:** optimized for modern browsers.
- **Generated CSS classes:** predictable names with explicit style suffixes.
- **Stable codepoints:** one append-only ledger shared across styles.
- **Metadata exports:** codepoint and style information for tooling.
- **Bundler-safe CSS:** stylesheet imports are preserved as side effects.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

```bash
# npm
npm install @mingcute/font

# pnpm
pnpm add @mingcute/font

# Yarn
yarn add @mingcute/font

# Bun
bun add @mingcute/font
```

## Quick Start

Import one style:

```js
import '@mingcute/font/core-regular.min.css';
```

Use a generated class:

```html
<i class="mgc mgc-home-1-regular" aria-hidden="true"></i>
```

## Stylesheets

| Import | Contents |
|---|---|
| `@mingcute/font/core-regular.min.css` | Core Regular classes and font face |
| `@mingcute/font/core-filled.min.css` | Core Filled classes and font face |
| `@mingcute/font/bundle.min.css` | Both public styles |

Import one style when the application uses one style. `bundle.min.css` includes both and increases the initial font payload.

## Public Assets

| Import path | Contents |
|---|---|
| `@mingcute/font/fonts/*` | Generated WOFF2 files |
| `@mingcute/font/metadata/*` | Codepoint and style metadata |
| `@mingcute/font/metadata/styles.json` | Public style catalogue |

## Stable Codepoints

The same canonical icon name uses the same codepoint across styles.

The checked-in codepoint ledger is append-only:

- existing codepoints do not change;
- removed values are retired rather than reused;
- ordinary builds do not allocate new codepoints; and
- adding an icon requires an intentional ledger update.

This protects CSS classes, stored metadata, templates, and generated integrations from silent glyph remapping.

## Accessibility

Icon fonts are decorative by default.

### Labelled controls

Keep the icon hidden when visible text labels the action:

```html
<button type="button">
  <i class="mgc mgc-home-1-regular" aria-hidden="true"></i>
  <span>Home</span>
</button>
```

### Icon-only controls

Put the accessible name on the control:

```html
<button type="button" aria-label="Open navigation">
  <i class="mgc mgc-menu-regular" aria-hidden="true"></i>
</button>
```

Do not rely on the private-use glyph as accessible text. Screen readers cannot infer the icon’s meaning from its codepoint.

## Available Styles

| Import subpath | Style | Icons |
|---|---|---:|
| `core-regular` | Core Regular | 2,263 |
| `core-filled` | Core Filled | 2,263 |
| **Total** | **All public styles** | **4,526** |

## Production Guidance

- Import only the styles used by the application.
- Serve WOFF2 files with the `font/woff2` MIME type.
- Use long-lived cache headers when font URLs are content-versioned.
- Preload only fonts required in the first viewport.
- Ensure the deployed CSS can resolve its relative `../fonts/*.woff2` URLs.
- Allow the deployed font origin in `font-src`.
- Configure CORS when fonts are served from another origin.
- Use SVG or framework components when exact gradients, masks, patterns, or original colors matter.

## Rendering Limitations

Icon fonts are monochrome glyphs. They cannot preserve every SVG feature.

Prefer SVG or framework packages for:

- gradients;
- masks;
- clipping paths;
- multicolor artwork;
- original-color brands; and
- per-layer opacity or color control.

## Troubleshooting

### Icons display as empty squares

Confirm that the generated CSS can resolve the emitted WOFF2 files and that the server returns the correct MIME type.

### A class renders the wrong glyph

Use the complete generated class name, including the icon name and style suffix.

### Fonts are blocked in production

Check the application’s `font-src` policy, asset origin, MIME type, and cross-origin response headers.

### Text or icons flash during loading

Load only required styles, avoid injecting the stylesheet after the interface renders, and preload only critical fonts.

### The bundle contains both styles unexpectedly

Import a style-specific stylesheet instead of `bundle.min.css`.

## Development

This package is generated from canonical SVG sources and the checked-in codepoint ledger. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/font check
```

<img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner3.png" alt="Editable MingCute vector construction" width="100%" />

## License

Licensed under the [Apache License 2.0](../../LICENSE).

## Links

- [MingCute website](https://www.mingcute.com/)
- [Package changelog](./CHANGELOG.md)
- [Icon keywords](../../doc/Keywords.md)
- [Icon mapping](../../doc/Mapping.md)
- [MingCute Icons packages](../../README.md#packages)
- [Repository](https://github.com/mingcute-design/mingcute-icons)
