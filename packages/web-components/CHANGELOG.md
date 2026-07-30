# Changelog - @mingcute/web-components

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.1] - 2026-07-30

### Documentation

- Expanded custom-element registration, attributes, accessibility, styling,
  SSR behavior, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- Core Regular and Filled as custom-element constructors.
- Explicit, idempotent registration functions for every icon.
- Reactive size, color, title, ARIA, class, and style attributes.
- Open shadow roots with the SVG exposed through `part="svg"` and `element.svg`.

### Changed

- Package imports no longer register global elements as a side effect.

### Fixed

- Scoped SVG resources per element instance and enforced caller-first accessibility precedence.
