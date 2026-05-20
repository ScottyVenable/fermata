# Fermata Guide

This is the long-form walkthrough. For a quick overview, see the [README](../README.md). For the metadata schema, see [METADATA_SPEC.md](METADATA_SPEC.md). For shared deps, see [DEPENDENCIES.md](DEPENDENCIES.md).

## Table of contents

- [How Fermata is organized](#how-fermata-is-organized)
- [Starting a new project](#starting-a-new-project)
- [Working in a project](#working-in-a-project)
- [Picking a category](#picking-a-category)
- [Platforms](#platforms)
- [Project status lifecycle](#project-status-lifecycle)
- [Using shared dependencies](#using-shared-dependencies)
- [Validation](#validation)
- [Common workflows](#common-workflows)

---

## How Fermata is organized

```
fermata/
├── projects/                    Every project lives here, grouped by category.
│   ├── games/
│   ├── tools/
│   │   ├── ai/
│   │   ├── dev/
│   │   ├── music/
│   │   └── productivity/
│   ├── web/
│   ├── experiments/
│   └── docs/
├── template/                    Copied when you scaffold a new project.
│   ├── README.md
│   ├── fermata.json
│   ├── TODO.md
│   ├── STYLE.md
│   ├── .gitignore
│   └── agents/                  Pre-wired files for vibe-coding with agents.
├── shared/
│   ├── dependencies/            Central registry of installable deps.
│   │   ├── manifest.json
│   │   └── README.md
│   └── assets/                  Shared images, fonts, sample data.
├── scripts/                     The tooling (Node.js, no build step).
│   ├── new-project.mjs
│   ├── validate.mjs
│   ├── organize.mjs
│   └── add-dependency.mjs
├── docs/                        This guide and the wiki source.
└── .github/                     Workflows + templates.
```

## Starting a new project

The fastest path:

```bash
npm run new -- --name my-thing --category tools/ai
```

What that does:

1. Copies `template/` into `projects/tools/ai/my-thing/`.
2. Fills in `fermata.json` (`name`, `category`, `created`, default `authors` from your git config).
3. Replaces placeholders in `README.md` with the project name.
4. Leaves you on a clean working tree (no commit made for you).

Flags:

| Flag | Description | Default |
| --- | --- | --- |
| `--name` | Project folder name (lowercase, hyphenated). | required |
| `--category` | One of the categories. Use `parent/sub` for subcategories. | required |
| `--display-name` | Human-readable name for `displayName`. | derived from `--name` |
| `--platforms` | Comma-separated. | `web` |
| `--no-agents` | Skip the `agents/` folder. | false |
| `--no-todo` | Skip the `TODO.md` file. | false |

Manual path: copy `template/` yourself, then edit `fermata.json`. `npm run validate` will tell you what's missing.

## Working in a project

There are no rules about what's *inside* a project beyond `fermata.json` and `README.md`. Use whatever stack you want. Use whatever folder shape you want.

That said, the template gives you a sensible default:

```
my-thing/
├── fermata.json         Required.
├── README.md            Required. Author-facing.
├── TODO.md              Optional. Plain Markdown checklist.
├── STYLE.md             Optional. Code/design style notes.
├── .gitignore           Project-local ignores (root .gitignore covers most).
├── agents/              Pre-wired for Claude / Cursor / Copilot etc.
│   ├── CLAUDE.md
│   └── AGENTS.md
└── docs/                Optional. Project-specific notes/specs.
```

Delete anything you don't use. The validator only cares about `fermata.json` and `README.md`.

## Picking a category

Pick the one that best describes what the project *is*, not what it's *for*. A productivity tool that happens to use AI goes in `tools/productivity/`, not `tools/ai/` — unless the AI angle is the whole point.

| Category | When to use it |
| --- | --- |
| `games/` | Anything game-shaped: full games, prototypes, jam entries, gameplay experiments. |
| `tools/productivity/` | Schedulers, note tools, trackers, dashboards. |
| `tools/ai/` | Wrappers, prompts, agents, model playgrounds, RAG demos. |
| `tools/music/` | DAW plugins, generators, sequencers, audio toys. |
| `tools/dev/` | Build tools, CLIs, linters, automation. |
| `web/` | Websites, web toys, single-page experiments without a "tool" framing. |
| `experiments/` | Generative art, shaders, demos, weird ideas. |
| `docs/` | Writing, notes, longform pieces that ship as the deliverable. |

If you're stuck, drop it in `experiments/` and we can move it later. Adding new categories is a PR — see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Platforms

Set `platforms` in `fermata.json` to one or more of:

- `web` — runs in a browser.
- `windows`, `macos`, `linux` — desktop native or cross-platform desktop runtimes (Electron, Tauri, etc.).
- `ios`, `android` — mobile.
- `cli` — terminal-only.
- `all` — anywhere Node/browser runs; use sparingly.

**Why no platform folders?** Most projects target more than one platform, so a single primary folder either duplicates files or arbitrarily picks a winner. Metadata is more honest *and* lets `organize` generate platform-grouped indices when you want one:

```bash
npm run organize -- --view platforms
```

## Project status lifecycle

`status` in `fermata.json` tells the world (and the automation) where a project stands.

| Status | Meaning |
| --- | --- |
| `experimental` | Just started. Expect breakage. |
| `active` | Being actively worked on. |
| `paused` | Not currently being worked on but might come back. |
| `stable` | Works as intended. Updates are unlikely. |
| `archived` | Frozen. Don't open PRs without asking the author. |

`organize` doesn't move archived projects. Validation still runs on them.

## Using shared dependencies

See [DEPENDENCIES.md](DEPENDENCIES.md) for the full picture. The TL;DR:

```bash
# What's available?
npm run deps -- list

# Add to your project
npm run add-dep -- --project my-thing --dep three

# Register something new (installs it once, in the root)
npm run add-dep -- --register react-three-fiber --version ^8.16.0
```

Your project's `fermata.json` ends up with:

```json
"dependencies": {
  "shared": ["three"],
  "external": {}
}
```

The shared package is resolved from the root `node_modules` at runtime — your project doesn't redownload it.

## Validation

`npm run validate` walks `projects/` and checks every `fermata.json`. It exits non-zero (and CI fails) when:

- A project has no `fermata.json`.
- A required field is missing or invalid.
- The folder placement doesn't match the declared `category`.
- The project's folder name doesn't match the `name` field.
- A declared shared dep isn't in the registry.
- `license` is anything other than `GPL-3.0`.

Errors include the file path and the exact field, so fixing them is a single read.

## Common workflows

### "I want to start something right now."

```bash
npm run new -- --name spark --category experiments
```

Open `projects/experiments/spark/`, write code.

### "I want to extend someone else's project."

1. Open an issue if it's non-trivial.
2. Add yourself to `authors` with `"role": "contributor"`.
3. Bump `updated` (or let `organize` do it on merge).

### "I want to move a project to a different category."

```bash
git mv projects/tools/ai/my-thing projects/web/my-thing
# Edit fermata.json: "category": "web"
npm run validate
```

`organize` will catch any leftover mismatches and surface them as actionable errors.

### "I want to retire a project but keep it in the repo."

Set `status: "archived"` in `fermata.json`. Done. The project stays where it is, contributions are paused.
