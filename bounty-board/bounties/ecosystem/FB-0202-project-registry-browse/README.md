# FB-0202: Project registry: browse, search, and publish on the web

> **Track** `ecosystem` · **Size** `l` · **Difficulty** `advanced` · **Reward** `420 REP` (+90 bonus)
> **Status** `open` · **Claim TTL** 60 days · **Epic** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)

---

## Summary

The discovery surface: every Fermata project as a real web page, browsable, searchable,
filterable, and creatable from the browser. This is what a stranger sees first and what decides
whether they stay. Creating a project on the site produces a genuine pull request against the
repo — no shadow registry.

---

## Context

- **Why now:** projects are the primary entity of the whole ecosystem, and right now they're
  discoverable only by reading a Markdown table in a Git repo.
- **Prior art you must read:** [FB-0006](../../web/FB-0006-static-project-gallery/) builds this
  statically and settles the card layout, the filter model, and the search index shape. This
  bounty implements the hosted version of those decisions. Deviating is allowed; deviating
  without saying why is not.
- **Depends on [FB-0200](../FB-0200-fermata-website-and-ecosystem/)** for the schema, sync, and
  shell, and reads [FB-0201](../FB-0201-accounts-and-authentication/) for who's signed in.

---

## Scope

| Surface | What |
| --- | --- |
| `/projects` | Grid of project cards. Filters for category, status, platform, tag, stack. Sort by updated, created, name, or activity. Shareable URL state. |
| `/projects/<category>/<name>` | Detail page: rendered README, full metadata, authors with REP badges, links, related projects, contribution activity. |
| `/new` | Create a project: the `fermata.json` form, preset selection, live validation, and a preview of the folder that will be produced. |
| Search | Full-text over name, display name, description, tags, README. Typo-tolerant. Sub-300ms. |
| Contribution surface | "Contribute to this project" — the open bounties targeting it, plus a one-click path to propose one. |

---

## Out of scope

- Hosting or executing project code. No live demos, no sandboxes, no build service.
- Editing a project's *files* from the web. Metadata only; code goes through Git.
- A comment system on projects — bounties get comments in [FB-0203](../FB-0203-bounty-board-web-surface/);
  projects don't in v1.
- Star/follow/like mechanics. Reputation is the credit system here, and a second popularity
  metric would dilute it.
- Redesigning the card and filter model FB-0006 already settled.

---

## Acceptance criteria

- [ ] `/projects` lists every project from the database with filters for category, status,
      platform, tag, and stack, plus four sort orders, and all filter and sort state is encoded
      in the URL so a view can be shared and restored.
- [ ] Each project has a detail page at a stable, human-readable path that renders its README
      safely (no raw HTML injection) alongside every `fermata.json` field.
- [ ] Author names on a detail page link to their profile and show their current tier badge.
- [ ] Search covers name, display name, description, tags, and README body, tolerates minor
      typos, and returns in under 300ms at p95 on a dataset of at least 500 seeded projects.
- [ ] A signed-in user can create a project through the web form, and doing so opens a real pull
      request against the repository containing a valid project folder that passes
      `npm run validate` unmodified.
- [ ] The creation form validates against `docs/METADATA_SPEC.md` live, and cannot submit an
      invalid `fermata.json`.
- [ ] Archived projects are rendered, visually de-emphasised, behind a filter that is off by
      default — Fermata keeps its dead ideas visible.
- [ ] Every page is server-rendered enough to be fully readable and crawlable without
      JavaScript, and has correct OpenGraph and Twitter card metadata.

### Bonus

- [ ] A per-project activity timeline — commits touching the folder, bounties completed against
      it, contributors added — assembled from Git history and the ledger.

---

## Deliverables

1. The three surfaces above in `projects/web/fermata-web/`.
2. Search implementation with the index-build step documented.
3. The PR-generating creation flow, including how it authenticates as the user.
4. A "Projects" section in `docs/WEB.md`.

---

## Definition of done

- All acceptance criteria checked, verified on the live deployment with real repo data.
- Search performance measured and the numbers reported, not asserted.
- README rendering is XSS-safe; state the sanitiser and its configuration in the PR.
- Accessibility: keyboard-navigable filters, correct landmarks, WCAG AA.
- Reviewed and approved by a maintainer.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 420 |
| Bonus (activity timeline) | 90 |
| Applicable multipliers | ×1.0 |

---

## Getting started

Read [FB-0006](../../web/FB-0006-static-project-gallery/) end to end first — if it has shipped,
you have a working reference implementation and a `search-index.json` contract to build against.
If it hasn't, you're setting the precedent it will follow, so write your decisions down.

```bash
cat projects/tools/ai/vivarium/fermata.json
cat docs/METADATA_SPEC.md
```

---

## Notes

- The creation flow is the interesting engineering problem: turning a form into a well-formed
  pull request, attributed to the user, without the site holding a token that can write anything
  it likes. A GitHub App with narrowly scoped permissions is the expected answer.
- Empty states matter. A category with no projects should invite someone to make one, not show a
  blank grid.
