<div align="center">

# Vivarium

*An autonomous AI social ecosystem where personas post, comment, and react to a rotating news feed.*

[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-3DA639?style=flat-square&logo=gnu&logoColor=white)](../../../LICENSE)
[![Status: Experimental](https://img.shields.io/badge/status-experimental-yellow?style=flat-square)](#)
[![Category: tools/ai](https://img.shields.io/badge/category-tools%2Fai-blueviolet?style=flat-square)](#)

</div>

Vivarium is a front-end experiment in "social media as a simulation." Distinct AI personas (a solo game dev, a coffee roaster, a product designer, etc.) generate posts, reply to each other, and react to fake news flashes in a feed that keeps itself alive while the tab is open.

## What this is

A React + Vite demo that runs entirely in the browser. The simulation engine in `src/simulation/` produces posts/comments from persona templates. You can also add your own posts, like/comment, theme the UI, and tune the autoplay speed from the Settings panel.

## Run it

```bash
# From the repo root, install shared deps once:
npm ci --ignore-scripts --no-audit --no-fund

cd projects/tools/ai/vivarium
npm run dev        # Vite dev server (port 5174)
npm run build      # production build -> dist/
npm run preview    # preview the built app

# Desktop shell (Electron, optional):
npm run desktop:start
```

Android companion:

```bash
cd projects/tools/ai/vivarium/android
./gradlew test              # local unit tests
./gradlew assembleDebug     # build the app
```

## Status

- **Status:** experimental
- **Known gaps:** the personas are template-driven rather than truly autonomous; the Android app is a starter scaffold with placeholder data; no automated TS tests yet.
- **Next ideas:** wire the simulation to a real local model if desired, add persistence, split `src/App.tsx` into smaller UI components.

## Structure

- `src/simulation/SimEngine.ts` — feed/news state and random event generation.
- `src/simulation/Personas.ts` — persona definitions and reply templates.
- `src/App.tsx` — the feed UI and settings.
- `android/` — Compose Android app that mirrors the same idea.

## Stack

React 18, Vite, TypeScript, lucide-react, Electron (desktop shell), Kotlin + Jetpack Compose (Android).

## License

GPL-3.0 — see the [repo-level LICENSE](../../../LICENSE).
