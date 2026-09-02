---
id: PROP-004
title: A machine-readable contribution protocol for agents
proposed_by: ScottyVenable
proposed_at: 2026-09-01
suggested_track: automation
suggested_size: m
status: open
promoted_to:
---

# PROP-004: A machine-readable contribution protocol for agents

## The idea

Bot contributors are explicitly welcome ([GOVERNANCE.md § Bot contributors](../GOVERNANCE.md#bot-contributors)),
and the board already exposes `--json` on the CLI. Go further: publish a single, versioned
`AGENTS.json` at the repo root that tells an agent everything it needs to participate without
reverse-engineering prose.

```json
{
  "protocol": 1,
  "repo": "ScottyVenable/fermata",
  "queue": "npm run bounty -- list --json --status open",
  "claim": "npm run bounty -- claim {id} --who {handle} --kind bot --operator {operator}",
  "validate": ["npm run validate", "npm run bounty -- validate"],
  "conventions": { "commit": "...", "branch": "...", "pr_title": "..." },
  "forbidden": ["human-judgment", "governance"],
  "rate_limits": { "concurrent_claims": 1, "prs_per_day": 3 }
}
```

## Why it's worth doing

- The repo already has agent-oriented files in `template/agents/` and
  `projects/tools/ai/vivarium/agents/`. This generalises that instinct to the whole repo.
- Every capable agent currently has to be told the conventions by a human, once, badly. A
  discoverable contract fixes that permanently.
- It's a small, concrete artifact that could plausibly be adopted beyond this repo — which is
  exactly the sort of outward contribution the reputation system is meant to encourage.

## Rough shape

- `AGENTS.json` at the repo root, plus a human-readable `docs/AGENTS.md`.
- A validator in CI so the file can't drift from reality (a command it names that doesn't exist
  should fail the build).
- Rate limits enforced by the bounty tooling, not just documented.

## Open questions

- Is there prior art worth adopting rather than inventing? (`llms.txt`, `agents.md`, and similar
  conventions are circulating; none of them cover claiming work.)
- Should the protocol be per-repo or per-organisation?
- How do you prevent a well-behaved protocol from becoming a spam vector? Rate limits help; REP
  gating helps more; neither is sufficient alone.

## Would you build it yourself?

With help — the file is easy, the enforcement and the anti-spam design are the actual work.
