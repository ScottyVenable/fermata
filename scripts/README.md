# scripts/

The tooling that makes Fermata work. Plain Node.js, no build step, no third-party runtime deps. Requires Node 18+.

| Script | NPM target | What it does |
| --- | --- | --- |
| `new-project.mjs` | `npm run new` | Scaffolds a new project by copying `template/` and replacing placeholders. |
| `validate.mjs` | `npm run validate` | Walks `projects/`, validates every `fermata.json`. Used by CI. |
| `doctor.mjs` | `npm run doctor` | Lightweight health check: placeholder READMEs, stale metadata, archived reasons. |
| `typecheck.mjs` | `npm run typecheck` | Runs `tsc --noEmit` for every project with a `tsconfig.json`. |
| `organize.mjs` | `npm run organize` | Regenerates `projects/INDEX.md`, optionally bumps `updated` on changed projects. Used by CI on merge. |
| `add-dependency.mjs` | `npm run add-dep` / `npm run deps` | Manages `shared/dependencies/manifest.json` and links shared deps into projects' `fermata.json`. |
| `lib/repo.mjs` | (library) | Shared helpers: project discovery, IO, arg parsing, formatting. |

`npm run check` runs `validate` + `doctor` + `typecheck` as one local sanity pass.

## Conventions

- All scripts use `import` (the package is `type: "module"`).
- Args are parsed by `parseArgs` in `lib/repo.mjs` — `--key value` or `--key=value`, plus positional args in `_`.
- Human-readable output goes to stdout; warnings to stdout with a `yellow` prefix; errors to stderr. Non-zero exit on failure.
- Each script self-contains its `--help` (mostly via the leading comment block — improve as we go).

## Adding a new script

1. Create `scripts/<name>.mjs`. Add a top-of-file comment block explaining what it does and its flags.
2. Use the helpers in `lib/repo.mjs` instead of reimplementing IO/CLI parsing.
3. Register it in the root `package.json` under `scripts`.
4. Add a row to the table above.

## Why no dependencies?

Three reasons:

- **Bootstrap speed.** A contributor with Node installed can run any script without `npm install` first.
- **Auditability.** Everything in `scripts/` is hand-written and readable in 10 minutes.
- **Stability.** No deprecation churn, no security advisories to chase.

If we genuinely need a library (e.g. for cross-ecosystem dep resolution), we'll add it — but it has to clear a "this is worth the cost" bar.
