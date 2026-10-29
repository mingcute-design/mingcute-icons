<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/web-components</h1>

<h3 align="center">Tree-shakeable MingCute custom elements with explicit registration</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/web-components"><img src="https://img.shields.io/npm/v/@mingcute/web-components?color=007AFF&label=version" alt="@mingcute/web-components npm version" /></a>&nbsp;
  <a href="https://bundlephobia.com/package/@mingcute/web-components"><img src="https://img.shields.io/bundlephobia/minzip/@mingcute/web-components?color=007AFF&label=gzip" alt="@mingcute/web-components minified and gzipped size" /></a>&nbsp;
  <a href="https://www.npmjs.com/package/@mingcute/web-components"><img src="https://img.shields.io/npm/dm/@mingcute/web-components?color=23AF5F&label=downloads" alt="@mingcute/web-components monthly npm downloads" /></a>&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/web-components` provides one custom-element class and one registration function for every public MingCute icon.

Importing an icon module does not modify the global custom-element registry. Registration is explicit, idempotent, and controlled by the application.

## Highlights

- **Explicit registration:** imports remain side-effect free.
- **Tree-shakeable modules:** import only the icons your application registers.
- **Standards-based rendering:** Custom Elements, Shadow DOM, and SVG.
- **Accessible defaults:** unlabeled icons remain decorative.
- **Style isolation:** the internal SVG is exposed through `part="svg"`.
- **Shared icon geometry:** generated elements consume `@mingcute/icons`.

<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner2.png" alt="MingCute icons used in product interfaces" width="100%" />
</a>

## Installation

```bash
# npm
npm install @mingcute/web-components

# pnpm
pnpm add @mingcute/web-components

# Yarn
yarn add @mingcute/web-components

# Bun
bun add @mingcute/web-components
```

## Quick Start

Register the icon in browser startup code:

```js
import { defineHome1Regular } from '@mingcute/web-components/core-regular/home-1';

defineHome1Regular();
```

Then use the custom element:

```html
<mingcute-home-1-regular
  size="24"
  title="Home"
></mingcute-home-1-regular>
```

Importing the module alone does not register the element.

## Registration API

Each icon module exports:

- a generated custom-element constructor;
- a `define...()` registration function; and
- the icon’s default tag name.

```js
import {
  Home1RegularElement,
  defineHome1Regular,
} from '@mingcute/web-components/core-regular/home-1';
```

The generated function accepts an optional tag name and registry:

```js
defineHome1Regular(name?, registry?);
```

It registers the icon and returns its constructor.

The lower-level helper supports tests and isolated registries:

```js
defineIconElement(tagName, constructor, registry?);
```

Registration:

- validates custom-element names;
- does not replace an existing tag with a different constructor;
- safely returns the existing constructor when registration is repeated; and
- supports an explicit registry when the environment provides one.

## API Reference

| Attribute | Default | Purpose |
|---|---|---|
| `size` | `24` | Sets width and height unless either dimension is provided |
| `width` | `size` | Overrides the SVG width |
| `height` | `size` | Overrides the SVG height |
| `color` | `currentColor` | Sets the inherited SVG paint color |
| `title` | none | Adds an accessible `<title>` |
| `title-id` | generated | Overrides the title association ID |
| `aria-label` | none | Provides an accessible name |
| `aria-labelledby` | none | Associates external accessible text |
| `aria-hidden` | accessibility default | Overrides assistive-technology visibility |
| `role` | accessibility default | Overrides the generated role |
| `class`, `style` | none | Styles the custom-element host |

The rendered SVG is available through:

```js
element.svg
```

It is also exposed as a CSS shadow part:

```css
mingcute-home-1-regular::part(svg) {
  display: block;
}
```

## Styling

Set supported values directly on the host:

```html
<mingcute-home-1-regular
  size="20"
  color="rebeccapurple"
></mingcute-home-1-regular>
```

Use `::part(svg)` to style the internal SVG:

```css
.app-icon::part(svg) {
  display: block;
}
```

Ordinary descendant selectors cannot cross the Shadow DOM boundary.

## Accessibility

Unlabeled elements render as decorative.

### Meaningful icons

Provide a title or ARIA label when the icon communicates meaning by itself:

```html
<mingcute-home-1-regular
  size="24"
  title="Home"
></mingcute-home-1-regular>
```

### Decorative icons

Keep the icon decorative when visible text already provides the label:

```html
<button type="button">
  <mingcute-home-1-regular
    size="20"
    aria-hidden="true"
  ></mingcute-home-1-regular>
  <span>Home</span>
</button>
```

### Icon-only controls

Place the accessible name on the control:

```js
import { defineMenuRegular } from '@mingcute/web-components/core-regular/menu';

defineMenuRegular();
```

```html
<button type="button" aria-label="Open navigation">
  <mingcute-menu-regular
    size="20"
    aria-hidden="true"
  ></mingcute-menu-regular>
</button>
```

## Browser and Server Environments

Custom elements require browser support for:

- Custom Elements;
- Shadow DOM; and
- standards-compliant SVG.

Icon modules can be imported in server code, but registration must be deferred until a custom-element registry is available.

```js
if (typeof customElements !== 'undefined') {
  defineHome1Regular();
}
```

## Available Styles

| Import subpath | Style | Icons |
|---|---|---:|
| `core-regular` | Core Regular | 2,263 |
| `core-filled` | Core Filled | 2,263 |
| **Total** | **All public styles** | **4,526** |

## Production Guidance

- The package is ESM-only and side-effect free.
- Importing an icon does not register it.
- Register icons during browser startup or feature initialization.
- Prefer direct icon imports to keep registrations and module graphs explicit.
- Use unique tag names for application-specific aliases.
- Style the internal SVG through `::part(svg)`.
- Avoid registering the same tag with different constructors.

## Integration with Definitions

Generated custom elements consume canonical geometry from `@mingcute/icons`.

`@mingcute/icons` owns icon data and metadata.

`@mingcute/web-components` owns:

- custom-element classes;
- explicit registration;
- Shadow DOM rendering;
- host attributes;
- SVG part exposure; and
- accessibility behavior.

## Troubleshooting

### The custom-element tag renders nothing

Confirm that its registration function ran after `customElements` became available:

```js
defineHome1Regular();
```

### Registration throws an error

The tag may already be registered with another constructor. Use a unique custom-element name or reuse the existing definition.

### CSS does not reach the SVG

Use the exposed shadow part:

```css
mingcute-home-1-regular::part(svg) {
  display: block;
}
```

### Server rendering fails during registration

Import the module on the server if needed, but call `define...()` only in the browser.

### The bundle is larger than expected

Use direct icon modules and register only the icons required by the application.

## Development

This package is generated from canonical SVG sources. Do not edit generated output by hand.

```bash
pnpm --filter @mingcute/web-components check
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
