#!/usr/bin/env node
// Manage shared dependencies and link them into a project's fermata.json.
//
// Subcommands (implicit, picked by flags):
//   list                   `npm run deps -- list`
//   add a shared dep       `npm run add-dep -- --project my-thing --dep react`
//   register a new dep     `npm run add-dep -- --register react-three-fiber --version ^8.16.0 --description "R3F"`
//   remove from project    `npm run add-dep -- --project my-thing --dep react --remove`

import { join, relative } from 'node:path';

import {
  REPO_ROOT, PROJECTS_DIR, MANIFEST_PATH,
  readJson, writeJson, findProjects, projectNameFromPath,
  parseArgs, color, header,
} from './lib/repo.mjs';

const args = parseArgs(process.argv.slice(2));
const subcommand = args._[0] || pickSubcommand(args);

const manifest = await readJson(MANIFEST_PATH);
manifest.registry = manifest.registry || {};

if (subcommand === 'list') {
  await listDeps();
} else if (args.register) {
  await registerDep();
} else if (args.project && args.dep) {
  if (args.remove) {
    await removeFromProject();
  } else {
    await addToProject();
  }
} else {
  printHelp();
  process.exit(args._.length === 0 ? 0 : 1);
}

// ----------------------------------------------------------

function pickSubcommand(a) {
  if (a.register) return 'register';
  if (a.project && a.dep) return 'project';
  return 'help';
}

function printHelp() {
  console.log(`${header('add-dependency')} — manage Fermata's shared dependency registry.

Subcommands:

  ${color('cyan', 'list')}
    npm run deps -- list

  ${color('cyan', 'register')} a new shared dep
    npm run add-dep -- --register <name> --version "<semver>" --description "<one line>" [--kind npm] [--tags a,b]

  ${color('cyan', 'add')} a shared dep to a project
    npm run add-dep -- --project <name-or-path> --dep <dep>

  ${color('cyan', 'remove')} a shared dep from a project
    npm run add-dep -- --project <name-or-path> --dep <dep> --remove

Examples:

  npm run deps -- list
  npm run add-dep -- --register marked --version ^12.0.0 --description "Markdown parser"
  npm run add-dep -- --project my-thing --dep marked
`);
}

async function listDeps() {
  const entries = Object.entries(manifest.registry);
  if (entries.length === 0) {
    console.log(color('gray', 'No shared deps registered yet.'));
    console.log(color('gray', 'Add one with: npm run add-dep -- --register <name> --version "<semver>" --description "<one line>"'));
    return;
  }
  entries.sort(([a], [b]) => a.localeCompare(b));
  console.log(header(`Shared dependencies (${entries.length}):\n`));
  const nameWidth = Math.max(...entries.map(([n]) => n.length));
  const verWidth = Math.max(...entries.map(([, m]) => (m.version || '').length));
  for (const [name, m] of entries) {
    const tagSuffix = m.tags && m.tags.length ? color('gray', `  [${m.tags.join(', ')}]`) : '';
    console.log(`  ${color('cyan', name.padEnd(nameWidth))}  ${m.version.padEnd(verWidth)}  ${m.description}${tagSuffix}`);
  }
}

async function registerDep() {
  const name = args.register === true ? args.dep : args.register;
  if (!name || typeof name !== 'string') {
    fail('--register requires a dep name.');
  }
  if (manifest.registry[name]) {
    fail(`"${name}" is already registered (version ${manifest.registry[name].version}). Edit shared/dependencies/manifest.json directly to change it.`);
  }
  const version = args.version;
  const description = args.description;
  if (!version) fail('--version is required when registering. Use a semver range like "^12.0.0".');
  if (!description) fail('--description is required when registering.');

  const kind = args.kind || 'npm';
  if (!['npm', 'pip', 'cargo'].includes(kind)) {
    fail(`--kind must be one of: npm, pip, cargo (got "${kind}").`);
  }

  const entry = { version, kind, description };
  if (args.tags) entry.tags = args.tags.split(',').map((s) => s.trim()).filter(Boolean);
  if (args.notes) entry.notes = args.notes;

  manifest.registry[name] = entry;
  manifest.registry = sortKeys(manifest.registry);
  await writeJson(MANIFEST_PATH, manifest);

  console.log(`${color('green', 'registered')} ${name}@${version} (${kind})`);

  if (kind === 'npm') {
    console.log('');
    console.log(color('gray', 'Next: install it in the root so projects can resolve it.'));
    console.log(color('gray', `  npm install ${name}@"${version}"`));
  }
}

async function addToProject() {
  const dep = args.dep;
  const project = await resolveProject(args.project);
  if (!manifest.registry[dep]) {
    fail(`"${dep}" is not registered. Register it first:\n  npm run add-dep -- --register ${dep} --version "<semver>" --description "<one line>"`);
  }
  const metaPath = join(project.dir, 'fermata.json');
  const meta = await readJson(metaPath);
  meta.dependencies = meta.dependencies || {};
  meta.dependencies.shared = meta.dependencies.shared || [];
  if (meta.dependencies.shared.includes(dep)) {
    console.log(color('gray', `${dep} is already a dep of ${meta.name}.`));
    return;
  }
  meta.dependencies.shared.push(dep);
  meta.dependencies.shared.sort();
  await writeJson(metaPath, meta);
  console.log(`${color('green', 'added')} ${dep} → ${relative(REPO_ROOT, project.dir)}`);
}

async function removeFromProject() {
  const dep = args.dep;
  const project = await resolveProject(args.project);
  const metaPath = join(project.dir, 'fermata.json');
  const meta = await readJson(metaPath);
  const shared = meta.dependencies?.shared;
  if (!Array.isArray(shared) || !shared.includes(dep)) {
    console.log(color('gray', `${dep} is not a shared dep of ${meta.name}.`));
    return;
  }
  meta.dependencies.shared = shared.filter((d) => d !== dep);
  await writeJson(metaPath, meta);
  console.log(`${color('green', 'removed')} ${dep} from ${relative(REPO_ROOT, project.dir)}`);
}

async function resolveProject(spec) {
  const projects = await findProjects();
  // Try by name first.
  const byName = projects.find((p) => projectNameFromPath(p) === spec);
  if (byName) return { dir: byName };
  // Then by relative path.
  const byPath = projects.find((p) => relative(REPO_ROOT, p) === spec || p === spec);
  if (byPath) return { dir: byPath };
  fail(`Project "${spec}" not found under projects/. Use the folder name or the relative path.`);
}

function sortKeys(obj) {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

function fail(msg) {
  console.error(color('red', 'error: ') + msg);
  process.exit(1);
}
