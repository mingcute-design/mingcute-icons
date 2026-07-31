# Changelog - @mingcute/font

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.2] - 2026-07-31

### Fixed

- Published metadata now resolves cleanly outside the workspace.

## [3.0.1] - 2026-07-30

### Documentation

- Expanded font installation, stylesheet, codepoint, accessibility,
  compatibility, and troubleshooting guidance.

### Changed

- Added `svg-icons`, `vector-icons`, and `icon-library` package keywords.

## [3.0.0] - 2026-07-29

### Added

- WOFF2 output for Core Regular and Filled.
- Minified CSS mappings, bundle stylesheet, font assets, and generated metadata.
- Append-only codepoint ledger shared across styles.

### Changed

- Ordinary builds consume the checked-in codepoint ledger and cannot silently allocate values.

### Fixed

- Verified font metrics, fragile glyph outlines, class mappings, and browser rasterization fixtures.
