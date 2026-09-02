# Reputation

**REP** records what you've contributed to Fermata. It's non-transferable, can't be bought or
traded, and only buys trust and permissions.

Full spec: [`bounty-board/REPUTATION.md`](https://github.com/ScottyVenable/fermata/blob/main/bounty-board/REPUTATION.md).

## Earning it

| What you did | REP |
| --- | --- |
| Completed a bounty | its `reward.rep` (10–1200) |
| First bounty ever | +25 |
| Reviewed a delivery that merged | +15 |
| Published a new project | +75 |
| Contributed to someone else's project | +40 |
| Merged a PR in an external repo | +50 |
| Your proposal became a bounty | +10 |
| Wrote a bounty someone else completed | +15 |
| Answered a question (capped at 50/season) | +5 |

## Multipliers

| Condition | × |
| --- | --- |
| Improving an existing project you didn't create | 1.5 |
| A verified external contribution | 1.25 |
| An urgent or stale bounty | 1.25 / 1.2 |
| Completing your own bounty | 0.5 |

Capped at ×2.0 total. **Helping with someone else's work pays more than helping with your own** —
that asymmetry is the whole reason the system exists.

## Losing it

Deliberately short: −10 for a silently lapsed claim, −25 for a third in a season, −15 for an
abandoned submission. Dropping a claim honestly costs **nothing**.

## Tiers

| Tier | REP | Unlocks |
| --- | --- | --- |
| 𝄽 Rest | 0 | Claim `xs`/`s` bounties |
| ♪ Note | 100 | Any size; 2 concurrent claims |
| 𝄀 Measure | 250 | Promote proposals; review deliveries |
| ♫ Phrase | 500 | 3 concurrent claims; post without co-sign |
| 𝄆 Movement | 1000 | Approve completions up to `m` |
| 𝄐 Fermata | 2500 | Approve anything; steward a track |
| 𝄌 Coda | 5000 | Nominate maintainers |

Tiers use **lifetime** REP and never decay. The seasonal leaderboard resets quarterly, so a
newcomer's good quarter can top someone's three-year total.

## Checking your standing

```bash
npm run rep -- who yourhandle
npm run rep -- leaderboard
npm run rep -- tiers
```

## How it's stored

An append-only JSONL ledger at `bounty-board/reputation/ledger/<year>-Q<n>.jsonl`. Nothing stores
a balance — balances are a fold over the events, so a scoring change is a re-run rather than a
migration, and a bad award is fixed by appending a correction rather than editing history.

Profiles and the leaderboard are fully derived: delete them and `npm run rep -- rebuild`
recreates them exactly.

## Anti-gaming

Ledger lines are written by CI, not by contributors. Self-awarding is a hard CI failure, so is a
duplicate award or a points mismatch. A nightly audit flags reciprocal review loops, single-source
REP, and award bursts for a human to look at. And everything is in public Git forever, which is
the cheapest anti-gaming measure there is.

## See also

- [Bounty Board](Bounty-Board)
- [Contributing](Contributing)
