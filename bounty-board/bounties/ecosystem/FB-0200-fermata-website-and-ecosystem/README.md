# FB-0200: Build the Fermata website and contributor ecosystem

> **Track** `ecosystem` · **Size** `xl` · **Difficulty** `expert` · **Reward** `1200 REP` (+300 bonus)
> **Status** `open` · **Claim TTL** 90 days · **Epic** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)

---

## Summary

Build **fermata.dev** — the web home of the whole thing. Accounts and login, public project
pages, project creation and browsing, the bounty board as a live surface you can post to and
claim from, visible reputation, and customisable profiles. In the shape of GitHub, at the scale
of a hobby community: everything a contributor needs to find work, do work, and be credited for
it, without cloning anything.

This is the second flagship of [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/) and the
umbrella for four child bounties. **You do not have to claim all of it.** Claim this one to own
the platform and the shell; claim a child to own one surface.

---

## Context

- **Why now:** the repo has real structure — validated metadata, a bounty board, a reputation
  ledger — and every bit of it is invisible unless you clone. The board in particular is a
  contributor-acquisition tool that currently requires you to already be a contributor to find.
- **Why GitHub-shaped:** because the shape works and everyone already knows it. Discovery →
  entity page → contribute → credit. Fermata's twist is that the entities are *projects and
  bounties*, and the credit is REP rather than a commit graph.
