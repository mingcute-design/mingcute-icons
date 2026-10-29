<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/react-native</h1>

<h3 align="center">Typed MingCute icons for React Native</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/react-native"><img src="https://img.shields.io/npm/v/%40mingcute%2Freact-native?color=007AFF&label=version" alt="@mingcute/react-native npm version" /></a>&nbsp;
  <a href="https://bundlephobia.com/package/@mingcute/react-native"><img src="https://img.shields.io/bundlephobia/minzip/@mingcute/react-native?color=007AFF&label=gzip" alt="@mingcute/react-native minified and gzipped size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/react-native"><img src="https://img.shields.io/npm/dm/%40mingcute%2Freact-native?color=23AF5F&label=downloads" alt="@mingcute/react-native monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/react-native` provides typed React Native components for the public MingCute Core Regular and Core Filled styles.

Canonical icon geometry comes from `@mingcute/icons`. The adapter focuses on React Native rendering, accessibility, prop precedence, refs, framework lifecycle behavior, and stable SVG resource identifiers.

## Highlights

- **4,526 styled definitions:** 2,263 icons in Core Regular and Core Filled.
- **Typed React Native components:** generated declarations and framework-native props.
- **Tree-shakeable imports:** style entry points and direct icon subpaths.
- **Accessible defaults:** unlabeled icons remain decorative.
- **Scoped SVG resources:** repeated icons avoid gradient, mask, and clip-path collisions.
- **Shared geometry:** the adapter does not duplicate the icon catalogue.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

**Compatibility:** React 18+, React Native 0.72+, and `react-native-svg` 13+.

```bash
# npm
npm install @mingcute/react-native

# pnpm
pnpm add @mingcute/react-native

# Yarn
yarn add @mingcute/react-native

# Bun
bun add @mingcute/react-native
```

## Quick Start

```tsx
import { Home1Regular } from '@mingcute/react-native/core-regular';

export function NavigationIcon() {
  return <Home1Regular size={24} color="#10161F" />;
}
```

## Imports

### Style entry points

```ts
import {
  Home1Regular,
  Search2Regular,
} from '@mingcute/react-native/core-regular';
```

### Direct icon imports

```ts
import Home1Regular from '@mingcute/react-native/core-regular/home-1';
```

The package root exports the shared `Icon` utility and public types. It does not re-export the complete icon catalogue.

## API Reference

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `size` | `number \| string` | `24` | Sets both width and height unless either is provided |
| `width` | `SvgProps` value | `size` | Overrides the rendered width |
| `height` | `SvgProps` value | `size` | Overrides the rendered height |
| `color` | `string` | `currentColor` | Sets the primary theme color |
| `primaryColor` | `string` | `color` | Explicitly overrides primary artwork |
| `secondaryColor` | `string` | primary color | Overrides themeable secondary artwork |
| `secondaryOpacity` | `number` | `0.3` | Controls secondary artwork opacity |
| `title` | `string` | none | Supplies the default native accessibility label |
| `ref` | React ref | none | Accesses the underlying `Svg` host |
| Other props | `SvgProps` | none | Forwards native SVG and accessibility props |

Explicit `width` or `height` values take precedence over `size`.

## Accessibility

Icons without a title or explicit accessible name are hidden from assistive technology.

### Meaningful icons

Provide a title or platform-appropriate accessibility label when an icon communicates meaning by itself.

### Decorative icons

Keep icons decorative when nearby text already labels the action.

### Icon-only controls

Put the accessible name on the interactive control and keep the icon itself decorative.

## Native Rendering

The adapter renders through `react-native-svg` and requires no WebView or browser DOM.

Angular gradients are represented with clipped native SVG wedges where needed. Refs target the underlying `Svg` component.

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
- Prefer direct icon subpaths to reduce Metro's module graph.

## Integration with Definitions

`@mingcute/icons` owns icon names, normalized geometry, SVG resources, layers, and metadata.

`@mingcute/react-native` owns:

- React Native component rendering;
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

### `react-native-svg` cannot be resolved

Install a compatible peer dependency and complete the platform’s normal native dependency setup.

### An icon is missing after upgrading

Reset Metro’s cache and rebuild the native application.

### A layered color does not change

Only themeable secondary artwork responds to `secondaryColor`. Original-color artwork preserves its authored colors.

### Rendering differs from web

React Native uses native SVG primitives and approximates angular gradients with clipped wedges.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/react-native check
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
