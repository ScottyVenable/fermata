# FB-0204: Contributor profiles, reputation display, and customization

> **Track** `ecosystem` · **Size** `m` · **Difficulty** `intermediate` · **Reward** `200 REP` (+50 bonus)
> **Status** `open` · **Claim TTL** 60 days · **Epic** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/)

---

## Summary

Give every contributor a home page. Tier and REP, badges, the projects they've made, the bounties
they've completed, the reviews they've given — and enough customisation that it feels like theirs
rather than a generated report. Reputation that nobody can look at isn't reputation.

---

## Context

- **Why it matters:** REP is the entire reward for working on Fermata. A number in a JSONL file
  is not a reward; a page you'd link from your CV might be.
- **The data is done.** `bounty-board/reputation/profiles/*.json` is already generated from the
  ledger with tiers, counts, tracks, badges, and recent events. This bounty renders it.
- **Related:** [FB-0902](../../meta/FB-0902-reputation-profile-cards/) generates SVG cards from
  the same data — reuse that layout as this page's OG image rather than designing a second one.
- **Depends on [FB-0200](../FB-0200-fermata-website-and-ecosystem/)** and
  [FB-0201](../FB-0201-accounts-and-authentication/).

---

## Scope

| Surface | What |
| --- | --- |
| `/@handle` | Profile: avatar, display name, pronouns, bio, links, tier with progress to next, lifetime and season REP, badge shelf, REP-by-track breakdown |
| Contribution history | Projects created and contributed to, bounties completed and authored, reviews given, external contributions — filterable, paginated |
| Activity graph | REP over time, and a contribution calendar |
| `/settings/profile` | Edit display name, pronouns, bio, links, avatar source, pinned items, theme accent, and email privacy |
| `/leaderboard` | Season and lifetime boards, humans and bots in separate columns, per-track boards |
| Public API | `/api/v1/profiles/<handle>` returning the same data |

Profile edits must write to `bounty-board/reputation/profiles/_overrides/<handle>.json` in the
repo — the site is not allowed to hold profile state the repo can't reproduce.

---

## Out of scope

- Any change to how REP is computed. Display only.
- Following, friending, or messaging.
- Arbitrary HTML or CSS on profiles. A constrained set of choices — accent colour, layout
  variant, pinned items — not a MySpace.
- Private profiles. Everything the ledger records is public by design; email is the only private
  field.
- Deleting or hiding ledger events.

---

## Acceptance criteria

- [ ] `/@handle` renders any contributor's profile with tier, symbol, lifetime REP, season REP,
      progress to the next tier, badges, and REP broken down by track.
- [ ] Contribution history lists projects, bounties, and reviews, is filterable by type, and
      paginates cleanly past 100 entries.
- [ ] A signed-in user can edit display name, pronouns, bio, links, accent colour, and pinned
      items, and every one of those changes lands in
      `reputation/profiles/_overrides/<handle>.json` in the repo via a commit or PR.
- [ ] Profile customisation cannot inject HTML, script, or arbitrary CSS — verified with an XSS
      test case in the PR.
- [ ] `/leaderboard` shows season and lifetime boards with humans and bots separated, plus
      per-track boards, matching the numbers produced by `npm run rep -- leaderboard`.
- [ ] Every profile page has an OG image generated from the FB-0902 card design, so a shared link
      previews as a reputation card.
- [ ] The public API returns a profile as JSON at `/api/v1/profiles/<handle>` with the same
      figures the page displays.

### Bonus

- [ ] An embeddable badge endpoint — `/@handle/badge.svg` — that anyone can drop into a GitHub
      profile README, with `?variant=slim|card` and correct cache headers.

---

## Deliverables

1. Profile, settings, and leaderboard pages in `projects/web/fermata-web/`.
2. The override write-back path to the repo.
3. OG image generation.
4. A "Profiles" section in `docs/WEB.md`.

---

## Definition of done

- All acceptance criteria checked on the live deployment.
- Displayed numbers verified to match `npm run rep -- who <handle>` exactly for at least three
  real contributors.
- XSS test case included and passing.
- Accessibility: WCAG AA, keyboard navigable, badge meanings available as text and not colour
  alone.
- Reviewed and approved by a maintainer.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 200 |
| Bonus (embeddable badge endpoint) | 50 |
| Applicable multipliers | ×1.0 |

---

## Getting started

```bash
npm run rep -- rebuild
npm run rep -- who scottyvenable
cat bounty-board/reputation/profiles/*.json
cat bounty-board/REPUTATION.md
```

The profile JSON is already exactly the shape a page wants — treat it as the contract and resist
recomputing anything client-side. If a number you want isn't in there, add it to the fold in
`scripts/lib/bounty.mjs` so the CLI and the site never disagree.

---

## Notes

- Restraint on customisation is a feature. Enough that a profile feels personal; not so much that
  the leaderboard becomes unreadable.
- Empty profiles are the common case for a while. A new contributor's page should read as an
  invitation — here's your tier, here's what the next one unlocks, here are three good first
  bounties — not as an empty dashboard.
