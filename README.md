<div align="center">

# Fermata

*A sandbox monorepo for vibe-coded whims, hobby experiments, and ideas in transit.*

[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-3DA639?style=flat-square&logo=gnu&logoColor=white)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)](#)
[![Contributions](https://img.shields.io/badge/contributions-welcome-ff7f50?style=flat-square)](CONTRIBUTING.md)
[![Projects](https://img.shields.io/badge/projects-curated-blueviolet?style=flat-square)](projects/)
[![Bounties](https://img.shields.io/badge/bounties-17_open-ff7f50?style=flat-square)](bounty-board/INDEX.md)
[![Made with](https://img.shields.io/badge/made_with-anything-1f6feb?style=flat-square)](#tech-stack)
[![Vibe](https://img.shields.io/badge/vibe-coded-ff69b4?style=flat-square)](#philosophy)

</div>

> In music, a *fermata* tells the performer to hold a note for as long as they choose. This repo holds ideas the same way — for as long as the spark lasts.

**Fermata** is a single, clutter-free home for hobby projects, experiments, and half-baked sparks. Instead of spinning up a new GitHub repo every time inspiration strikes (and abandoning most of them), everything lives here — organized by category, lightly governed by metadata, and open to anyone who wants to extend a project or drop in one of their own.

---

## Table of contents

- [Philosophy](#philosophy)
- [What's inside](#whats-inside)
- [Quick start](#quick-start)
- [Project layout](#project-layout)
- [Categories](#categories)
- [Project metadata](#project-metadata)
- [Shared dependencies](#shared-dependencies)
- [Bounty board](#bounty-board)
- [Contributing](#contributing)
- [Automation](#automation)
- [Tech stack](#tech-stack)
- [License](#license)

---

## Philosophy

Fermata is built around one rule: **ideas come fresh, so removing friction matters more than perfection.** The repo exists so contributors (myself included) can skip the "set up a new repo, scaffold the README, pick a license, write CI..." dance and just *start building*.

Some projects here will grow. Most won't. Both outcomes are fine. The goal isn't shipping — it's keeping the workshop open.

Three principles guide every decision:

| Principle | What it means in practice |
| --- | --- |
| **Efficiency first** | Templates, scripts, and shared deps so a new project is one command away. |
| **Consistency, not conformity** | Every project follows the same metadata + folder shape; what's *inside* is up to the author. |
| **Open by default** | GPL-3.0 across the board. Anyone can contribute new projects or extend existing ones. |

---

## What's inside

```
fermata/
├── projects/          The actual projects, grouped by category
├── template/          Scaffold copied when starting a new project
├── shared/            Centralized dependencies + reusable assets
├── scripts/           Project tooling (new-project, validate, organize, add-dep, bounty, rep)
├── bounty-board/      Open work to claim + the reputation system
├── docs/              Guides, specs, and wiki source
└── .github/           Workflows + issue templates
```

---

## Quick start

```bash
# Clone
git clone https://github.com/ScottyVenable/fermata.git
cd fermata

# Install tooling (only needed if you'll run the scripts)
npm install

# Scaffold a new project
npm run new -- --name my-thing --category tools/ai

# Validate every project's metadata
npm run validate

# Pull in a shared dependency
npm run add-dep -- --project my-thing --dep three
```

That's it. Open `projects/tools/ai/my-thing/` and start vibing.

Full walkthrough: **[docs/GUIDE.md](docs/GUIDE.md)**.

---

## Project layout

Every project lives at `projects/<category>/<name>/` (or `projects/<category>/<subcategory>/<name>/`) and contains, at minimum:

```
projects/tools/ai/my-thing/
├── fermata.json     Required. Metadata used by validation + automation.
├── README.md        Required. Use the template.
├── TODO.md          Optional but encouraged.
└── ...              Whatever the project needs.
```

The `fermata.json` is the only thing the automation reads — everything else is the author's call. See **[docs/METADATA_SPEC.md](docs/METADATA_SPEC.md)** for the schema.

---

## Categories

Top-level categories are intentionally broad. Most have subcategories you can use to keep things tidy.

| Category | Subcategories | What goes here |
| --- | --- | --- |
| `games/` | — | Mini-games, prototypes, jam entries. |
| `tools/` | `productivity/`, `ai/`, `music/`, `dev/` | Utilities and apps. |
| `web/` | — | Sites, web toys, single-page experiments. |
| `experiments/` | — | Things that don't fit anywhere else. Generative art, shaders, demos. |
| `docs/` | — | Writing, notes, longform docs that ship as projects. |

Need a new category? Add it in a PR — see [CONTRIBUTING.md](CONTRIBUTING.md).

**Why not platform-based folders (windows/, mac/, web/, ...)?** Most projects target more than one platform, so a single primary folder either duplicates files or arbitrarily picks a winner. Platform lives in `fermata.json` instead, and `npm run organize -- --view platforms` generates a platform-grouped index when you want one.

---

## Project metadata

Every project has a `fermata.json` at its root. The bare minimum:

```json
{
  "name": "my-thing",
  "displayName": "My Thing",
  "description": "One-line description.",
  "category": "tools/ai",
  "status": "active",
  "platforms": ["web"],
  "authors": [
    { "name": "Scotty Venable", "github": "ScottyVenable", "role": "creator" }
  ],
  "license": "GPL-3.0",
  "created": "2026-05-20"
}
```

`license` is locked to `GPL-3.0` to match the repo. Full spec, all fields, and validation rules: **[docs/METADATA_SPEC.md](docs/METADATA_SPEC.md)**.

---

## Shared dependencies

Most hobby projects pull in the same handful of libraries (React, three.js, p5, etc.). Instead of installing them per-project, Fermata keeps a **shared dependency registry** at `shared/dependencies/manifest.json`. Projects declare which shared deps they use in their `fermata.json`, and the tooling resolves them from the root install.

```bash
# What's currently available
npm run deps -- list

# Add an existing shared dep to your project
npm run add-dep -- --project my-thing --dep react

# Register a new shared dep (and install it once, repo-wide)
npm run add-dep -- --register react-three-fiber --version ^8.16.0
```

This means new projects start at zero install time when the deps they need are already in the registry. Full details: **[docs/DEPENDENCIES.md](docs/DEPENDENCIES.md)**.

---

## Bounty board

Work that wants doing, and a way to get credit for doing it. The **[bounty board](bounty-board/)**
is a queue of scoped, acceptance-tested tasks that anyone — human or bot — can claim. Completing
one earns **REP**, a non-transferable reputation score that unlocks permissions and shows up on
your profile.

```bash
npm run bounty -- list --status open       # what needs doing
npm run bounty -- show FB-0001             # read one
npm run bounty -- claim FB-0001 --who you  # take it
npm run rep -- who you                     # your standing
```

| | |
| --- | --- |
| **[INDEX.md](bounty-board/INDEX.md)** | Every bounty, generated, always current |
| **[README.md](bounty-board/README.md)** | How the board works and how to claim |
| **[REPUTATION.md](bounty-board/REPUTATION.md)** | How REP is earned, the tiers, the rules |
| **[ARCHITECTURE.md](bounty-board/ARCHITECTURE.md)** | The full system design |
| **[EPIC-001](bounty-board/epics/EPIC-001-fermata-ecosystem/)** | The big one: a Windows app, a website with accounts, and a public API |

New here? Look for the `good-first-bounty` label. Bots are welcome and have their own
[rules of engagement](bounty-board/GOVERNANCE.md#bot-contributors).

---

## Contributing

New projects, fixes to existing ones, contributions to the tooling — all welcome. The short version:

**Adding a project:**

1. Fork & branch.
2. `npm run new -- --name your-thing --category <category>` (or copy `template/`).
3. Fill in `fermata.json` and `README.md`.
4. `npm run validate` — make sure it's green.
5. Open a PR.

**Claiming a bounty:**

1. `npm run bounty -- list --status open` and pick one.
2. `npm run bounty -- claim FB-#### --who yourhandle`, then PR the claim.
3. Build it against the acceptance criteria.
4. Open a PR with `Closes FB-####` in the body.
5. REP lands on merge.

Full process, code of conduct, and review expectations: **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## Automation

| Event | Action |
| --- | --- |
| PR opened or updated | Validate every project's `fermata.json` and folder placement. |
| PR touching `bounty-board/` | Validate bounties, audit the ledger, check generated files are current. |
| PR merged to `main` | Run `organize` to keep the tree tidy and regenerate indices. |
| Merge referencing `Closes FB-####` | Complete the bounty, award REP, regenerate the board. |
| Nightly | Expire lapsed claims and run the reputation integrity audit. |
| `docs/wiki/` changes | Sync to the GitHub Wiki. |

Workflows live in `.github/workflows/`. Each is named after what it does.

---

## Tech stack

Anything goes. The shared registry currently knows about (more added as projects need them):

[![Node](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](#)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](#)

The tooling itself (`scripts/`) is plain Node.js — no transpile step, no framework, no lock-in.

---

## License

Fermata and every project within it is licensed under **[GPL-3.0](LICENSE)**. By contributing, you agree your work is licensed the same way. Authors retain credit via the `authors` field in their project's `fermata.json`.

---

<div align="center">
<sub>Hold the note as long as it feels right. <strong>𝄐</strong></sub>
</div>
