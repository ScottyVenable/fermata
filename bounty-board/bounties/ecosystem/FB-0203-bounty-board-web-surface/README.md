# FB-0203: Bounty board as a live web surface with claims and review

> **Track** `ecosystem` · **Size** `l` · **Difficulty** `advanced` · **Reward** `450 REP` (+100 bonus)
> **Status** `open` · **Claim TTL** 60 days · **Epic** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)

---

## Summary

Put the bounty board on the web: browse and filter open work, read a bounty with its acceptance
criteria, claim it, post progress, submit a delivery, and review someone else's — all from the
browser, all landing in the repository as real commits and pull requests. This is the surface
that turns the board from a folder of Markdown into a place people show up to.

---

## Context

- **Why this matters most:** the bounty board is Fermata's contributor-acquisition mechanism, and
  today finding it requires already being a contributor. Every hour spent here converts more
  strangers than an hour spent anywhere else on the site.
- **The board's data model is done.** [`bounty-board/schemas/`](../../../schemas/) has four JSON
  Schemas, [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) has the state machine, and
  `npm run bounty -- list --json` already emits the exact payload. You are building the interface,
  not the model.
- **Depends on [FB-0200](../FB-0200-fermata-website-and-ecosystem/)** (shell, sync) and
  [FB-0201](../FB-0201-accounts-and-authentication/) (who's claiming).

---

## Scope

| Surface | What |
| --- | --- |
| `/bounties` | Filter by status, track, size, difficulty, skill, label, REP range. Sort by reward, age, expiry. Highlighted "good first bounty" rail. |
| `/bounties/<id>` | Full bounty: rendered README, acceptance criteria as live checkboxes for the claimant, claim state, TTL countdown, dependency graph, comment thread. |
| Claim flow | One click → claim file written, `bounty.json` updated, PR opened, TTL started. Concurrency and tier gates enforced server-side. |
| Progress | Post an update to your claim file from the site; TTL resets. |
| Submission | Link a delivery PR, walk the criteria, mark ready for review. |
| Review | Reviewers step through criteria, approve or request changes, and completion writes the ledger event. |
| Posting | Write a bounty in a guided editor that enforces the required sections and the three-criteria minimum; opens a PR. |
| Proposals | Post a proposal, and promote one to a bounty if you're Measure tier or above. |

---

## Out of scope

- Cash, escrow, or payment of any kind. REP only.
- Replacing GitHub PR review. The site tracks the acceptance criteria; code review stays on GitHub.
- Notifications beyond in-app and the GitHub notifications that PRs already generate. No email
  digests in v1.
- Automatic bounty generation from issues.
- Changing the state machine, the reward bands, or any governance rule. Implement what's
  specified; propose changes separately.

---

## Acceptance criteria

- [ ] `/bounties` lists every bounty with filters for status, track, size, difficulty, skill,
      and label, plus three sort orders, with all state in the URL.
- [ ] A bounty detail page renders the full README, shows every acceptance criterion, the current
      claim with a live TTL countdown, and the `depends_on` / `blocks` relationships as links.
- [ ] A signed-in, eligible user can claim an open bounty in one action, and doing so opens a real
      PR containing a correct claim file and the `bounty.json` status change.
- [ ] Claim eligibility is enforced **server-side**: tier gate by size, concurrency limit by tier,
      and bot restrictions, all matching [GOVERNANCE.md](../../../GOVERNANCE.md#claiming-rules).
      A test proves each rejection.
- [ ] A claimant can post a progress update from the site, which commits to their claim file and
      visibly resets the TTL.
- [ ] Acceptance criteria are frozen once claimed: the site refuses to accept an edit that changes
      the criteria count on a claimed bounty, per governance.
- [ ] A reviewer can walk the criteria, approve or request changes, and an approval that meets the
      required review threshold marks the bounty complete and appends a correctly-computed
      `bounty.completed` ledger event — including the target multiplier.
- [ ] Anyone can post a proposal; Measure-tier and above can promote one, which opens a PR
      creating the bounty folder from the template.
- [ ] Every state change made through the site is reflected in the repository, and a repo-side
      change made by hand is reflected on the site within five minutes.

### Bonus

- [ ] A personal "my work" dashboard: active claims with countdowns, bounties you authored and
      their status, reviews awaiting you, and your REP trend for the season.

---

## Deliverables

1. The bounty surfaces in `projects/web/fermata-web/`.
2. Server-side enforcement of the claim, review, and completion rules, with tests.
3. The guided bounty and proposal editors.
4. A "Bounties" section in `docs/WEB.md`.

---

## Definition of done

- All acceptance criteria checked on the live deployment against the real board.
- Every governance rule implemented server-side, never only in the UI — demonstrated by tests
  that call the API directly.
- Ledger writes verified with `npm run rep -- audit` on the resulting repo state.
- Reviewed and approved by a maintainer.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 450 |
| Bonus (my-work dashboard) | 100 |
| Applicable multipliers | ×1.0 |

The largest of the four child bounties, because it's the one that decides whether the ecosystem
has contributors in it.

---

## Getting started

```bash
npm run bounty -- list --json      # your payload, already shaped
npm run bounty -- show FB-0100 --json
cat bounty-board/schemas/bounty.schema.json
cat bounty-board/ARCHITECTURE.md   # the state machine section especially
```

Read [`GOVERNANCE.md`](../../../GOVERNANCE.md) completely. Roughly a third of this bounty is
faithfully implementing rules that are already written down, and the review will check them
line by line.

---

## Notes

- **Trust the client with nothing.** Tier gates, concurrency limits, criteria freezing, and
  review thresholds all have to hold against someone calling your API with `curl`.
- The TTL countdown is a small detail that does a lot of work — it makes the claim feel like a
  commitment rather than a checkbox.
- Latency on the claim action matters more than anywhere else on the site. If claiming takes six
  seconds because it's waiting on the GitHub API, do it optimistically and reconcile.
