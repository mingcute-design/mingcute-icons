<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/vue</h1>

<h3 align="center">Typed, tree-shakeable MingCute icons for Vue</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/vue"><img src="https://img.shields.io/npm/v/@mingcute/vue?color=007AFF&label=version" alt="@mingcute/vue npm version" /></a>&nbsp;
  <a href="https://bundlephobia.com/package/@mingcute/vue"><img src="https://img.shields.io/bundlephobia/minzip/@mingcute/vue?color=007AFF&label=gzip" alt="@mingcute/vue minified and gzipped size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/vue"><img src="https://img.shields.io/npm/dm/@mingcute/vue?color=23AF5F&label=downloads" alt="@mingcute/vue monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/vue` provides typed Vue components for the public MingCute Core Regular and Core Filled icon styles.

The package focuses on Vue rendering, accessibility, prop precedence, attribute forwarding, and server-rendered hydration. Canonical icon geometry comes from `@mingcute/icons`, so the Vue adapter does not duplicate the icon catalogue.

## Highlights

- **4,526 styled definitions:** 2,263 icons in Core Regular and Core Filled.
- **Typed Vue components:** generated TypeScript declarations and SVG-compatible props.
- **Tree-shakeable imports:** style entry points and direct icon subpaths.
- **Accessible defaults:** icons remain decorative unless given an accessible title or label.
- **SSR-safe resources:** instance-scoped IDs prevent collisions in gradients, masks, and clip paths.
- **Shared geometry:** all icon data comes from `@mingcute/icons`.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

Vue 3.5 or newer is required.

```bash
# npm
npm install @mingcute/vue

# pnpm
pnpm add @mingcute/vue

# Yarn
yarn add @mingcute/vue

# Bun
bun add @mingcute/vue
```

## Quick Start

```vue
<script setup lang="ts">
import {
  Home1Regular,
  MenuRegular,
} from '@mingcute/vue/core-regular';
</script>

<template>
  <Home1Regular :size="24" color="currentColor" title="Home" />
</template>
```

## Imports

### Style entry points

Use a style entry point for convenient named imports:

```ts
import {
  Home1Regular,
  Search2Regular,
} from '@mingcute/vue/core-regular';
```

### Direct icon imports

Use a direct icon subpath for the smallest module graph:

```ts
import Home1Regular from '@mingcute/vue/core-regular/home-1';
```

The package root exports the shared `Icon` utility and public types. It does not re-export the complete icon catalogue.

## API Reference

| Prop or attribute | Type | Default | Purpose |
|---|---|---|---|
| `size` | `number \| string` | `24` | Sets both width and height unless either dimension is provided |
| `width` | SVG attribute | `size` | Overrides the rendered width |
| `height` | SVG attribute | `size` | Overrides the rendered height |
| `color` | `string` | `currentColor` | Sets the inherited SVG paint color |
| `title` | `string` | none | Adds an accessible `<title>` |
| `titleId` | `string` | generated | Overrides the generated title association ID |
| Other attributes | Vue `SVGAttributes` | none | Forwards classes, styles, listeners, ARIA, and SVG attributes |

Explicit `width` or `height` values take precedence over `size`.

## Accessibility

Icons without a title or explicit accessible name are hidden from assistive technology.

### Meaningful icons

Use `title`, `aria-label`, or `aria-labelledby` when the icon communicates meaning by itself:

```vue
<Home1Regular :size="24" title="Home" />
```

### Decorative icons

Keep an icon decorative when nearby text already labels the control:

```vue
<button type="button">
  <Home1Regular :size="20" aria-hidden="true" />
  <span>Home</span>
</button>
```

### Icon-only controls

Place the accessible name on the control and keep the icon decorative:

```vue
<button type="button" aria-label="Open navigation">
  <MenuRegular :size="20" aria-hidden="true" />
</button>
```

## Server Rendering

The renderer uses stable Vue IDs to scope SVG resources and title associations.

For reliable hydration:

- use the same MingCute package version on the server and client;
- render the same component tree on both sides;
- avoid changing icon order during hydration; and
- preserve stable keys when rendering icon lists.

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

- The package is ESM-only and declares `sideEffects: false`.
- Prefer direct icon imports in shared libraries and bundle-sensitive entry points.
- Vue attributes and listeners are forwarded to the rendered `<svg>`.
- Explicit dimensions override `size`.
- Use framework components or standalone SVG when gradients, masks, or patterns must be preserved exactly.

## Integration with Definitions

`@mingcute/icons` owns icon names, normalized geometry, layers, resources, and metadata.

`@mingcute/vue` owns:

- Vue component rendering;
- prop and attribute handling;
- accessibility behavior;
- resource ID scoping; and
- SSR hydration behavior.

Keeping those responsibilities separate prevents duplicate icon data and keeps every framework adapter visually consistent.

## Troubleshooting

### A component import cannot be resolved

Use a PascalCase named export from a style entry point:

```ts
import { Home1Regular } from '@mingcute/vue/core-regular';
```

Or use the kebab-case direct path:

```ts
import Home1Regular from '@mingcute/vue/core-regular/home-1';
```

### Attributes do not appear on the SVG

Pass attributes to the icon component itself. Supported Vue SVG attributes, classes, styles, listeners, and ARIA attributes are forwarded.

### An SSR hydration warning appears

Confirm that the server and client use the same MingCute version and render the same icon tree in the same order.

### The production bundle is larger than expected

Use direct icon subpaths and confirm that the bundler tree-shakes ESM. Avoid namespace imports of complete style entry points.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/vue check
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
