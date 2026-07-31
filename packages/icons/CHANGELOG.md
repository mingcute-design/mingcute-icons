# Changelog - @mingcute/icons

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.2] - 2026-07-31

### Fixed

- Published metadata now resolves cleanly outside the workspace.

## [3.0.1] - 2026-07-30

### Documentation

- Expanded framework-neutral definitions, rendering, resource scoping,
  accessibility, security, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- 3,326 definitions across Core Regular and Filled.
- Typed icon geometry, metadata, gradient, mask, clip-path, and pattern models.
- Style barrels, direct icon subpaths, metadata JSON, and styles metadata.
- Safe SVG body and source rendering helpers with scoped resource IDs.

### Changed

- Established this package as the single geometry dependency for framework renderers.

### Fixed

- Validated complex SVG resources and XML escaping across representative source fixtures.
