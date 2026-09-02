# FB-0007: Add a repo doctor command for environment checks

> **Track** `tooling` · **Size** `s` · **Difficulty** `beginner` · **Reward** `50 REP`
> **Status** `open` · **Claim TTL** 14 days · **Epic** —

---

## Summary

Add `npm run doctor` — a single command that checks whether a clone is set up correctly and
tells you exactly what to do about anything that isn't. Node version, install state, git
configuration, orphaned folders, generated files that have drifted from source. It should be
the first thing anyone runs when something's weird, and the first thing a bot runs before
claiming work.

---

## Context

- **Why now:** the repo has five scripts, a shared dependency model, generated indices, and a
  bounty board with its own generated artifacts. There are now several ways for a working copy
  to be subtly wrong, and no way to find out except by hitting the failure.
- **Prior art:** `npm run validate` checks *project metadata*; doctor checks *the environment
  and the repo's own consistency*. Keep them separate — validate is a correctness gate that CI
  enforces, doctor is a diagnostic that never blocks anything.

---

## Scope

| What | Where |
| --- | --- |
| The command | `scripts/doctor.mjs` |
| `doctor` entry | `package.json` |
| A mention in the troubleshooting path | `docs/GUIDE.md`, `CONTRIBUTING.md` |

Checks to implement:

| Check | Failure hint |
| --- | --- |
| Node ≥ 18 | "You're on 16.x. Fermata needs 18+." |
| `node_modules/` present if any script needs it | "Run `npm install`." |
| Every project folder has a `fermata.json` | Lists the offenders, suggests `npm run new` or removal |
| No `fermata.json` outside `projects/` and `template/` | Lists strays |
| `projects/INDEX.md` matches a fresh `organize` run | "Run `npm run organize`." |
| `bounty-board/INDEX.md` matches a fresh `bounty index` | "Run `npm run bounty -- index`." |
| Shared deps declared by projects all exist in the manifest | Names the missing ones |
| Git: not detached HEAD, remote `origin` set | Informational |

---

## Out of scope

- Not fixing anything automatically unless `--fix` is passed, and `--fix` only regenerates
  derived files (the two indices). It never edits a `fermata.json` or a `bounty.json`.
- Not replacing or wrapping `npm run validate`.
- Not adding checks that require network access.
- Not failing CI. Doctor exits `0` unless `--strict` is passed.

---

## Acceptance criteria

- [ ] `npm run doctor` runs every check above and prints a grouped pass/warn/fail report with a
      specific, actionable hint for each non-pass.
- [ ] `npm run doctor` exits `0` even when checks fail; `npm run doctor -- --strict` exits `1`
      if anything failed.
- [ ] `npm run doctor -- --fix` regenerates `projects/INDEX.md` and `bounty-board/INDEX.md` when
      they've drifted, and touches nothing else.
- [ ] `npm run doctor -- --json` emits a structured result (same convention as `bounty list --json`).
- [ ] Running doctor on a clean, correct clone reports all checks passing and nothing else.

---

## Deliverables

1. `scripts/doctor.mjs`.
2. `doctor` script in `package.json`.
3. A "Something's wrong" section in `docs/GUIDE.md` pointing at it.

---

## Definition of done

- All acceptance criteria checked.
- Every check has been verified against a deliberately broken clone — say which breakages you
  simulated in the PR.
- No new dependencies.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 50 |
| Applicable multipliers | ×1.0 |

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata
node scripts/validate.mjs
node scripts/bounty.mjs validate
```

Files worth reading first:

- `scripts/lib/repo.mjs` — `findProjects`, `fileExists`, `readJson`, `color`.
- `scripts/lib/bounty.mjs` — `findBounties`, and the index path constants.
- `scripts/organize.mjs` — regenerating the project index, which `--fix` will call.

The drift checks are the interesting bit: generate the index into a string, compare to what's
on disk, and report the difference rather than writing it. That's a nice reusable pattern.

---

## How to claim

```bash
npm run bounty -- claim FB-0007 --who yourhandle
```

---

## Notes

- Hint quality is the actual product here. "Check failed" is worthless: "`projects/web/foo` has
  no `fermata.json` — run `npm run new -- --name foo --category web` or delete the folder" is
  the standard.
- Good candidate for a bot claim: the criteria are mechanical and the blast radius is one new
  file.
