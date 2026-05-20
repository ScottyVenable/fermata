<div align="center">

# ATC Phrase Forge

*A mobile-first sandbox for practicing Air Traffic Control phraseology — tap, build, transmit.*

[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-3DA639?style=flat-square&logo=gnu&logoColor=white)](../../../LICENSE)
[![Status: Experimental](https://img.shields.io/badge/status-experimental-yellow?style=flat-square)](#)
[![Category: web](https://img.shields.io/badge/category-web-blueviolet?style=flat-square)](#)
[![Platform: Web](https://img.shields.io/badge/platform-web-1f6feb?style=flat-square&logo=html5&logoColor=white)](#)
[![Built with: Tailwind](https://img.shields.io/badge/built_with-Tailwind_CSS-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](#)

</div>

> A self-contained single-page web app that helps a beginner pilot or aviation enthusiast practice ATC radio call structure. You construct responses by tapping colored "chips" into "slots" — no drag-and-drop, no friction, no setup.

---

## What this is

ATC Phrase Forge simulates the loop a pilot lives in: a tower-generated transmission arrives, you assemble a correct readback using the right callsigns, runways, winds, and instructions, and you transmit. The app ships an aircraft database, a glossary, a quiz mode, and a per-aircraft transmission log so each "conversation" with a virtual plane feels continuous.

Everything is color-coded by **what the chip represents** (callsign, plane, wind, runway, action) so the visual language of an ATC call becomes muscle memory.

The whole app is one `index.html` — Tailwind via CDN, FontAwesome via CDN, vanilla JS state. No build step. No server. Open it and go.

## Quick start

```bash
cd projects/web/atc-phrase-forge
# Just open the file in a browser:
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows

# Or serve it (any static server works):
npx serve .
python3 -m http.server 8000
```

Then open it on your phone (same Wi-Fi, point at your machine's IP) — that's the intended target.

## How it works

- **Slot-and-Tray** instead of HTML5 drag-and-drop. Empty dashed boxes ("slots") are taps; tapping opens a bottom-sheet "tray" with the eligible chips. Tap a chip → slot filled, tray closes. Mobile-friendly by design.
- **Color-coded chips** map a single semantic category to a single color, so glance-reading a phrase reveals its structure:
  - Tower callsign → indigo
  - Aircraft → blue
  - Wind → amber
  - Runway → green
  - Action / instruction → rose
- **Long-press tooltips.** Touch-and-hold (or right-click on desktop) any populated chip to open a modal definition pulled from the glossary.
- **State persistence.** Planes, history, settings, and glossary all live in `localStorage`, so refreshes don't wipe progress.
- **Six views**, switched via a fixed bottom nav:
  1. **Practice Builder** — generate a scenario, build the correct response.
  2. **Challenge** — quiz mode with trap chips and a correctness check.
  3. **Aircraft Database** — add custom callsigns, or auto-generate valid N-numbers.
  4. **History** — every transmitted phrase, grouped by aircraft callsign.
  5. **Glossary** — the dictionary that powers tooltips.
  6. **Settings** — set your custom tower callsign.

## Features

- Mobile-first responsive layout with bottom navigation, 44×44px+ tap targets, no horizontal scroll.
- Random scenario engine (random plane, wind direction & speed, active runway).
- Strict slot/chip color palette mapped to ATC semantics.
- Bottom-sheet "tray" for chip selection (no drag-and-drop required anywhere).
- Long-press tooltips on every populated chip, sourced from a built-in glossary.
- Aircraft database with manual entry plus a valid N-number generator.
- Per-callsign transmission history with single-entry delete and clear-all.
- Customizable tower callsign that propagates across all builders.
- Zero dependencies to install — Tailwind and FontAwesome load from CDN.

## Stack

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#)
[![FontAwesome](https://img.shields.io/badge/FontAwesome-528DD7?style=flat-square&logo=fontawesome&logoColor=white)](#)

## Status & roadmap

Current status: **Experimental**. See [`TODO.md`](TODO.md) for what's next.

## Credits

Created by Scotty Venable ([@ScottyVenable](https://github.com/ScottyVenable)).

Contributors:

- (Add yourself here when you contribute.)

## License

GPL-3.0 — see the [repo-level LICENSE](../../../LICENSE). All projects in Fermata share the same license.

## Disclaimer

ATC Phrase Forge is a **practice tool**, not a training authority. Phraseology is simplified for learning and may diverge from current FAA/ICAO authoritative sources. Do not use it as a substitute for real flight training or the AIM.
