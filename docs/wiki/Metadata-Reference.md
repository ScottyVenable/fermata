# Metadata Reference

Quick reference for `fermata.json`. Full spec lives at [`docs/METADATA_SPEC.md`](https://github.com/ScottyVenable/fermata/blob/main/docs/METADATA_SPEC.md).

## Minimum example

```json
{
  "name": "my-thing",
  "displayName": "My Thing",
  "description": "One-line description.",
  "category": "tools/ai",
  "status": "experimental",
  "platforms": ["web"],
  "authors": [
    { "name": "Scotty Venable", "github": "ScottyVenable", "role": "creator" }
  ],
  "license": "GPL-3.0",
  "created": "2026-05-20"
}
```

## Field cheatsheet

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | Lowercase, hyphenated. Must equal folder name. |
| `displayName` | yes | Human-readable. 1–80 chars. |
| `description` | yes | One line. 10–280 chars. |
| `category` | yes | From the allowed list. Must match folder placement. |
| `status` | yes | `experimental` / `active` / `paused` / `stable` / `archived`. |
| `platforms` | yes | Array of: `windows`, `macos`, `linux`, `web`, `ios`, `android`, `cli`, `all`. |
| `authors` | yes | Array of `{name, role, github?, email?}`. Exactly one `creator`. |
| `license` | yes | Must be `GPL-3.0`. |
| `created` | yes | ISO date (`YYYY-MM-DD`). Set once. |
| `updated` | no | ISO date. Auto-bumped on merge by the organize workflow. |
| `tags` | no | Free-form lowercase strings. |
| `entry` | no | Path to the project's main file. |
| `stack` | no | Lowercase tech identifiers. |
| `dependencies.shared` | no | Names from the registry. Validation fails if unknown. |
| `dependencies.external` | no | name → semver. Project-local deps. |
| `links` | no | Free-form `key → url`. |
| `archived_reason` | iff archived | One sentence. |

## What validation enforces

In rough order:

1. File exists and is valid JSON.
2. All required fields present and typed correctly.
3. `name` matches folder name.
4. `category` matches folder placement.
5. `license === "GPL-3.0"`.
6. Exactly one `creator` in `authors`.
7. Every `dependencies.shared` entry is in the registry.
8. `created` is a valid past ISO date.
9. If `status === "archived"`, `archived_reason` is set.

Failures include the project path and the specific field, so a fix is a single read.
