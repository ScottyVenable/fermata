# Quick Start

The fastest path from "I have an idea" to "I'm building".

## Prereqs

- Node 18 or newer (`node --version`).
- Git.
- A fork (or write access) to [ScottyVenable/fermata](https://github.com/ScottyVenable/fermata).

## One-time setup

```bash
git clone https://github.com/<you>/fermata.git
cd fermata
npm install
```

That installs whatever shared deps are currently in the registry. There's nothing to build.

## Create a project

```bash
npm run new -- --name my-thing --category tools/ai
```

What this does:

1. Copies `template/` into `projects/tools/ai/my-thing/`.
2. Fills in `fermata.json` (name, category, created date, author from your git config).
3. Replaces placeholders in the README and agent files.
4. Leaves you with a clean working tree (no commit made for you).

Flags worth knowing:

| Flag | Default |
| --- | --- |
| `--display-name "My Thing"` | derived from `--name` |
| `--platforms web,desktop` | `web` |
| `--no-agents` | (agents/ included) |

## Develop

Open `projects/tools/ai/my-thing/`. Write code. There are no rules about what's *inside* — use any stack, any folder shape.

## Add a shared dep

```bash
npm run deps -- list                            # see what's available
npm run add-dep -- --project my-thing --dep react   # link it
```

If the dep isn't registered yet:

```bash
npm run add-dep -- --register react --version "^18.3.0" --description "UI library"
```

Then `npm install` to pull it down at the root.

## Validate before pushing

```bash
npm run validate
```

This is what CI runs. If it's green locally, it'll be green on the PR.

## Open a PR

Push your branch and open a PR. The validation workflow runs automatically. The PR template will ask you to confirm a few things — checking those boxes is what makes review fast.

## What if I mess up?

- **`validate` fails:** read the error message. It tells you the file path and the exact field. Fix it, re-run.
- **You put the project in the wrong category:** `git mv` it, then update `category` in `fermata.json` to match, then re-run `validate`.
- **You named the folder one thing and `fermata.json` another:** rename one to match the other. The folder name and `name` field must agree.
