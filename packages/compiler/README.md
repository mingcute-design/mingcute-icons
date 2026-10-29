<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/compiler</h1>

<h3 align="center">Private SVG compilation and validation for MingCute packages</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <img src="https://img.shields.io/badge/workspace-private-007AFF" alt="Private workspace package" />&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/compiler` is the private, framework-neutral build pipeline that converts canonical MingCute SVG artwork into the shared `IconDefinition` model.

It is used only during repository builds. Consumer packages have no runtime dependency on it.

## Responsibilities

The compiler owns:

- source discovery;
- secure XML parsing;
- SVG optimization;
- geometry normalization;
- paint and resource normalization;
- definition validation;
- source auditing; and
- framework-neutral compiled output.

Framework-specific code generation belongs to each consumer package adapter.

## Pipeline

```text
source discovery
  → secure XML parsing
  → SVG optimization
  → geometry and resource normalization
  → definition validation
  → package-specific generation
```

The compiler preserves supported artwork while rejecting unsafe or unsupported input before package generation begins.

## Security Boundary

The compiler rejects:

- scripts;
- inline event handlers;
- external resource URLs;
- malformed XML;
- unsupported active content;
- unsafe image references; and
- invalid resource relationships.

Supported self-contained resources, including gradients, masks, clipping paths, and embedded image patterns, remain structured in the compiled definition.

Security failures stop the build rather than silently removing or retaining unsafe content.

## Publication Boundary

The package is marked private and has no public publication configuration.

It must remain absent from:

- published package manifests;
- consumer runtime dependency graphs;
- public export maps; and
- packed application dependencies.

Generated consumer output must be self-contained or depend on `@mingcute/icons`.

## Determinism

Compilation must produce equivalent output for identical source files and configuration.

Maintainers should avoid:

- locale-sensitive ordering;
- filesystem enumeration assumptions;
- platform-specific path behavior;
- unstable generated IDs; and
- ad hoc source-string replacement.

XML must be parsed structurally.

## Maintainer Contract

- Keep framework behavior out of the compiler.
- Preserve internal resource references after optimization.
- Fail explicitly on unsupported artwork.
- Keep source counts and generated counts auditable.
- Fix canonical parsing or normalization problems at this layer.
- Fix framework-only rendering problems in the owning adapter.
- Add focused fixtures for every new supported SVG feature.
- Run repository-wide generation and visual checks after compiler changes.

## Artwork Fidelity

The compiler supports structured SVG features required by the MingCute catalogue, including:

- paths and basic geometry;
- groups and transforms;
- inherited fills and strokes;
- linear and radial gradients;
- masks;
- clipping paths;
- patterns;
- self-contained embedded images; and
- scoped resource references.

Optimizer changes must be validated against parsed definitions and rendering fixtures.

## Asset Auditing

Run the asset audit when source counts, names, or style membership change:

```bash
pnpm --filter @mingcute/compiler audit:assets
```

Resolve:

- missing assets;
- duplicate canonical names;
- unexpected files;
- invalid style placement;
- inconsistent metadata; and
- unsupported source content

before package generation.

## Troubleshooting

### An SVG fails security validation

Remove scripts, event attributes, external URLs, or unsupported active content from the canonical source.

### Artwork changes after optimization

Compare the parsed definition and rendering fixture before changing optimizer settings. Confirm that resource references and transforms remain intact.

### Asset counts differ

Run `audit:assets` and resolve missing, duplicate, misplaced, or unexpected source files.

### A framework output is wrong but the definition is correct

Fix the owning framework adapter. Do not introduce framework-specific behavior into the compiler.

### Output differs across operating systems

Check path normalization, sorting, locale-sensitive operations, and filesystem-order assumptions.

## Development

```bash
pnpm --filter @mingcute/compiler build
pnpm --filter @mingcute/compiler typecheck
pnpm --filter @mingcute/compiler test
pnpm --filter @mingcute/compiler audit:assets
```

Compiler changes should also pass repository-wide validation:

```bash
pnpm build
pnpm check
pnpm release:check
pnpm pack:dry
```

<img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner3.png" alt="Editable MingCute vector construction" width="100%" />

## License

This private workspace package is covered by the [Apache License 2.0](../../LICENSE) and is not published independently.

## Links

- [MingCute website](https://www.mingcute.com/)
- [Package changelog](./CHANGELOG.md)
- [Icon keywords](../../doc/Keywords.md)
- [Icon mapping](../../doc/Mapping.md)
- [Repository architecture](../../README.md#repository-structure)
- [Repository](https://github.com/mingcute-design/mingcute-icons)
