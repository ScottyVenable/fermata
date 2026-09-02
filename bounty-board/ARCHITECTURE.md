# Bounty Board — Architecture

How the board is built, why it's built that way, and every seam where it touches the rest of
Fermata.

- [Design goals](#design-goals)
- [System overview](#system-overview)
- [Data model](#data-model)
- [State machine](#state-machine)
- [Storage layout and naming](#storage-layout-and-naming)
- [The reputation ledger](#the-reputation-ledger)
- [Tooling layer](#tooling-layer)
- [Repository integration](#repository-integration)
- [CI/CD integration](#cicd-integration)
- [Bot contributor interface](#bot-contributor-interface)
- [Cross-project and external contributions](#cross-project-and-external-contributions)
- [Failure modes and mitigations](#failure-modes-and-mitigations)
- [Migration path to a hosted service](#migration-path-to-a-hosted-service)

---

## Design goals

| Goal | Consequence in the design |
| --- | --- |
| **Git is the database.** | No server, no hosted DB, no accounts to provision. Every fact is a file in this repo, and `git log` is the audit trail. |
| **Human-first, machine-readable.** | Every bounty is a Markdown doc a person actually wants to read, plus a small JSON sidecar the tooling parses. Neither is generated from the other. |
| **Append-only truth.** | The reputation ledger is JSONL, append-only. Profiles and leaderboards are *derived* and can always be recomputed from zero. |
| **Zero dependencies.** | The tooling is plain Node 18+ ESM, matching `scripts/lib/repo.mjs`. `npm install` is not required to read or write bounties. |
| **Bots are first-class.** | Anything a human does through the CLI, an agent can do with the same commands and the same review bar. |
| **Portable forward.** | The file formats are designed so a future hosted Fermata (see EPIC-001) can import them wholesale and keep serving the same permalinks. |

Explicit non-goals: money escrow, on-chain anything, real-time state, and a bounty count so
large that flat directories stop working. If the board ever outgrows Git, that's the signal
to build the service in EPIC-001 — not to bolt a database onto the repo.

---

## System overview

```
                        ┌─────────────────────────────────────────┐
   contributor ────────▶│  bounty-board/  (source of truth, Git)  │
   or bot               │                                         │
        │               │  bounties/<track>/FB-####-slug/         │
        │               │    ├── bounty.json     ← state          │
        │               │    ├── README.md       ← spec           │
        │               │    └── claims/*.md     ← ownership      │
        │               │                                         │
        │               │  reputation/ledger/*.jsonl  ← events    │
        │               └───────────────┬─────────────────────────┘
        │                               │
        │  npm run bounty / npm run rep │  read + append
        ▼                               ▼
 ┌────────────────┐            ┌──────────────────────┐
 │ scripts/       │            │  derived artifacts   │
 │  bounty.mjs    │───────────▶│  INDEX.md            │
 │  reputation.mjs│            │  LEADERBOARD.md      │
 │  lib/bounty.mjs│            │  profiles/<h>.json   │
 └────────────────┘            └──────────────────────┘
        ▲                               ▲
        │                               │
 ┌──────┴───────────────────────────────┴──────────────┐
 │ .github/workflows/bounty.yml                        │
 │   PR  → validate schemas, IDs, links, criteria      │
 │   merge → award REP, rebuild profiles + indices     │
 │   cron → expire stale claims, integrity audit       │
 └─────────────────────────────────────────────────────┘
```

Three layers, cleanly separated:

1. **Storage** — Markdown + JSON files under `bounty-board/`. Hand-editable. The only
   authoritative state.
2. **Tooling** — `scripts/bounty.mjs` and `scripts/reputation.mjs`, sharing
   `scripts/lib/bounty.mjs`. Pure functions over the storage layer; every command is
   idempotent and safe to re-run.
3. **Automation** — GitHub Actions that call the tooling. The workflows contain no logic of
   their own, so everything CI does can be reproduced locally.

---

## Data model

### `bounty.json`

The machine-readable sidecar. Validated against
[`schemas/bounty.schema.json`](schemas/bounty.schema.json).

```json
{
  "id": "FB-0002",
  "title": "Scaffold presets for new-project",
  "slug": "scaffold-presets",
  "track": "tooling",
  "status": "open",
  "size": "s",
  "difficulty": "beginner",
  "reward": { "rep": 60, "bonus_rep": 15, "cash": null },
  "labels": ["good-first-bounty", "scripts", "dx"],
  "skills": ["node", "cli"],
  "targets": [{ "type": "repo-path", "value": "scripts/new-project.mjs" }],
  "requested_by": { "handle": "ScottyVenable", "kind": "human" },
  "created": "2026-09-01",
  "updated": "2026-09-01",
  "deadline": null,
  "epic": null,
  "depends_on": [],
  "blocks": [],
  "claim": {
    "ttl_days": 14,
    "max_concurrent": 1,
    "current": null,
    "history": []
  },
  "acceptance_count": 5,
  "completion": null
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | `FB-####`. Immutable. Must match the folder prefix. |
| `title` | string | 10–100 chars. Must match the `#` heading in `README.md`. |
| `slug` | string | Lowercase-hyphenated. Must match the folder suffix. |
| `track` | enum | `tooling` `automation` `docs` `design` `web` `projects` `ecosystem` `meta` |
| `status` | enum | See [state machine](#state-machine). |
| `size` | enum | `xs` `s` `m` `l` `xl` `epic` — see the size table below. |
| `difficulty` | enum | `beginner` `intermediate` `advanced` `expert` |
| `reward.rep` | integer | Base REP. Must fall in the size's allowed band. |
| `reward.bonus_rep` | integer | Optional stretch award, granted only if the bounty's *Bonus* section is satisfied. |
| `reward.cash` | object\|null | `{ "amount": 50, "currency": "USD", "sponsor": "@handle", "terms_url": "..." }`. Null in almost every case. |
| `labels` | string[] | Free-form, lowercase-hyphenated. `good-first-bounty` is special-cased by the index. |
| `skills` | string[] | Used by `list --skill` and by bots to self-select. |
| `targets` | object[] | What the work touches: `{type: "repo-path"\|"project"\|"external-repo"\|"new-project", value}`. Drives the external-contribution multiplier. |
| `requested_by` | object | `{handle, kind: "human"\|"bot"\|"maintainer"}`. |
| `epic` | string\|null | `EPIC-###` if part of a program. |
| `depends_on` / `blocks` | string[] | Bounty IDs. Validated to exist and to be acyclic. |
| `claim.current` | object\|null | `{handle, kind, claimed_at, expires_at, pr}`. |
| `claim.history` | object[] | Every past claim including expirations and drops. Never pruned. |
| `acceptance_count` | integer | Number of checkboxes in the README's acceptance section. CI verifies it matches, which stops criteria being quietly deleted after a claim. |
| `completion` | object\|null | `{handle, merged_at, pr, commit, rep_awarded, reviewers[]}`. |

### Sizes

`size` is the primary scoping signal. It bounds the REP reward and the default TTL, so
inflating a size to inflate a reward is visible in review.

| Size | Rough effort | REP band | Default TTL | Concurrency cost |
| --- | --- | --- | --- | --- |
| `xs` | < 1 hour | 10–25 | 7 days | 0 (doesn't count against your limit) |
| `s` | a few hours | 30–75 | 14 days | 1 |
| `m` | a weekend | 80–200 | 21 days | 1 |
| `l` | a week+ | 220–500 | 30 days | 2 |
| `xl` | multi-week | 550–1200 | 60 days | 2 |
| `epic` | a program | — (sum of children) | n/a | n/a |

`epic`-sized entries never carry their own REP; they aggregate child bounties so nobody can
claim a whole program in one go and then vanish.

### `README.md`

The human document, generated from
[`templates/BOUNTY_TEMPLATE.md`](templates/BOUNTY_TEMPLATE.md). Its required sections are
enforced structurally by the validator:

`Summary` · `Context` · `Scope` · `Out of scope` · `Acceptance criteria` · `Deliverables` ·
`Definition of done` · `Reward` · `Getting started` · `Notes`

Acceptance criteria must be GitHub task-list checkboxes (`- [ ]`), minimum three, and each
one must be falsifiable by a reviewer without asking the author what they meant.

### Claim files

`claims/YYYY-MM-DD-<handle>.md`, from `CLAIM_TEMPLATE.md`. A claim file is a small
front-matter block plus a running log. The log is what resets the TTL — the expiry job reads
the file's last-modified commit date, not the claim date.

### Ledger events

One JSON object per line in `reputation/ledger/<YYYY>-Q<n>.jsonl`. Append-only, chronological,
never rewritten. Full spec in [REPUTATION.md](REPUTATION.md#event-format).

```json
{"ts":"2026-09-04T18:22:11Z","id":"ev_01J...","actor":"ScottyVenable","subject":"newcontrib","event":"bounty.completed","ref":"FB-0002","points":60,"multiplier":1.0,"reason":"Merged in #42","source":"workflow"}
```

### Profiles

`reputation/profiles/<handle>.json` — **fully derived**. Delete the whole directory and
`npm run rep -- rebuild` recreates it byte-identically from the ledger. Nothing may write a
profile except the rebuild step, which is how we guarantee the ledger stays the only truth.

---

## State machine

```
                    ┌──────────┐
                    │  draft   │  (in a PR, not yet merged)
                    └────┬─────┘
                merge PR │
                    ┌────▼─────┐◀──────────────┐◀────────────────┐
        ┌──────────▶│   open   │               │                 │
        │           └────┬─────┘         expire│           reject│
        │      claim PR  │                     │                 │
        │           ┌────▼─────┐          ┌────┴─────┐      ┌────┴──────┐
        │           │ claimed  │─────────▶│ expired  │      │ in-review │
        │           └──┬───┬───┘  TTL     └──────────┘      └────┬──────┘
        │       drop   │   │ open delivery PR                    │
        └──────────────┘   └─────────────────────────────────────┤
                                                          accept │
                                                          ┌──────▼─────┐
                                                          │ completed  │
                                                          └────────────┘

  any non-terminal ──▶ blocked ──▶ (back to previous state)
  any non-terminal ──▶ cancelled ──▶ moved to bounties/archived/
```

Transition rules the validator enforces:

| From | To | Requires |
| --- | --- | --- |
| `draft` | `open` | Bounty PR merged; passes `bounty validate` |
| `open` | `claimed` | `claim.current` set; claimant under their concurrency limit; tier ≥ size requirement |
| `claimed` | `in-review` | A delivery PR referencing the ID exists |
| `claimed` | `expired` | `now > claim.current.expires_at` and no claim-file activity since |
| `claimed` | `open` | Claimant drops voluntarily (moves claim to `history`, no penalty) |
| `in-review` | `completed` | All acceptance boxes checked; approval from a reviewer at the required tier |
| `in-review` | `open` | Rejected or abandoned; recorded in `claim.history` |
| any | `blocked` | A `blocked_reason` and, ideally, a `depends_on` entry. TTL clock pauses. |
| any | `cancelled` | Maintainer decision + a `cancelled_reason`. Partial work still earns partial REP. |

Terminal states are `completed` and `cancelled`. Everything else can cycle.

---

## Storage layout and naming

```
bounty-board/bounties/<track>/FB-<id>-<slug>/
```

Rules, all validator-enforced:

1. Folder name is `FB-####-<slug>`; `####` matches `bounty.json.id` and `<slug>` matches
   `bounty.json.slug`.
2. IDs are globally unique across all tracks *and* `archived/`. Never reused, even after
   cancellation.
3. `bounty.json.track` matches the parent directory (except in `archived/`, where the
   original track is preserved in the JSON).
4. A bounty folder contains exactly: `bounty.json`, `README.md`, optional `claims/`,
   optional `assets/`. Anything else is a validation warning — deliverables belong in the
   repo they're delivered to, not inside the bounty folder.
5. Slugs are 2–5 words, lowercase, hyphenated, no filler ("add", "the", "some").

**Why status is not a directory** — see [README.md](README.md#why-filed-by-track-not-by-status).
Short version: stable permalinks, clean diffs, and status is better served by a query.

---

## The reputation ledger

Two design decisions carry the whole system.

**1. Events, not balances.** Nothing anywhere stores "handle X has 340 REP". The ledger
stores the events that produced 340, and the balance is a fold over them. This means a
scoring-rule change is a re-run, not a migration, and a bad award is fixed by appending a
correcting event rather than editing history.

**2. Quarterly files.** `2026-Q3.jsonl`, `2026-Q4.jsonl`, … Keeps any one file small enough
to review in a PR diff, gives decay a natural window, and makes merge conflicts rare — two
PRs appending to the same file conflict only on the final line, which Git resolves cleanly
in nearly every case. The workflow appends after merge (not in the contributor's PR) to
eliminate even that.

```
reputation/
├── ledger/
│   ├── 2026-Q3.jsonl        append-only
│   └── 2026-Q4.jsonl
├── profiles/                derived; safe to delete
│   ├── scottyvenable.json
│   └── ...
└── LEADERBOARD.md           derived
```

Integrity: `npm run rep -- audit` verifies that (a) the ledger parses line-by-line,
(b) every `ref` points to a real bounty/PR, (c) no event predates the one before it,
(d) profiles match a fresh fold, and (e) no anti-gaming rule ([REPUTATION.md](REPUTATION.md#anti-gaming))
is violated. CI runs it nightly and on every push to `main`.

---

## Tooling layer

```
scripts/
├── bounty.mjs          CLI: list, show, new, claim, drop, complete, promote, validate, index
├── reputation.mjs      CLI: award, rebuild, who, leaderboard, audit
└── lib/
    ├── repo.mjs        existing shared helpers (paths, args, color, dates)
    └── bounty.mjs      new: bounty + ledger primitives, shared by both CLIs
```

`lib/bounty.mjs` exports the primitives and nothing else does file IO on the board:

| Export | Purpose |
| --- | --- |
| `BOUNTY_BOARD_DIR`, `BOUNTIES_DIR`, `LEDGER_DIR`, `PROFILES_DIR` | Path constants, derived from `REPO_ROOT` |
| `TRACKS`, `STATUSES`, `SIZES`, `SIZE_RULES`, `TIERS`, `EVENT_POINTS` | The canonical enums and scoring tables — the single place they're defined |
| `findBounties()` | Walk `bounties/`, return every folder containing `bounty.json` (mirrors `findProjects()`) |
| `readBounty(dir)` / `writeBounty(dir, data)` | Load/save with schema validation |
| `nextBountyId(track)` | Allocate from the reserved range for the track |
| `parseAcceptance(readme)` | Extract the checkbox list, for `acceptance_count` verification |
| `appendEvent(event)` | Append one line to the current quarter's ledger |
| `readLedger()` / `foldLedger(events)` | Load all events / compute balances, tiers, streaks |
| `tierFor(points)` | Points → tier |

Design rules for both CLIs, matching the existing scripts:

- Node 18+, ESM, zero external dependencies.
- Every mutating command supports `--dry-run` and prints the diff it would write.
- Every command exits non-zero on failure so CI can consume it directly.
- Output is a plain table by default and JSON with `--json`, so bots can parse it.
- Nothing writes to `reputation/profiles/` except `rep rebuild`.

Wired into `package.json`:

```json
"bounty": "node scripts/bounty.mjs",
"rep": "node scripts/reputation.mjs"
```

---

## Repository integration

| Seam | How the board plugs in |
| --- | --- |
| **`projects/`** | A `track: projects` bounty produces a real project folder. Its `targets` entry is `{"type":"new-project","value":"tools/dev/thing"}`, and completion is gated on `npm run validate` passing for that project. |
| **`fermata.json`** | On completion of a project-affecting bounty, the claimant is appended to that project's `authors` with `role: "contributor"`. The board is the *reason*; `fermata.json` stays the *record*. |
| **`scripts/`** | `lib/bounty.mjs` sits beside `lib/repo.mjs` and reuses its path, arg-parsing, and color helpers. No duplication. |
| **`scripts/validate.mjs`** | Unchanged. Board validation is a separate command so a broken bounty can never block a project PR, and vice versa. |
| **`scripts/organize.mjs`** | Unchanged, but the post-merge workflow now runs `bounty index` and `rep rebuild` in the same job, so all generated artifacts refresh together in one commit. |
| **`docs/`** | `docs/BOUNTIES.md` is a short pointer to this directory; the deep documentation lives here, next to the data. |
| **`docs/wiki/`** | `Bounty-Board.md` and `Reputation.md` are synced to the GitHub Wiki by the existing `sync-wiki.yml`. |
| **`.github/ISSUE_TEMPLATE/`** | New `bounty-proposal.md` lets someone propose work without cloning. A maintainer converts an accepted issue into a folder with `bounty new --from-issue <n>`. |
| **`.github/PULL_REQUEST_TEMPLATE.md`** | Gains an optional `Bounty: FB-####` line. Present ⇒ the completion workflow fires on merge. |
| **`README.md`** (root) | A "Bounty board" section in the table of contents pointing here, plus a badge with the open-bounty count refreshed by the index job. |
| **`CONTRIBUTING.md`** | A "Claim a bounty" path alongside the existing "add a project" path. |

Nothing above changes existing behaviour for contributors who ignore the board entirely.
That's deliberate: the board is additive, and a PR that never mentions a bounty ID takes
exactly the same route it does today.

---

## CI/CD integration

One new workflow, `.github/workflows/bounty.yml`, with four jobs:

### `validate` — on `pull_request` touching `bounty-board/**`

```
npm run bounty -- validate       # schemas, IDs, folder names, dep cycles, acceptance counts
npm run rep -- audit --ledger-only
```
Also enforces the human rules a schema can't: no editing another person's claim file, no
lowering `acceptance_count` on a claimed bounty, no self-awarded ledger events in a
contributor PR (the ledger is workflow-written only).

### `award` — on `push` to `main`

Scans the merge commit for `Closes FB-####` / `Bounty: FB-####`, then for each:

```
npm run bounty -- complete FB-#### --who <pr-author> --pr <n> --commit <sha>
npm run rep -- award --who <pr-author> --event bounty.completed --ref FB-#### --pr <n>
npm run rep -- award --who <reviewer> --event review.completed --ref FB-####   # per approving reviewer
npm run bounty -- index
npm run rep -- rebuild && npm run rep -- leaderboard
```

Commits the result with `[skip organize]` so it doesn't re-trigger the organize workflow.

### `expire` — nightly cron

Moves lapsed claims back to `open`, appends `claim.expired` events, and comments on the
original claim PR. A claim with activity in the last TTL window is skipped.

### `audit` — nightly cron

Full `rep audit`, including anti-gaming heuristics. Opens an issue tagged
`reputation-audit` if anything trips, rather than failing silently.

**Concurrency.** All jobs that write use `concurrency: group=bounty-board-write`, so two
merges landing at once can't produce a corrupt ledger or duplicate awards. The award step is
idempotent besides: an event with an existing `(subject, event, ref)` triple is a no-op.

---

## Bot contributor interface

Bots are welcome and use the same surface as humans, with three extra requirements:

1. **Declare yourself.** `claim.current.kind = "bot"`, and the claim file names the operator
   who is accountable for the output.
2. **One claim at a time** until the bot's account reaches ♫ Phrase (500 REP). A bot that
   burns through claims without delivering is rate-limited by its own REP.
3. **Human-legible PRs.** The submission must walk the acceptance criteria explicitly. "The
   tests pass" is not a review argument.

Machine-friendly affordances already in the design:

- `npm run bounty -- list --json --status open --skill node` → a queue an agent can poll.
- `bounty.json.skills` and `difficulty` → self-selection without reading prose.
- `acceptance_count` → a checkable target before opening a PR.
- `npm run bounty -- validate` → the exact gate CI will apply, runnable locally.

Bot REP is tracked separately in the leaderboard (a `kind: bot` profile field) so human and
machine contributions are visible but not conflated. Bots cannot review, approve completions,
or promote proposals at any tier.

---

## Cross-project and external contributions

The point of a reputation system in a *sandbox* monorepo is to reward the thing that doesn't
happen naturally: people improving work that isn't theirs.

`targets[].type` drives a multiplier applied at award time:

| Target type | Meaning | Multiplier |
| --- | --- | --- |
| `repo-path` | Core Fermata infrastructure | ×1.0 |
| `new-project` | A brand-new project in `projects/` | ×1.0 |
| `project` | An **existing** project you did not create | ×1.5 |
| `external-repo` | A repo outside Fermata (upstream fix, dependency patch) | ×1.25, verification required |

External contributions are verified by linking the merged upstream PR in the submission; the
award event stores that URL in `ref_url`. Unverifiable external claims are simply not
awarded — no penalty, no argument.

This is also how the board stays honest about its own scope: Fermata explicitly wants
contributors going *out* and improving other people's projects, and the ledger records that
as reputation earned here.

---

## Failure modes and mitigations

| Failure mode | Mitigation |
| --- | --- |
| **Board rots** — bounties sit open forever | Nightly expiry; `stale` label after 90 days with no activity; quarterly triage sweep tracked as a `meta` bounty |
| **Reward inflation** — everything becomes `xl` | REP bands are bounded by size; size is set at review time by the merger, not the author |
| **Sockpuppet farming** | Awards require a merged PR; self-review earns nothing; `rep audit` flags accounts whose REP comes from a single reviewer or a single-day burst |
| **Claim squatting** | TTL + concurrency limits by tier + a small REP penalty for silent lapses |
| **Ledger corruption or a bad merge** | Append-only + derived profiles: `rep rebuild` restores everything, and `git log` shows exactly which commit introduced a bad line |
| **Scoring changes invalidate history** | Points are stored *on the event*, so a rule change affects future awards only unless a maintainer deliberately re-folds with a documented migration event |
| **Vague bounties waste contributor time** | Minimum three falsifiable criteria and a mandatory *Out of scope*, both enforced by the validator |
| **Two people build the same thing** | Claim-first convention, plus `good-faith-collision` REP so the loser isn't punished for the race |

---

## Migration path to a hosted service

[EPIC-001](epics/EPIC-001-fermata-ecosystem/) builds a website and a desktop app with
accounts, projects, and a bounty feed. The board is designed to be that service's seed data,
not something to throw away.

| Board concept | Service concept |
| --- | --- |
| `bounty.json` | `bounties` row; the folder path becomes the permalink slug |
| `README.md` | `bounties.body_markdown` |
| `claims/*.md` | `claims` rows + a threaded comment log |
| `ledger/*.jsonl` | `reputation_events` table — same schema, same event names, same points |
| `profiles/*.json` | Materialized view, exactly as it is here |
| `INDEX.md` / `LEADERBOARD.md` | Server-rendered pages |

The rule that makes this work: **the repo stays authoritative through the transition.** The
first version of the service is read-only over a Git sync, then writes go through the API and
the repo becomes a mirror — never a fork of truth. Migration is a one-way door, so it's
gated behind its own bounty (`FB-0301`) with an explicit go/no-go checklist rather than
happening by drift.
