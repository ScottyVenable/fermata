# Templates

Copy these; don't edit them in place. Edits here change what every future bounty looks like,
which is sometimes what you want — just do it deliberately, in its own PR.

| File | Use when | Lands at |
| --- | --- | --- |
| [`BOUNTY_TEMPLATE.md`](BOUNTY_TEMPLATE.md) | Writing a bounty | `bounties/<track>/FB-####-<slug>/README.md` |
| [`bounty.template.json`](bounty.template.json) | Same, machine side | `bounties/<track>/FB-####-<slug>/bounty.json` |
| [`CLAIM_TEMPLATE.md`](CLAIM_TEMPLATE.md) | Claiming a bounty | `bounties/<track>/FB-####-<slug>/claims/<date>-<handle>.md` |
| [`SUBMISSION_TEMPLATE.md`](SUBMISSION_TEMPLATE.md) | Opening a delivery PR | The PR description |
| [`PROPOSAL_TEMPLATE.md`](PROPOSAL_TEMPLATE.md) | Floating an idea | `proposals/PROP-###-<slug>.md` |

The tooling copies the right one for you:

```bash
npm run bounty -- new --title "..." --track tooling --size s   # bounty + json
npm run bounty -- claim FB-0002 --who yourhandle               # claim file
npm run bounty -- promote PROP-004 --track web --size m        # proposal → bounty
```

**A note on the HTML comments.** Every template is heavily commented with instructions.
Delete them before committing — the validator warns if `<!--` survives into a merged bounty.
