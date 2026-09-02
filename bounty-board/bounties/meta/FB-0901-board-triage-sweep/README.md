# FB-0901: Quarterly board triage sweep automation

> **Track** `meta` · **Size** `s` · **Difficulty** `intermediate` · **Reward** `70 REP`
> **Status** `open` · **Claim TTL** 14 days · **Epic** —

---

## Summary

Bounty boards die by accumulation: stale entries pile up, nobody trusts the list, and new
contributors bounce. Automate the quarterly sweep — label stale bounties, apply the stale-bounty
REP multiplier, summarise the quarter, and open a single triage issue for the humans to act on.

---

## Context

- **Why now:** the board is new and clean. The moment to build the thing that keeps it clean is
  before it isn't.
- **Prior art:** `bounty-board/GOVERNANCE.md` already specifies the sweep as a steward
  responsibility. This makes it happen whether or not a steward remembers.
- **Related:** [FB-0003](../../automation/FB-0003-stale-project-sweeper/) does the analogous job
  for projects. Read it first — the two should feel like siblings, and sharing helpers is
  encouraged if that bounty has landed.

---

## Scope

| What | Where |
| --- | --- |
| Sweep command | `scripts/bounty.mjs sweep` |
| Scheduled workflow (quarterly + dispatch) | `.github/workflows/bounty.yml` |
| Season summary appended to the index | `scripts/bounty.mjs index` |

Sweep behaviour:

- Bounties `open` for >90 days get the `stale` label added to `bounty.json`.
- Bounties `open` for >180 days are listed in the triage issue as cancellation candidates —
  listed, never cancelled.
- Claims past their TTL with no claim-file activity are expired (status back to `open`, claim
  moved to `history`, `claim.expired-silent` event appended).
- A season summary — bounties opened, completed, REP awarded, top tracks — is written into
  `INDEX.md`.

---

## Out of scope

- Never cancels a bounty. Cancellation is a maintainer decision, always.
- Never edits a bounty's README or acceptance criteria.
- Not touching the reputation ledger except to append `claim.expired-silent` events for genuine
  silent lapses.
- Not sending notifications outside GitHub.

---

## Acceptance criteria

- [ ] `npm run bounty -- sweep` runs locally, supports `--dry-run`, and prints exactly what it
      would change.
- [ ] Bounties open longer than 90 days gain a `stale` label; those past 180 days are collected
      into a cancellation-candidate list.
- [ ] Expired claims are reverted to `open` with the claim moved into `claim.history` with
      `outcome: "expired"`, and a `claim.expired-silent` ledger event is appended for each.
- [ ] A claim whose claim file has been committed to within the TTL window is **not** expired —
      verified with a test case in the PR.
- [ ] The workflow runs on a quarterly schedule and on `workflow_dispatch`, and opens or edits a
      single `Board triage — <season>` issue rather than creating duplicates.

---

## Deliverables

1. `sweep` subcommand in `scripts/bounty.mjs`.
2. Quarterly job in `.github/workflows/bounty.yml`.
3. Season summary block in the generated `bounty-board/INDEX.md`.

---

## Definition of done

- All acceptance criteria checked.
- Dry-run output for the current board attached to the PR.
- `npm run bounty -- validate` and `npm run rep -- audit` both green after a simulated sweep.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 70 |
| Applicable multipliers | ×1.0 |

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata
npm run bounty -- validate
npm run bounty -- stats
git log -1 --format=%cI -- bounty-board/bounties/tooling/FB-0001-validate-json-output/claims/
```

Files worth reading first:

- `scripts/bounty.mjs` — `cmdIndex` and `cmdDrop` show the mutation patterns to follow.
- `scripts/lib/bounty.mjs` — `loadBounties`, `appendEvent`, `quarterOf`.
- `bounty-board/GOVERNANCE.md` § Cancellation and archival.

The claim-activity check is the subtle part: use the last commit date touching the claim
**file**, not the `claimed_at` timestamp. That's what lets someone hold a long bounty by
posting progress.

---

## Notes

- Err toward doing nothing. A sweep that wrongly expires an active claim costs a contributor
  more than a stale label costs the board.
