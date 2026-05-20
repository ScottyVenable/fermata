# Fermata Wiki

Welcome. This wiki is a quick-access reference — the long-form docs live in [the repo's `docs/` folder](https://github.com/ScottyVenable/fermata/tree/main/docs).

## Start here

- **[Quick Start](Quick-Start)** — Get a new project on disk in under a minute.
- **[Project Categories](Project-Categories)** — What goes where, and why.
- **[Metadata Reference](Metadata-Reference)** — Every field in `fermata.json`.
- **[Shared Dependencies](Shared-Dependencies)** — How the registry works.
- **[Contributing](Contributing)** — Adding a project, extending someone else's.
- **[FAQ](FAQ)** — Quick answers to common questions.

## What is Fermata?

A sandbox monorepo for hobby projects and vibe-coded experiments. Instead of spinning up a new GitHub repo for every idea (and then abandoning most of them), everything lives in one place — organized by category, governed by a tiny metadata file, and open to anyone who wants to contribute.

## Conventions

- All projects are licensed **GPL-3.0**. Authors keep credit via `authors` in `fermata.json`.
- Every project has a `fermata.json` and a `README.md`. Everything else is the author's choice.
- Categories live in folders; platforms live in metadata. (See [Project Categories](Project-Categories) for the reasoning.)

## How this wiki stays up to date

The source for these pages is at [`docs/wiki/`](https://github.com/ScottyVenable/fermata/tree/main/docs/wiki) in the main repo. A GitHub Action syncs the folder to the wiki on every push to `main`. **Don't edit pages here directly** — edit the source files and open a PR.
