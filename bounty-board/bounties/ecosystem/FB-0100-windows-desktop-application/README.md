# FB-0100: Build the Fermata desktop application for Windows

> **Track** `ecosystem` · **Size** `xl` · **Difficulty** `expert` · **Reward** `1200 REP` (+300 bonus)
> **Status** `open` · **Claim TTL** 90 days · **Epic** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)

---

## Summary

Build **Fermata Desktop** — a native-feeling Windows application that turns the monorepo into a
workspace. Browse and search every project, scaffold new ones without touching a terminal,
watch the bounty board, see your REP, and run the repo's tooling behind a real UI. This is one
of the two flagship deliverables of the Fermata ecosystem, and the single largest bounty on the
board.

It is deliberately scoped so that a **local-only v1 is complete and shippable on its own**. The
account and sync features layer on top once [FB-0300](../FB-0300-public-api-and-git-sync/) is
live, and they are the bonus, not the bar.

---

## Context

- **Why a desktop app:** Fermata's premise is that friction kills ideas. The terminal is
  friction for a lot of people — including the repo's own author on a Windows machine at
  midnight. An app that makes "start a new thing" a two-click operation is directly on-mission.
- **Why Windows first:** it's the primary daily-driver platform for this project. macOS and
  Linux builds are welcome and cheap to add given the stack, but Windows is what's being
  accepted here.
- **Prior art in-repo:** `electron` and `electron-builder` are already in the root
  `package.json`, so that path is pre-sanctioned. `scripts/lib/repo.mjs` and
  `scripts/lib/bounty.mjs` are dependency-free ESM and can be imported directly by the app's
  main process — the entire data layer already exists.
- **Related:** [FB-0006](../../web/FB-0006-static-project-gallery/) defines the card and filter
  UX; reuse its decisions rather than inventing parallel ones. [FB-0200](../FB-0200-fermata-website-and-ecosystem/)
  is the sibling flagship.

---

## Scope

| Area | What |
| --- | --- |
| **Shell** | Electron main + preload with `contextIsolation: true`, `nodeIntegration: false`, a strict CSP, and a typed IPC surface. Custom title bar, native-feeling window chrome, remembers size/position. |
| **Repo binding** | Pick a local Fermata clone via a folder picker. Detect validity. Support multiple clones and switch between them. Watch the filesystem and live-update. |
| **Project browser** | Tree by category, cards in the main pane, detail view with rendered README, metadata panel, tags, authors, links. Search and filter matching FB-0006's model. |
| **Project creation** | A form over `scripts/new-project.mjs`: name, display name, description, category, platforms, preset (see [FB-0002](../../tooling/FB-0002-scaffold-presets/)), tags. Validates as you type against `docs/METADATA_SPEC.md`. Writes a real project folder. |
| **Metadata editor** | Edit `fermata.json` through a proper form — enums as dropdowns, dates as pickers, authors as a repeatable row. Never lets you write an invalid file. |
| **Tooling runner** | Buttons for `validate`, `organize`, `doctor`, `bounty validate`, streaming output into a console pane with parsed error rows you can click to open the offending file. |
| **Bounty board** | Browse `bounty-board/` from the local clone: list, filter, read, and see your claims. Claim flow generates the claim file and the branch, then hands off to the user's Git tool. |
| **Reputation** | Your profile card, tier progress, badges, and recent events, read from `bounty-board/reputation/`. |
| **Editor handoff** | Open any project in VS Code, Explorer, or Windows Terminal. |
| **Packaging** | Signed-or-clearly-unsigned `.exe` installer plus a portable build, via `electron-builder`. Auto-update channel configured but pointed at GitHub Releases. |

The app lives at `projects/tools/dev/fermata-desktop/` as a normal Fermata project with its own
`fermata.json`.

---

## Out of scope

- **macOS and Linux builds.** Keep the code portable and don't hard-code paths, but only the
  Windows build is being accepted. Other platforms are follow-up bounties.
- **Cloud accounts, login, and sync.** That's [FB-0200](../FB-0200-fermata-website-and-ecosystem/)
  and [FB-0300](../FB-0300-public-api-and-git-sync/). v1 reads and writes a local clone only.
- **A built-in code editor or terminal emulator.** Hand off to VS Code and Windows Terminal.
- **Git operations beyond reading state.** No commit, push, merge, or conflict UI. Show branch
  and dirty state; let the user's real Git tool do the rest.
- **Running project code.** The app manages projects; it does not execute them.
- **Telemetry of any kind.** Not opt-in, not anonymous, not "just crash reports." None.

---

## Acceptance criteria

- [ ] A Windows installer (`.exe`) and a portable build are produced by a documented
      `npm run dist` from a clean clone, and both launch on Windows 10 and 11.
- [ ] On first run the app asks for a Fermata clone folder, validates it (presence of
      `projects/`, `fermata.json` files, `package.json` named `fermata`), and gives a clear
      error for an invalid pick.
- [ ] Every project in the clone appears in the browser, grouped by category, with search and
      with filters for category, status, and platform.
- [ ] Selecting a project shows its rendered `README.md` and every `fermata.json` field in a
      readable metadata panel.
- [ ] Creating a project through the UI produces a folder that passes `npm run validate` with
      no manual edits, including correct `category`, `platforms`, `created`, and `authors`.
- [ ] Editing metadata through the UI can never write an invalid `fermata.json` — enum fields
      are constrained, required fields are enforced, and the save button is disabled while
      invalid.
