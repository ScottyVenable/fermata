<div align="center">

# Antigravity IDE

*An agentic development environment prototype with a file-tree, an agent console, and a desktop sync server.*

[![License: GPL v3](https://img.shields.io/badge/License-GPL_v3-3DA639?style=flat-square&logo=gnu&logoColor=white)](../../../LICENSE)
[![Status: Experimental](https://img.shields.io/badge/status-experimental-yellow?style=flat-square)](#)
[![Category: tools/dev](https://img.shields.io/badge/category-tools%2Fdev-blueviolet?style=flat-square)](#)

</div>

Antigravity IDE is an experimental workspace UI for working with a local coding agent. It presents a mock project tree, an editor, and an agent console. Point it at Ollama or LM Studio in Settings and it will stream a step-by-step agent loop back into the UI; the desktop shell also hosts a tiny WebSocket sync server for pairing with the Android companion.

## What this is

A React + Vite web app with an optional Electron desktop shell. The agent loop is asynchronous and tool-shaped (`READ_FILE`, `WRITE_FILE`, `LIST_DIR`, `RUN_COMMAND`), so it can be swapped for real local-model input later. The Android app is a Compose companion that shows the same product idea.

## Run it

```bash
# From the repo root, install shared deps once:
npm ci --ignore-scripts --no-audit --no-fund

cd projects/tools/dev/antigravity-ide
npm run dev        # Vite dev server (port 5173)
npm run build      # production build -> dist/
npm run preview    # preview the built app

# Desktop shell (Electron, optional):
npm run desktop:start
```

The desktop shell starts a local WebSocket sync server on port **3001** for mobile pairing. This is intended for local/experimental use only.

Android companion:

```bash
cd projects/tools/dev/antigravity-ide/android
./gradlew test              # local unit tests
./gradlew assembleDebug     # build the app
```

## Status

- **Status:** experimental
- **Known gaps:** the sync server is unauthenticated and the Electron window uses permissive web preferences; the mobile app is a scaffold; the mock project tree is intentionally fake.
- **Next ideas:** harden the Electron window (context isolation + no node integration), add auth or bind the sync server to loopback, and feed real files from disk.

## Structure

- `src/agent/AgentLoop.ts` — the agent step loop and tool definitions.
- `src/agent/LocalAI.ts` — local-model connection helper.
- `src/components/` — Editor, Sidebar, AgentConsole, Settings.
- `desktop.js` — Electron shell + WebSocket sync server.
- `android/` — Compose Android companion.

## Stack

React 18, Vite, TypeScript, lucide-react, Electron, `ws`, Kotlin + Jetpack Compose (Android).

## License

GPL-3.0 — see the [repo-level LICENSE](../../../LICENSE).
