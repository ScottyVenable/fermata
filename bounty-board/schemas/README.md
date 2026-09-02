# Schemas

JSON Schema (draft-07) definitions the bounty tooling validates against. `npm run bounty --
validate` and `npm run rep -- audit` enforce these on every PR touching `bounty-board/`.

| Schema | Validates | Written by |
| --- | --- | --- |
| [`bounty.schema.json`](bounty.schema.json) | `bounties/<track>/FB-####-<slug>/bounty.json` | Humans and the CLI |
| [`claim.schema.json`](claim.schema.json) | The front matter of `claims/*.md` | Humans and the CLI |
| [`ledger-event.schema.json`](ledger-event.schema.json) | Each line of `reputation/ledger/*.jsonl` | **Automation only** |
| [`profile.schema.json`](profile.schema.json) | `reputation/profiles/*.json` | **`rep rebuild` only** — derived |

## Editor support

Point your editor at these for autocomplete while writing a bounty by hand:

```jsonc
// .vscode/settings.json
{
  "json.schemas": [
    {
      "fileMatch": ["bounty-board/bounties/**/bounty.json"],
      "url": "./bounty-board/schemas/bounty.schema.json"
    }
  ]
}
```

## Changing a schema

Schemas are part of the governed surface. Loosening a constraint is a normal PR; **tightening**
one can invalidate existing bounties, so:

1. Run `npm run bounty -- validate` against every existing bounty first.
2. Migrate anything that breaks in the same PR.
3. Bump `schema` in `ledger-event.schema.json` if the event format itself changes — old lines
   keep their old version number and the fold handles both.

See [GOVERNANCE.md § Changing these rules](../GOVERNANCE.md#changing-these-rules).
