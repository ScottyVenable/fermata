// Shared helpers for Fermata's tooling scripts.
// No external dependencies — Node 18+ built-ins only.

import { readFile, writeFile, readdir, stat, mkdir, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, relative, sep, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..');
export const PROJECTS_DIR = join(REPO_ROOT, 'projects');
export const TEMPLATE_DIR = join(REPO_ROOT, 'template');
export const MANIFEST_PATH = join(REPO_ROOT, 'shared', 'dependencies', 'manifest.json');

export const ALLOWED_CATEGORIES = new Set([
  'games',
  'tools/productivity',
  'tools/ai',
  'tools/music',
  'tools/dev',
  'web',
  'experiments',
  'docs',
]);

export const ALLOWED_PLATFORMS = new Set([
  'windows', 'macos', 'linux', 'web', 'ios', 'android', 'cli', 'all',
]);

export const ALLOWED_STATUSES = new Set([
  'experimental', 'active', 'paused', 'stable', 'archived',
]);

export const ALLOWED_ROLES = new Set(['creator', 'contributor', 'maintainer']);

export const REQUIRED_LICENSE = 'GPL-3.0';

// ---------- IO ----------

export async function readJson(path) {
  const raw = await readFile(path, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON at ${relative(REPO_ROOT, path)}: ${err.message}`);
  }
}

export async function writeJson(path, value) {
  await writeFile(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

export async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

export async function copyDir(src, dest, { skip = () => false } = {}) {
  await ensureDir(dest);
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (skip(relative(TEMPLATE_DIR, srcPath))) continue;
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, { skip });
    } else if (entry.isFile()) {
      await copyFile(srcPath, destPath);
    }
  }
}

// ---------- project discovery ----------

// Walks projects/ and returns every directory that contains a fermata.json.
export async function findProjects() {
  const projects = [];
  await walk(PROJECTS_DIR, projects);
  return projects;
}

async function walk(dir, out) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  // If this directory itself contains fermata.json, it's a project root.
  if (entries.some((e) => e.isFile() && e.name === 'fermata.json')) {
    out.push(dir);
    return; // Don't recurse into a project.
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    if (entry.name === 'node_modules') continue;
    await walk(join(dir, entry.name), out);
  }
}

// The category path the project lives at, derived from its filesystem location.
export function categoryFromPath(projectPath) {
  const rel = relative(PROJECTS_DIR, projectPath);
  const parts = rel.split(sep);
  return parts.slice(0, parts.length - 1).join('/');
}

export function projectNameFromPath(projectPath) {
  return relative(PROJECTS_DIR, projectPath).split(sep).pop();
}

// ---------- CLI args ----------

export function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i];
    if (tok.startsWith('--')) {
      const eq = tok.indexOf('=');
      if (eq !== -1) {
        args[tok.slice(2, eq)] = tok.slice(eq + 1);
      } else {
        const next = argv[i + 1];
        if (next === undefined || next.startsWith('--')) {
          args[tok.slice(2)] = true;
        } else {
          args[tok.slice(2)] = next;
          i++;
        }
      }
    } else {
      args._.push(tok);
    }
  }
  return args;
}

// ---------- console formatting ----------

const COLOR_RESET = '[0m';
const COLORS = {
  red: '[31m',
  green: '[32m',
  yellow: '[33m',
  cyan: '[36m',
  gray: '[90m',
  bold: '[1m',
};

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;

export function color(name, str) {
  if (!useColor) return str;
  return `${COLORS[name]}${str}${COLOR_RESET}`;
}

export function header(str) {
  return color('bold', str);
}

// ---------- misc ----------

export function today() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isValidName(name) {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

export function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00Z');
  return !Number.isNaN(d.getTime());
}

export function fileExists(path) {
  return existsSync(path);
}

export { readFile, writeFile, readdir, stat, mkdir, dirname, join, relative, resolve };
