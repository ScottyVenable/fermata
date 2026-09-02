# EPIC-001: The Fermata Ecosystem

> A Windows application, a website with accounts, and the shared services that connect them —
> turning a monorepo into a place people can find, join, and be credited in.

| | |
| --- | --- |
| **Status** | `open` |
| **Opened** | 2026-09-01 |
| **Bounties** | 7 |
| **Total REP** | 4,450 base (+1,040 bonus) |
| **Sponsor** | [@ScottyVenable](https://github.com/ScottyVenable) |

---

## Table of contents

- [The pitch](#the-pitch)
- [What "ecosystem" means here](#what-ecosystem-means-here)
- [The bounties](#the-bounties)
- [Dependency graph](#dependency-graph)
- [Phases](#phases)
- [Architecture at a glance](#architecture-at-a-glance)
- [Principles this epic must not violate](#principles-this-epic-must-not-violate)
- [How to get involved](#how-to-get-involved)
- [Open questions](#open-questions)

---

## The pitch

Fermata works. It has structured metadata, validation, a template system, a shared dependency
registry, and now a bounty board with a reputation ledger. All of it is invisible unless you
clone a Git repository and read Markdown.

The ecosystem closes that gap in two directions at once:

**Outward — the website.** A stranger can find Fermata, browse its projects, see what work is
wanted, claim a bounty, contribute, and watch their reputation grow. No clone required to
participate, and no clone required to be seen participating.

**Inward — the desktop app.** The person actually building things gets a workspace: create a
project in two clicks, edit metadata without hand-writing JSON, run the tooling behind a UI,
watch the board, and see their own standing — all against a local clone, offline, fast.

Both halves read the same data, enforce the same rules, and write back to the same repository.
Neither becomes a second source of truth.

---

## What "ecosystem" means here

Concretely, when this epic is done:

| You can | Where |
| --- | --- |
| Sign in with GitHub | Website |
| Browse and search every project | Website, desktop, static gallery |
| Create a project from a form, and have it land as a real PR | Website, desktop |
| Post a bounty or a proposal | Website |
| Claim a bounty, post progress, submit work | Website, desktop |
| Review someone's delivery against its criteria | Website |
| See your REP, tier, badges, and history | Everywhere, including an embeddable SVG |
| Customise a public profile page | Website |
| Consume all of it as JSON | Public API |
| Do all of the above from a terminal | The CLIs that already exist |

And, crucially, **you can still do all of it with nothing but `git` and a text editor** — because
every surface is an interface over files in the repo.

---

## The bounties

### Flagships

| ID | Bounty | Size | REP | Status |
| --- | --- | --- | --- | --- |
| [FB-0100](../../bounties/ecosystem/FB-0100-windows-desktop-application/) | Fermata desktop application for Windows | `xl` | 1200 (+300) | open |
| [FB-0200](../../bounties/ecosystem/FB-0200-fermata-website-and-ecosystem/) | Fermata website and contributor ecosystem | `xl` | 1200 (+300) | open |

### Website surfaces

| ID | Bounty | Size | REP | Status |
| --- | --- | --- | --- | --- |
| [FB-0201](../../bounties/ecosystem/FB-0201-accounts-and-authentication/) | Accounts, authentication, and roles | `l` | 380 (+80) | open |
| [FB-0202](../../bounties/ecosystem/FB-0202-project-registry-browse/) | Project registry: browse, search, publish | `l` | 420 (+90) | open |
| [FB-0203](../../bounties/ecosystem/FB-0203-bounty-board-web-surface/) | Bounty board as a live web surface | `l` | 450 (+100) | open |
| [FB-0204](../../bounties/ecosystem/FB-0204-profiles-and-customization/) | Profiles, reputation display, customisation | `m` | 200 (+50) | open |

### Shared services

| ID | Bounty | Size | REP | Status |
| --- | --- | --- | --- | --- |
| [FB-0300](../../bounties/ecosystem/FB-0300-public-api-and-git-sync/) | Public API and bidirectional Git sync | `xl` | 600 (+120) | open |

### Supporting work outside this epic

These aren't epic children, but the ecosystem is better if they land first:

| ID | Why it helps |
| --- | --- |
| [FB-0005](../../bounties/design/FB-0005-visual-identity-kit/) | The design system both the app and the site inherit |
| [FB-0006](../../bounties/web/FB-0006-static-project-gallery/) | Prototypes the browse UX and defines the search index contract |
| [FB-0002](../../bounties/tooling/FB-0002-scaffold-presets/) | The presets the app's "new project" form offers |
| [FB-0902](../../bounties/meta/FB-0902-reputation-profile-cards/) | The card design profile pages reuse as their OG image |

---

## Dependency graph

```
        FB-0005 (identity kit)
             │
             ├──────────────┬──────────────────────┐
             ▼              ▼                      ▼
        FB-0006        FB-0902              ┌────────────┐
      (static           (REP cards)         │  FB-0200   │  website platform
       gallery)              │              │    xl      │
             │               │              └─────┬──────┘
             │               │                    │
             │               │        ┌───────────┼───────────┬───────────┐
             │               │        ▼           ▼           ▼           ▼
             └──────────────►│    FB-0201     FB-0202     FB-0203     FB-0204
                             └───► (auth)    (projects)  (bounties)  (profiles)
                                      │           │           │           │
                                      └───────────┴─────┬─────┴───────────┘
                                                        ▼
                                                  ┌────────────┐
                                                  │  FB-0300   │  API + sync
                                                  │    xl      │
                                                  └─────┬──────┘
                                                        ▼
                                                  ┌────────────┐
                                                  │  FB-0100   │  Windows app
                                                  │    xl      │  (local-only v1
                                                  └────────────┘   needs nothing)
```

**Important:** FB-0100's *local-only* v1 has no dependencies at all and can start today. It
depends on FB-0300 only for its bonus account-and-sync mode. Don't let the arrow scare you off.

---

## Phases

### Phase 1 — Foundations (now)

Nothing here is blocked. All four can run in parallel, by different people.

- FB-0005 · visual identity kit
- FB-0006 · static project gallery
- FB-0100 · Windows app, milestones 1–3 (local-only)
- FB-0200 · website platform, milestones 1–2

**Exit criteria:** a design system exists, projects are browsable on the public web, and a
Windows build renders the local project tree.

### Phase 2 — Surfaces

- FB-0201 · accounts
- FB-0202 · project registry
- FB-0203 · bounty board web surface
- FB-0100 · milestones 4–5

**Exit criteria:** someone can sign in, browse projects, and claim a bounty from a browser, and
the claim shows up as a PR.

### Phase 3 — Connective tissue

- FB-0300 · public API and sync
- FB-0204 · profiles
- FB-0902 · REP cards

**Exit criteria:** the desktop app and the website read the same API, and a contributor's
reputation is visible and embeddable.

### Phase 4 — Ecosystem

- FB-0100 bonus · account mode in the desktop app
- FB-0300 bonus · read-only federation of external repos
- FB-0200 bonus · federated projects and bounties on the site

**Exit criteria:** Fermata reputation can be earned for work in repositories that aren't this
one. That's the point of the whole thing.

---

## Architecture at a glance

```
   ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
   │  Fermata Desktop │        │   fermata.dev    │        │   CLI / Git      │
   │    (Windows)     │        │    (website)     │        │  (already ships) │
   └────────┬─────────┘        └────────┬─────────┘        └────────┬─────────┘
            │ local FS + API            │ HTTP                      │ files
            │                           │                           │
            │                  ┌────────▼─────────┐                 │
            └─────────────────►│  Public API      │                 │
                               │  /api/v1  FB-0300│                 │
                               └────────┬─────────┘                 │
                                        │                           │
                               ┌────────▼─────────┐                 │
                               │  Sync worker     │                 │
                               │  repo ⇄ database │                 │
                               └────────┬─────────┘                 │
                                        │                           │
                    ┌───────────────────▼───────────────────────────▼──────┐
                    │        github.com/ScottyVenable/fermata              │
                    │              THE SOURCE OF TRUTH                     │
                    │  projects/ · bounty-board/ · reputation ledger       │
                    └──────────────────────────────────────────────────────┘
```

Read the arrows carefully: everything points *down* to the repository. There is no path where
the database is authoritative, and there is no state on the website that survives a rebuild from
Git.

---

## Principles this epic must not violate

1. **The repository is the source of truth.** Any feature that requires the database to hold
   something the repo can't reproduce is out of scope, no matter how convenient.
2. **Every hosted feature degrades to files.** The CLI must remain a complete way to use
   Fermata. If a bounty can only be claimed on the website, the design is wrong.
3. **No money.** No payments, escrow, tokens, or cash bounties. REP is the reward, and it is
   non-transferable.
4. **No tracking.** No third-party analytics, no ad tech, no behavioural telemetry. Self-hosted
   aggregate counts, disclosed, are the ceiling.
5. **Open licence throughout.** GPL-3.0 compatible dependencies only, listed in `THIRD_PARTY.md`.
6. **Hobby-scale.** Optimise for one maintainer understanding the whole system in an afternoon,
   and for near-zero cost at idle. This is not a startup.
7. **Accessible by default.** WCAG AA, keyboard navigation, and no colour-only information, on
   every surface, from the first commit rather than as a cleanup pass.

---

## How to get involved

**You want the big one.** Read [FB-0100](../../bounties/ecosystem/FB-0100-windows-desktop-application/)
or [FB-0200](../../bounties/ecosystem/FB-0200-fermata-website-and-ecosystem/) end to end, then
open a claim PR describing your stack and your plan. `xl` bounties need ♫ Phrase tier or a
maintainer's sign-off — if you're new, say what you'd build and we'll talk.

**You want a defined slice.** FB-0201 through FB-0204 are each a real, ownable surface. They're
sized `l`/`m` and depend only on the platform, not on each other.

**You want to help without a large commitment.** FB-0005 (design), FB-0006 (static gallery), and
FB-0902 (REP cards) all feed the ecosystem and are independently useful even if the epic stalls.

**You have opinions rather than time.** Comment on the bounties. Scoping feedback before someone
spends 90 days is worth real REP — `triage.completed` and `review.thorough` both apply.

```bash
npm run bounty -- list --epic EPIC-001
npm run bounty -- show FB-0100
```

---

## Open questions

Answers welcome as comments on this epic or as proposals in
[`bounty-board/proposals/`](../../proposals/).

1. **Domain.** `fermata.dev`? Something else? Who holds it, and what happens to it if the project
   goes quiet for a year — which is an entirely acceptable outcome under Fermata's own philosophy.
2. **Hosting and cost.** What's the sustainable arrangement for a hobby project with no revenue?
   The API and sync worker need to run somewhere that costs nothing at idle.
3. **Electron vs. Tauri for FB-0100.** Electron is the default because it's already in the tree.
   Tauri would produce a dramatically smaller binary. Make the case in a proposal.
4. **Federation scope.** Which external repos can earn Fermata REP, and who decides? This is a
   governance question as much as a technical one, and it's the most interesting unsolved part
   of the reputation system.
5. **Moderation.** Once anyone can post a bounty from a browser, who handles spam and bad faith,
   and with what tooling? [GOVERNANCE.md](../../GOVERNANCE.md) covers disputes but not volume.
6. **Data retention on account deletion.** Ledger events are history and must persist. Is
   handle-only anonymisation the right resolution, and does it actually satisfy anyone's
   expectations?
