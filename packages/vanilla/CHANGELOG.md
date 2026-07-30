# Changelog - @mingcute/vanilla

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.1] - 2026-07-30

### Documentation

- Expanded Vanilla JavaScript installation, string and DOM APIs,
  accessibility, security, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- Core Regular and Filled as importable SVG strings.
- `toSvgString()` for server and template rendering.
- `createIcon()` for validated browser DOM creation.
- Dimension, color, class, title, ARIA, and custom attribute options.

### Changed

- Icon source is consumed from `@mingcute/icons` without duplicating definitions.

### Fixed

- Escaped markup and attributes, validated attribute names, and preserved complex SVG resources.

### Security

- Rejects active elements, event handlers, external references, and unsafe CSS URLs before DOM parsing.
