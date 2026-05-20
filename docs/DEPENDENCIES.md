# Shared Dependencies

Fermata's shared dependency system exists for one reason: **a new project shouldn't have to `npm install` the same five libraries every other project already installed.**

## The mental model

There are two kinds of dependencies:

| Kind | Lives where | Declared in |
| --- | --- | --- |
| **Shared** | Root `node_modules/`, registered in `shared/dependencies/manifest.json` | `fermata.json` → `dependencies.shared` |
| **External** | The project's own `node_modules/` (if any) | `fermata.json` → `dependencies.external` |

Most things should be shared. Use external only when the project needs a version that conflicts with the shared one, or when the dep is genuinely one-off.

## The registry

`shared/dependencies/manifest.json` is the single source of truth for what's available:

```json
{
  "$schema": "../../docs/manifest.schema.json",
  "registry": {
    "react": {
      "version": "^18.3.0",
      "kind": "npm",
      "description": "UI library.",
      "tags": ["ui", "react"]
    },
    "vite": {
      "version": "^5.2.0",
      "kind": "npm",
      "description": "Dev server and bundler.",
      "tags": ["build", "dev"]
    },
    "three": {
      "version": "^0.165.0",
      "kind": "npm",
      "description": "3D engine for the web.",
      "tags": ["3d", "graphics"]
    }
  }
}
```

Each entry has:

| Field | Notes |
| --- | --- |
| `version` | Semver range used when installing in the root. |
| `kind` | Currently only `npm`. `pip` / `cargo` planned. |
| `description` | One line shown by `npm run deps -- list`. |
| `tags` | Free-form. |
| `notes` | Optional. Multi-line notes about gotchas / setup. |

## Workflow

### See what's available

```bash
npm run deps -- list
```

Prints every registered dep with its version and description.

### Add an existing shared dep to your project

```bash
npm run add-dep -- --project my-thing --dep react
```

Updates `projects/<...>/my-thing/fermata.json`:

```json
"dependencies": {
  "shared": ["react"]
}
```

Nothing is installed locally — your project resolves `react` from the root `node_modules/` via Node's module resolution (the root is always a parent of every project folder, so `require('react')` and `import 'react'` both work).

### Register a new shared dep

```bash
npm run add-dep -- --register marked --version "^12.0.0" --description "Markdown parser"
```

This:

1. Adds an entry to `shared/dependencies/manifest.json`.
2. Adds `marked` to the root `package.json` dependencies.
3. Suggests running `npm install` (it doesn't run it automatically — you might be batching multiple registrations).

### Keep a dep project-local

If you genuinely need a dep that shouldn't be shared (conflicting version, niche use), declare it in `external`:

```json
"dependencies": {
  "external": {
    "marked": "^15.0.0"
  }
}
```

Your project needs its own `package.json` and `npm install`. The validator does not enforce installation — that's on the author.

## Resolution model

Because Node walks up the filesystem looking for `node_modules/`, every project at `projects/<category>/<...>/<name>/` will see the root `node_modules/` as the nearest install. That means:

- `import three from 'three'` in a project file resolves to the root install.
- The version is whatever's pinned at the root.
- No symlinks, no workspaces, no monorepo tooling required.

For non-Node ecosystems (Python, Rust, etc.) the model is the same idea but the manifest exposes install commands instead. That's planned, not built — see [open questions](#open-questions).

## When this breaks

| Symptom | Why | Fix |
| --- | --- | --- |
| Project can't find a shared dep at runtime | Root `node_modules/` is missing. | Run `npm install` at the repo root. |
| Validator says "unknown shared dep" | The dep is in your `fermata.json` but not in the registry. | Either register it (`--register`) or move it to `external`. |
| Version mismatch with another project | Two projects need conflicting versions. | Pick: bump the registry (and update both) or move the conflicting one to `external`. |

## Open questions

- **Python and other ecosystems.** The current model is Node-shaped. We'll mirror it for `pip` (root `requirements.txt`, projects declare which deps they pull from it) and `cargo` (root workspace, projects opt in). No timeline.
- **Dev vs runtime split.** Currently all shared deps are flat. If dev-only deps (linters, etc.) start cluttering the registry, we'll add a `scope` field (`runtime` | `dev`).
- **Lockfile policy.** The root `package-lock.json` is committed. Projects using `external` should commit their own.
