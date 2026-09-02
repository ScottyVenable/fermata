# scripts/

The tooling that makes Fermata work. Plain Node.js, no build step, no third-party runtime deps. Requires Node 18+.

| Script | NPM target | What it does |
| --- | --- | --- |
| `new-project.mjs` | `npm run new` | Scaffolds a new project by copying `template/` and replacing placeholders. |
| `validate.mjs` | `npm run validate` | Walks `projects/`, validates every `fermata.json`. Used by CI. |
| `organize.mjs` | `npm run organize` | Regenerates `projects/INDEX.md`, optionally bumps `updated` on changed projects. Used by CI on merge. |
| `add-dependency.mjs` | `npm run add-dep` / `npm run deps` | Manages `shared/dependencies/manifest.json` and links shared deps into projects' `fermata.json`. |
| `bounty.mjs` | `npm run bounty` | The [bounty board](../bounty-board/) CLI: list, show, new, claim, drop, complete, validate, index, stats. Used by CI. |
| `reputation.mjs` | `npm run rep` | The REP ledger CLI: award, rebuild, who, leaderboard, audit, tiers. Used by CI. |
| `lib/repo.mjs` | (library) | Shared helpers: project discovery, IO, arg parsing, formatting. |
| `lib/bounty.mjs` | (library) | Bounty + ledger primitives: discovery, enums, scoring tables, the ledger fold. |

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

## The bounty board CLIs

`bounty.mjs` and `reputation.mjs` follow two extra conventions beyond the ones above, because
they have machine consumers:

- **Every mutating command supports `--dry-run`** and prints exactly what it would write.
- **Every read command supports `--json`**, so bots, editors, the desktop app, and the future
  website can all consume the same output.

They also both refuse to guess. `rep award` will not self-award, `bounty complete` will not pass
a bounty with unchecked criteria unless you say `--partial`, and `bounty validate` fails on
anything the schemas or [GOVERNANCE.md](../bounty-board/GOVERNANCE.md) forbid. The point is that
running the command locally gives you the same verdict CI will.

Full data model: [bounty-board/ARCHITECTURE.md](../bounty-board/ARCHITECTURE.md#tooling-layer).

## Why no dependencies?

Three reasons:

- **Bootstrap speed.** A contributor with Node installed can run any script without `npm install` first.
- **Auditability.** Everything in `scripts/` is hand-written and readable in 10 minutes.
- **Stability.** No deprecation churn, no security advisories to chase.

If we genuinely need a library (e.g. for cross-ecosystem dep resolution), we'll add it — but it has to clear a "this is worth the cost" bar.
