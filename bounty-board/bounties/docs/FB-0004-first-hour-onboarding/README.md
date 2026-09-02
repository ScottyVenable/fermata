# FB-0004: Write the first-hour contributor onboarding guide

> **Track** `docs` · **Size** `s` · **Difficulty** `beginner` · **Reward** `55 REP`
> **Status** `open` · **Claim TTL** 14 days · **Epic** —

---

## Summary

Fermata's documentation is complete but reference-shaped: `GUIDE.md`, `METADATA_SPEC.md`,
`DEPENDENCIES.md`, `CATEGORIES.md`, `CONTRIBUTING.md`, plus a wiki. A newcomer landing on the
repo has to assemble their own path through six documents. Write `docs/FIRST_HOUR.md`: one
narrative walkthrough that takes a stranger from `git clone` to a merged PR, in order, with no
detours.

---

## Context

- **Why now:** the bounty board is about to invite drive-by contributors and bots who have no
  context at all. The board's value is capped by how fast someone can go from "this looks
  interesting" to "my PR merged."
- **Prior art:** everything needed already exists in pieces. This is a synthesis and sequencing
  job, not a research one. Deliberately linking *out* to the reference docs rather than
  duplicating them is the whole craft here.
- **Related:** [`CONTRIBUTING.md`](../../../../CONTRIBUTING.md), [`docs/GUIDE.md`](../../../../docs/GUIDE.md),
  [bounty-board/README.md](../../../README.md).

---

## Scope

| What | Where |
| --- | --- |
| The new guide | `docs/FIRST_HOUR.md` |
| Entry links from the places newcomers actually land | `README.md`, `CONTRIBUTING.md`, `bounty-board/README.md` |
| Wiki version | `docs/wiki/First-Hour.md` + `_Sidebar.md` entry |

Suggested arc, roughly 15 minutes of reading:

1. **What Fermata is** (3 sentences, no philosophy detour)
2. **Set up** — clone, `npm install`, verify with `npm run validate`
3. **Pick your path** — add a project · improve a project · claim a bounty
4. **Path A: your first project** — `npm run new`, fill `fermata.json`, README, validate, PR
5. **Path B: your first bounty** — find, claim, build, submit
6. **What happens after you open a PR** — CI, review, merge, REP
7. **Where to go next** — the reference docs, by name and by when you'd need them

---

## Out of scope

- Not rewriting `CONTRIBUTING.md`, `GUIDE.md`, or any existing doc. Link to them.
- Not documenting the metadata schema field-by-field — that's `METADATA_SPEC.md`'s job.
- Not producing video or screencast content.
- Not redesigning the wiki structure.

---

## Acceptance criteria

- [ ] `docs/FIRST_HOUR.md` exists and takes a reader from zero to an opened PR in a single
      linear read, following the arc above.
- [ ] Every command shown is copy-pasteable and has been run by the author against a clean
      clone.
- [ ] Both paths — add a project, claim a bounty — are covered end to end.
- [ ] The guide links out to at least five existing docs at the moments they become relevant,
      and duplicates none of their content.
- [ ] `README.md`, `CONTRIBUTING.md`, and `bounty-board/README.md` each link to it from a place
      a newcomer will actually see.
- [ ] A wiki copy exists at `docs/wiki/First-Hour.md` and is listed in `docs/wiki/_Sidebar.md`.

---

## Deliverables

1. `docs/FIRST_HOUR.md`.
2. `docs/wiki/First-Hour.md` and an updated `docs/wiki/_Sidebar.md`.
3. Entry links in `README.md`, `CONTRIBUTING.md`, `bounty-board/README.md`.

---

## Definition of done

- All acceptance criteria checked.
- The author has actually followed their own guide on a fresh clone and says so in the PR.
- Tone matches the existing docs: direct, warm, unhurried, no exclamation marks.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 55 |
| Applicable multipliers | ×1.0 |

---

## Getting started

Read, in this order, and note where you get confused — your confusion *is* the deliverable:

- `README.md`
- `CONTRIBUTING.md`
- `docs/GUIDE.md`
- `bounty-board/README.md`

Then do the thing cold:

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata && npm install
npm run new -- --name my-first --category experiments
npm run validate
```

Write down every moment you had to guess. That list, answered in order, is the guide.

---

## How to claim

```bash
npm run bounty -- claim FB-0004 --who yourhandle
```

---

## Notes

- This is an excellent first bounty precisely if you're **new** to the repo. Someone who
  already knows their way around can't see the gaps any more.
- Length target is 800–1500 words. Longer than that and it stops being a first hour.
