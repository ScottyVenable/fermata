# Categories

The canonical list of categories Fermata accepts. Validation reads this from `scripts/categories.mjs` — if you add one here, add it there too (or do it in a single PR).

## Top-level categories

### `games/`

Anything game-shaped. Mini-games, prototypes, jam entries, mechanics experiments. If it has a player, a goal, or a loop, it's a game.

### `tools/`

Utilities, apps, and helpers. Must declare a subcategory.

Subcategories:

- **`tools/productivity/`** — Schedulers, note tools, trackers, dashboards, planners.
- **`tools/ai/`** — LLM wrappers, prompt tools, agents, RAG demos, model playgrounds. Anything where the AI angle is the point of the tool.
- **`tools/music/`** — DAW plugins, generators, sequencers, sample tools, audio toys.
- **`tools/dev/`** — Build tools, CLIs, linters, automation, developer experience.

### `web/`

Websites, web toys, single-page experiments. Use this when "tool" doesn't feel right and the browser is the whole story.

### `experiments/`

Generative art, shaders, simulations, weird demos, anything that doesn't fit anywhere else. Low bar to entry — when in doubt, this is the bucket.

### `docs/`

Long-form writing, notes, or documentation that ships as the deliverable. *Not* for project READMEs (those live inside the project).

## Adding a new category or subcategory

1. Decide if it's truly distinct from existing buckets. "AI music tools" is not a new subcategory — it's `tools/music/` with `tags: ["ai"]`.
2. Open a PR that:
   - Adds the category here.
   - Adds it to `scripts/categories.mjs`.
   - Creates the folder under `projects/` with a `.gitkeep`.
   - Updates the table in `README.md`.
3. If you have a project that needs the new category, include it in the same PR.

## Why these and not others?

The categories are deliberately broad. A long, specific list (`projects/games/platformer/`, `projects/games/puzzle/`, ...) would push too much into the folder structure when tags already handle it. If you want to find every puzzle game, the answer is `tags: ["puzzle"]`, not a folder.
