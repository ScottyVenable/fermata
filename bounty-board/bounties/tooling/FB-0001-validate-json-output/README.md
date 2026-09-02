# FB-0001: Machine-readable output for the validate script

> **Track** `tooling` · **Size** `s` · **Difficulty** `beginner` · **Reward** `45 REP` (+15 bonus)
> **Status** `open` · **Claim TTL** 14 days · **Epic** —

---

## Summary

`npm run validate` prints a friendly coloured report for humans and nothing a machine can
consume. Add a `--json` flag that emits a structured result to stdout, so CI annotations,
editor integrations, bots, and the future Fermata website can all read validation output
without scraping ANSI escape codes.

---

## Context

- **Why now:** every other piece of Fermata tooling is about to grow a machine consumer — the
  bounty board CLI already supports `--json`, the ecosystem work in [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)
  needs to surface per-project health on a website, and bot contributors need a parseable
  signal for "did I break anything".
- **Prior art:** `scripts/bounty.mjs` already implements `--json` on `list` and `show`. Match
  that convention rather than inventing a second one.
- **Related:** `docs/METADATA_SPEC.md` defines every rule the validator checks.

---

## Scope

| What | Where |
| --- | --- |
| `--json` flag and structured emitter | `scripts/validate.mjs` |
| A shared result shape both output modes build from | `scripts/validate.mjs` |
| `--quiet` behaviour reconciled with `--json` | `scripts/validate.mjs` |
| Documentation of the flag and the output shape | `scripts/README.md`, `docs/GUIDE.md` |

Suggested output shape:

```json
{
  "ok": false,
  "checked": 3,
  "passed": 2,
  "failed": 1,
  "projects": [
    {
      "path": "projects/tools/ai/vivarium",
      "name": "vivarium",
      "ok": true,
      "errors": []
    },
    {
      "path": "projects/web/thing",
      "name": "thing",
      "ok": false,
      "errors": [
        { "field": "category", "rule": "category-matches-path", "message": "..." }
      ]
    }
  ]
}
```

The `field` and `rule` keys are what make this worth doing — a bare message string is barely
better than parsing the text output.

---

## Out of scope

- Not changing any validation **rule**. Same checks, new output format.
- Not adding a JSON Schema validator dependency. The repo's tooling is dependency-free and
  stays that way.
- Not touching `organize.mjs` or `add-dependency.mjs`, even though they'd benefit from the
  same treatment — those are separate bounties if someone wants them.
- Not building the GitHub Actions annotation output. Nice idea, different bounty.

---

## Acceptance criteria

- [ ] `node scripts/validate.mjs --json` prints a single valid JSON document to stdout and
      nothing else — no colour codes, no progress lines, no trailing prose.
- [ ] The JSON matches the shape above: top-level `ok`, `checked`, `passed`, `failed`, and a
      `projects` array with `path`, `name`, `ok`, and `errors`.
- [ ] Each error object carries at least `rule` and `message`, and `field` where a specific
      metadata field is at fault.
- [ ] Exit codes are unchanged: `0` when everything passes, `1` when anything fails, in both
      output modes.
- [ ] Human output is byte-for-byte unchanged when `--json` is absent.
- [ ] `--json` combined with `--project <path>` scopes to that one project.

### Bonus

- [ ] A `--format github` mode that emits `::error file=...,line=...::message` workflow
      commands, wired into `.github/workflows/validate.yml` so failures annotate the PR diff.

---

## Deliverables

1. Updated `scripts/validate.mjs`.
2. A short "Output formats" section in `scripts/README.md` documenting both modes.
3. A one-line mention in `docs/GUIDE.md` where validation is introduced.

---

## Definition of done

- All acceptance criteria checked, with the reviewer's verification noted in the PR.
- `npm run validate` still green on the existing project tree.
- No new dependencies.
- Changes are GPL-3.0 compatible.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 45 |
| Bonus (GitHub annotations) | 15 |
| Applicable multipliers | ×1.0 |

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata
node scripts/validate.mjs            # see the current human output
node scripts/bounty.mjs list --json  # see the --json convention to match
```

Files worth reading first:

- `scripts/validate.mjs` — the whole thing is ~150 lines; the report loop is at the top of `main()`.
- `scripts/lib/repo.mjs` — `parseArgs` and `color` already exist; reuse them.
- `scripts/bounty.mjs` — how `--json` is handled elsewhere.

The main design decision is where to build the result object. The cleanest approach is to
have `validateProject()` return structured errors instead of strings, then render those into
either format — which is a small refactor with a nice payoff.

---

## How to claim

```bash
npm run bounty -- claim FB-0001 --who yourhandle
```

Then open a PR titled `claim: FB-0001 validate-json-output`.

---

## Notes

- If you find a validation rule that's wrong while you're in here, don't fix it in this PR —
  note it in the claim file and it'll become its own bounty.
- `--json` and `--quiet` together should behave as `--json` (quiet is meaningless when the
  only output is the document).
