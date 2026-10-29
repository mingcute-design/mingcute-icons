<a href="https://www.mingcute.com/">
  <img src="https://raw.githubusercontent.com/mingcute-design/mingcute-icons/main/images/banner1.png" alt="MingCute Icon System" width="100%" />
</a>

<h1 align="center">@mingcute/core</h1>

<h3 align="center">Private architecture contracts for the MingCute workspace</h3>

<p align="center">
  <a href="https://www.mingcute.com/"><img src="https://img.shields.io/badge/mingcute.com-website-007AFF" alt="MingCute website" /></a>&nbsp;
  <img src="https://img.shields.io/badge/workspace-private-007AFF" alt="Private workspace package" />&nbsp;
  <a href="https://github.com/mingcute-design/mingcute-icons/stargazers"><img src="https://img.shields.io/github/stars/mingcute-design/mingcute-icons?color=007AFF&style=flat" alt="MingCute GitHub stars" /></a>
</p>

---

## Overview

`@mingcute/core` is a private workspace package that defines shared architecture contracts for the MingCute Icons repository.

It is not an npm product and must never be installed by consumer applications.

The package centralizes:

- public style declarations;
- normalized icon and metadata contracts;
- file, export, and component naming rules;
- framework adapter build contracts; and
- deterministic helpers shared by generators and tests.

## Publication Boundary

The package manifest uses:

```json
{
  "private": true
}
```

`@mingcute/core` has no public `publishConfig` and must remain absent from every packed consumer dependency graph.

Public packages should either:

- emit self-contained public types; or
- depend on `@mingcute/icons` for runtime icon definitions.

They must never expose `@mingcute/core` as a runtime dependency.

## Workspace Exports

| Export | Purpose |
|---|---|
| `@mingcute/core` | Shared contracts and general helpers |
| `@mingcute/core/styles` | Style catalogue, identifiers, and resolution |
| `@mingcute/core/icons` | Icon models, metadata contracts, and naming |
| `@mingcute/core/adapters` | Stable framework adapter build contracts |

These exports are workspace-internal. They are not public consumer APIs.

## Owned Contracts

### Styles

The package defines the canonical public style catalogue:

- Core Regular
- Core Filled

Style identifiers are release contracts consumed by:

- the compiler;
- package generators;
- export-map generation;
- metadata generation;
- tests; and
- release validation.

### Icons and metadata

The icon contracts define normalized:

- icon names;
- component names;
- filenames;
- view boxes;
- geometry and paint structures;
- resource metadata; and
- generated catalogue metadata.

### Adapter contracts

Adapter contracts describe build output shared across framework generators.

They must remain framework-runtime neutral. Framework-specific runtime dependencies belong in the generated adapter packages, not in `@mingcute/core`.

## Maintainer Rules

- Keep style identifiers and naming rules deterministic.
- Do not depend on filesystem enumeration order.
- Normalize paths and names consistently across operating systems.
- Fix naming collisions at the canonical contract layer rather than adding adapter-specific exceptions.
- Treat public export names as release contracts.
- Regenerate every affected package after contract changes.
- Keep the package side-effect free.
- Keep framework runtime dependencies out of this package.
- Keep the package private and absent from packed consumer dependency graphs.

## Change Impact

A change to `@mingcute/core` may require coordinated regeneration when it affects:

- style identifiers;
- icon names;
- component names;
- filenames;
- metadata shape;
- adapter output contracts;
- export-map construction; or
- generated public TypeScript declarations.

Before merging such a change, run repository-wide checks rather than validating this package in isolation.

## Troubleshooting

### A generator cannot resolve a style

Confirm that the style exists in the canonical catalogue and that the generator is running against the same workspace version.

### Component names collide

Fix the canonical naming or collision-resolution contract. Do not add framework-specific exceptions unless the framework itself imposes a unique restriction.

### A release audit finds `@mingcute/core`

Remove the consumer runtime dependency and generate self-contained public output or depend on `@mingcute/icons` where runtime definitions are required.

### Output differs across operating systems

Check path normalization, locale-sensitive comparisons, sorting, and filesystem-order assumptions.

## Development

```bash
pnpm --filter @mingcute/core build
pnpm --filter @mingcute/core typecheck
pnpm --filter @mingcute/core test
```

Repository-wide validation is required for contract changes:

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
