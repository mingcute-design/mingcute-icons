# Changelog - @mingcute/react-native

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.2] - 2026-07-31

### Fixed

- Published metadata now resolves cleanly outside the workspace.

## [3.0.1] - 2026-07-30

### Documentation

- Expanded React Native installation, imports, props, accessibility, platform
  compatibility, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- React Native components for Core Regular and Filled.
- Style barrels and direct icon subpath exports.
- Typed component props compatible with React 18+, React Native 0.72+, and react-native-svg 13+.
- Native accessibility defaults, title association, and caller-controlled React Native accessibility behavior.
- Instance-scoped SVG resources for gradients, masks, clip paths, and patterns.

### Changed

- Icon geometry is consumed from `@mingcute/icons` instead of duplicated in this renderer.
- The package root exports only the shared Icon utility and types.

### Fixed

- Verified color overrides, native accessibility props, ref forwarding, scoped resource identifiers, package resolution, and tree-shaking.
- Added the complete free angular-gradient device fixture required by the native release typecheck.
