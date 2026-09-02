<!-- Save as: bounty-board/bounties/<track>/FB-####-<slug>/claims/YYYY-MM-DD-<handle>.md
     Generated for you by: npm run bounty -- claim FB-#### --who <handle> -->

---
bounty: FB-####
handle: yourhandle
kind: human          # human | bot
operator:            # REQUIRED if kind is bot — the accountable human's handle
claimed_at: YYYY-MM-DDTHH:MM:SSZ
expires_at: YYYY-MM-DDTHH:MM:SSZ
status: active       # active | delivered | dropped | expired
pr:                  # delivery PR number, filled in later
---

# Claim: FB-####

## Plan

<!-- How you intend to approach it. Two or three sentences is plenty. This
     mostly exists so a reviewer can flag a wrong turn before you take it. -->

## Questions

<!-- Anything ambiguous in the bounty. Ask now. Nobody loses REP for asking, and
     an answered question often improves the bounty for the next person. -->

-

## Log

<!-- Append an entry whenever you make progress. Each commit to this file RESETS
     your claim TTL, so this is how you hold a bounty for longer than 14 days.
     Newest at the bottom. -->

- **YYYY-MM-DD** — Claimed.

## Dropping this claim

Change `status` to `dropped`, add a line to the log saying why, set the bounty's
`status` back to `open`, and open a PR. **This costs you nothing.** Silent lapses cost
−10 REP; honest drops cost zero, and the note usually helps whoever picks it up next.
