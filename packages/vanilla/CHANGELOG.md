# Changelog - @mingcute/vanilla

## [4.0.0] - 2026-11-04

### Breaking changes

- Use the current designer v1.60 icon names without legacy name aliases.
- Use the canonical `assets/stroke` collection and generated package subpaths.
- Preserve upstream font codepoints for matching canonical names; retire removed names and allocate new names without reusing codepoints.

### Rendering

- Preserve outer mask compositing and fixed Original brand colors in SVG/framework output.
- Build 4,526 Core Regular/Filled definitions, SVGs, and font glyphs from the current artwork.

## [3.1.0] - 2026-10-29

### Added

- SVG strings for the expanded Core Regular and Filled corpus,
  now 2,263 icons per style.

### Changed

- Followed renamed icon exports from `@mingcute/icons` and removed `dots-vertical`.

## [3.0.2] - 2026-07-31

### Fixed

- Published metadata now resolves cleanly outside the workspace.

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
