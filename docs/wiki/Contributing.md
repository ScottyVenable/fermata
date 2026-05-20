# Contributing

Mirror of the highlights from [CONTRIBUTING.md](https://github.com/ScottyVenable/fermata/blob/main/CONTRIBUTING.md) — read that for the full story.

## The four common cases

1. **Add a new project.** Most contributions look like this.
2. **Extend an existing project.** Open an issue first if it's non-trivial.
3. **Improve the tooling.** Scripts, workflows, templates.
4. **Triage and review.** Reviewing PRs, opening issues for stale/broken projects.

You don't need to ask permission. Just open a PR.

## Adding a new project (fast path)

```bash
git checkout -b new/<your-project-name>
npm run new -- --name your-thing --category tools/ai
# ... build something ...
npm run validate
git add -A && git commit -m "new: your-thing in tools/ai"
git push -u origin new/your-thing
```

Open the PR — fill in the template. CI runs validation automatically.

## Picking a category

See [Project Categories](Project-Categories). When in doubt, `experiments/`.

## Extending someone else's project

- Open an issue first if it's non-trivial.
- Add yourself to `authors` with `role: "contributor"`.
- Respect their `status` — if it's `archived`, ask before reviving.

## Rules the validator enforces

All listed in the [Metadata Reference](Metadata-Reference). The short version:

- `license` must be `GPL-3.0`.
- `name` must match the folder name.
- `category` must match the folder placement.
- Every shared dep must be in the registry.
- Exactly one creator per project.

## PR conventions

- Branch names: `new/<project>`, `fix/<thing>`, `tooling/<thing>`, `docs/<thing>`.
- Title format: `<scope>: <short description>`.
- One project per PR; tooling changes can bundle related fixes.
- CI must be green.
