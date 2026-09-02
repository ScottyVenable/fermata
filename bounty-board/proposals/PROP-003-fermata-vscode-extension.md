---
id: PROP-003
title: VS Code extension for Fermata metadata
proposed_by: ScottyVenable
proposed_at: 2026-09-01
suggested_track: projects
suggested_size: m
status: open
promoted_to:
---

# PROP-003: VS Code extension for Fermata metadata

## The idea

A small VS Code extension that makes the repo's conventions visible where people actually work:

- `fermata.json` autocomplete and inline validation from the metadata spec.
- A sidebar tree of projects, grouped by category, with status badges.
- Commands: new project, validate, organize, claim bounty, show my REP.
- CodeLens on `fermata.json` showing the project's open bounties.
- A status-bar item with your current tier and season REP.

## Why it's worth doing

- Most of the friction Fermata is designed to remove reappears the moment you're in an editor
  and have to remember what the category enum is.
- Overlaps meaningfully with [FB-0100](../bounties/ecosystem/FB-0100-windows-desktop-application/)
  but from the opposite direction — the app brings you to the projects, the extension brings the
  repo to where you already are. Both are legitimate; they're not competitors.
- A genuinely enjoyable, self-contained project for someone who wants a `projects` bounty with a
  real user.

## Rough shape

- A project under `projects/tools/dev/fermata-vscode/`.
- Imports `scripts/lib/repo.mjs` and `scripts/lib/bounty.mjs` directly — no reimplementation.
- JSON Schema contribution point handles most of the validation for free.
- Ships as a `.vsix`; marketplace publishing is a separate decision.

## Open questions

- Does this duplicate too much of the desktop app to be worth both? (Argument for: different
  moment in the workflow. Argument against: two things to maintain.)
- Marketplace publishing means an account and an identity for the project. Who owns it?
- How much of the bounty board belongs in an editor before it's just a worse browser?

## Would you build it yourself?

No — happy for someone else to own this one entirely.
