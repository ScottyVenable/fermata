# Bounties

> This is a pointer. The bounty board documents itself, next to its own data, at
> **[`bounty-board/`](../bounty-board/)**.

## What it is

A queue of scoped, acceptance-tested work anyone — human or bot — can claim, plus **REP**, a
non-transferable reputation score earned by contributing.

## Where to go

| Doc | For |
| --- | --- |
| [bounty-board/README.md](../bounty-board/README.md) | How the board works, how to claim, how to post |
| [bounty-board/INDEX.md](../bounty-board/INDEX.md) | Every bounty, generated, always current |
| [bounty-board/REPUTATION.md](../bounty-board/REPUTATION.md) | Every way REP is earned and lost |
| [bounty-board/GOVERNANCE.md](../bounty-board/GOVERNANCE.md) | Roles, review rules, disputes, bot policy |
| [bounty-board/ARCHITECTURE.md](../bounty-board/ARCHITECTURE.md) | Data model, state machine, CI integration |
| [bounty-board/epics/EPIC-001-fermata-ecosystem/](../bounty-board/epics/EPIC-001-fermata-ecosystem/) | The Windows app + website + API program |

## Commands

```bash
npm run bounty -- list --status open
npm run bounty -- show FB-0001
npm run bounty -- claim FB-0001 --who yourhandle
npm run bounty -- new --title "..." --track tooling --size s
npm run rep -- who yourhandle
npm run rep -- leaderboard
```

## Why it lives outside `docs/`

The board is data as much as documentation — 17 bounty folders, four JSON Schemas, an
append-only ledger, and two CLIs that read all of it. Keeping the docs beside the data means a
rule change and the file it governs land in the same diff, which is the only reliable way to
stop the two from drifting.