- **The hard constraint:** **the Git repository stays authoritative.** The site is a rich
  interface over repo state, not a second copy of the truth. See
  [ARCHITECTURE.md § Migration path](../../../ARCHITECTURE.md#migration-path-to-a-hosted-service).
  Every write the site performs ends up as a commit or a PR against the repo.
- **Related:** [FB-0006](../../web/FB-0006-static-project-gallery/) prototypes the browse UX
  statically — read it, and don't redesign what it settled. [FB-0100](../FB-0100-windows-desktop-application/)
  is the desktop sibling and will consume the same API.

---

## Scope

This bounty owns the **platform and the shell**. The four surfaces are child bounties, each
claimable separately:

| Child | Surface |
| --- | --- |
| [FB-0201](../FB-0201-accounts-and-authentication/) | Accounts, GitHub OAuth, sessions, roles |
| [FB-0202](../FB-0202-project-registry-browse/) | Project registry: browse, search, detail pages, create |
| [FB-0203](../FB-0203-bounty-board-web-surface/) | Bounty board: list, post, claim, submit, review |
| [FB-0204](../FB-0204-profiles-and-customization/) | Profiles, reputation display, customisation |

What **this** bounty delivers:

| Area | What |
| --- | --- |
| **App shell** | Next.js (App Router) + TypeScript, layout, navigation, responsive down to 360px, dark mode, the FB-0005 design system as tokens and components. |
| **Data layer** | Postgres schema covering users, projects, bounties, claims, reputation events, comments. Migrations. Seed script that imports the current repo state. |
| **Repo sync** | A worker that reads the Git repo and reconciles it into the database on push, and writes site-originated changes back as commits or PRs. Idempotent, resumable, and safe to re-run from zero. |
| **Public API** | The read surface consumed by the desktop app and by anyone else. Coordinated with [FB-0300](../FB-0300-public-api-and-git-sync/). |
| **Home + discovery** | Landing page, global search across projects/bounties/people, activity feed. |
| **Deployment** | Reproducible deploy, environment documentation, backups, and a documented restore procedure. |

---

## Out of scope

- **Anything the four child bounties own.** Ship stubs and the contracts they'll implement
  against; don't build their surfaces.
- **Payments, sponsorship, or cash bounties.** REP only. No Stripe, no wallets, no tokens.
- **Hosting Git.** Projects live in the Fermata repo (or link out to external repos). The site
  is not a Git host and never will be.
- **A CI service.** GitHub Actions already does that.
- **Real-time chat / DMs.** Comments on bounties and projects are in scope; a messaging product
  is not.
- **Mobile apps.** Responsive web only.
- **Ad tech, third-party analytics, or any tracker.** Self-hosted, privacy-preserving
  aggregate metrics are acceptable if disclosed.

---

## Acceptance criteria

- [ ] A deployed, publicly reachable site exists at a URL linked from the repo README, running
      from a documented, reproducible deploy.
- [ ] The database schema covers users, projects, bounties, claims, reputation events, and
      comments, with migrations that run cleanly from an empty database.
- [ ] A seed/import command populates a fresh database from the current Git repo — every
      project's `fermata.json`, every bounty, and every ledger event — and is idempotent when
      run twice.
- [ ] Repo → site sync runs automatically on push to `main` and reconciles changes within five
      minutes, with a manual re-sync trigger available to maintainers.
- [ ] Site → repo writes land as real commits or pull requests against the repository, with the
      acting user attributed, and no site-only state exists for anything the repo models.
- [ ] A documented public read API serves projects, bounties, and profiles as JSON, versioned
      under `/api/v1/`, with rate limiting and CORS configured.
- [ ] Global search returns projects, bounties, and people, ranked, in under 300ms at p95 on the
      seeded dataset.
- [ ] The app shell implements the FB-0005 design system as reusable components and passes an
      accessibility audit: keyboard-navigable throughout, visible focus, WCAG AA contrast, and
      correct landmark structure.
- [ ] Responsive from 360px to 2560px with no horizontal scroll and no unusable control at any
      width.
- [ ] Lighthouse ≥ 90 for Performance, Accessibility, Best Practices, and SEO on the home and a
      project detail page, with reports attached.
- [ ] Security: all secrets in environment variables and none in the repo, authorisation checked
      server-side on every mutation, parameterised queries throughout, CSP and security headers
      set, and a documented backup + restore procedure that has been tested at least once.
- [ ] `docs/WEB.md` documents the architecture, the deploy, the environment variables, the sync
      model, and how to run the whole thing locally with one command.

### Bonus

- [ ] Federation-ready: the API can index and display **external** projects and bounties from
      other repositories that publish a `fermata.json`, so the ecosystem extends past this one
      monorepo — which is the long-term point of the reputation system.

---

## Deliverables

1. `projects/web/fermata-web/` — the application, as a normal Fermata project with valid
   metadata.
2. Database schema and migrations.
3. Sync worker, both directions.
4. Public API with an OpenAPI description.
5. `docs/WEB.md` and a runnable local development setup.
6. A deploy pipeline and a tested restore procedure.

---

## Definition of done

- All acceptance criteria checked, verified by a maintainer against the live deployment.
- Child bounty contracts (API shapes, component interfaces, database tables) documented and
  stable enough that FB-0201–FB-0204 can be claimed by other people in parallel.
- `npm run validate` passes for the new project.
- Every dependency licence-checked and listed in `THIRD_PARTY.md`; all GPL-3.0 compatible.
- Threat model written down: authentication, authorisation, injection, SSRF, secret handling,
  and what happens when the sync worker is fed a malicious `fermata.json`.
- Reviewed and approved by a maintainer.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 1200 |
| Bonus (federation-ready API) | 300 |
| Applicable multipliers | ×1.25 (`help-wanted-urgent`) |

Base completion awards **1500 REP**. The four children add a further 1450 between them, making
EPIC-001's web half worth roughly 3000 REP across all claimants.

---

## Suggested milestones

| # | Milestone | Roughly |
| --- | --- | --- |
| 1 | Shell, design system components, deploy pipeline, empty database | 3 weeks |
| 2 | Schema + migrations + repo import; projects visible read-only | 3 weeks |
| 3 | Sync worker both directions, with the write path going through PRs | 3 weeks |
| 4 | Public API + OpenAPI, consumed by a smoke-test client | 2 weeks |
| 5 | Search, home, activity feed | 1 week |
| 6 | Security review, accessibility pass, docs, hardening | 1 week |

Stack is the claimant's call, but the reference answer is Next.js + TypeScript + Postgres +
Drizzle or Prisma, deployed anywhere with a documented, portable configuration. **Propose your
stack in the claim PR before milestone 1.** A stack that locks the project into one vendor will
be pushed back on.

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata && npm install
npm run bounty -- list --json          # the bounty API shape, already defined
npm run rep -- rebuild && cat bounty-board/reputation/profiles/*.json
find projects -name fermata.json -exec cat {} \;
```

Read first, in order:

- [`bounty-board/ARCHITECTURE.md`](../../../ARCHITECTURE.md) — especially the migration-path
  table, which is the schema half-designed already.
- [`bounty-board/REPUTATION.md`](../../../REPUTATION.md) — the reputation model the site
  displays and must not re-derive differently.
- [`docs/METADATA_SPEC.md`](../../../../docs/METADATA_SPEC.md) — the project model.
- [`bounty-board/schemas/`](../../../schemas/) — four JSON Schemas that are, functionally, your
  first four tables.

---

## How to claim

```bash
npm run bounty -- claim FB-0200 --who yourhandle
```

`xl` bounties require ♫ Phrase (500 REP) or maintainer sign-off. **Claiming this one does not
claim its children** — that's deliberate, so the platform owner and the surface builders can be
different people working at the same time.

---

## Notes

- **The repo is the source of truth. Say it out loud before every design decision.** The moment
  the site holds state the repo can't reproduce, Fermata has quietly become a walled garden,
  and the whole thing was supposed to be the opposite of that.
- Every user-visible thing here already exists as a file. Resist the urge to model something new
  because it'd be tidier in SQL — if the schema and the repo disagree, the repo wins and the
  schema changes.
- Scale honestly: this is a hobby community, not a startup. Optimise for a maintainer being able
  to understand the whole system in an afternoon, and for the deployment costing approximately
  nothing when nobody's using it.
