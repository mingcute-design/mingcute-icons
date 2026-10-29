<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/icons</h1>

<h3 align="center">Framework neutral MingCute icon definitions and rendering helpers</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/icons"><img src="https://img.shields.io/npm/v/@mingcute/icons?color=007AFF&label=version" alt="@mingcute/icons npm version" /></a>&nbsp;
  <a href="https://bundlephobia.com/package/@mingcute/icons"><img src="https://img.shields.io/bundlephobia/minzip/@mingcute/icons?color=007AFF&label=gzip" alt="@mingcute/icons minified and gzipped size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/icons"><img src="https://img.shields.io/npm/dm/@mingcute/icons?color=23AF5F&label=downloads" alt="@mingcute/icons monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/icons` is the framework-neutral data foundation for the public MingCute packages.

Each icon is represented as a typed `IconDefinition` containing its view box, normalized geometry, resources, and metadata.

Framework adapters consume this package instead of embedding separate copies of the SVG catalogue.

## Highlights

- **4,526 styled definitions:** 2,263 icons in Core Regular and Core Filled.
- **Framework-neutral data:** suitable for custom renderers and build tools.
- **Structured SVG resources:** gradients, masks, clip paths, and patterns remain typed.
- **Safe rendering helpers:** XML values are escaped and resource IDs are scoped.
- **Direct icon imports:** load one definition without importing a complete style.
- **Generated metadata:** inspect catalogue information without importing icon modules.
- **Shared foundation:** React, Vue, React Native, Svelte, SolidJS, Vanilla, and Web Components consume the same definitions.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

```bash
# npm
npm install @mingcute/icons

# pnpm
pnpm add @mingcute/icons

# Yarn
yarn add @mingcute/icons

# Bun
bun add @mingcute/icons
```

## Quick Start

Import an icon definition and render a complete SVG document:

```ts
import { Home1Icon } from '@mingcute/icons/core-regular';
import { renderIconSource } from '@mingcute/icons';

const svg = renderIconSource(Home1Icon);
```

For the smallest module graph:

```ts
import Home1Icon from '@mingcute/icons/core-regular/home-1';
import { renderIconSource } from '@mingcute/icons';

const svg = renderIconSource(Home1Icon);
```

## Imports

### Style entry points

Use a style entry point for convenient named imports:

```ts
import {
  Home1Icon,
  Search2Icon,
} from '@mingcute/icons/core-regular';
```

### Direct icon imports

Use a direct icon path when only one definition is required:

```ts
import Home1Icon from '@mingcute/icons/core-regular/home-1';
```

### Metadata imports

Load generated metadata without importing icon definitions:

```ts
import metadata from '@mingcute/icons/metadata/core-regular' with {
  type: 'json',
};
```

Toolchains without JSON-module support may load the metadata through their asset APIs.

## API Reference

| Export | Purpose |
|---|---|
| `renderIconBody(definition, idPrefix?)` | Renders inner SVG markup with scoped resource identifiers |
| `renderIconSource(definition, idPrefix?)` | Renders a complete standalone SVG document |
| `/<style>` | Provides named icon definitions for one style |
| `/<style>/<icon>` | Provides one default icon definition |
| `/metadata/<style>` | Provides generated JSON metadata |
| `/styles.json` | Provides the canonical public style catalogue |

## Rendering Helpers

### `renderIconBody`

Renders the inner markup of an SVG element:

```ts
const body = renderIconBody(Home1Icon, 'home-instance');
```

Use this helper when a custom renderer owns the outer `<svg>` element.

### `renderIconSource`

Renders a complete standalone SVG document:

```ts
const source = renderIconSource(Home1Icon, 'home-instance');
```

Use this helper when a complete SVG string is required.

### Resource prefixes

Pass a stable, instance-specific prefix when rendering icons that contain gradients, masks, clip paths, or patterns:

```ts
const first = renderIconSource(Home1Icon, 'home-1');
const second = renderIconSource(Home1Icon, 'home-2');
```

This prevents resource identifier collisions when multiple instances appear in the same document.

## Definition Model

`IconDefinition` keeps SVG content structured rather than flattening it into arbitrary markup.

A definition may contain:

- view-box information;
- normalized shape nodes;
- fills and strokes;
- groups and transforms;
- gradients;
- masks;
- clipping paths;
- patterns;
- self-contained embedded images; and
- generated metadata.

The renderer:

- escapes XML attribute values;
- scopes internal resource references;
- preserves supported resources;
- rejects external image URLs during compilation; and
- never executes active content.

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

## Building a Custom Renderer

A custom renderer should support every node and resource represented by `IconDefinition`.

At minimum, account for:

- SVG geometry;
- groups and transforms;
- inherited paint;
- gradients;
- masks;
- clip paths;
- patterns;
- scoped resource IDs; and
- self-contained embedded images.

Do not assume that every icon is a flat list of paths.

## Security

Generated definitions are trusted build artifacts.

The package:

- structures icon resources instead of storing arbitrary executable markup;
- escapes XML values during string rendering;
- scopes resource references;
- preserves only supported embedded resources; and
- rejects external image URLs during compilation.

The package guarantees the safety of its generated icon data, not arbitrary markup added by an application.

Do not concatenate untrusted HTML or SVG into rendered output.

## Production Guidance

- The package is ESM-only and declares `sideEffects: false`.
- Prefer direct definition imports in custom renderers and performance-sensitive code.
- Pass a stable custom resource prefix when the renderer owns instance identity.
- Treat generated definitions and metadata as immutable.
- Avoid namespace imports of complete styles when only a small number of icons is needed.
- Configure the toolchain for JSON modules before importing metadata directly.
- Keep custom renderers aligned with the complete `IconDefinition` model.

## Integration with Framework Packages

The public framework packages consume `@mingcute/icons`:

```text
@mingcute/icons
├── @mingcute/react
├── @mingcute/vue
├── @mingcute/react-native
├── @mingcute/svelte
├── @mingcute/solid
├── @mingcute/vanilla
└── @mingcute/web-components
```

`@mingcute/icons` owns:

- icon names;
- normalized geometry;
- SVG resources;
- style metadata; and
- rendering helpers.

Framework adapters own their target-specific component APIs and accessibility behavior.

## Troubleshooting

### A definition import cannot be resolved

Use a PascalCase named export from a style entry point:

```ts
import { Home1Icon } from '@mingcute/icons/core-regular';
```

Or use the kebab-case direct path:

```ts
import Home1Icon from '@mingcute/icons/core-regular/home-1';
```

### A JSON metadata import fails

Enable JSON-module support in the toolchain or load the metadata file through the bundler’s asset API.

### Duplicate SVG resource IDs appear

Pass a distinct prefix for each independently rendered instance:

```ts
renderIconSource(Home1Icon, 'instance-1');
renderIconSource(Home1Icon, 'instance-2');
```

### A custom renderer drops artwork

Support every resource represented by the definition model, including gradients, masks, clip paths, patterns, and embedded images.

### The bundle is larger than expected

Use direct icon paths and avoid importing complete styles as namespaces.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/icons check
```

<img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner3.png" alt="Editable MingCute vector construction" width="100%" />

## License

Licensed under the [Apache License 2.0](../../LICENSE). See the included `LICENSE` file.

## Links

- [MingCute website](https://www.mingcute.com/)
- [Package changelog](./CHANGELOG.md)
- [Icon keywords](../../doc/Keywords.md)
- [Icon mapping](../../doc/Mapping.md)
- [MingCute Icons packages](../../README.md#packages)
- [Repository](https://github.com/mingcute-design/mingcute-icons)