- [ ] `validate`, `organize`, and `doctor` can each be run from the UI with output streamed
      live, and failures are listed as clickable rows that open the relevant file.
- [ ] The bounty board is browsable from the app: list with filters, full bounty detail with
      acceptance criteria, and a claim action that writes a correct claim file and updates
      `bounty.json`.
- [ ] The reputation view shows the signed-in-as handle's tier, lifetime and season REP,
      badges, and recent ledger events, read from the local `reputation/` directory.
- [ ] External changes to the clone (a `git pull`, an edit in VS Code) are reflected in the app
      within two seconds without a manual refresh.
- [ ] Security posture verified and documented: `contextIsolation` on, `nodeIntegration` off,
      `sandbox` on for the renderer, a restrictive CSP, no remote content loaded, and every IPC
      channel explicitly allow-listed with validated payloads.
- [ ] The app makes **zero** network requests in v1 — demonstrated with a packet capture or an
      offline run, and stated in the PR.

### Bonus

- [ ] Account mode: sign in against the Fermata website ([FB-0201](../FB-0201-accounts-and-authentication/)),
      sync your profile and claims through the public API ([FB-0300](../FB-0300-public-api-and-git-sync/)),
      and browse remote projects you don't have cloned — all degrading cleanly to local-only
      when signed out or offline.

---

## Deliverables

1. `projects/tools/dev/fermata-desktop/` — full source, `fermata.json`, README with build and
   release instructions.
2. A GitHub Actions workflow that builds the Windows artifacts on tag.
3. A tagged pre-release with the installer attached.
4. `docs/DESKTOP.md` — user-facing documentation with screenshots.
5. An architecture note in the project README covering the main/preload/renderer split and the
   IPC contract.

---

## Definition of done

- All acceptance criteria checked, each verified by a maintainer on a real Windows machine.
- `npm run validate` passes for the new project.
- Security posture reviewed by a maintainer against the Electron security checklist, with the
  findings written into the PR.
- No unvetted native dependencies. Anything native needs a justification in the PR.
- All bundled code GPL-3.0 compatible, with a `THIRD_PARTY.md` listing every dependency and its
  licence.
- Reviewed and approved by a maintainer — `ecosystem` track always requires maintainer sign-off.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 1200 |
| Bonus (account + sync mode) | 300 |
| Applicable multipliers | ×1.25 (`help-wanted-urgent`) |

At ×1.25, base completion is **1500 REP** — enough on its own to reach 𝄆 Movement and most of
the way to 𝄐 Fermata. This is the largest single award on the board, and it should be.

---

## Suggested milestones

This is a 90-day claim. Post progress in your claim file at each milestone; that's also what
keeps your TTL alive.

| # | Milestone | Roughly |
| --- | --- | --- |
| 1 | Electron shell, secure IPC skeleton, clone picker, project list renders | 2 weeks |
| 2 | Detail view, README rendering, search and filters | 2 weeks |
| 3 | Project creation and metadata editing, both writing valid files | 3 weeks |
| 4 | Tooling runner with streamed output and clickable errors | 1 week |
| 5 | Bounty board and reputation views | 2 weeks |
| 6 | Packaging, signing story, auto-update channel, docs, polish | 2 weeks |

**Partial delivery is explicitly welcome.** Milestones 1–3 alone are a genuinely useful app and
earn scaled REP under [GOVERNANCE.md § Awarding rules](../../../GOVERNANCE.md#awarding-rules).
Say so early if that's where you're landing.

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata && npm install
node -e "import('./scripts/lib/repo.mjs').then(m=>m.findProjects().then(console.log))"
node -e "import('./scripts/lib/bounty.mjs').then(m=>m.loadBounties().then(b=>console.log(b.map(x=>x.data.id))))"
```

Files worth reading first:

- `scripts/lib/repo.mjs` and `scripts/lib/bounty.mjs` — import these from the main process; do
  not reimplement them. If you need something they don't expose, add it there and both the CLI
  and the app benefit.
- `docs/METADATA_SPEC.md` — the validation rules your forms must enforce.
- `bounty-board/ARCHITECTURE.md` — the board's data model.
- The root `package.json` — `electron`, `electron-builder`, `react`, `vite`, and `typescript`
  are already present.

**Talk before you build.** Post wireframes or a clickable prototype on the claim PR before
milestone 2. A 90-day bounty whose first design review is at the end is a 90-day bounty that
gets rejected, and neither of us wants that.

---

## How to claim

```bash
npm run bounty -- claim FB-0100 --who yourhandle
```

`xl` bounties require ♫ Phrase (500 REP) **or** an explicit maintainer sign-off on the claim
PR. If you're new and want this one, say so in the claim — a short track record on a couple of
smaller bounties first is the usual route, and a co-claim with an established contributor is
also fine.

---

## Notes

- **Feel is a requirement, not a garnish.** Instant startup, no layout shift, keyboard
  navigation throughout, and a window that remembers where it was. An app that's slower than
  `ls` will not get used, and then none of the rest matters.
- The tooling scripts are ESM with zero dependencies specifically so this app can consume them.
  Preserving that property is part of the job.
- If you'd rather build this in Tauri, WinUI 3, or Avalonia, open a proposal in
  `bounty-board/proposals/` and make the case. Electron is the default because it's already in
  the tree and shares the language with the rest of the ecosystem, not because it's sacred.
