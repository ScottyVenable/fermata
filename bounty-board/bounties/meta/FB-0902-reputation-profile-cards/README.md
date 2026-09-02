# FB-0902: Reputation profile cards and badge SVG generator

> **Track** `meta` · **Size** `m` · **Difficulty** `intermediate` · **Reward** `110 REP` (+25 bonus)
> **Status** `open` · **Claim TTL** 21 days · **Epic** —

---

## Summary

REP is currently a number in a JSON file. Make it visible: generate an SVG profile card and a
set of badge SVGs for each contributor, straight from the ledger, so people can drop their
Fermata standing into a GitHub profile README, a blog, or a PR description. Recognition that
can't leave the repo isn't doing much work.

---

## Context

- **Why now:** the ledger, tiers, and badges are specified and implemented in
  [REPUTATION.md](../../../REPUTATION.md); everything needed to render already exists in
  `reputation/profiles/*.json`.
- **Depends on [FB-0005](../../design/FB-0005-visual-identity-kit/):** the cards must use the
  official palette and mark. Don't invent a look — this bounty is blocked until the identity
  kit lands.
- **Downstream:** [FB-0204](../../ecosystem/FB-0204-profiles-and-customization/) builds hosted
  profile pages. The card designed here becomes the OG image for those pages, so treat the
  layout as a spec, not a one-off.

---

## Scope

| What | Where |
| --- | --- |
| Card + badge generator | `scripts/reputation.mjs cards` |
| Generated output | `bounty-board/reputation/cards/<handle>.svg` |
| Badge sprites | `bounty-board/reputation/badges/<badge>.svg` |
| Regeneration in the post-merge job | `.github/workflows/bounty.yml` |

The card should show: handle and display name, tier symbol and name, lifetime and season REP,
progress toward the next tier, the top three tracks, badge icons, and the 𝄐 mark.

---

## Out of scope

- Not rendering PNG. SVG only — GitHub renders it, and it scales.
- Not adding a chart library, a font embed, or any dependency. System font stack with a
  documented fallback chain.
- Not building a hosted badge service (`img.shields.io`-style dynamic endpoints). That's part
  of the ecosystem work, not this.
- Not changing how REP is calculated.

---

## Acceptance criteria

- [ ] `npm run rep -- cards` generates one SVG per contributor into `reputation/cards/`,
      deterministically — running it twice on an unchanged ledger produces identical bytes.
- [ ] Each card shows handle, tier symbol and name, lifetime REP, season REP, next-tier
      progress, top three tracks, and earned badges.
- [ ] One SVG per badge in [REPUTATION.md § Badges](../../../REPUTATION.md#badges) exists in
      `reputation/badges/`, visually consistent as a set.
- [ ] Cards render correctly when embedded in a GitHub Markdown file — verified with a real
      embed screenshot in the PR — and remain legible at 400px wide.
- [ ] Cards respect the FB-0005 palette in both light and dark GitHub themes (use
      `prefers-color-scheme` inside the SVG).
- [ ] `README.md` in `bounty-board/reputation/` documents how to embed your own card.

### Bonus

- [ ] A compact `--variant slim` card (badge-strip height, ~20px) suitable for inlining in a PR
      description or a README badge row.

---

## Deliverables

1. `cards` subcommand in `scripts/reputation.mjs`.
2. `bounty-board/reputation/cards/` and `bounty-board/reputation/badges/`.
3. Embed documentation in `bounty-board/reputation/README.md`.
4. Regeneration wired into the post-merge workflow.

---

## Definition of done

- All acceptance criteria checked, with embed screenshots in both GitHub themes.
- Deterministic output confirmed by running the generator twice and diffing.
- No dependencies.
- Uses the FB-0005 identity kit; if that bounty's palette changed since, the cards match it.
- Reviewed and approved per [GOVERNANCE.md](../../../GOVERNANCE.md#review-rules).

---

## Reward

| Component | REP |
| --- | --- |
| Base | 110 |
| Bonus (slim variant) | 25 |
| Applicable multipliers | ×1.0 |

---

## Getting started

```bash
git clone https://github.com/ScottyVenable/fermata.git
cd fermata
npm run rep -- rebuild
cat bounty-board/reputation/profiles/*.json
npm run rep -- tiers
```

Files worth reading first:

- `scripts/reputation.mjs` — `cmdLeaderboard` shows how to read the folded ledger.
- `scripts/lib/bounty.mjs` — `TIERS` and `BADGE_RULES`, the two tables you're rendering.
- `bounty-board/REPUTATION.md` — the semantics behind every number on the card.

GitHub sanitises embedded SVG: no scripts, no external references, no web fonts. Everything has
to be inline, and text needs a system font stack. Test early — a card that looks perfect locally
and renders as a grey box on GitHub is the classic failure here.

---

## Notes

- Restraint wins. A card that looks like it belongs next to a shields.io badge row will get used;
  a dashboard will not.
- The tier symbols are real Unicode musical glyphs and won't render everywhere. Consider drawing
  them as paths.
