# Proposals

A proposal is an idea with no commitment attached. Cheap to write, cheap to decline, and the
lowest-friction way to put something on the board's radar.

| Write a proposal when | Write a bounty instead when |
| --- | --- |
| You have a hunch, not a spec | You know exactly what "done" looks like |
| You don't know the scope or the size | You can write three falsifiable acceptance criteria |
| You want to know if anyone else cares | You already know someone cares |
| You'd like someone else to shape it | You're going to shape it |

## Writing one

Copy [`../templates/PROPOSAL_TEMPLATE.md`](../templates/PROPOSAL_TEMPLATE.md) to
`PROP-###-short-slug.md`, fill in what you know, leave the rest blank, and open a PR. There is no
quality bar beyond being comprehensible.

## Promotion

Anyone at 𝄀 Measure tier (250 REP) or above can turn a proposal into a bounty:

```bash
npm run bounty -- promote PROP-004 --track web --size m
```

That scaffolds the bounty folder, links back to the proposal, and sets the proposal's status to
`promoted`. The **proposer earns +10 REP** (`proposal.promoted`) whether or not they build it —
having the idea is a contribution.

## Statuses

| Status | Meaning |
| --- | --- |
| `open` | Awaiting triage |
| `promoted` | Became a bounty. `promoted_to` names it. |
| `declined` | Not wanted, with a reason in the file. Stays here as a record. |
| `duplicate` | Already covered. Points at the original. |

Declined proposals are never deleted. "We considered this and here's why not" is useful
information, and the next person to have the idea deserves to find it.

## Current proposals

| ID | Title | Proposed by | Status |
| --- | --- | --- | --- |
| [PROP-001](PROP-001-shared-asset-registry.md) | Shared asset registry for sprites, sounds, and fonts | @ScottyVenable | open |
| [PROP-002](PROP-002-project-changelog-convention.md) | A lightweight changelog convention for projects | @ScottyVenable | open |
| [PROP-003](PROP-003-fermata-vscode-extension.md) | VS Code extension for Fermata metadata | @ScottyVenable | open |
| [PROP-004](PROP-004-agent-contribution-protocol.md) | A machine-readable contribution protocol for agents | @ScottyVenable | open |
