# How this template is used

The `new-project.mjs` script copies this folder into `projects/<category>/<name>/` and replaces these placeholders in every file:

| Placeholder | Replaced with |
| --- | --- |
| `{{NAME}}` | The project's folder name (lowercase, hyphenated). |
| `{{DISPLAY_NAME}}` | Human-readable name (from `--display-name` or derived). |
| `{{CATEGORY}}` | The full category path (e.g. `tools/ai`). |
| `{{CATEGORY_PATH}}` | Same as `{{CATEGORY}}` but URL-safe. |
| `{{CATEGORY_BADGE}}` | The category formatted for the shield badge (slashes → dots). |
| `{{AUTHOR_NAME}}` | Author name from git config or `--author`. |
| `{{AUTHOR_GITHUB}}` | GitHub username if known. |
| `{{CREATED}}` | ISO date the project was scaffolded. |

After substitution, this file (`README_TEMPLATE_NOTES.md`) is *not* copied into the new project — it's filtered out by the script.

If you're copying the template manually, do the replacements yourself and delete this file from your project copy.
