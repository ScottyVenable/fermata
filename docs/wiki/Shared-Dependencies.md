# Shared Dependencies

Fermata keeps a single registry of dependencies that any project can pull from, so a new project doesn't have to `npm install` the same five libraries every other project already installed.

Full model and rationale: [`docs/DEPENDENCIES.md`](https://github.com/ScottyVenable/fermata/blob/main/docs/DEPENDENCIES.md).

## TL;DR

```bash
# See what's available
npm run deps -- list

# Add an existing shared dep to your project
npm run add-dep -- --project my-thing --dep react

# Register something new (writes the manifest; doesn't install)
npm run add-dep -- --register marked --version "^12.0.0" --description "Markdown parser"
# Then run npm install in the repo root to actually install it.
```

## Two kinds of deps

| Kind | Lives where | Declared in |
| --- | --- | --- |
| **Shared** | Root `node_modules/`, registered in `shared/dependencies/manifest.json` | `fermata.json` → `dependencies.shared` |
| **External** | The project's own `node_modules/` (if any) | `fermata.json` → `dependencies.external` |

Use shared by default. Use external only when you need a version that conflicts with the shared one, or the dep is genuinely one-off.

## Why does this work?

Node walks up the filesystem looking for `node_modules/`. Every project at `projects/<category>/<...>/<name>/` will find the root install on the way up. No symlinks, no workspaces, no monorepo tooling — just Node's default resolution.

## When it breaks

| Symptom | Cause | Fix |
| --- | --- | --- |
| Project can't find a shared dep at runtime | Root `node_modules/` not installed | `npm install` in the repo root |
| Validator: "unknown shared dep" | Listed in `fermata.json` but not in the registry | Register it, or move it to `dependencies.external` |
| Two projects need different versions | Conflict | Bump the registry (and both projects) or move one to `external` |

## Cross-ecosystem (planned)

The same model will work for `pip` and `cargo` deps — `kind` in the manifest already supports it. Implementation comes when the first non-Node project needs it.
