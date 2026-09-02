<div align="center">

# 𝄐 Fermata Bounty Board

*Work that wants doing, and a way to get credit for doing it.*

[![Bounties](https://img.shields.io/badge/bounties-open-ff7f50?style=flat-square)](INDEX.md)
[![Reputation](https://img.shields.io/badge/reputation-REP-blueviolet?style=flat-square)](REPUTATION.md)
[![Open to bots](https://img.shields.io/badge/open_to-humans_%26_bots-1f6feb?style=flat-square)](GOVERNANCE.md#bot-contributors)
[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-3DA639?style=flat-square)](../LICENSE)

</div>

> A **bounty** is a unit of wanted work: scoped, acceptance-tested, and claimable by anyone — human or bot.
> Completing one earns **REP**, Fermata's non-transferable reputation currency.

---

## Table of contents

- [What this is](#what-this-is)
- [The 60-second version](#the-60-second-version)
- [Directory layout](#directory-layout)
- [Bounty lifecycle](#bounty-lifecycle)
- [How to claim a bounty](#how-to-claim-a-bounty)
- [How to post a bounty](#how-to-post-a-bounty)
- [Reputation](#reputation)
- [Tooling](#tooling)
- [Reading list](#reading-list)

---

## What this is

Fermata is a sandbox monorepo for hobby projects. It grows in two ways: someone builds a
thing, or someone improves the machinery around the things. The **bounty board** is the
queue for the second kind of work — and, increasingly, the first.

The board answers three questions that every drive-by contributor asks:

| Question | Where it's answered |
| --- | --- |
| *What needs doing?* | [`INDEX.md`](INDEX.md) — generated, always current. |
| *What counts as done?* | Every bounty's `Acceptance criteria` section. Binary checkboxes, no vibes. |
| *What do I get?* | **REP** — see [REPUTATION.md](REPUTATION.md). |

Bounties are **not paid in money**. Fermata is a hobby repo under GPL-3.0; the reward is
reputation, credit in `fermata.json`, and standing in the project. If a bounty ever carries
a cash sponsorship, it says so explicitly in its `reward.cash` field and links the sponsor.

---

## The 60-second version

```bash
# See what's open
npm run bounty -- list --status open

# Read one
cat bounty-board/bounties/tooling/FB-0002-scaffold-presets/README.md

# Claim it (writes a claim file; commit it in a PR titled "claim: FB-0002")
npm run bounty -- claim FB-0002 --who yourhandle

# Do the work, open a PR that says "Closes FB-0002"
# A maintainer merges, awards REP, and the ledger updates.
```

---

## Directory layout

```
bounty-board/
├── README.md                  You are here. Entry point + rules of the road.
├── ARCHITECTURE.md            Full system design: data model, states, integration points.
├── REPUTATION.md              The REP spec: events, values, tiers, decay, anti-gaming.
├── GOVERNANCE.md              Roles, review rules, disputes, bot policy.
├── INDEX.md                   GENERATED. Every bounty, grouped by status + track.
├── STEWARDS.md                Who tends which track this season.
├── CHANGELOG.md               Changes to the board itself, not to its contents.
│
├── schemas/                   JSON Schemas the tooling validates against.
│   ├── bounty.schema.json
│   ├── claim.schema.json
│   ├── ledger-event.schema.json
│   └── profile.schema.json
│
├── templates/                 Copy these. Do not edit in place.
│   ├── BOUNTY_TEMPLATE.md     ← the canonical bounty document
│   ├── bounty.template.json   ← the machine-readable sidecar
│   ├── CLAIM_TEMPLATE.md
│   ├── SUBMISSION_TEMPLATE.md
│   └── PROPOSAL_TEMPLATE.md
│
├── bounties/                  The bounties themselves, filed by TRACK (not by status).
│   ├── tooling/               scripts/, CLI, validation, developer ergonomics
│   ├── automation/            GitHub Actions, bots, scheduled jobs
│   ├── docs/                  guides, wiki, specs, onboarding
│   ├── design/                brand, UI, visual identity, UX
│   ├── web/                   sites and web surfaces owned by Fermata itself
│   ├── projects/              build-a-new-project bounties (land in projects/)
│   ├── ecosystem/             the big platform work (Windows app, website, API)
│   ├── meta/                  the bounty board improving itself
│   └── archived/              cancelled or expired. Never deleted, only moved here.
│
├── epics/                     Multi-bounty programs with a shared goal + roadmap.
│   └── EPIC-001-fermata-ecosystem/
│
├── proposals/                 Pre-bounty ideas. Cheap to write, no commitment.
│
└── reputation/
    ├── README.md              How the ledger works operationally.
    ├── ledger/                APPEND-ONLY. One JSONL file per quarter.
    ├── profiles/              GENERATED. One JSON per contributor.
    └── LEADERBOARD.md         GENERATED.
```

### Why filed by track, not by status

The obvious layout is `bounties/open/`, `bounties/claimed/`, `bounties/done/`. We don't do
that, deliberately:

- **Permalinks stay stable.** A bounty's path never changes, so links from PRs, issues,
  Discord, and blog posts don't rot the moment someone claims it.
- **Git history stays readable.** Status changes are one-line diffs in `bounty.json`,
  not directory renames that show up as delete+add.
- **Status is a query, not a location.** `npm run bounty -- list --status open` and the
  generated `INDEX.md` give you every status view you'd get from folders, for free.

The single exception is `bounties/archived/`, where cancelled and expired bounties go so
the active tracks stay skimmable. That's a one-time terminal move, not churn.

### Anatomy of a bounty folder

```
bounties/tooling/FB-0002-scaffold-presets/
├── bounty.json        Required. Machine-readable metadata. Validated in CI.
├── README.md          Required. The human document, from BOUNTY_TEMPLATE.md.
├── claims/            One file per claim attempt.
│   └── 2026-09-04-yourhandle.md
└── assets/            Optional. Mockups, diagrams, sample data.
```

### ID scheme

`FB-####` — **F**ermata **B**ounty, zero-padded to four digits, allocated monotonically and
never reused.

| Range | Reserved for |
| --- | --- |
| `FB-0001`–`FB-0099` | Core repo work: tooling, automation, docs, design |
| `FB-0100`–`FB-0199` | Ecosystem: Windows application |
| `FB-0200`–`FB-0299` | Ecosystem: website, API, accounts |
| `FB-0300`–`FB-0399` | Ecosystem: shared services (reputation API, search, CDN) |
| `FB-0400`–`FB-0899` | Reserved |
| `FB-0900`–`FB-0999` | Meta: the bounty board improving itself |
| `FB-1000`+ | General pool once the ranges above fill |

Epics use `EPIC-###`. Proposals use `PROP-###` until they're promoted to a bounty.

---

## Bounty lifecycle

```
 proposal ──▶ open ──▶ claimed ──▶ in-review ──▶ completed
                │         │            │
                │         ├── expired ─┘ (claim TTL lapsed → back to open)
                │         │
                └─────────┴──▶ cancelled ──▶ archived/
```

| Status | Meaning | Who moves it |
| --- | --- | --- |
| `draft` | Being written. Not claimable. | Author |
| `open` | Claimable by anyone. | Maintainer (on merge of the bounty PR) |
| `claimed` | Someone owns it; the claim TTL is running. | Claimant, via merged claim PR |
| `in-review` | Work submitted, PR under review. | Claimant, on opening the delivery PR |
| `completed` | Merged and accepted. REP awarded. | Maintainer |
| `blocked` | Waiting on an external dependency. TTL paused. | Anyone, with a reason |
| `cancelled` | No longer wanted. | Maintainer |
| `expired` | Claim TTL lapsed with no activity → auto-reopened. | Automation |

**Claim TTL** defaults to 14 days (`claim.ttl_days` in `bounty.json`). Extra-large bounties
set their own. A claimant who posts a progress note in `claims/` resets the clock. Letting a
claim lapse silently costs REP; saying "I'm dropping this" costs nothing.

---

## How to claim a bounty

1. **Read it end to end.** Especially *Acceptance criteria* and *Out of scope*.
2. **Check it's actually open.** `npm run bounty -- show FB-0002`.
3. **File the claim.**
   ```bash
   npm run bounty -- claim FB-0002 --who yourhandle
   ```
   This creates `claims/<date>-<handle>.md` from the template and flips
   `bounty.json` → `status: "claimed"`.
4. **Open a PR titled `claim: FB-0002 <slug>`.** Nothing else in it. It merges fast.
5. **Build.** Post progress in your claim file if you need more than a week.
6. **Deliver.** Open the real PR, use `SUBMISSION_TEMPLATE.md` for the description, and put
   `Closes FB-0002` in the body.
7. **Review.** A maintainer walks the acceptance criteria. Every box or it goes back.
8. **Get paid in REP.** The merge commit appends a `bounty.completed` event to the ledger.

**Contested claims.** First merged claim PR wins. If two land close together, the earlier
`claimed_at` timestamp wins and the other claimant gets a `good-faith-collision` award of
+5 REP for the wasted trip. Nobody loses REP for a collision.

**Small bounties (`size: xs`)** can skip step 3–4 entirely: just open the PR with
`Closes FB-####`. Don't do that for anything larger — claim first so nobody duplicates you.

---

## How to post a bounty

Anyone can propose work. Two routes:

**Route A — I know exactly what I want.**
```bash
npm run bounty -- new \
  --title "Add --json output to validate" \
  --track tooling \
  --size s
```
Fills in the template, allocates the next free ID, writes both files. Edit them, then PR.

**Route B — I have a hunch.**
Drop a file in `proposals/` using `PROPOSAL_TEMPLATE.md`. No scoping required, no acceptance
criteria required. A maintainer (or anyone with **Measure** tier or above) can promote it:
```bash
npm run bounty -- promote PROP-004 --track web --size m
```

A bounty is mergeable when it has: a title, a track, a size, a reward, at least three
falsifiable acceptance criteria, and an explicit *Out of scope*. Vague bounties are the main
way a board like this dies, so this bar is enforced by `npm run bounty -- validate`, which CI
runs on every PR.

---

## Reputation

Short version: you earn **REP** for merged work, reviews, published projects, and helping
other people's projects — with a deliberate multiplier for the last one, because a monorepo
of solo silos isn't an ecosystem.

| Tier | REP | What it unlocks |
| --- | --- | --- |
| 𝄽 Rest | 0 | Claim `xs`/`s` bounties |
| ♪ Note | 100 | Claim any size; 2 concurrent claims |
| 𝄀 Measure | 250 | Promote proposals; review others' bounties |
| ♫ Phrase | 500 | 3 concurrent claims; post bounties without co-sign |
| 𝄆 Movement | 1000 | Approve `xs`–`m` completions |
| 𝄐 Fermata | 2500 | Approve any completion; steward a track |
| 𝄌 Coda | 5000 | Maintainer nomination rights |

The full spec — every event type, point value, the external-contribution multiplier, decay,
escrow, and the anti-gaming rules — is in **[REPUTATION.md](REPUTATION.md)**.

---

## Tooling

All of it is plain Node 18+, no dependencies, same as the rest of `scripts/`.

| Command | Does |
| --- | --- |
| `npm run bounty -- list [--status s] [--track t] [--size z]` | Filtered table of bounties |
| `npm run bounty -- show FB-0002` | Full detail for one |
| `npm run bounty -- new --title T --track t --size z` | Scaffold a new bounty |
| `npm run bounty -- claim FB-0002 --who handle` | File a claim |
| `npm run bounty -- complete FB-0002 --who handle` | Mark done + emit ledger event |
| `npm run bounty -- validate` | Schema + rule check (CI runs this) |
| `npm run bounty -- index` | Regenerate `INDEX.md` |
| `npm run rep -- award --who h --event bounty.completed --ref FB-0002` | Append a ledger event |
| `npm run rep -- rebuild` | Recompute all profiles from the ledger |
| `npm run rep -- who handle` | One contributor's standing |
| `npm run rep -- leaderboard` | Regenerate `LEADERBOARD.md` |
| `npm run rep -- audit` | Anti-gaming + ledger integrity checks |

---

## Reading list

| Doc | Read it when |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | You want the whole design: data model, states, CI integration |
| [REPUTATION.md](REPUTATION.md) | You want to know exactly how REP is earned and lost |
| [GOVERNANCE.md](GOVERNANCE.md) | You're reviewing, disputing, or running a bot |
| [templates/BOUNTY_TEMPLATE.md](templates/BOUNTY_TEMPLATE.md) | You're writing a bounty |
| [epics/EPIC-001-fermata-ecosystem/](epics/EPIC-001-fermata-ecosystem/) | You want the big one |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | You're new to the repo generally |

---

<div align="center">
<sub>Claim a note. Hold it as long as you like. <strong>𝄐</strong></sub>
</div>
