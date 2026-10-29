<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/react</h1>

<h3 align="center">Typed, tree-shakeable MingCute icons for React</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/react"><img src="https://img.shields.io/npm/v/%40mingcute%2Freact?color=007AFF&label=version" alt="@mingcute/react npm version" /></a>&nbsp;
  <a href="https://bundlephobia.com/package/@mingcute/react"><img src="https://img.shields.io/bundlephobia/minzip/@mingcute/react?color=007AFF&label=gzip" alt="@mingcute/react minified and gzipped size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/react"><img src="https://img.shields.io/npm/dm/%40mingcute%2Freact?color=23AF5F&label=downloads" alt="@mingcute/react monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/react` provides typed React components for the public MingCute Core Regular and Core Filled styles.

Canonical icon geometry comes from `@mingcute/icons`. The adapter focuses on React rendering, accessibility, prop precedence, refs, framework lifecycle behavior, and stable SVG resource identifiers.

## Highlights

- **4,526 styled definitions:** 2,263 icons in Core Regular and Core Filled.
- **Typed React components:** generated declarations and framework-native props.
- **Tree-shakeable imports:** style entry points and direct icon subpaths.
- **Accessible defaults:** unlabeled icons remain decorative.
- **Scoped SVG resources:** repeated icons avoid gradient, mask, and clip-path collisions.
- **Shared geometry:** the adapter does not duplicate the icon catalogue.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

**Compatibility:** React 18 or 19.

```bash
# npm
npm install @mingcute/react

# pnpm
pnpm add @mingcute/react

# Yarn
yarn add @mingcute/react

# Bun
bun add @mingcute/react
```

## Quick Start

```tsx
import { Home1Regular } from '@mingcute/react/core-regular';

export function NavigationIcon() {
  return <Home1Regular size={24} color="currentColor" title="Home" />;
}
```

## Imports

### Style entry points

```ts
import {
  Home1Regular,
  Search2Regular,
} from '@mingcute/react/core-regular';
```

### Direct icon imports

```ts
import Home1Regular from '@mingcute/react/core-regular/home-1';
```

The package root exports the shared `Icon` utility and public types. It does not re-export the complete icon catalogue.

## API Reference

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `size` | `number \| string` | `24` | Sets both width and height unless either is provided |
| `width` | React SVG value | `size` | Overrides the rendered width |
| `height` | React SVG value | `size` | Overrides the rendered height |
| `color` | `string` | `currentColor` | Sets inherited SVG paint |
| `title` | `string` | none | Adds an accessible `<title>` |
| `titleId` | `string` | generated | Overrides the generated title association ID |
| `ref` | `Ref<SVGSVGElement>` | none | Accesses the rendered SVG element |
| Other props | `SVGProps<SVGSVGElement>` | none | Forwards SVG, event, class, style, and ARIA props |

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

Components use `React.useId()` to scope titles, gradients, masks, clip paths, and patterns.

For reliable hydration, render the same component tree with the same package version on the server and client. Do not rewrite generated resource IDs.

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
- Style icons with `color`, `className`, or `style`.

## Integration with Definitions

`@mingcute/icons` owns icon names, normalized geometry, SVG resources, layers, and metadata.

`@mingcute/react` owns:

- React component rendering;
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

### A hydration warning appears

Confirm that the server and client render the same icon tree with the same React and MingCute package versions.

### An icon has the wrong color

Check for a more specific CSS rule on the SVG or its child paths. Most themeable geometry uses `currentColor`.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/react check
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
