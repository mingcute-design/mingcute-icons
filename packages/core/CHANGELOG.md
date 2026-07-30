# Changelog - @mingcute/core

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.0.1] - 2026-07-30

### Documentation

- Expanded the private architecture guide with contract ownership, package
  boundaries, maintenance, and troubleshooting details.

### Changed

- Added consistent icon-library discovery metadata to the workspace manifest.

## [3.0.0] - 2026-07-29

### Added

- Public style, icon, naming, and adapter contracts.
- Private workspace build and test entry points.

### Changed

- Renamed from the former internal package scope while retaining `private: true`.

### Security

- Release guards reject this package from public consumer runtime dependencies.
