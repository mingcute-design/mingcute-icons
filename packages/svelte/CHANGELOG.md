# Changelog - @mingcute/svelte

## [4.0.0] - 2026-11-04

### Breaking changes

- Use the current designer v1.60 icon names without legacy name aliases.
- Use the canonical `assets/stroke` collection and generated package subpaths.
- Preserve upstream font codepoints for matching canonical names; retire removed names and allocate new names without reusing codepoints.

### Rendering

- Preserve outer mask compositing and fixed Original brand colors in SVG/framework output.
- Build 4,526 Core Regular/Filled definitions, SVGs, and font glyphs from the current artwork.

## [3.1.0] - 2026-10-29

### Added

- Svelte components for the expanded Core Regular and Filled corpus,
  now 2,263 icons per style.

### Changed

- Followed renamed icon exports from `@mingcute/icons` and removed `dots-vertical`.

## [3.0.2] - 2026-07-31

### Fixed

- Published metadata now resolves cleanly outside the workspace.

## [3.0.1] - 2026-07-30

### Documentation

- Expanded Svelte installation, imports, props, accessibility, SSR,
  tree-shaking, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- Svelte components for Core Regular and Filled.
- Style barrels and direct icon subpath exports.
- Typed component props compatible with Svelte 5.20 or newer.
- Accessible decorative defaults, title association, and caller-controlled ARIA behavior.
- Instance-scoped SVG resources for gradients, masks, clip paths, and patterns.

### Changed

- Icon geometry is consumed from `@mingcute/icons` instead of duplicated in this renderer.
- The package root exports only the shared Icon utility and types.

### Fixed

- Verified prop precedence, ref forwarding, SSR-safe identifiers, package resolution, and tree-shaking.

### Security

- Rejects active elements, event handlers, external references, and unsafe CSS URLs before raw SVG insertion.
