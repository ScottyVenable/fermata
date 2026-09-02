# FB-0002: Scaffold presets for the new-project script

> **Track** `tooling` · **Size** `m` · **Difficulty** `intermediate` · **Reward** `140 REP` (+30 bonus)
> **Status** `open` · **Claim TTL** 21 days · **Epic** —

---

## Summary

`npm run new` copies one generic template, which means every project starts as an empty
folder with a `fermata.json` in it. Add **presets** — `static`, `vite-react`, `node-cli`,
`python`, `godot` — so a new project starts as something you can actually run. This is the
single highest-leverage change available to the repo's stated goal of removing friction
between an idea and the first line of code.

---

## Context

- **Why now:** Fermata's whole pitch is "skip the scaffolding dance and just start building."
  Right now the dance is shorter, not gone. A preset takes it to zero.
- **Prior art:** `template/` is the current single scaffold. `shared/dependencies/manifest.json`
  already knows about React, Vite, and friends, so presets can wire shared deps rather than
  installing per-project.
- **Related:** [`docs/DEPENDENCIES.md`](../../../../docs/DEPENDENCIES.md) explains the shared
  dependency resolution model a preset must respect.

---

## Scope

| What | Where |
| --- | --- |
| `--preset` flag with discovery and validation | `scripts/new-project.mjs` |
| Preset definitions (files + shared deps + stack) | `template/presets/<name>/` |
| Base template stays the default (`--preset base`) | `template/` |
| Preset docs | `docs/GUIDE.md`, `template/README_TEMPLATE_NOTES.md` |

Presets to ship:

| Preset | Produces | Shared deps |
| --- | --- | --- |
| `base` | Today's behaviour. The default. | — |
| `static` | `index.html`, `style.css`, `main.js`, ready to open in a browser | — |
| `vite-react` | Vite + React + TS entry, `vite.config.ts`, an `App.tsx` that renders | `react`, `react-dom`, `vite`, `@vitejs/plugin-react` |
| `node-cli` | `bin/<name>.mjs` with arg parsing, executable bit set | — |
| `python` | `main.py`, `requirements.txt`, `.gitignore` additions | — |
| `godot` | `project.godot`, a `main.tscn`, `scripts/` folder | — |

---

## Out of scope

- Not running `npm install` as part of scaffolding. Presets declare shared deps in
  `fermata.json`; resolution stays the existing model.
- Not adding a preset for every framework anyone might like. Six is the shipping set; more
  arrive as their own small bounties once the mechanism exists.
- Not restructuring `template/` beyond adding `presets/`. The existing base files stay where
  they are.
- Not building an interactive prompt UI. Flags only.

---

## Acceptance criteria

- [ ] `npm run new -- --name x --category web --preset static` produces a project that opens
      in a browser and shows something, with no further edits.
- [ ] `npm run new -- --name x --category web --preset vite-react` produces a project where
      `npx vite` serves a rendering React app, and whose `fermata.json` declares the right
      shared deps.
- [ ] All six presets in the table above exist and produce a valid project — `npm run validate`
      passes for each immediately after scaffolding.
- [ ] Omitting `--preset` behaves exactly as today (equivalent to `--preset base`).
- [ ] An unknown preset name exits non-zero and lists the available presets.
- [ ] `npm run new -- --list-presets` prints the presets with a one-line description each.
- [ ] Every scaffolded project's `fermata.json` has a correct `stack` array and, where
      applicable, `entry`.

### Bonus

- [ ] Presets support a `{{name}}` / `{{displayName}}` / `{{year}}` token substitution pass so
      generated files carry the project's real name, and the mechanism is documented for
      people adding presets later.

---

## Deliverables

1. `template/presets/<name>/` for all six presets, each with a `preset.json` describing its
   shared deps, stack, and entry point.
2. Updated `scripts/new-project.mjs`.
3. A "Presets" section in `docs/GUIDE.md`.
4. A note in `template/README_TEMPLATE_NOTES.md` on how to add a preset.

---

## Definition of done

- All acceptance criteria checked, each verified by actually scaffolding a throwaway project.
- `npm run validate` green.
- No new root dependencies beyond what's already in `shared/dependencies/manifest.json`.
- Scaffolded output is GPL-3.0 compatible — no vendored code with incompatible licences.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 140 |
| Bonus (token substitution) | 30 |
| Applicable multipliers | ×1.0 |

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata && npm install
npm run new -- --name scratch --category experiments   # see what you get today
```

Files worth reading first:

- `scripts/new-project.mjs` — the copy logic and the `fermata.json` it writes.
- `scripts/lib/repo.mjs` — `copyDir` already supports a `skip` predicate.
- `template/` — the current scaffold, which becomes `presets/base`.
- `shared/dependencies/manifest.json` — the registry a preset should reference.

Design hint: keep the preset a **data** description (`preset.json` + a `files/` directory)
rather than code. That way adding a preset is a PR full of files, not a PR full of branching,
and the bonus token pass applies uniformly.

---

## How to claim

```bash
npm run bounty -- claim FB-0002 --who yourhandle
```

---

## Notes

- Delete the scratch projects you create while testing before opening the PR.
- If the Godot preset is a stretch for you, ship the other five and say so in the PR — a
  partial delivery that's honest about it is better than a stalled claim. Reward scales with
  criteria met.
