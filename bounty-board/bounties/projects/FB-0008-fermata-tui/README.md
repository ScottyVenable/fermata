# FB-0008: Build fermata-tui, a terminal browser for the monorepo

> **Track** `projects` · **Size** `m` · **Difficulty** `intermediate` · **Reward** `180 REP` (+40 bonus)
> **Status** `open` · **Claim TTL** 21 days · **Epic** —

---

## Summary

Build a real project — a terminal UI for browsing Fermata itself. Arrow through projects by
category, read their metadata and README in a pane, filter by tag or platform, and jump
straight into one with your editor. It's genuinely useful, it dogfoods the metadata model, and
it's a complete, self-contained thing someone can point at and say "I built that."

---

## Context

- **Why now:** the repo has good structured metadata and no pleasant way to explore it from
  where contributors actually live. [FB-0006](../../web/FB-0006-static-project-gallery/) solves
  this for the web; this solves it for the terminal, and the two can share nothing at all,
  which is fine.
- **Why it's a `projects` bounty:** the deliverable is a new project under `projects/tools/dev/`,
  with its own `fermata.json`, README, and lifecycle. It happens to be *about* Fermata, but it's
  a first-class project like any other.

---

## Scope

| What | Where |
| --- | --- |
| The project | `projects/tools/dev/fermata-tui/` |
| Metadata | `projects/tools/dev/fermata-tui/fermata.json` |
| Docs | `projects/tools/dev/fermata-tui/README.md` |

Feature set:

- Two-pane layout: a category/project tree on the left, detail on the right.
- Detail pane shows `fermata.json` fields rendered readably, plus the project README.
- `/` to fuzzy-search across names, descriptions, and tags.
- `f` to cycle filters: category, status, platform.
- `Enter` opens the project directory in `$EDITOR`.
- `q` quits. `?` shows the keymap.

---

## Out of scope

- Not writing to anything. Read-only, always. No editing `fermata.json` from the TUI.
- Not implementing project *creation*. `npm run new` exists.
- Not bundling a heavyweight TUI framework. Node's `readline` and raw-mode stdin are enough,
  and the constraint is part of the exercise. If you want a dependency, make the case in the
  claim PR first.
- Not supporting Windows `cmd.exe`. Windows Terminal and PowerShell are in scope.

---

## Acceptance criteria

- [ ] `projects/tools/dev/fermata-tui/` exists with a valid `fermata.json` that passes
      `npm run validate`, and a README documenting install, usage, and the full keymap.
- [ ] Running the TUI lists every project in the repo, grouped by category, navigable with
      arrow keys.
- [ ] The detail pane shows the selected project's metadata and renders its README as readable
      text (wrapped, with headings distinguishable).
- [ ] `/` filters the list live as you type, matching name, description, and tags.
- [ ] `f` cycles at least the category, status, and platform filters, and the active filter is
      visible on screen.
- [ ] The TUI restores the terminal cleanly on exit — including on `Ctrl-C` and on a crash —
      leaving no raw mode, no hidden cursor, no colour bleed.
- [ ] It runs on macOS, Linux, and Windows Terminal. State which you tested on in the PR.

### Bonus

- [ ] A bounty view: `b` switches to browsing open bounties from `bounty-board/`, using the
      same two-pane layout, with `npm run bounty -- list --json` as the data source.

---

## Deliverables

1. `projects/tools/dev/fermata-tui/` — a complete project folder following the standard layout.
2. A `bin/` entry point runnable via `node projects/tools/dev/fermata-tui/bin/fermata-tui.mjs`.
3. A screen recording or asciinema link in the PR.

---

## Definition of done

- All acceptance criteria checked.
- `npm run validate` passes for the new project.
- The project's `fermata.json` lists the claimant as `creator`.
- Terminal restoration verified by deliberately crashing it and confirming the shell is intact.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 180 |
| Bonus (bounty browser view) | 40 |
| Applicable multipliers | ×1.0 (new project) |

Completing this also earns `project.published` (+75 REP) once the project merges — new projects
are rewarded on top of the bounty itself.

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata && npm install
npm run new -- --name fermata-tui --category tools/dev
node -e "import('./scripts/lib/repo.mjs').then(m=>m.findProjects().then(console.log))"
```

Files worth reading first:

- `scripts/lib/repo.mjs` — your data layer, already written.
- `docs/METADATA_SPEC.md` — every field you can display.
- `template/` — the scaffold your project starts from.

The hard part is not the rendering, it's the terminal lifecycle: raw mode, resize handling, and
restoring state on every exit path. Get that skeleton right first and the features are easy.

---

## How to claim

```bash
npm run bounty -- claim FB-0008 --who yourhandle
```

---

## Notes

- You own this project after it merges. You'll be its `creator` in `fermata.json`, and future
  contributions to it earn other people the ×1.5 cross-project multiplier.
- Resist scope creep. A tight, fast two-pane browser beats a half-finished IDE.
