<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/svelte</h1>

<h3 align="center">Typed, tree-shakeable MingCute icons for Svelte</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/svelte"><img src="https://img.shields.io/npm/v/%40mingcute%2Fsvelte?color=007AFF&label=version" alt="@mingcute/svelte npm version" /></a>&nbsp;
  <a href="https://bundlephobia.com/package/@mingcute/svelte"><img src="https://img.shields.io/bundlephobia/minzip/@mingcute/svelte?color=007AFF&label=gzip" alt="@mingcute/svelte minified and gzipped size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/svelte"><img src="https://img.shields.io/npm/dm/%40mingcute%2Fsvelte?color=23AF5F&label=downloads" alt="@mingcute/svelte monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/svelte` provides typed Svelte components for the public MingCute Core Regular and Core Filled styles.

Canonical icon geometry comes from `@mingcute/icons`. The adapter focuses on Svelte rendering, accessibility, prop precedence, refs, framework lifecycle behavior, and stable SVG resource identifiers.

## Highlights

- **4,526 styled definitions:** 2,263 icons in Core Regular and Core Filled.
- **Typed Svelte components:** generated declarations and framework-native props.
- **Tree-shakeable imports:** style entry points and direct icon subpaths.
- **Accessible defaults:** unlabeled icons remain decorative.
- **Scoped SVG resources:** repeated icons avoid gradient, mask, and clip-path collisions.
- **Shared geometry:** the adapter does not duplicate the icon catalogue.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

**Compatibility:** Svelte 5.20 or newer.

```bash
# npm
npm install @mingcute/svelte

# pnpm
pnpm add @mingcute/svelte

# Yarn
yarn add @mingcute/svelte

# Bun
bun add @mingcute/svelte
```

## Quick Start

```svelte
<script lang="ts">
  import { Home1Regular } from '@mingcute/svelte/core-regular';
</script>

<Home1Regular size={24} title="Home" />
```

## Imports

### Style entry points

```ts
import {
  Home1Regular,
  Search2Regular,
} from '@mingcute/svelte/core-regular';
```

### Direct icon imports

```ts
import Home1Regular from '@mingcute/svelte/core-regular/home-1';
```

The package root exports the shared `Icon` utility and public types. It does not re-export the complete icon catalogue.

## API Reference

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `size` | `number \| string` | `24` | Sets both width and height unless either is provided |
| `width` | Svelte SVG value | `size` | Overrides the rendered width |
| `height` | Svelte SVG value | `size` | Overrides the rendered height |
| `color` | `string` | `currentColor` | Sets inherited SVG paint |
| `title` | `string` | none | Adds an accessible `<title>` |
| `titleId` | `string` | generated | Overrides the title association ID |
| `class`, `className`, `style` | Svelte SVG values | none | Styles the rendered SVG |
| `ref` | `SVGSVGElement` | none | Supports `bind:ref` |
| Other props | Svelte SVG attributes | none | Forwards SVG, event, and ARIA props |

Explicit `width` or `height` values take precedence over `size`.

## Accessibility

Icons without a title or explicit accessible name are hidden from assistive technology.

### Meaningful icons

Provide a title or platform-appropriate accessibility label when an icon communicates meaning by itself.

### Decorative icons

Keep icons decorative when nearby text already labels the action.

### Icon-only controls

Put the accessible name on the interactive control and keep the icon itself decorative.

## Server Rendering

Components use `$props.id()` for title and SVG resource identifiers.

Svelte 5.20 or newer is required. Keep server and client package versions aligned for stable hydration.

## Available Styles

| Import subpath | Style | Icons |
|---|---|---:|
| `core-regular` | Core Regular | 2,263 |
| `core-filled` | Core Filled | 2,263 |
| **Total** | **All public styles** | **4,526** |

Additional Core, Cute, and Sharp styles are available in [MingCute Pro](https://mgc.mingcute.com/).

## Free and Pro

| Capability          | MingCute Icons               | MingCute Pro                                 |
| ------------------- | ---------------------------- | -------------------------------------------- |
| Families and styles | Core Regular and Core Filled | 12 Core, Cute, and Sharp style combinations  |
| Styled definitions  | 4,526                        | 27,360                                       |
| Package names       | `@mingcute/*`                | `@mingcute/*-pro`                            |
| Distribution        | Public npm registry          | Private MingCute registry                    |
| Access              | No account or CLI required   | Active Pro entitlement and CLI configuration |
| License             | Apache-2.0                   | MingCute Pro Commercial License              |

The public and Pro packages use the same framework conventions and import structure. This makes migration straightforward while keeping the source repositories and licensing boundaries separate.

## Production Guidance

- The package is ESM-only and side-effect free.
- Prefer direct icon subpaths in shared libraries and bundle-sensitive entry points.
- Keep framework and MingCute package versions aligned across server and client environments where applicable.
- Use framework components or standalone SVG when gradients, masks, patterns, or original colors must be preserved exactly.
- Use `bind:ref` only when direct SVG access is required.

## Integration with Definitions

`@mingcute/icons` owns icon names, normalized geometry, SVG resources, layers, and metadata.

`@mingcute/svelte` owns:

- Svelte component rendering;
- prop and attribute handling;
- accessibility behavior;
- resource ID scoping; and
- framework-specific refs and lifecycle behavior.

This separation prevents duplicate icon data and keeps every framework adapter visually consistent.

## Troubleshooting

### A component import cannot be resolved

Use a PascalCase named export from a style entry point or the kebab-case direct icon path.

### The production bundle is larger than expected

Use direct icon subpaths and confirm that the bundler tree-shakes ESM. Avoid namespace imports of complete style entry points.

### `$props.id()` or rune errors appear

Upgrade the consuming application to Svelte 5.20 or newer.

### An SSR hydration warning appears

Confirm identical server and client trees and MingCute package versions.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/svelte check
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
