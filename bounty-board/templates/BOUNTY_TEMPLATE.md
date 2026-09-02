<!--
  ============================================================================
  FERMATA BOUNTY TEMPLATE
  ----------------------------------------------------------------------------
  Copy this file to:
      bounty-board/bounties/<track>/FB-####-<slug>/README.md
  and copy templates/bounty.template.json next to it as bounty.json.

  Or let the tooling do it:
      npm run bounty -- new --title "Your title" --track tooling --size s

  Rules the validator enforces (npm run bounty -- validate):
    * Every section heading below must be present, in this order.
    * "Acceptance criteria" needs >= 3 checkbox items, each falsifiable.
    * "Out of scope" must not be empty.
    * The H1 title must match bounty.json.title exactly.
    * The checkbox count must match bounty.json.acceptance_count.

  Delete every HTML comment before you commit. They're instructions, not content.
  ============================================================================
-->

# FB-####: <Outcome-shaped title>

<!-- Title describes a RESULT, not an activity.
     Good: "Ship --json output for the validate script"
     Bad:  "Work on validate" / "Improve tooling" -->

> **Track** `tooling` · **Size** `s` · **Difficulty** `beginner` · **Reward** `60 REP`
> **Status** `open` · **Claim TTL** 14 days · **Epic** —

<!-- Keep this quote block in sync with bounty.json. The index reads the JSON,
     but humans read this line first. -->

---

## Summary

<!-- 2-4 sentences. What's wanted and why anyone should care. Someone should be
     able to decide whether to keep reading based only on this. -->

One paragraph describing the outcome. Write it so that a person who has never opened this
repository understands what will exist when this is done that doesn't exist now.

---

## Context

<!-- Why this bounty exists. Prior art, the pain it removes, links to related
     discussion, previous attempts, relevant design decisions. -->

- Why now:
- Related: <!-- FB-####, EPIC-###, issue links, docs -->
- Prior art: <!-- existing files, similar implementations elsewhere -->

---

## Scope

<!-- Concrete list of what the work touches. Be specific about files and
     directories — vagueness here is what makes bounties rot. -->

| What | Where |
| --- | --- |
| <!-- component --> | `path/to/file` |
| | |

---

## Out of scope

<!-- REQUIRED and never empty. This section protects the claimant as much as the
     reviewer: anything listed here cannot be used to reject the submission. -->

- Not doing: <!-- the adjacent thing someone will inevitably suggest -->
- Not doing: <!-- the refactor that would balloon this bounty -->
- Not doing: <!-- the "while you're in there" ask -->

---

## Acceptance criteria

<!-- The contract. Minimum three. Each one must be checkable by a reviewer
     without asking you what you meant. Frozen once this bounty is claimed. -->

- [ ] <!-- Falsifiable statement 1. "Running `npm run x` prints Y." -->
- [ ] <!-- Falsifiable statement 2. -->
- [ ] <!-- Falsifiable statement 3. -->
- [ ] Documentation is updated where the change is user-visible.
- [ ] `npm run validate` and `npm run bounty -- validate` both pass.

### Bonus <!-- optional; delete the section if reward.bonus_rep is 0 -->

- [ ] <!-- Stretch goal worth reward.bonus_rep. All-or-nothing. -->

---

## Deliverables

<!-- The artifacts that exist when this is done. Files, not feelings. -->

1. `path/to/new-or-changed/file`
2. Documentation at `docs/...`
3. <!-- ... -->

---

## Definition of done

<!-- The process gate, distinct from the acceptance criteria above (which are
     the product gate). Usually near-boilerplate; adjust as needed. -->

- All acceptance criteria checked, with the reviewer's own verification noted in the PR.
- CI green on the delivery PR.
- No new dependencies added without a note in the PR explaining why (see
  [DEPENDENCIES.md](../../../../docs/DEPENDENCIES.md)).
- Changes are GPL-3.0 compatible.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 60 |
| Bonus (optional) | 15 |
| Applicable multipliers | ×1.0 |

<!-- If the target is an existing project you didn't create, note the ×1.5 here.
     See REPUTATION.md § Multipliers. -->

Awarded on merge of the delivery PR. Reviewers earn `review.completed` (+15) on the same merge.

---

## Getting started

<!-- Lower the activation energy. Where to look first, how to run the thing,
     what "working" looks like locally. This section is why people claim
     bounties instead of bouncing off them. -->

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata
npm install
# the specific commands that matter for this bounty
```

Files worth reading first:

- `path/to/file` — <!-- why -->
- `docs/RELEVANT.md` — <!-- why -->

Questions? Open a comment on the claim PR, or ask in Discussions. Asking early is cheaper
than a rejected submission, and nobody loses REP for asking.

---

## How to claim

```bash
npm run bounty -- claim FB-#### --who yourhandle
```

Then open a PR titled `claim: FB-#### <slug>` containing only the claim file and the status
change. Full process: [README.md § How to claim](../../../README.md#how-to-claim-a-bounty).

---

## Notes

<!-- Anything that doesn't fit above: open questions, design preferences that
     aren't hard requirements, warnings about tricky bits. -->

-
