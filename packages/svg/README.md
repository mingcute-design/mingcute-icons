<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/svg</h1>

<h3 align="center">Optimized standalone MingCute SVG assets</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/svg"><img src="https://img.shields.io/npm/v/@mingcute/svg?color=007AFF&label=version" alt="@mingcute/svg npm version" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/svg"><img src="https://img.shields.io/npm/unpacked-size/%40mingcute%2Fsvg?color=007AFF&label=size" alt="@mingcute/svg unpacked package size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/svg"><img src="https://img.shields.io/npm/dm/@mingcute/svg?color=23AF5F&label=downloads" alt="@mingcute/svg monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/svg` provides optimized standalone SVG files for Core Regular and Core Filled.

Every asset is compiled from canonical MingCute artwork, normalized, validated, and packaged without framework runtime code.

## Highlights

- **4,526 SVG assets:** 2,263 icons in Core Regular and Core Filled.
- **Explicit file imports:** stable style and icon subpaths.
- **No JavaScript runtime:** package files are consumed as build assets.
- **High rendering fidelity:** gradients, masks, clip paths, patterns, and authored colors are preserved.
- **Safe embedded resources:** external image URLs and active content are rejected.
- **Concise filenames:** styles are represented by package subpaths rather than repeated in every filename.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

```bash
# npm
npm install @mingcute/svg

# pnpm
pnpm add @mingcute/svg

# Yarn
yarn add @mingcute/svg

# Bun
bun add @mingcute/svg
```

## Quick Start

Import an SVG through a build tool that supports package assets:

```ts
import homeUrl from '@mingcute/svg/core-regular/home-1.svg';

const image = document.querySelector<HTMLImageElement>('#home-icon');
if (image) image.src = homeUrl;
```

```html
<img id="home-icon" alt="" />
```

The exact import result depends on the toolchain. A bundler may return:

- a public URL;
- a raw source string; or
- an asset module.

## Package Layout

```text
core-regular/
├── home-1.svg
├── search-2.svg
└── metadata.json

core-filled/
├── home-1.svg
├── search-2.svg
└── metadata.json

styles.json
```

The package root intentionally has no icon barrel. Import SVG files through explicit style paths.

Canonical artwork is organized internally as:

```text
{family}/{style}/{category}/{icon}.svg
```

Those source directories are not part of the public package API.

The published package exposes flattened style subpaths:

```text
@mingcute/svg/core-regular/home-1.svg
@mingcute/svg/core-filled/home-1.svg
```

The style is not repeated in the filename because the containing subpath already identifies it.

## Usage Patterns

### Asset URL import

```ts
import homeUrl from '@mingcute/svg/core-regular/home-1.svg';

const image = new Image();
image.src = homeUrl;
image.alt = '';
```

### Public asset copy

Copy the package asset into the application’s public output directory during the build:

```html
<img src="/icons/home-1.svg" alt="" />
```

Do not expose `node_modules` paths directly to the browser.

### CSS background

```css
.home-icon {
  background-image: url('/icons/home-1.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}
```

Background images are decorative and should not be used as the only accessible representation of meaningful content.

## Accessibility

### Decorative images

Use an empty `alt` value when an SVG is decorative:

```html
<img src="/icons/home-1.svg" alt="" />
```

### Meaningful images

Provide useful alternative text when the image communicates information by itself:

```html
<img src="/icons/warning.svg" alt="Warning" />
```

### Icons inside labelled controls

Keep the image decorative when visible text already labels the control:

```html
<button type="button">
  <img src="/icons/home-1.svg" alt="" />
  <span>Home</span>
</button>
```

For icon-only controls, place the accessible name on the control:

```html
<button type="button" aria-label="Open navigation">
  <img src="/icons/menu.svg" alt="" />
</button>
```

## Rendering Fidelity

SVG is the recommended MingCute format for:

- gradients;
- masks;
- clipping paths;
- angular paint;
- patterns; and
- original-color brand artwork.

Embedded image resources are self-contained. The compiler rejects external image URLs and active content.

Themeable icons use `currentColor` where appropriate. Original-color artwork intentionally preserves authored paint.

## Available Styles

| Import subpath | Style | Icons |
|---|---|---:|
| `core-regular` | Core Regular | 2,263 |
| `core-filled` | Core Filled | 2,263 |
| **Total** | **All public styles** | **4,526** |

## Production Guidance

- Import SVG files through the application’s asset pipeline or copy them during the build.
- Preserve the `viewBox` when resizing.
- Do not serve files directly from `node_modules`.
- Prefer SVG over icon fonts when exact rendering fidelity matters.
- Configure a content security policy that allows only the image sources required by the application.
- Keep package paths explicit to avoid copying unused assets.
- Use cache-busted build output for reliable upgrades.

## Security

Generated SVG files:

- contain no executable JavaScript;
- reject external image references;
- preserve only supported SVG resources;
- use self-contained embedded images where required; and
- are validated before packaging.

Applications that inline raw SVG should still use a trusted build pipeline and should not combine generated icon source with untrusted markup.

## Troubleshooting

### The bundler cannot import `.svg`

Use the bundler’s URL or raw-asset query syntax, or copy the file as a build asset.

### The browser requests a `node_modules` URL

Do not expose package internals directly. Emit the SVG into the application’s public asset directory.

### The icon appears with a fixed dark color

Themeable artwork uses `currentColor`, while original-color artwork intentionally preserves its authored colors.

### A sanitizer removes part of the artwork

Allow supported SVG resources such as:

- `defs`;
- gradients;
- masks;
- clip paths;
- patterns; and
- self-contained data-backed images.

### The icon becomes distorted when resized

Preserve the SVG `viewBox` and avoid forcing incompatible aspect ratios.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/svg check
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
