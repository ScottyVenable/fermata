# Epics

An **epic** is a multi-bounty program with a shared goal, a roadmap, and a dependency graph. It
exists when a body of work is too large for one bounty but too coherent to scatter across the
board unlabelled.

| Epic | Goal | Bounties | Status |
| --- | --- | --- | --- |
| [EPIC-001](EPIC-001-fermata-ecosystem/) | The Fermata ecosystem — Windows app, website, accounts, public API | 7 | open |

## What an epic is and isn't

An epic **is** a README that explains why a set of bounties belongs together, in what order, and
what "done" looks like for the program as a whole.

An epic **is not** claimable. It carries no REP of its own. All value lives in its child
bounties, which are claimed and rewarded individually — this is deliberate, so nobody can claim
a nine-month program and then disappear with it.

## Creating one

1. `mkdir epics/EPIC-###-slug/` and write a `README.md` covering: the pitch, the bounty table,
   a dependency graph, phases with exit criteria, non-negotiable principles, and open questions.
2. Set `"epic": "EPIC-###"` on each child bounty's `bounty.json`.
3. Optionally create an `epic`-sized bounty with a `children` array as a tracking entry — it must
   have `reward.rep: 0`.

```bash
npm run bounty -- list --epic EPIC-001
```

## Rules

- Epic IDs are `EPIC-###`, allocated monotonically, never reused.
- Every child bounty must stand alone: claimable, reviewable, and useful even if the rest of the
  epic never happens.
- Phases need **exit criteria**, not dates. This is a hobby repo; deadlines are fiction and
  "we'll know we're done with phase 1 when X is true" is not.
- An epic that has been open with no activity for two seasons gets a triage note. It doesn't get
  cancelled — holding a note as long as the spark lasts applies to programs too.
