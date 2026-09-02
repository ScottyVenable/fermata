# Bounty Board — Governance

Who decides what, how disagreements end, and the rules bots play by.

- [Roles](#roles)
- [Posting rules](#posting-rules)
- [Claiming rules](#claiming-rules)
- [Review rules](#review-rules)
- [Awarding rules](#awarding-rules)
- [Cancellation and archival](#cancellation-and-archival)
- [Bot contributors](#bot-contributors)
- [Disputes](#disputes)
- [Changing these rules](#changing-these-rules)

---

## Roles

| Role | How you get it | Can do |
| --- | --- | --- |
| **Contributor** | Show up | Propose, claim `xs`/`s`, deliver |
| **Reviewer** | 𝄀 Measure (250 REP) | Review delivery PRs, promote proposals, label |
| **Approver** | 𝄆 Movement (1000 REP) | Approve completions up to size `m`, set sizes and rewards |
| **Steward** | 𝄐 Fermata (2500 REP) + accepts a track | Own one track's backlog, triage, quarterly sweep |
| **Maintainer** | Repo write access | Everything, including cancellation, corrections, and merges |

Roles are permissions, not status. A Rest-tier contributor's bounty is judged by the same
criteria as a maintainer's.

**Track stewards** are listed in [`STEWARDS.md`](STEWARDS.md). A steward commits to one
season and is responsible for: triaging new proposals in their track within a week, keeping
open bounties accurate, and running the end-of-quarter sweep. Stewardship earns +50 REP per
season and lapses silently if the track goes untriaged for 30 days.

---

## Posting rules

A bounty is mergeable when it has all of:

- [ ] A title that describes an outcome, not an activity ("Ship `--json` output for validate", not "Work on validate")
- [ ] A track, a size, and a difficulty
- [ ] A reward inside the size's REP band
- [ ] **At least three falsifiable acceptance criteria**
- [ ] A non-empty *Out of scope* section
- [ ] A *Getting started* section pointing at the files or docs involved
- [ ] `bounty.json` passing `npm run bounty -- validate`

Below 𝄀 Measure, posting a bounty needs one co-sign from a Reviewer or above. This isn't
gatekeeping the idea — it's a second pair of eyes on the *scoping*, which is the part that
wastes people's time when it's wrong.

**Sizing is set at merge time, by the merger, not the author.** Authors suggest; approvers
decide. This keeps reward inflation from being a negotiation.

---

## Claiming rules

- One claim per bounty. First merged claim PR wins; ties break on `claimed_at`.
- Concurrency limits by tier: Rest 1 · Note 2 · Measure 2 · Phrase 3 · Movement+ 4.
  `xs` bounties are free and never count against the limit.
- Tier gates by size: `xs`/`s` any tier · `m`+ requires ♪ Note · `xl` requires ♫ Phrase or a
  maintainer's explicit sign-off in the claim PR.
- TTL is the bounty's `claim.ttl_days` (default 14). Any commit to your claim file resets it.
- **Dropping is free and encouraged.** Add a note to your claim file, set the status back to
  `open`, done. No penalty, ever. The penalty exists only for silent lapses.
- You may claim a bounty you authored, at half REP.

---

## Review rules

A reviewer walks the acceptance criteria in order and checks each box in the PR. Reviews are
**criteria-driven**: if something bothers you that isn't in the criteria, say so as a
non-blocking suggestion, or fix the criteria for next time. Moving the goalposts mid-claim is
the fastest way to lose contributors, so:

> **Acceptance criteria are frozen once a bounty is claimed.** Changing them requires the
> claimant's agreement, recorded in the claim file. CI enforces the count via
> `acceptance_count`.

Required approvals:

| Bounty size | Approvals needed |
| --- | --- |
| `xs`, `s` | 1 Reviewer (𝄀 Measure+) |
| `m` | 1 Approver (𝄆 Movement+) |
| `l`, `xl` | 1 Approver + 1 other Reviewer |
| Anything in `ecosystem` | 1 Maintainer |

You cannot review your own delivery, and you cannot approve a bounty you authored *and*
claimed.

---

## Awarding rules

- Awards are written by the `bounty.yml` workflow on merge to `main`. Humans don't append
  ledger lines in normal operation.
- A maintainer may append a manual event (missed award, retroactive bounty, correction). It
  needs `source: "manual"` or `"correction"`, a `reason`, and a second maintainer's approval.
- **Partial credit exists.** A cancelled bounty with real work behind it gets a
  `bounty.completed` event scaled to the fraction of criteria met, at the approver's judgment,
  with the reasoning in the event's `reason`.
- Reviewers are awarded automatically for approving reviews on merged delivery PRs.
- Award mistakes are corrected by appending, never by editing. See
  [REPUTATION.md § Disputes](REPUTATION.md#disputes-and-corrections).

---

## Cancellation and archival

A bounty is cancelled when the work is no longer wanted, has been done another way, or turns
out to be a bad idea. Only maintainers cancel, and cancellation always writes a
`cancelled_reason`.

Process:

1. Set `status: "cancelled"`, add `cancelled_reason` and `cancelled_at`.
2. If claimed, notify the claimant in the claim file and award partial credit.
3. Move the folder to `bounties/archived/`, preserving the original `track` in the JSON.
4. Regenerate `INDEX.md`.

Archived bounties are never deleted. Their IDs are never reused. Links keep resolving — the
whole reason the original path was worth preserving.

**Expiry** is different and automatic: a lapsed claim just returns the bounty to `open`. The
bounty itself isn't going anywhere.

---

## Bot contributors

Bots are welcome. They are also, per the [Code of Conduct](../CODE_OF_CONDUCT.md), the
responsibility of a named human.

**Requirements**

1. `claim.current.kind = "bot"` and an operator named in the claim file.
2. A profile at `reputation/profiles/_overrides/<handle>.json` with `kind: "bot"` and the
   operator's handle.
3. PR descriptions that walk the acceptance criteria in prose. Diff-dumps get closed.
4. One concurrent claim until ♫ Phrase.

**Limits**

- Bots cannot review, approve completions, promote proposals, cancel bounties, or steward a
  track — at any REP.
- Bots cannot claim bounties labelled `human-judgment` (design, governance, anything about
  taste).
- A bot with 3 silent lapses in a season is suspended from claiming until its operator
  responds on the audit issue.

**Encouragements**

- `npm run bounty -- list --json` is a stable, parseable queue. Poll it.
- Bounties labelled `good-first-bounty` and `bot-friendly` are explicitly scoped for agents:
  narrow blast radius, mechanical criteria, easy verification.
- Bot REP is displayed on the leaderboard in its own column. Doing good work as a machine is
  a legitimate thing to be proud of.

---

## Disputes

| Dispute | Resolution |
| --- | --- |
| Two claims collided | Earlier `claimed_at` wins; the other gets `good-faith-collision` |
| Criteria disagreement | Criteria text governs. If it's genuinely ambiguous, the claimant's reading wins and the bounty is amended for next time. |
| Reward feels wrong | Issue labelled `reputation-dispute`; an uninvolved maintainer decides |
| Rejected submission | Reviewer states which criteria failed, specifically. Claimant keeps the claim and its TTL resets. |
| Conduct | [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) takes precedence over everything here |

Escalation ends with the repo owner. This is a hobby project, not a court.

---

## Changing these rules

Governance, reward tables, tiers, and multipliers change by PR to this directory, labelled
`governance`. Requirements:

- Open for **7 days** before merge.
- Approval from a maintainer and at least one 𝄐 Fermata-tier contributor.
- Rule changes are **not retroactive**. Points already awarded stay awarded, because they're
  stored on the event.

Small clarifications and typo fixes are exempt — improving the wording of a rule isn't
changing it.
