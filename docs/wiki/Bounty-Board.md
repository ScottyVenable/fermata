# Bounty Board

Fermata's bounty board is a queue of scoped work that anyone can claim — humans and bots alike.
Every bounty has explicit acceptance criteria, so you always know what "done" means before you
start.

Source of truth: [`bounty-board/`](https://github.com/ScottyVenable/fermata/tree/main/bounty-board)
in the repo. This page is the short version.

## Finding work

```bash
npm run bounty -- list --status open
npm run bounty -- list --label good-first-bounty
npm run bounty -- list --skill node --size s
npm run bounty -- show FB-0001
```

Or read the generated [INDEX.md](https://github.com/ScottyVenable/fermata/blob/main/bounty-board/INDEX.md).

## Anatomy of a bounty

Each one is a folder at `bounty-board/bounties/<track>/FB-####-<slug>/`:

| File | What |
| --- | --- |
| `README.md` | The human document: summary, context, scope, out of scope, acceptance criteria, reward, getting started |
| `bounty.json` | Machine-readable metadata, validated in CI |
| `claims/` | One file per claim attempt, with a progress log |

Bounties are filed by **track**, not by status — so a link to a bounty never breaks when someone
claims it. Status lives in `bounty.json` and is queried, not navigated.

## Tracks

`tooling` · `automation` · `docs` · `design` · `web` · `projects` · `ecosystem` · `meta`

## Sizes

| Size | Effort | REP | Claim TTL |
| --- | --- | --- | --- |
| `xs` | < 1 hour | 10–25 | 7 days |
| `s` | a few hours | 30–75 | 14 days |
| `m` | a weekend | 80–200 | 21 days |
| `l` | a week+ | 220–500 | 30 days |
| `xl` | multi-week | 550–1200 | 60 days |

## Claiming

```bash
npm run bounty -- claim FB-0001 --who yourhandle
```

Commit the claim file and the status change, open a PR titled `claim: FB-0001 <slug>`, and build.
When you're done, open a PR with `Closes FB-0001` in the body — that's what awards the REP.

Rules worth knowing:

- Acceptance criteria are **frozen** once you claim. Nobody moves the goalposts.
- A claim expires after its TTL, but any commit to your claim file resets the clock.
- **Dropping a claim is free.** Only silent lapses cost REP (−10).
- `xs` bounties don't need a claim — just open the PR.

## Posting

```bash
npm run bounty -- new --title "Ship X" --track tooling --size s
```

A bounty is mergeable with a title, track, size, reward, **three or more falsifiable acceptance
criteria**, and a non-empty *Out of scope*. Not sure enough to write all that? Post a
[proposal](https://github.com/ScottyVenable/fermata/tree/main/bounty-board/proposals) instead —
if someone promotes it, you earn +10 REP for having the idea.

## The big one

[EPIC-001](https://github.com/ScottyVenable/fermata/tree/main/bounty-board/epics/EPIC-001-fermata-ecosystem)
is a seven-bounty program to build a Fermata Windows application, a website with accounts and
profiles, and the public API that joins them. Roughly 4,450 REP across the epic.

## See also

- [Reputation](Reputation) — how REP works
- [Contributing](Contributing) — the general contribution guide
