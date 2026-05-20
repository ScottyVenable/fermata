#!/usr/bin/env node
// Scaffolds a new project by copying template/ into projects/<category>/<name>/
// and replacing placeholders.
//
// Usage:
//   node scripts/new-project.mjs --name my-thing --category tools/ai
//   node scripts/new-project.mjs --name my-thing --category games --display-name "My Thing" --platforms web,desktop
//
// Flags:
//   --name           Required. Folder name, lowercase + hyphens.
//   --category       Required. e.g. tools/ai, games, web.
//   --display-name   Human-readable name. Default: derived from --name.
//   --platforms      Comma-separated. Default: web.
//   --author         Author display name. Default: from git config user.name.
//   --github         GitHub username. Default: from git config (best-effort).
//   --no-agents      Skip the agents/ folder.
//   --no-todo        Skip TODO.md.
//   --no-style       Skip STYLE.md.

import { execSync } from 'node:child_process';
import { readdir, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';

import {
  REPO_ROOT, PROJECTS_DIR, TEMPLATE_DIR,
  ALLOWED_CATEGORIES,
  ensureDir, copyDir, readJson, writeJson,
  parseArgs, color, today, isValidName,
} from './lib/repo.mjs';

const args = parseArgs(process.argv.slice(2));

function fail(msg) {
  console.error(color('red', 'error: ') + msg);
  process.exit(1);
}

const name = args.name;
const category = args.category;

if (!name) fail('--name is required.');
if (!isValidName(name)) fail(`--name "${name}" must match /^[a-z][a-z0-9-]*$/.`);
if (!category) fail('--category is required. See docs/CATEGORIES.md.');
if (!ALLOWED_CATEGORIES.has(category)) {
  fail(`--category "${category}" is not allowed. Allowed: ${[...ALLOWED_CATEGORIES].join(', ')}.`);
}

const projectDir = join(PROJECTS_DIR, ...category.split('/'), name);
if (existsSync(projectDir)) {
  fail(`Project already exists at projects/${category}/${name}/.`);
}

const displayName = args['display-name'] || toTitle(name);
const platforms = (args.platforms || 'web').split(',').map((s) => s.trim()).filter(Boolean);
const authorName = args.author || tryGit('user.name') || 'Anonymous';
const githubUser = args.github || tryGitGithub() || '';
const created = today();

const replacements = {
  '{{NAME}}': name,
  '{{DISPLAY_NAME}}': displayName,
  '{{CATEGORY}}': category,
  '{{CATEGORY_PATH}}': category,
  '{{CATEGORY_BADGE}}': category.replace(/\//g, '%2F'),
  '{{AUTHOR_NAME}}': authorName,
  '{{AUTHOR_GITHUB}}': githubUser || authorName.replace(/\s+/g, ''),
  '{{CREATED}}': created,
};

const SKIP_FROM_TEMPLATE = new Set(['README_TEMPLATE_NOTES.md']);
if (args['no-agents']) SKIP_FROM_TEMPLATE.add('agents');
if (args['no-todo']) SKIP_FROM_TEMPLATE.add('TODO.md');
if (args['no-style']) SKIP_FROM_TEMPLATE.add('STYLE.md');

console.log(color('cyan', `Scaffolding ${name} → projects/${category}/${name}/`));

await copyDir(TEMPLATE_DIR, projectDir, {
  skip: (relPath) => {
    const top = relPath.split(sep)[0];
    return SKIP_FROM_TEMPLATE.has(top) || SKIP_FROM_TEMPLATE.has(relPath);
  },
});

await applyReplacements(projectDir, replacements);

// Patch fermata.json with the real platforms array (replacements are string-based).
const metaPath = join(projectDir, 'fermata.json');
const meta = await readJson(metaPath);
meta.platforms = platforms;
await writeJson(metaPath, meta);

console.log(color('green', '\nDone.'));
console.log('');
console.log(`  cd ${relative(process.cwd(), projectDir) || '.'}`);
console.log('  # edit fermata.json, write your README, start building');
console.log('');
console.log(color('gray', 'Run `npm run validate` to confirm everything is wired up.'));

// ---------- helpers ----------

async function applyReplacements(dir, repl) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      await applyReplacements(p, repl);
    } else if (e.isFile()) {
      let content = await readFile(p, 'utf8');
      let changed = false;
      for (const [from, to] of Object.entries(repl)) {
        if (content.includes(from)) {
          content = content.split(from).join(to);
          changed = true;
        }
      }
      if (changed) await writeFile(p, content, 'utf8');
    }
  }
}

function tryGit(key) {
  try {
    return execSync(`git config --get ${key}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || null;
  } catch {
    return null;
  }
}

function tryGitGithub() {
  // Best-effort: parse from remote URL if it's github.
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const m = url.match(/github\.com[:\/]([^\/]+)\//);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function toTitle(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
