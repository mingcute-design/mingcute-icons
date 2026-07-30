# Changelog - @mingcute/compiler

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.1] - 2026-07-30

### Documentation

- Expanded the private compiler guide with pipeline, validation, maintenance,
  and troubleshooting details.

### Changed

- Added consistent icon-library discovery metadata to the workspace manifest.

## [3.0.0] - 2026-07-29

### Added

- Framework-neutral source discovery, SVG parsing, optimization, normalization, and validation.
- Structured support for gradients, masks, clip paths, and embedded image patterns.
- Asset audits against the canonical source catalogue.

### Changed

- Renamed from the former internal package scope while retaining `private: true`.

### Security

- Rejects active content and external resources before package generation.
- Validates raw input before optimization, rejects untrusted foreign content, and validates resource identifiers, nested references, and gradient values.
- Updated SVGO to 3.3.4.
