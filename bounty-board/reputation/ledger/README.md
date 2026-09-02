# Ledger

**Append-only.** One JSONL file per calendar quarter. Every line is one reputation event,
validated against [`../../schemas/ledger-event.schema.json`](../../schemas/ledger-event.schema.json).

## Do not

- Edit an existing line. Ever. Corrections are new lines with `source: "correction"` and a
  `corrects` field naming the event they fix.
- Reorder lines. Timestamps must be non-decreasing, and `npm run rep -- audit` fails if they
  aren't.
- Add lines in a contributor PR. The `bounty.yml` workflow writes these on merge. A maintainer
  may append `source: "manual"` or `"correction"` events with a second maintainer's approval.
- Delete a file when a quarter ends. The whole history stays.

## Format

```json
{"ts":"2026-09-04T18:22:11Z","id":"ev_20260904_182211_7f3a","event":"bounty.completed","subject":"newcontrib","subject_kind":"human","actor":"github-actions[bot]","ref":"FB-0002","track":"tooling","base_points":140,"multiplier":1,"points":140,"reason":"Scaffold presets shipped; all 7 acceptance criteria met.","source":"workflow","schema":1}
```

Field reference: [REPUTATION.md § Event format](../../REPUTATION.md#event-format).

## Verify

```bash
npm run rep -- audit          # integrity + anti-gaming
npm run rep -- rebuild        # recompute every profile from these files
```
