# Changelog - @mingcute/font

## [3.2.0] - 2026-11-04

### Artwork and naming updates

- Use the current designer v1.60 icon names without legacy name aliases.
- Use the canonical `assets/stroke` collection and generated package subpaths.
- Preserve upstream font codepoints for matching canonical names; retire removed names and allocate new names without reusing codepoints.

### Rendering

- Preserve outer mask compositing and fixed Original brand colors in SVG/framework output.
- Build 4,526 Core Regular/Filled definitions, SVGs, and font glyphs from the current artwork.

## [3.1.0] - 2026-10-29

### Added

- 4,526 styled glyphs across Core Regular and Filled,
  including 607 new glyphs per style.
- Appended codepoints for new icons without reusing published values.

### Changed

- Renamed `barcode-sca` to `barcode-scan`, `computer-camer` to `computer-camera`,
  `currency-rubel` to `currency-ruble`, `currency-rubel-2` to `currency-ruble-2`,
  `docment` to `document`, and `rada` to `radar`.
- Removed `dots-vertical` without a direct replacement.

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
