<!--
Thanks for contributing! Pick the template that fits your PR by deleting the
sections that don't apply.
-->

## What this PR does

<!-- One or two sentences. What changed, and why. -->

## Type

- [ ] New project
- [ ] Update to an existing project
- [ ] Tooling / scripts / GitHub Actions
- [ ] Docs / wiki
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

### If this PR changes tooling, scripts, or workflows

- [ ] Documented the change in `scripts/README.md` or relevant doc.
- [ ] If it's a new script, registered it in `package.json`.

---

## Notes for reviewers

<!-- Anything reviewers should pay extra attention to, or context that isn't
obvious from the diff. -->
