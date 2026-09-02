# REP — The Fermata Reputation System

REP is a non-transferable score that records what you've contributed to Fermata and to the
projects around it. It buys trust and permissions, nothing else.

- [Principles](#principles)
- [Earning REP](#earning-rep)
- [Multipliers](#multipliers)
- [Losing REP](#losing-rep)
- [Tiers](#tiers)
- [Event format](#event-format)
- [Profiles](#profiles)
- [Decay and seasons](#decay-and-seasons)
- [Anti-gaming](#anti-gaming)
- [Badges](#badges)
- [Disputes and corrections](#disputes-and-corrections)
- [FAQ](#faq)

---

## Principles

1. **REP measures contribution, not presence.** Opening issues, commenting, and hanging
   around earn nothing. Merged work earns.
2. **REP is not currency.** It cannot be transferred, gifted, traded, or spent. It only ever
   accumulates from your own actions and unlocks permissions.
3. **Helping beats hoarding.** Improving someone else's project pays 1.5× what improving
   your own does. That asymmetry is the entire point of having a score in a repo that would
   otherwise be a pile of solo folders.
4. **Every point is traceable.** Each point comes from a ledger event that names the actor,
   the subject, the reference, and the reason. If you can't point at the commit, it isn't REP.
5. **Errors are appended, never erased.** Bad awards are corrected with a compensating event.
   The ledger is history, and history doesn't get edited.

---

## Earning REP

### Bounty work

| Event | Points | Notes |
| --- | --- | --- |
| `bounty.completed` | `reward.rep` | The bounty's own value, 10–1200 by size |
| `bounty.bonus` | `reward.bonus_rep` | Only if the *Bonus* section is fully met |
| `bounty.first` | +25 | One-time, on your first completed bounty |
| `bounty.streak` | +20 | Three completions inside one quarter |
| `bounty.rescued` | +30 | Completing a bounty that previously expired on someone else |
| `bounty.authored` | +15 | You wrote a bounty someone else completed |
| `proposal.promoted` | +10 | Your proposal became a real bounty |

### Review and stewardship

| Event | Points | Notes |
| --- | --- | --- |
| `review.completed` | +15 | A substantive review on a delivery PR that gets merged |
| `review.thorough` | +10 | Reviewer caught a genuine acceptance-criteria failure; awarded by the merger |
| `triage.completed` | +5 | Labelled, deduped, or refined an incoming proposal |
| `steward.quarter` | +50 | Kept a track healthy for a full quarter |
| `mentor.assist` | +20 | Materially helped another contributor finish their claim (they nominate you) |

### Project work

| Event | Points | Notes |
| --- | --- | --- |
| `project.published` | +75 | A new project merged into `projects/` and passing `npm run validate` |
| `project.contribution` | +40 | A merged PR to a project you didn't create |
| `project.maintained` | +30 | Per quarter, for keeping a non-archived project responsive |
| `project.graduated` | +100 | A project you created reached `status: "stable"` |
| `project.documented` | +25 | Brought an existing project's README/docs up to standard |

### Ecosystem and outward contributions

| Event | Points | Notes |
| --- | --- | --- |
| `external.merged` | +50 | A merged PR to a repo outside Fermata, verified by URL |
| `external.reported` | +10 | A confirmed upstream bug report that led to a fix |
| `ecosystem.integration` | +60 | Connected Fermata to something else (CI, package registry, app store) |
| `community.answered` | +5 | Answered a question in Discussions, marked as the answer. Capped at +50/quarter. |

### Good citizenship

| Event | Points | Notes |
| --- | --- | --- |
| `good-faith-collision` | +5 | You lost a claim race. Not your fault. |
| `claim.dropped-cleanly` | 0 | Explicitly zero: dropping a claim honestly costs nothing |
| `security.reported` | +75 | Responsibly disclosed a real vulnerability |

---

## Multipliers

Applied to the base points at award time and stored on the event, so the arithmetic is always
visible.

| Condition | Multiplier | Rationale |
| --- | --- | --- |
| Target is an existing project you didn't create | ×1.5 | Reward cross-pollination |
| Target is an external repo (verified) | ×1.25 | Reward outward contribution |
| Bounty carried a `help-wanted-urgent` label | ×1.25 | Reward unblocking people |
| Bounty was stale (open > 90 days) | ×1.2 | Clear the backlog |
| First bounty in a track you've never worked in | ×1.1 | Reward breadth |
| You are also the bounty's author | ×0.5 | You can complete your own bounty; you just don't get full credit for both sides |

Multipliers stack multiplicatively, capped at **×2.0** total. Results round half up.

---

## Losing REP

Deliberately short. Punishing people is a bad way to run a hobby repo, so this list exists
only to make squatting and bad faith unprofitable.

| Event | Points | When |
| --- | --- | --- |
| `claim.expired-silent` | −10 | A claim lapsed with no drop note and no progress update |
| `claim.expired-repeat` | −25 | Third silent lapse within a quarter |
| `submission.abandoned` | −15 | Delivery PR left unresponsive for 30 days after review feedback |
| `conduct.violation` | −100 to −∞ | Code of Conduct enforcement; maintainer action, always documented |
| `award.corrected` | negative of the original | An award is reversed (mistake, retracted work, gaming) |

REP floors at 0 for tier purposes; the ledger may still show a negative running total, and
that history remains visible on the profile.

---

## Tiers

| Tier | Symbol | REP | Unlocks |
| --- | --- | --- | --- |
| **Rest** | 𝄽 | 0 | Claim `xs` and `s` bounties. 1 concurrent claim. Post proposals. |
| **Note** | ♪ | 100 | Claim any size. 2 concurrent claims. |
| **Measure** | 𝄀 | 250 | Promote proposals to bounties. Review delivery PRs. Add labels. |
| **Phrase** | ♫ | 500 | 3 concurrent claims. Post bounties without a maintainer co-sign. Nominate `mentor.assist`. |
| **Movement** | 𝄆 | 1000 | Approve completions up to size `m`. Set sizes and rewards. Steward a track. |
| **Fermata** | 𝄐 | 2500 | Approve any completion. Cancel bounties. Adjust the reward tables via PR. |
| **Coda** | 𝄌 | 5000 | Nominate maintainers. Vote on governance changes. |

Tiers are computed from **lifetime** REP, not current-season REP, so decay never demotes
anyone. Bots max out at ♫ Phrase: they can claim and deliver freely, but never review,
approve, or promote.

---

## Event format

One JSON object per line, in `reputation/ledger/<YYYY>-Q<n>.jsonl`.

```json
{
  "ts": "2026-09-04T18:22:11Z",
  "id": "ev_20260904_182211_7f3a",
  "event": "bounty.completed",
  "subject": "newcontrib",
  "subject_kind": "human",
  "actor": "github-actions[bot]",
  "ref": "FB-0002",
  "ref_url": "https://github.com/ScottyVenable/fermata/pull/42",
  "base_points": 60,
  "multiplier": 1.5,
  "points": 90,
  "reason": "Scaffold presets shipped; all 5 acceptance criteria met.",
  "source": "workflow",
  "schema": 1
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `ts` | ✅ | ISO 8601 UTC. Must be ≥ the previous line's `ts`. |
| `id` | ✅ | Unique. `ev_<yyyymmdd>_<hhmmss>_<4 hex>`. |
| `event` | ✅ | One of the event names in this document. Unknown names fail the audit. |
| `subject` | ✅ | Who earns (or loses) the points. GitHub handle, lowercased. |
| `subject_kind` | ✅ | `human` \| `bot` |
| `actor` | ✅ | Who issued the award. `github-actions[bot]` for automated ones. |
| `ref` | ✅ | `FB-####`, `EPIC-###`, a project path, or an external repo slug. |
| `ref_url` | — | Required for `external.*` events. |
| `base_points` | ✅ | Before multipliers. |
| `multiplier` | ✅ | Product of all applied multipliers, ≤ 2.0. |
| `points` | ✅ | `round(base_points × multiplier)`. Recomputed and checked by the audit. |
| `reason` | ✅ | One human sentence. Shows up on the profile. |
| `source` | ✅ | `workflow` \| `manual` \| `import` \| `correction` |
| `schema` | ✅ | Format version. Currently `1`. |

**The ledger is written by automation, not by contributors.** A PR that adds ledger lines by
hand fails validation, with one exception: a maintainer may append a `source: "manual"` or
`source: "correction"` event, and CI requires such a PR to be approved by a second maintainer.

---

## Profiles

`reputation/profiles/<handle>.json`, fully derived. Never hand-edit — `npm run rep -- rebuild`
overwrites it.

```json
{
  "handle": "newcontrib",
  "kind": "human",
  "display_name": "New Contributor",
  "rep_lifetime": 315,
  "rep_season": 205,
  "tier": "measure",
  "first_seen": "2026-09-04",
  "last_active": "2026-11-19",
  "counts": {
    "bounties_completed": 4,
    "bounties_authored": 2,
    "reviews": 6,
    "projects_published": 1,
    "external_merged": 2
  },
  "tracks": { "tooling": 190, "docs": 65, "web": 60 },
  "badges": ["first-bounty", "good-neighbor", "bug-hunter"],
  "recent": [
    { "ts": "2026-11-19T14:02:00Z", "event": "review.completed", "ref": "FB-0007", "points": 15 }
  ]
}
```

The optional bits a person actually controls — display name, pronouns, links, an avatar URL,
a one-line bio — live in `reputation/profiles/_overrides/<handle>.json`, which *is*
hand-editable (by that person only, enforced in review) and gets merged in during rebuild.
This is the file that becomes a real profile page in EPIC-001.

---

## Decay and seasons

A **season** is a calendar quarter, matching the ledger files.

- **Lifetime REP never decays.** Tiers and badges are permanent. What you did, you did.
- **Season REP** resets each quarter and drives the leaderboard, so a newcomer's good quarter
  can top the board over someone's three-year total.
- **Track stewardship** requires activity in the current season, since it's a live
  responsibility rather than an honour.

There is no inactivity penalty. Fermata is a repo about holding notes for as long as the
spark lasts; going quiet for six months is a valid way to use it.

---

## Anti-gaming

`npm run rep -- audit` runs nightly and on every push to `main`, and flags:

| Heuristic | Threshold | Action |
| --- | --- | --- |
| Reciprocal review loops | Two accounts reviewing each other >5× in a season with no third-party reviews | Flag for maintainer review |
| Single-source REP | >80% of an account's season REP awarded by one actor | Flag |
| Burst awards | >5 awards to one subject within 10 minutes | Flag; likely a workflow bug |
| Trivial completions | `xs` bounties whose PRs total <5 changed lines, >3 in a week | Flag |
| Self-award | `actor == subject` with `source != "correction"` | **Hard fail** |
| Duplicate award | Same `(subject, event, ref)` triple appearing twice | **Hard fail** |
| Points mismatch | `points != round(base_points × multiplier)` | **Hard fail** |
| Out-of-order timestamps | Any line older than its predecessor | **Hard fail** |
| Unknown event name | Not in this document | **Hard fail** |
| Dangling reference | `ref` points at a bounty that doesn't exist | **Hard fail** |

Hard fails break CI. Flags open an issue labelled `reputation-audit` for a human to judge —
the tooling never silently reverses an award.

Structural defences that matter more than the heuristics:

- REP only flows from **merged** work, so someone with merge rights is always in the loop.
- Self-review earns nothing, and completing your own bounty is halved.
- Ledger writes come from workflows; the contributor's own PR can't award anything.
- Everything is in Git, publicly, forever. The cheapest anti-gaming measure is that cheating
  is legible.

---

## Badges

Cosmetic, permanent, derived from the ledger. They exist because a single number is a poor
description of a person.

| Badge | Earned by |
| --- | --- |
| `first-bounty` | First completed bounty |
| `good-neighbor` | 5 contributions to projects you didn't create |
| `outward-bound` | 3 verified external contributions |
| `polymath` | Completed bounties in 4+ different tracks |
| `night-owl` | 10 completions merged between 00:00–05:00 local |
| `bug-hunter` | 5 `review.thorough` awards |
| `founder` | Authored 10 bounties others completed |
| `steward` | Held track stewardship for 2 seasons |
| `machine` | Bot account with 10 completions |
| `holds-the-note` | Maintained a project for 4 consecutive seasons |
| `ecosystem` | Contributed to EPIC-001 |

---

## Disputes and corrections

1. **Open an issue** labelled `reputation-dispute` with the event `id` and what's wrong.
2. **A maintainer who is not the original actor** reviews it.
3. **Resolution is an append.** A correcting event with `source: "correction"` and a `reason`
   citing the issue. The original line stays exactly where it is.
4. **Systematic errors** (a bad multiplier shipped in the tooling, say) get a documented
   migration: a `rep migrate` run that appends one correction per affected event, in a single
   PR, reviewed as a batch.

No appeal beyond that. This is a hobby repo's scoreboard, and the process should cost less
than the points are worth.

---

## FAQ

**Is REP worth money?** No. It's not a token, it's not transferable, and it never converts to
anything. If a bounty ever carries cash, that's a separate `reward.cash` field with a named
sponsor.

**Can I lose my tier?** Only through Code of Conduct enforcement. Decay affects the seasonal
leaderboard, never your tier.

**Do bots and humans compete?** They're on the same board but labelled distinctly, and bots
are capped at ♫ Phrase. Comparing them directly isn't very meaningful, so the leaderboard
shows them in separate columns.

**What if I contribute something huge that has no bounty?** Open a bounty for it retroactively
and note that the work is done — a maintainer sizes it and awards accordingly. Unbountied
work is not unrewarded work.

**Why music-themed tiers?** Fermata. Everything here is named after notation, and a score you
climb is more fun than "Level 4".
