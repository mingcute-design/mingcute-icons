<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/vanilla</h1>

<h3 align="center">MingCute SVG strings and DOM helpers without a framework runtime</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/vanilla"><img src="https://img.shields.io/npm/v/@mingcute/vanilla?color=007AFF&label=version" alt="@mingcute/vanilla npm version" /></a>&nbsp;
  <a href="https://bundlephobia.com/package/@mingcute/vanilla"><img src="https://img.shields.io/bundlephobia/minzip/@mingcute/vanilla?color=007AFF&label=gzip" alt="@mingcute/vanilla minified and gzipped size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/vanilla"><img src="https://img.shields.io/npm/dm/@mingcute/vanilla?color=23AF5F&label=downloads" alt="@mingcute/vanilla monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/vanilla` provides precompiled SVG strings together with helpers for serialization and browser DOM creation.

Use it for:

- server-rendered markup;
- static templates;
- browser DOM insertion;
- progressive enhancement; and
- custom integrations that do not need a framework adapter.

## Highlights

- **No framework runtime:** suitable for browser, server, and edge environments.
- **Two rendering modes:** SVG strings through `toSvgString()` and DOM elements through `createIcon()`.
- **Tree-shakeable imports:** style entry points and direct icon subpaths.
- **Validated attributes:** names are checked and values are escaped.
- **Accessible options:** titles, ARIA labels, and decorative behavior.
- **Shared geometry:** generated assets come from `@mingcute/icons`.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

```bash
# npm
npm install @mingcute/vanilla

# pnpm
pnpm add @mingcute/vanilla

# Yarn
yarn add @mingcute/vanilla

# Bun
bun add @mingcute/vanilla
```

## Quick Start

```ts
import { createIcon, toSvgString } from '@mingcute/vanilla';
import { Home1Regular } from '@mingcute/vanilla/core-regular';

const markup = toSvgString(Home1Regular, {
  size: 24,
  color: 'currentColor',
  title: 'Home',
});

const element = createIcon(Home1Regular, {
  size: 24,
  className: 'navigation-icon',
  ariaHidden: true,
});

document.querySelector('nav')?.append(element);
```

`toSvgString()` works without a DOM. `createIcon()` requires `document`.

## Imports

### Style entry points

```ts
import {
  Home1Regular,
  Search2Regular,
} from '@mingcute/vanilla/core-regular';
```

### Direct icon imports

```ts
import Home1Regular from '@mingcute/vanilla/core-regular/home-1';
```

Use direct icon paths in bundle-sensitive code.

## API Reference

| Option | Type | Purpose |
|---|---|---|
| `size` | `number \| string` | Sets the default width and height |
| `width` | `number \| string` | Overrides the rendered width |
| `height` | `number \| string` | Overrides the rendered height |
| `color` | `string` | Sets inherited SVG paint |
| `className` | `string` | Adds an SVG class |
| `title` | `string` | Creates an accessible `<title>` |
| `titleId` | `string` | Overrides the title association ID |
| `ariaLabel` | `string` | Supplies an accessible name |
| `ariaHidden` | boolean-compatible value | Controls assistive-technology visibility |
| `attributes` | attribute record | Adds validated SVG attributes |

Attribute names are validated and values are XML-escaped before serialization.

## Rendering Modes

### `toSvgString()`

Use this helper for server rendering, static generation, edge runtimes, or string-based templates:

```ts
const svg = toSvgString(Home1Regular, {
  size: 24,
  title: 'Home',
});
```

It does not read browser globals.

### `createIcon()`

Use this helper to create a live `SVGSVGElement`:

```ts
const icon = createIcon(Home1Regular, {
  size: 24,
  ariaHidden: true,
});

document.body.append(icon);
```

It requires a DOM and throws a clear error when `document` is unavailable.

## Accessibility

### Meaningful icons

Provide one clear accessible name:

```ts
toSvgString(Home1Regular, {
  size: 24,
  title: 'Home',
});
```

### Decorative icons

Hide icons when adjacent text already provides the label:

```ts
createIcon(Home1Regular, {
  size: 20,
  ariaHidden: true,
});
```

### Icon-only controls

Put the accessible name on the control rather than duplicating it on the SVG.

## Security

The package serializes generated MingCute icon data and validates caller-provided attribute names.

It:

- escapes XML attribute values;
- rejects invalid attribute names;
- scopes generated SVG resources; and
- does not execute embedded script content.

The safety guarantee does not extend to arbitrary untrusted markup concatenated around the generated SVG string.

## Available Styles

| Import subpath | Style | Icons |
|---|---|---:|
| `core-regular` | Core Regular | 2,263 |
| `core-filled` | Core Filled | 2,263 |
| **Total** | **All public styles** | **4,526** |

## Production Guidance

- The package is ESM-only and declares `sideEffects: false`.
- Use `toSvgString()` in server and edge environments.
- Call `createIcon()` only after a DOM is available.
- Prefer direct icon subpaths in bundle-sensitive code.
- Treat generated icon source as immutable.
- Pass customization through documented options rather than modifying generated markup.
- Keep one accessible name per meaningful icon.

## Integration with Definitions

`@mingcute/icons` owns structured geometry, resources, names, and metadata.

`@mingcute/vanilla` owns:

- SVG serialization options;
- validated caller attributes;
- accessible string output; and
- browser DOM creation.

## Troubleshooting

### `document` is unavailable

Use `toSvgString()` during server rendering and call `createIcon()` only in a browser or DOM-compatible environment.

### An attribute is rejected

Use a valid SVG/XML attribute name and pass it through `attributes`.

### An icon is announced unexpectedly

Set `ariaHidden: true` for decorative icons or provide one clear accessible name for meaningful icons.

### The bundle is larger than expected

Import icons from direct subpaths instead of importing complete styles as namespaces.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/vanilla check
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
