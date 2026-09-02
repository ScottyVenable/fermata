---
id: PROP-001
title: Shared asset registry for sprites, sounds, and fonts
proposed_by: ScottyVenable
proposed_at: 2026-09-01
suggested_track: tooling
suggested_size: m
status: open
promoted_to:
---

# PROP-001: Shared asset registry for sprites, sounds, and fonts

## The idea

`shared/dependencies/manifest.json` solves the "every project reinstalls React" problem. Nothing
solves the equivalent problem for *assets* — the placeholder sprite sheet, the UI click sound,
the open-licence font, the noise texture. Every game or visual experiment re-sources them, and
half the time the licence provenance gets lost along the way.

A `shared/assets/registry.json` with the same shape as the dependency manifest: named entries,
each with a path, a licence, an attribution string, and a source URL. Projects declare
`assets: ["kenney-ui-pack", "inter-font"]` in their `fermata.json` and the tooling resolves and
validates them.

## Why it's worth doing

- Removes a real, recurring friction from exactly the kind of project Fermata attracts.
- Makes licence provenance a structural property rather than something you hope someone
  remembered to write in a README. For a GPL-3.0 repo that actually matters.
- Repo size stays sane: one copy of the placeholder tileset instead of six.

## Rough shape

- `shared/assets/registry.json` mirroring the dependency manifest's structure.
- An `assets` array in `fermata.json`, validated against the registry by `npm run validate`.
- `npm run add-asset -- --project x --asset y`, matching the existing `add-dep` ergonomics.
- A generated `ATTRIBUTION.md` per project listing every asset's licence and credit line.

## Open questions

- Binary files in Git — where's the size ceiling before this needs LFS or an external bucket?
- Do assets need versioning, or is "replace it and update everyone" fine at hobby scale?
- Should the registry allow *referencing* remote assets by URL without vendoring them?

## Would you build it yourself?

With help. The registry and validation are straightforward; the licence metadata model and the
size question need a second opinion first.
