# Bounty Board Changelog

Changes to the board's structure, rules, and tooling. Individual bounties aren't listed here —
`git log bounty-board/bounties/` is better at that.

## 2026-09-01 — Board established

- **Structure.** `bounty-board/` with bounties filed by track, plus epics, proposals, schemas,
  templates, and the reputation ledger.
- **Docs.** [README](README.md), [ARCHITECTURE](ARCHITECTURE.md), [REPUTATION](REPUTATION.md),
  [GOVERNANCE](GOVERNANCE.md), [STEWARDS](STEWARDS.md).
- **Templates.** Bounty, claim, submission, and proposal templates, plus the `bounty.json`
  sidecar template.
- **Schemas.** Draft-07 JSON Schemas for bounties, claims, ledger events, and profiles.
- **Tooling.** `npm run bounty` (list, show, new, claim, drop, complete, validate, index, stats)
  and `npm run rep` (award, rebuild, who, leaderboard, audit, tiers), sharing
  `scripts/lib/bounty.mjs`. Zero dependencies, Node 18+.
- **Reputation.** REP spec with 29 event types, four multipliers, seven tiers, quarterly seasons,
  eleven badges, and an append-only JSONL ledger with an audit command.
- **Bounties.** 17 opened across eight tracks — 5,700 base REP available, plus 1,250 in bonuses.
- **Epic.** [EPIC-001](epics/EPIC-001-fermata-ecosystem/): the Fermata ecosystem — a Windows
  application, a website with accounts, and the public API and sync service that join them.
- **CI.** `.github/workflows/bounty.yml` — validate on PR, award on merge, expire and audit
  nightly.

## Conventions

Entries are reverse-chronological, dated, and describe *changes to the system* rather than
changes to its contents. Rule changes must also follow
[GOVERNANCE.md § Changing these rules](GOVERNANCE.md#changing-these-rules).
