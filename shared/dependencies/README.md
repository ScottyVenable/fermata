# shared/dependencies/

The central registry of dependencies any project in Fermata can pull from.

## `manifest.json`

The single source of truth. Edit via the script:

```bash
npm run add-dep -- --register <name> --version "<semver>" --description "<one line>"
```

You *can* edit it by hand — but the script will validate the shape, install in the root `package.json`, and (when JSON-shaped deps are added) keep the manifest sorted.

## Schema

See [`docs/DEPENDENCIES.md`](../../docs/DEPENDENCIES.md) for the full model and rationale, and [`docs/manifest.schema.json`](../../docs/manifest.schema.json) for the JSON Schema.

## Why a registry instead of npm workspaces?

- **Discoverability.** A new contributor reads `manifest.json` and immediately knows what's already wired up.
- **Cross-ecosystem.** The same model can describe `pip` and `cargo` deps when we get there.
- **Tiny tooling.** No build step, no workspace tool, no lockfile gymnastics.
- **Opt-in per project.** Declaring a shared dep is a one-line change in `fermata.json` — projects don't accidentally inherit deps they don't need.
