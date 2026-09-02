<div align="center">

# Soundscape AI

*A procedural ambient audio generator and spatial mixer built on the Web Audio API.*

[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-3DA639?style=flat-square&logo=gnu&logoColor=white)](../../../LICENSE)
[![Status: Experimental](https://img.shields.io/badge/status-experimental-yellow?style=flat-square)](#)
[![Category: tools/music](https://img.shields.io/badge/category-tools%2Fmusic-blueviolet?style=flat-square)](#)

</div>

Soundscape AI generates ambient soundscapes in the browser and lets you place each source on a 2D spatial canvas. Rain crackle, detuned space pads, forest bird sweeps, key echoes, and wind are all synthesized live with the Web Audio API — no audio files required.

## What this is

A single-purpose web toy. Open it, toggle sources, drag them around the canvas, adjust master volume/mute, and the app mixes a real-time ambient bed. Presets are described in `src/components/SoundCanvas.tsx` and the mixer UI lives in `src/App.tsx`.

## Run it

```bash
# From the repo root, install shared deps once:
npm ci --ignore-scripts --no-audit --no-fund

cd projects/tools/music/soundscape-ai
npm run dev        # Vite dev server (port 5175)
npm run build      # production build -> dist/
npm run preview    # preview the built app
```

Open the browser tab and press play. Audio is generated locally; no server or API keys are used.

## Status

- **Status:** experimental
- **Known gaps:** the UI is concentrated in a very large `App.tsx`; no automated tests; no saved presets or export.
- **Next ideas:** split `App.tsx`, persist a user's source layout, add shareable preset URLs, and add a light smoke test around generated sound parameters.

## Structure

- `src/App.tsx` — preset state + mixer controls.
- `src/components/SoundCanvas.tsx` — spatial drag canvas and per-source rendering hooks.
- `src/index.css` — styling.

## Stack

React 18, Vite, TypeScript, React, lucide-react, Web Audio API.

## License

GPL-3.0 — see the [repo-level LICENSE](../../../LICENSE).
