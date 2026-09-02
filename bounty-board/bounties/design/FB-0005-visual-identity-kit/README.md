# FB-0005: Fermata visual identity kit and badge system

> **Track** `design` · **Size** `m` · **Difficulty** `intermediate` · **Reward** `160 REP` (+40 bonus)
> **Status** `open` · **Claim TTL** 21 days · **Epic** —

---

## Summary

Fermata has a strong name, a strong metaphor, and no visual identity — the README leans on
shields.io defaults and a lone 𝄐 character. Produce a small, coherent identity kit: a mark, a
palette, a type pairing, a badge set, and a social card generator. Everything downstream (the
website, the Windows app, the project gallery) will inherit from this, so it's worth getting
right before those exist rather than after.

---

## Context

- **Why now:** [EPIC-001](../../../epics/EPIC-001-fermata-ecosystem/) builds a website and a
  desktop app. Both need a design language on day one, and retrofitting brand onto shipped UI
  is miserable.
- **The metaphor to work with:** a fermata (𝄐) is a hold — an eye over a note, telling the
  performer to sustain it as long as they choose. That's *pause with intent*, not *stop*. The
  mark should feel patient rather than urgent.
- **Constraint:** the repo's existing aesthetic is understated — flat shields, no gradients,
  a lot of whitespace. Evolve it; don't replace it with something loud.

---

## Scope

| What | Where |
| --- | --- |
| Primary mark + wordmark, light and dark | `shared/assets/brand/` |
| Colour palette with tokens and contrast data | `shared/assets/brand/palette.json` |
| Type pairing (open-licence fonts only) | `shared/assets/brand/BRAND.md` |
| Badge set matching the README's existing shields | `shared/assets/brand/badges/` |
| Social/OG card template | `shared/assets/brand/social/` |
| Usage guide | `shared/assets/brand/BRAND.md` |

---

## Out of scope

- Not redesigning the README's structure or copy. Swapping badge images is fine; rewriting
  sections is not.
- Not designing the website or app UI. This is the kit those will draw from, not the screens.
- Not producing raster-only assets. SVG source is required; PNG exports are a convenience.
- Not proposing a name change or a new metaphor. The fermata stays.

---

## Acceptance criteria

- [ ] A primary mark exists as SVG, legible at 16px (favicon) and 512px (app icon), in light
      and dark variants.
- [ ] A wordmark exists as SVG, with the mark locked up beside the word "Fermata" at a defined
      clear-space ratio.
- [ ] `palette.json` defines named tokens (at minimum: background, surface, text, muted,
      accent, success, warning, danger) for light and dark, and every text-on-background pair
      documented in it meets WCAG AA (4.5:1).
- [ ] The type pairing uses fonts with an open licence (OFL or similar), named with links, and
      the licence text is vendored under `shared/assets/brand/fonts/`.
- [ ] A badge set covering the README's current six badges is provided, visually consistent
      with each other, and the README renders correctly with them substituted in.
- [ ] `BRAND.md` documents the mark, palette, type, spacing, and — importantly — what **not**
      to do with the mark.
- [ ] All source files are SVG (or an editable open format); no binary-only deliverables.

### Bonus

- [ ] A `scripts/social-card.mjs` that renders a 1200×630 OG image for any project from its
      `fermata.json`, so every project gets a decent link preview automatically.

---

## Deliverables

1. `shared/assets/brand/` containing marks, wordmark, palette, fonts, badges, social template.
2. `shared/assets/brand/BRAND.md`.
3. A PR-attached contact sheet showing every asset at real size, light and dark.

---

## Definition of done

- All acceptance criteria checked, with the contact sheet in the PR.
- Every asset is original work or provably open-licensed, with provenance stated in the PR.
- Assets are GPL-3.0 compatible or explicitly CC-BY-SA-4.0, noted in `BRAND.md`.
- Reviewed and approved by a maintainer — this bounty is labelled `human-judgment` and is not
  open to bot claims.

---

## Reward

| Component | REP |
| --- | --- |
| Base | 160 |
| Bonus (social card generator) | 40 |
| Applicable multipliers | ×1.0 |

---

## Getting started

Read `README.md` for the voice, and note the existing shield colours — `#3DA639` for the
licence, `#ff7f50` for contributions, `#blueviolet` for projects. There's a palette hiding in
there already; consider formalising it rather than starting over.

Post two or three directions as images on the claim PR **before** building out the full kit.
Design bounties fail when the first review is also the first look. Early feedback is expected
here and does not count against your TTL.

---

## How to claim

```bash
npm run bounty -- claim FB-0005 --who yourhandle
```

---

## Notes

- The 𝄐 glyph is a fermata over a note. A literal reproduction is the obvious answer and
  probably the right one — but show us the non-obvious ones too.
- Accessibility is a hard requirement, not a nice-to-have. A palette that fails contrast will
  be rejected no matter how good it looks.
