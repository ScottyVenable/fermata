# FB-0300: Public API and bidirectional Git sync service

> **Track** `ecosystem` · **Size** `xl` · **Difficulty** `expert` · **Reward** `600 REP` (+120 bonus)
> **Status** `open` · **Claim TTL** 90 days · **Epic** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)

---

## Summary

The load-bearing piece of the whole ecosystem: a versioned public API over Fermata's data, and a
sync service that keeps the Git repository and the hosted database in agreement in both
directions — with the repository always winning. Every other ecosystem surface, including the
Windows app, consumes this.

---

## Context

- **Why it's separate:** [FB-0200](../FB-0200-fermata-website-and-ecosystem/) needs *a* sync to
  ship its own surfaces, and [FB-0100](../FB-0100-windows-desktop-application/)'s bonus account
  mode needs a *stable, public* one. Splitting them lets the website ship without blocking on a
  production-grade API, and lets someone who cares about distributed systems own the hard part.
- **The invariant:** the repo is authoritative. If the database and the repo disagree, the repo is
  right and the database is rebuilt. Every site-originated write becomes a commit or a PR.
  See [ARCHITECTURE.md § Migration path](../../../ARCHITECTURE.md#migration-path-to-a-hosted-service).
- **Why this blocks FB-0100:** the desktop app's sync mode is specified against this contract.

---

## Scope

| Area | What |
| --- | --- |
| **Read API** | `/api/v1/` for projects, bounties, claims, profiles, ledger events, search. Cursor pagination, ETags, conditional requests, rate limits. |
| **Write API** | Claim, drop, post progress, submit, propose — each producing a repo commit or PR attributed to the acting user. Idempotency keys required. |
| **Repo → DB sync** | Webhook-driven on push, plus a periodic full reconcile. Resumable, idempotent, and able to rebuild from an empty database. |
| **DB → repo writes** | Batched commits through a GitHub App with narrow permissions, conflict detection, and retry with backoff. |
| **Consistency** | A drift detector that compares DB state to repo state and reports differences; repo wins, always. |
| **Contract** | OpenAPI 3 description, a generated TypeScript client, and documented API versioning and deprecation policy. |
| **Ops** | Structured logs, health endpoint, sync lag metric, alert on drift, documented runbook. |

---

## Out of scope

- Authentication itself — that's [FB-0201](../FB-0201-accounts-and-authentication/). This bounty
  consumes its sessions and tokens.
- Building any UI.
- GraphQL. REST plus OpenAPI in v1; a GraphQL layer is a later proposal if anyone wants it.
- Webhooks *out* to third parties. Later.
- Hosting Git.

---

## Acceptance criteria

- [ ] `/api/v1/` serves projects, bounties, claims, profiles, and ledger events as JSON, with
      cursor-based pagination, ETag support, and documented rate limits, all described by a
      published OpenAPI 3 document.
- [ ] A generated, published TypeScript client exists and is used by at least one real consumer
      (a smoke-test CLI is acceptable) in CI.
- [ ] Repo → DB sync is triggered by a push webhook, reconciles within 60 seconds at p95, and is
      idempotent: replaying the same webhook produces no further change.
- [ ] A full rebuild from an empty database reproduces exactly the same state as incremental sync
      — verified by a test that runs both paths and diffs the result.
- [ ] Every write endpoint produces a real commit or pull request in the repository, attributed
      to the acting user, and requires an idempotency key so a retried request cannot double-write.
- [ ] Concurrent writes to the same bounty are serialised and cannot produce a corrupt
      `bounty.json` or a duplicate ledger event — demonstrated with a concurrency test.
- [ ] A drift detector runs on a schedule, reports any DB/repo disagreement, and the documented
      resolution is always to rebuild from the repo.
- [ ] Ledger writes performed through the API pass `npm run rep -- audit` with zero integrity
      failures, including the points-arithmetic and duplicate-award checks.
- [ ] A runbook documents deploy, rollback, full resync, credential rotation, and what to do when
      the GitHub API is rate-limited or down.

### Bonus

- [ ] Read-only federation: index `fermata.json` and bounty metadata from **other** repositories
      that opt in, so projects outside this monorepo appear in the API — the technical
      precondition for reputation earned across the wider ecosystem.

---

## Deliverables

1. The API service and sync worker in `projects/web/fermata-web/` (or a sibling package).
2. Published OpenAPI document and generated client.
3. Sync, idempotency, and concurrency test suites.
4. `docs/API.md` and an operational runbook.

---

## Definition of done

- All acceptance criteria checked, with test output and measured sync-lag figures in the PR.
- The repo-wins invariant demonstrated: deliberately corrupt a database row, run the reconcile,
  show it restored from the repo.
- GitHub App permissions documented and minimal.
- Reviewed and approved by a maintainer.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 600 |
| Bonus (read-only federation) | 120 |
| Applicable multipliers | ×1.0 |

---

## Getting started

```bash
npm run bounty -- list --json
npm run rep -- audit
cat bounty-board/schemas/*.json
cat bounty-board/ARCHITECTURE.md
```

The four JSON Schemas plus the CLI's `--json` output are, together, most of your v1 API surface
already specified. Start by making `/api/v1/bounties` return byte-compatible payloads with
`npm run bounty -- list --json`, and the desktop app can point at either one interchangeably —
which is a genuinely useful property to preserve.

---

## Notes

- The single most valuable thing you can build here is the **rebuild-from-repo** path. Get that
  right and every other failure mode becomes recoverable. Get it wrong and the ecosystem
  eventually forks from its own source of truth.
- Rate limits: the GitHub API is the bottleneck for writes. Batch, back off, and make the queue
  visible.
- This one is genuinely hard and genuinely important. If distributed-state problems are your
  thing, this is the bounty on the board for you.
