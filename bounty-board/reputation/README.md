# Reputation — operational guide

The spec is in [REPUTATION.md](../REPUTATION.md). This file is about the files.

```
reputation/
├── README.md          this
├── ledger/            APPEND-ONLY. One JSONL file per quarter. The only truth.
│   └── 2026-Q3.jsonl
├── profiles/          DERIVED. Delete it and `npm run rep -- rebuild` recreates it.
│   ├── _overrides/    hand-editable, by the person it describes
│   └── <handle>.json
└── LEADERBOARD.md     DERIVED.
```

## The one rule

**Only the ledger is real.** Profiles and the leaderboard are a fold over it. If they disagree
with the ledger, they're wrong, and the fix is:

```bash
npm run rep -- rebuild
npm run rep -- leaderboard
```

Never hand-edit a profile. Never edit an existing ledger line. Corrections are new lines with
`source: "correction"` and a `corrects` pointer at the event they fix.

## Who writes what

| File | Written by |
| --- | --- |
| `ledger/*.jsonl` | The `bounty.yml` workflow on merge to `main`. Maintainers may append manual/correction events with a second maintainer's approval. |
| `profiles/*.json` | `npm run rep -- rebuild`, and nothing else. |
| `profiles/_overrides/*.json` | You, about yourself. |
| `LEADERBOARD.md` | `npm run rep -- leaderboard`. |

A PR from a contributor that adds ledger lines fails validation. That's the point — you can't
award yourself REP.

## Your override file

`profiles/_overrides/<handle>.json` is the only file here you edit by hand, and only your own:

```json
{
  "handle": "yourhandle",
  "kind": "human",
  "display_name": "Your Name",
  "pronouns": "they/them",
  "bio": "One line about what you build.",
  "avatar_url": "https://github.com/yourhandle.png",
  "links": {
    "site": "https://example.com",
    "mastodon": "https://mastodon.social/@you"
  }
}
```

Bots additionally need `"kind": "bot"` and `"operator": "<accountable human's handle>"`.

These fields are merged into your generated profile on every rebuild, and they're what becomes
your public profile page in [FB-0204](../bounties/ecosystem/FB-0204-profiles-and-customization/).

## Everyday commands

```bash
npm run rep -- who yourhandle        # your standing
npm run rep -- tiers                 # the tier table
npm run rep -- leaderboard           # regenerate the board
npm run rep -- audit                 # integrity + anti-gaming checks
npm run rep -- rebuild               # recompute all profiles from the ledger
```

## Quarterly files

The ledger rolls over each calendar quarter (`2026-Q3.jsonl`, `2026-Q4.jsonl`, …). Three reasons:

1. Any one file stays small enough to review in a PR diff.
2. Seasons — which drive the leaderboard and decay — get a natural boundary.
3. Append-only writes to different files rarely conflict, and the workflow appends after merge
   rather than in the contributor's branch, so in practice they never do.

## Reading the ledger directly

It's JSONL, so the usual tools work:

```bash
# Everything one person has earned
grep '"subject":"yourhandle"' reputation/ledger/*.jsonl | jq -s 'map(.points) | add'

# Every award this quarter, newest last
cat reputation/ledger/$(date -u +%Y)-Q3.jsonl | jq -c '{ts, subject, event, points}'

# Who reviewed the most
jq -s 'map(select(.event=="review.completed")) | group_by(.subject) | map({who: .[0].subject, n: length})' reputation/ledger/*.jsonl
```

## If something looks wrong

Open an issue labelled `reputation-dispute` with the event `id`. Don't edit the ledger. See
[REPUTATION.md § Disputes](../REPUTATION.md#disputes-and-corrections).
