# FAQ

## Why "Fermata"?

In music notation, a *fermata* (𝄐) tells the performer to hold a note for as long as they choose. This repo holds ideas the same way — for as long as the spark lasts. Some notes are short; some last forever. Both are fine.

## Can I license my project under something other than GPL-3.0?

No. The repo is GPL-3.0 and all projects share that license. You keep credit through the `authors` field in your `fermata.json`. If you specifically need a permissive license (MIT, Apache, BSD), this isn't the right home for that project.

## Can I add binary files / large assets?

For small projects, yes. For anything over a few MB, consider Git LFS or hosting the asset elsewhere and linking from the project's README. Fermata isn't optimized for large media.

## Can I add a project that isn't done?

Yes — that's most of them. Set `status: "experimental"`. Nobody expects polish.

## What happens to projects I stop working on?

Nothing bad. Set `status: "paused"` to signal you've stepped away. Set `status: "archived"` (and add `archived_reason`) to freeze it. Both keep the project in the repo; neither deletes anything.

## Can someone else take over a paused project?

If the original author marked it `paused`: open an issue, tag the original author, and propose what you'd do. If they don't respond after a reasonable wait (say, two weeks), maintainers can transfer effective ownership while preserving the original `creator` in `authors`.

For `archived` projects, get explicit consent from the original author before reviving.

## Do I need to use the scripts?

No. They exist to remove friction. You can copy `template/` by hand, edit `fermata.json` in your editor, and skip `npm run new` entirely. The validator runs on what's on disk regardless.

## My project needs a shared dep that doesn't exist yet. What do I do?

Two options:

1. **Register it.** `npm run add-dep -- --register <name> --version "<semver>" --description "<one line>"`. Other projects benefit too.
2. **Keep it project-local.** Put it in `dependencies.external` in your `fermata.json` and `npm install` inside the project folder. Use this for one-off deps or version conflicts.

## How do I get my project featured on the README / wiki?

There's no curation list. The README is intentionally about Fermata-the-system, not specific projects. `projects/INDEX.md` (auto-generated on merge) lists everything.

## Can I contribute without writing code?

Absolutely. Doc improvements, reviewing PRs, opening issues for broken projects, adding a category, improving the wiki — all welcome.

## Where do I report problems with this wiki?

The wiki is generated from [`docs/wiki/`](https://github.com/ScottyVenable/fermata/tree/main/docs/wiki) in the main repo. Open a PR against those files.
