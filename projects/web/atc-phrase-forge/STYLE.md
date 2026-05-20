# Style — ATC Phrase Forge

Visual, code, and interaction conventions for ATC Phrase Forge. Short by design.

## Visual

- **Palette** — semantic, color-coded by chip category:
  - Tower callsign → `bg-indigo-100 text-indigo-800 ring-indigo-300`
  - Aircraft / plane → `bg-blue-100 text-blue-800 ring-blue-300`
  - Wind / weather → `bg-amber-100 text-amber-900 ring-amber-300`
  - Runway data → `bg-green-100 text-green-800 ring-green-300`
  - Action / instruction → `bg-rose-100 text-rose-800 ring-rose-300`
  - Empty slot → dashed `border-slate-300` over `bg-slate-50`
  - App chrome → `slate-50` background, `slate-900` text, `slate-200` borders
- **Typography** — corporate sans-serif stack. **Do not use the `Inter` typeface.** Stack:
  `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
  Weights used: 400, 500, 600, 700.
- **Spacing** — Tailwind defaults; base unit 4px. Section padding `p-4`; tap targets minimum 44×44px (`min-h-[44px] min-w-[44px]`).
- **Iconography** — FontAwesome 6 Free (via CDN). Use solid for nav, regular elsewhere when available.
- **Elevation** — flat surfaces with `ring-1 ring-slate-200` and `rounded-2xl` for cards/sheets; no heavy shadows except the bottom-sheet (`shadow-2xl`).

## Code

- **Language** — vanilla ES2020+ JavaScript embedded in `index.html`. No build step. No framework.
- **Formatter** — 2-space indent, single quotes, semicolons, trailing commas where syntactically valid.
- **Structure** — one `App` module pattern (IIFE) containing: `state`, `storage`, `render`, `views`, `events`, `util`. Keep DOM access scoped to the active view.
- **State** — single global `state` object, persisted to `localStorage` under the key `atc-phrase-forge:v1`.
- **Naming** — `camelCase` for vars/functions, `PascalCase` for view names, `kebab-case` for ids/classes.
- **Comments** — explain *why*, not *what*. Required at the top of each view function.

## Interaction

- **Navigation** — fixed bottom nav with 6 tabs. Active tab marked by color + icon weight.
- **Slot-and-Tray** — tap an empty slot → bottom sheet slides up with eligible chips → tap a chip to fill → sheet closes. No drag-and-drop, anywhere.
- **Long-press** — 500ms hold on a populated chip opens its glossary modal. Desktop equivalent: `contextmenu`.
- **Feedback** — `Transmit` button disabled until every slot is filled; tinted disabled state. Success/error in Challenge mode shows an inline banner above the builder.
- **Reset** — submitting a phrase logs to history and immediately resets the builder for the next call.

---

*Edit freely as the app evolves; keep the color/chip mapping authoritative — it's the project's whole pedagogy.*
