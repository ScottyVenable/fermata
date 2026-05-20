# Project Categories

Fermata uses a small, intentionally broad set of top-level categories. Each project's `category` field in `fermata.json` must match its folder placement under `projects/`.

## Categories at a glance

| Category | What goes here |
| --- | --- |
| `games/` | Mini-games, prototypes, gameplay experiments, jam entries. |
| `tools/productivity/` | Schedulers, note tools, trackers, dashboards. |
| `tools/ai/` | LLM wrappers, prompt tools, agents, RAG demos. |
| `tools/music/` | DAW plugins, generators, sequencers, audio toys. |
| `tools/dev/` | Build tools, CLIs, linters, automation. |
| `web/` | Sites, web toys, single-page experiments. |
| `experiments/` | Generative art, shaders, demos, weird ideas. |
| `docs/` | Long-form writing or notes that ship as the deliverable. |

## How to pick

Pick the category that describes what the project **is**, not what it's **for**. A productivity app that happens to use AI goes in `tools/productivity/` (with `tags: ["ai"]`), unless the AI angle is the whole point of the tool.

When in doubt, **`experiments/`**. It's the catch-all and there's zero penalty for being there.

## Why no platform folders?

Some sandboxes organize by platform (e.g. `windows/`, `mac/`, `linux/`, `web/`). Fermata doesn't — platform lives in `fermata.json` under `platforms`. Three reasons:

1. **Most projects target more than one platform.** A primary-folder approach either duplicates files or arbitrarily picks a winner.
2. **The data is already in metadata.** A platform-grouped index can be generated on demand (`npm run organize -- --view platforms`).
3. **It keeps the folder tree honest.** Folders describe what kind of thing a project is; metadata describes its surface.

## Adding a new category or subcategory

Categories are cheap to add. The bar is "this is genuinely distinct from what exists," not "this would be nice."

To add one, open a PR that:

1. Adds the category to [`docs/CATEGORIES.md`](https://github.com/ScottyVenable/fermata/blob/main/docs/CATEGORIES.md).
2. Adds it to `ALLOWED_CATEGORIES` in [`scripts/lib/repo.mjs`](https://github.com/ScottyVenable/fermata/blob/main/scripts/lib/repo.mjs).
3. Creates the folder under `projects/` with a `.gitkeep`.
4. Updates the table in the [README](https://github.com/ScottyVenable/fermata/blob/main/README.md).
5. Updates [this page's source](https://github.com/ScottyVenable/fermata/blob/main/docs/wiki/Project-Categories.md).

If you have a project that needs the new category, bundle it into the same PR.
