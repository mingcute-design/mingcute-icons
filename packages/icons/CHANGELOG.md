# Changelog - @mingcute/icons

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

- 4,526 definitions across Core Regular and Filled,
  including 607 new icons per style.

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
