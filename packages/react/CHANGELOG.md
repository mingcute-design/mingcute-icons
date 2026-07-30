# Changelog - @mingcute/react

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.1] - 2026-07-30

### Documentation

- Expanded React installation, imports, props, accessibility, SSR,
  tree-shaking, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- React components for Core Regular and Filled.
- Style barrels and direct icon subpath exports.
- Typed component props compatible with React 18 or 19.
- Accessible decorative defaults, title association, and caller-controlled ARIA behavior.
- Instance-scoped SVG resources for gradients, masks, clip paths, and patterns.

### Changed

- Icon geometry is consumed from `@mingcute/icons` instead of duplicated in this renderer.
- The package root exports only the shared Icon utility and types.

### Fixed

- Verified prop precedence, ref forwarding, SSR-safe identifiers, package resolution, and tree-shaking.
