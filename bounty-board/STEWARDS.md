# Track Stewards

A steward owns one track's backlog for a season. It's the difference between a board that gets
tended and a board that becomes an archive of things nobody did.

| Track | Steward | Since | Season |
| --- | --- | --- | --- |
| `tooling` | — | — | — |
| `automation` | — | — | — |
| `docs` | — | — | — |
| `design` | — | — | — |
| `web` | — | — | — |
| `projects` | — | — | — |
| `ecosystem` | [@ScottyVenable](https://github.com/ScottyVenable) | 2026-09-01 | 2026-Q3 |
| `meta` | [@ScottyVenable](https://github.com/ScottyVenable) | 2026-09-01 | 2026-Q3 |

## The job

One season (a calendar quarter). Roughly an hour a week.

- **Triage** new proposals and bounties in your track within a week of them landing.
- **Keep bounties accurate** — if the codebase moved and a bounty's *Getting started* is now
  wrong, fix it.
- **Watch claims.** Nudge a quiet claimant before their TTL lapses; a friendly "still on this?"
  saves more bounties than the expiry job does.
- **Answer questions** on claim PRs in your track, or find someone who can.
- **Run the end-of-season sweep** — or check that [FB-0901](bounties/meta/FB-0901-board-triage-sweep/)
  did it for you once that's built.

## What it isn't

Not a gatekeeper. Stewards don't get to decide what work is worthy — anyone can propose anything
and a Reviewer can promote it. Stewardship is maintenance, not authority.

## Becoming one

Reach 𝄐 Fermata (2500 REP) and open a PR adding yourself to the table. Or, if a track is
unstewarded and you're already active in it, ask a maintainer — the tier requirement bends for
someone who's obviously already doing the job.

## Reward and lapse

- **+50 REP** per season (`steward.quarter`), awarded at season end.
- Stewardship lapses silently if a track goes untriaged for 30 days. No penalty, no drama — the
  row just goes back to `—` and someone else can pick it up. Life happens, and this is a hobby
  repo.
