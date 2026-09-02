# Contributing to Fermata

Thanks for stopping by. Fermata exists so people can move from "I have an idea" to "I'm building it" as fast as possible, so this guide is built around the same goal: low friction, clear rules, no gatekeeping on what counts as a "good enough" project.

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Claiming a bounty](#claiming-a-bounty)
- [Adding a new project](#adding-a-new-project)
- [Working on an existing project](#working-on-an-existing-project)
- [Improving the tooling](#improving-the-tooling)
- [Project metadata rules](#project-metadata-rules)
- [Branch & PR conventions](#branch--pr-conventions)
- [Code of conduct](#code-of-conduct)
- [License agreement](#license-agreement)

---

## Ways to contribute

1. **Add a new project.** The most common case. See [Adding a new project](#adding-a-new-project).
2. **Extend an existing project.** Pick anything in `projects/`. Open an issue first if it's a meaningful change to someone else's work.
3. **Improve the tooling.** Scripts, GitHub Actions, templates, docs — all fair game.
4. **Triage and review.** Help review PRs, validate metadata, or open issues for stale/broken projects.
5. **Claim a bounty.** Work that's already scoped and waiting for someone. See [Claiming a bounty](#claiming-a-bounty).

You do **not** need to ask permission to contribute. Just open a PR.

Contributions earn **REP** — a reputation score that unlocks permissions and shows up on your
profile. Improving *someone else's* project pays 1.5× what improving your own does, which is
deliberate. Details: [bounty-board/REPUTATION.md](bounty-board/REPUTATION.md).

---

## Claiming a bounty

The [bounty board](bounty-board/) is a queue of scoped work with explicit acceptance criteria.
It's the shortest path from "I'd like to help" to "I know exactly what to build."

```bash
npm run bounty -- list --status open              # what's available
npm run bounty -- list --label good-first-bounty  # start here if you're new
npm run bounty -- show FB-0001                    # read one in full
npm run bounty -- claim FB-0001 --who yourhandle  # take it
```

Claiming writes a claim file and flips the bounty's status. Commit both, open a PR titled
`claim: FB-0001 <slug>`, and it'll merge quickly. Then build against the acceptance criteria and
open your real PR with `Closes FB-0001` in the body — that's what triggers the REP award on merge.

A few things worth knowing:

- **Acceptance criteria are frozen once you claim.** Nobody can move the goalposts on you.
- **Claims have a TTL** (14 days by default). Post a note in your claim file to reset it.
- **Dropping a claim costs nothing.** Only going silent does.
- **Ask questions early.** Nobody loses REP for asking, and a rejected submission is far more
  expensive than a comment on your claim PR.
- **`xs` bounties skip the claim step** — just open the PR.

Bots are welcome and use the same commands, with three extra rules in
[GOVERNANCE.md](bounty-board/GOVERNANCE.md#bot-contributors).

Nothing to claim that interests you? Post a proposal in
[`bounty-board/proposals/`](bounty-board/proposals/) or open a
[bounty proposal issue](../../issues/new?template=bounty-proposal.md). Promoted proposals earn
the proposer +10 REP whether or not they build it.

---

## Adding a new project

The fast path:

```bash
git checkout -b new/<your-project-name>
npm run new -- --name your-thing --category tools/ai
```

That scaffolds `projects/tools/ai/your-thing/` from `template/`, fills in starter values for `fermata.json`, and you're ready to code.

If you'd rather do it manually:

1. Copy `template/` to `projects/<category>/<name>/`.
2. Edit `fermata.json` — at minimum, fill in `name`, `displayName`, `description`, `category`, `authors`, and `created`.
3. Replace the template `README.md` with your project's real one.
4. Delete any template files you won't use (`TODO.md`, `agents/`, etc. are optional).
5. Run `npm run validate` and fix anything it flags.

### Picking a category

| Your project is... | Category |
| --- | --- |
| A game (any genre, any platform) | `games/` |
| A productivity tool, AI tool, music tool, dev tool, etc. | `tools/<subcategory>/` |
| A website, web toy, or browser-only experiment | `web/` |
| Generative art, shaders, weird demos | `experiments/` |
| Long-form writing, notes, or docs as a deliverable | `docs/` |

If nothing fits, drop it in `experiments/` and we can pull out a new category in a follow-up PR.

---

## Working on an existing project

If you're the project's original author, do whatever you want — just keep `fermata.json` honest (especially `updated`, `status`, and `authors`).

If it's someone else's project:

1. **Open an issue first** if the change is non-trivial (new features, refactors, scope changes). Quick fixes don't need one.
2. Add yourself to the `authors` array with `"role": "contributor"`.
3. Respect the original author's `status` — if they marked it `archived`, ask before reviving.

---

## Improving the tooling

The scripts in `scripts/` are plain Node.js (no build step). They share a few conventions:

- Read repo state from disk, not from git — easier to test locally.
- Print human-readable errors with file paths so problems are easy to fix.
- Exit with non-zero status on failure (so GitHub Actions catch it).

If you're adding a script, register it in `package.json` under `scripts` and document it in `scripts/README.md`.

---

## Project metadata rules

Validation enforces these. Full schema in [docs/METADATA_SPEC.md](docs/METADATA_SPEC.md).

- **`license` is locked to `GPL-3.0`.** The repo is GPL-3.0; per-project license overrides aren't allowed. Authors keep credit via the `authors` array.
- **`name` must match the folder name.** Lowercase, hyphenated, no spaces.
- **`category` must match the folder placement.** `category: "tools/ai"` means the project lives at `projects/tools/ai/<name>/`.
- **`platforms` is required** and must contain at least one of: `windows`, `macos`, `linux`, `web`, `ios`, `android`, `all`.
- **`created` is set once and never changes.** `updated` should be bumped on meaningful edits (the `organize` workflow will do this automatically on merge).

---

## Branch & PR conventions

- Branch names: `new/<project>` for new projects, `fix/<thing>`, `tooling/<thing>`, `docs/<thing>` otherwise.
- Keep PRs scoped. One project per PR is the norm; tooling changes can bundle related fixes.
- PR title format: `<scope>: <short description>` — e.g. `tools/ai: add prompt sandbox`, `tooling: better validation errors`.
- CI must be green. If validation fails for an unrelated reason, flag it in the PR description and link the existing issue.

PRs that touch existing projects need a brief "what changed and why" in the description. PRs that add new projects just need the project's README to do its job.

---

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Short version: be kind, give credit, don't be a jerk in reviews. Issues and PRs are public; treat them that way.

---

## License agreement

By contributing, you agree that your contribution is licensed under [GPL-3.0](LICENSE). You retain authorship credit via the `authors` field in the relevant `fermata.json`.
