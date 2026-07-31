# Changelog - @mingcute/svg

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.2] - 2026-07-31

### Fixed

- Published metadata now resolves cleanly outside the workspace.

## [3.0.1] - 2026-07-30

### Documentation

- Expanded SVG installation, asset imports, metadata, rendering,
  accessibility, optimization, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- 3,326 optimized public SVG files.
- Explicit style asset paths, per-style metadata, and `styles.json`.
- Render fixtures covering gradients, masks, and embedded image resources.

### Security

- Rejected scripts, event handlers, external resource URLs, and malformed source SVG.

### Fixed

- Preserved structured gradients, clipping, masks, and self-contained patterns during optimization.
