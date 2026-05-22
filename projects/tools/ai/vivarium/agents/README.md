# agents/

Pre-wired files for vibe-coding with agents. Delete the ones you don't use.

| File | Tool it targets | Notes |
| --- | --- | --- |
| `CLAUDE.md` | Claude Code | Read automatically when running `claude` in this directory. |
| `AGENTS.md` | Generic / Codex / others that respect `AGENTS.md` | Treat as fallback when no tool-specific file is present. |

To add support for another tool:

- **Cursor:** create `.cursor/rules` (or `.cursorrules`) at the project root, not in `agents/`. Cursor doesn't traverse `agents/` by default.
- **GitHub Copilot:** create `.github/copilot-instructions.md` at the project root.
- **Aider / Continue / etc.:** check the tool's docs for its convention.

The point of this folder is to keep agent files visible and grouped where it's not a project root convention; tool-specific files that *must* live at the project root should still go there.
