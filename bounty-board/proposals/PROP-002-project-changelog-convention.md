---
id: PROP-002
title: A lightweight changelog convention for projects
proposed_by: ScottyVenable
proposed_at: 2026-09-01
suggested_track: docs
suggested_size: s
status: open
promoted_to:
---

# PROP-002: A lightweight changelog convention for projects

## The idea

`fermata.json` has `created` and `updated`, which tell you *that* something changed and nothing
about *what*. Adopt an optional, deliberately tiny `CHANGELOG.md` convention — reverse-chronological
dated bullets, no semver, no release ceremony — and have `organize` surface the most recent entry
in the generated index.

```markdown
## 2026-08-14
- Rewrote the pathfinding to be less obviously wrong.
- Added a debug overlay behind the ` key.

## 2026-07-02
- First playable.
```

## Why it's worth doing

- Coming back to your own project after eight months is Fermata's single most common user
  journey, and the current answer is "read the diff."
- Makes the index dramatically more informative at almost zero authoring cost.
- Gives drive-by contributors a sense of whether a project is alive and what its author was last
  thinking about.

## Rough shape

- A convention documented in `docs/`, not a schema change — nothing about it should be required.
- `organize` parses the top entry, if present, and shows the date and first bullet in the index.
- The template ships a stub `CHANGELOG.md` with one line explaining it's optional.

## Open questions

- Optional forever, or eventually required for `status: "stable"` projects?
- Is "Keep a Changelog" the wrong reference here? Its ceremony feels heavier than this repo wants.
- Should the bounty board's completion workflow append an entry automatically when a bounty
  targets a project? Tempting, and possibly annoying.

## Would you build it yourself?

Yes — but it's a good first bounty for someone else, and it's more useful if it's written by
someone who has actually felt the "what was I doing here?" moment recently.
