# Changelog - MingCute Icons

All notable changes to this repository are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.1.0] - 2026-10-29

### Added

- Expanded Core Regular and Core Filled from 1,663 to 2,263 icons per style.
- Added 607 icons in each style, for 4,526 styled definitions across the public packages.

### Changed

- Renamed `barcode-sca` to `barcode-scan`, `computer-camer` to `computer-camera`,
  `currency-rubel` to `currency-ruble`, `currency-rubel-2` to `currency-ruble-2`,
  `docment` to `document`, and `rada` to `radar`.
- Removed `dots-vertical` without a direct replacement.

## [3.0.2] - 2026-07-31

### Fixed

- Published framework package manifests with installable icon dependencies instead of workspace-only ranges.

## [3.0.1] - 2026-07-30

### Documentation

- Expanded the repository and package guides with package-specific installation,
  imports, accessibility, compatibility, security, and troubleshooting details.

### Changed

- Added consistent `svg-icons`, `vector-icons`, and `icon-library` discovery
  metadata across the workspace.

## [3.0.0] - 2026-07-29

### Added

- Dedicated public monorepo for ten coordinated MingCute packages.
- Core Regular and Core Filled distributions with 1,663 icons per style.
- Framework packages for React, Vue, React Native, Svelte, SolidJS, Vanilla JavaScript, and Web Components.
- Framework-neutral definitions, optimized SVG assets, and WOFF2 font distributions.
- Stable append-only font codepoint ledger and generated style metadata.
- Release policy and packed-artifact checks for all public packages.

### Changed

- Kept the v1.5 artwork baseline at 1,663 icons per style; eleven newly authored
  icons are deferred to the next larger content release.
- Centralized icon geometry in `@mingcute/icons` so framework packages no longer duplicate definition data.
- Separated the free repository from Pro licensing, registry, and private source infrastructure.
- Enabled strict unused-code, implicit-return, and switch fallthrough checks across the workspace.
- Added a CI gate for full checks, packed archives, and high-severity production dependency audits.

### Security

- Updated SVGO to 3.3.4 and validate active SVG content before optimization.
- Reject active or externally referenced SVG markup at browser string-rendering boundaries.

### Fixed

- Aligned package exports, direct icon subpaths, accessibility defaults, resource ID scoping, and tree-shaking behavior across supported frameworks.
- Added the missing React Native device fixture so the native release typecheck cannot silently disappear.
