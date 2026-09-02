<!--
Thanks for contributing! Pick the template that fits your PR by deleting the
sections that don't apply.
-->

## What this PR does

<!-- One or two sentences. What changed, and why. -->

**Bounty:** <!-- FB-#### if this PR delivers a bounty, otherwise leave blank.
Include the line `Closes FB-####` below so the award workflow fires on merge. -->

## Type

- [ ] New project
- [ ] Update to an existing project
- [ ] Tooling / scripts / GitHub Actions
- [ ] Docs / wiki
- [ ] Bounty board (new bounty, claim, or delivery)
- [ ] Other (explain below)

---

### If this PR adds a new project

- **Path:** `projects/<category>/<name>/`
- **Category:** <!-- from docs/CATEGORIES.md -->
- **Status:** experimental | active
- **Confirms:**
  - [ ] Folder name matches `fermata.json` → `name`.
  - [ ] `category` field matches folder placement.
  - [ ] `license` is `GPL-3.0`.
  - [ ] README.md is filled in (not template placeholders).
  - [ ] `npm run validate` passes locally.

### If this PR updates an existing project

- **Project:** `projects/<category>/<name>/`
- **Author of original project notified?** (only required if not the author)
- [ ] Added myself to `authors` with `role: "contributor"` (if applicable).
- [ ] `npm run validate` passes locally.

### If this PR delivers a bounty

- **Bounty:** FB-####
- **Claimed on:** <!-- date, or "unclaimed xs bounty" -->
- [ ] The body contains `Closes FB-####`.
- [ ] Every acceptance criterion is listed below with **how to verify it** — see
      [SUBMISSION_TEMPLATE.md](../blob/main/bounty-board/templates/SUBMISSION_TEMPLATE.md).
- [ ] Deviations from the bounty are stated explicitly (or "None").
- [ ] `npm run bounty -- validate` passes locally.

### If this PR posts or claims a bounty

- [ ] `npm run bounty -- validate` passes.
- [ ] For a new bounty: three or more falsifiable acceptance criteria, a non-empty
      *Out of scope*, and `acceptance_count` matching the README.
- [ ] For a claim: only the claim file and the `bounty.json` status change are included.
- [ ] No reputation ledger lines added — those are written by CI on merge.

### If this PR changes tooling, scripts, or workflows

- [ ] Documented the change in `scripts/README.md` or relevant doc.
- [ ] If it's a new script, registered it in `package.json`.

---

## Notes for reviewers

<!-- Anything reviewers should pay extra attention to, or context that isn't
obvious from the diff. -->
