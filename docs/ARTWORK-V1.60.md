# Designer artwork v1.60 release candidate — 4.0.0

Canonical source SVGs are stored in `assets/stroke`. Font outline intermediates
are regenerated in `assets/outline` and are not committed. All packages use the
current designer artwork and current names without compatibility aliases.

The public collection contains 4,526 Core Regular/Filled SVGs, shared definitions,
and styled font glyphs (2,263 per style). The package version is 4.0.0.

SVG and framework renderers preserve composited outer masks, embedded image
patterns, local reused paths, and fixed Original brand colors. Font conversion
preserves even-odd holes. No artificial separation seams are generated.

Matching canonical names retain upstream font codepoints. Removed names are
retired; new names receive fresh codepoints. Legacy name aliases are removed,
so this candidate uses a major package version. Existing applications must
update imports and CSS classes for names absent from the new designer delivery.

The existing GitHub CI, publishing configuration, and production dependency
security fixes are retained. Generated review galleries are local review
artifacts and do not enter package or source release commits.
