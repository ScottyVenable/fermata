# `fermata.json` — Metadata Spec

Every project has a `fermata.json` at its root. It's the single source of truth that validation, organization, and dependency tooling read from.

## Minimum viable example

```json
{
  "name": "my-thing",
  "displayName": "My Thing",
  "description": "One-line description.",
  "category": "tools/ai",
  "status": "active",
  "platforms": ["web"],
  "authors": [
    { "name": "Scotty Venable", "github": "ScottyVenable", "role": "creator" }
  ],
  "license": "GPL-3.0",
  "created": "2026-05-20"
}
```

## Full example

```json
{
  "name": "prompt-sandbox",
  "displayName": "Prompt Sandbox",
  "description": "A scratchpad for iterating on Claude prompts side-by-side.",
  "category": "tools/ai",
  "status": "active",
  "platforms": ["web"],
  "tags": ["llm", "claude", "prompting"],
  "authors": [
    { "name": "Scotty Venable", "github": "ScottyVenable", "role": "creator" },
    { "name": "Jane Doe", "github": "janedoe", "role": "contributor" }
  ],
  "license": "GPL-3.0",
  "created": "2026-05-20",
  "updated": "2026-05-21",
  "entry": "index.html",
  "stack": ["html", "js", "vite"],
  "dependencies": {
    "shared": ["react", "vite"],
    "external": {
      "marked": "^12.0.0"
    }
  },
  "links": {
    "demo": "https://example.com/prompt-sandbox",
    "writeup": "https://example.com/posts/prompt-sandbox"
  }
}
```

## Field reference

### Required

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | Lowercase, hyphenated. Must equal the folder name. `^[a-z][a-z0-9-]*$` |
| `displayName` | string | Human-readable. 1–80 chars. |
| `description` | string | One line. 10–280 chars. |
| `category` | string | One of: `games`, `tools/productivity`, `tools/ai`, `tools/music`, `tools/dev`, `web`, `experiments`, `docs`. Must match folder placement. |
| `status` | enum | `experimental` \| `active` \| `paused` \| `stable` \| `archived` |
| `platforms` | string[] | Non-empty. Allowed: `windows`, `macos`, `linux`, `web`, `ios`, `android`, `cli`, `all`. |
| `authors` | object[] | At least one. See [authors](#authors). |
| `license` | string | Must be `GPL-3.0`. Locked to match the repo. |
| `created` | string | ISO date (`YYYY-MM-DD`). Set once, never changes. |

### Optional

| Field | Type | Notes |
| --- | --- | --- |
| `updated` | string | ISO date. Auto-bumped by `organize` on merge. |
| `tags` | string[] | Free-form. Lowercase, hyphenated. Used by indices. |
| `entry` | string | Relative path to the project's entry point (`index.html`, `main.py`, etc.). |
| `stack` | string[] | Lowercase tech identifiers (`react`, `vite`, `python`, etc.). |
| `dependencies` | object | See [dependencies](#dependencies). |
| `links` | object | Free-form key/value of URLs (`demo`, `writeup`, `video`, etc.). |
| `archived_reason` | string | Required iff `status === "archived"`. One sentence. |

### `authors`

```json
{ "name": "Scotty Venable", "github": "ScottyVenable", "role": "creator" }
```

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Required. Display name. |
| `github` | string | Optional. Username, without the `@`. |
| `role` | enum | Required. `creator` \| `contributor` \| `maintainer`. Exactly one `creator` per project. |
| `email` | string | Optional. |

### `dependencies`

```json
{
  "shared": ["react", "vite"],
  "external": {
    "marked": "^12.0.0"
  }
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `shared` | string[] | Names from `shared/dependencies/manifest.json`. Validation fails if unknown. |
| `external` | object | name → semver range. For deps you want isolated to this project. |

See [DEPENDENCIES.md](DEPENDENCIES.md) for the resolution model.

## Validation rules summary

The `validate` script enforces, in order:

1. `fermata.json` exists at every project root under `projects/`.
2. `fermata.json` is valid JSON.
3. All required fields present and correctly typed.
4. `name` matches folder name.
5. `category` matches folder placement.
6. `license === "GPL-3.0"`.
7. Exactly one author with `role: "creator"`.
8. Every `dependencies.shared` entry exists in `shared/dependencies/manifest.json`.
9. If `status === "archived"`, `archived_reason` is set.
10. `created` is a valid ISO date and not in the future.

Each failure is reported with the project path, the field, and what was expected. Multiple failures across multiple projects are surfaced together so you can fix them in one pass.

## Why JSON (not TOML/YAML)?

- Universal tooling support — every language and editor handles it.
- No whitespace ambiguity.
- The script reads it with `JSON.parse`. Zero dependencies.

If JSON proves painful for hand-editing, we'll add a `fermata.toml` alternative — but only when there's a real need.
