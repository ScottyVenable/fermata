# AGENTS.md — Vivarium

Generic agent instructions for this project. Tools that respect `AGENTS.md` (Codex, Cursor in some configs, OpenAI's agent SDKs) will read this; Claude-specific instructions go in [CLAUDE.md](CLAUDE.md).

If both files exist, treat them as complementary — anything in `CLAUDE.md` overrides anything here when Claude is the one driving.

## Project summary

One paragraph. What is Vivarium, what's the current focus.

## Local commands

```bash
# install
# dev server / run
# tests
# lint
```

## Folder layout

```
vivarium/
├── fermata.json
├── README.md
├── (your code)
```

## Conventions

- Language, formatter, file naming, import order.
- Test layout.
- Anything non-obvious.

## Things to avoid

- Don't change `license` or `created` in `fermata.json`.
- Don't add deps without checking `shared/dependencies/manifest.json` first.
- Project-specific footguns go here.

## When unsure

Open a clarifying question rather than guessing. This project is part of a larger sandbox — small, contained projects beat sprawling refactors.
