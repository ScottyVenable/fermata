#!/usr/bin/env node
// Lightweight repo health check for the sandbox.
// Catches the things validation deliberately ignores: placeholder READMEs,
// obviously stale metadata, and projects that should be archived.
//
// Usage:
//   node scripts/doctor.mjs              # check every project
//   node scripts/doctor.mjs --project x # check one project by name or path

import {
  REPO_ROOT, PROJECTS_DIR, MANIFEST_PATH,
  ALLOWED_CATEGORIES, ALLOWED_PLATFORMS, ALLOWED_STATUSES,
  readJson, readFile, findProjects, categoryFromPath, projectNameFromPath,
  parseArgs, color, header, fileExists, join, relative,
} from './lib/repo.mjs';

const args = parseArgs(process.argv.slice(2));

// Phrases that shipped in the scaffold and should never survive in a real project.
const PLACEHOLDER_PATTERNS = [
  'One-line tagline. Replace this.',
  'A short, punchy description of the project.',
  'A paragraph or two describing the project in more detail.',
  'Replace with the actual commands.',
  'Feature one',
  'Feature two',
  'Feature three',
  '{{DISPLAY_NAME}}',
  '{{AUTHOR_NAME}}',
];

async function main() {
  const manifest = await readJson(MANIFEST_PATH).catch(() => ({ registry: {} }));
  const knownSharedDeps = new Set(Object.keys(manifest.registry || {}));
  const projects = await findProjects();

  const targets = args.project
    ? [resolveProjectSpec(args.project, projects)]
    : projects;

  if (targets.length === 0) {
    if (!args.quiet) console.log(color('gray', 'No projects found yet. Add one with `npm run new`.'));
    return;
  }

  let failures = 0;
  console.log(header('Checking repo health...\n'));

  for (const dir of targets) {
    const rel = relative(REPO_ROOT, dir);
    const issues = [];
    const metaPath = join(dir, 'fermata.json');
    const readmePath = join(dir, 'README.md');

    if (!fileExists(metaPath)) issues.push('missing fermata.json');
    if (!fileExists(readmePath)) issues.push('missing README.md');

    let meta = null;
    try {
      meta = await readJson(metaPath);
    } catch {
      // readJson below already reported the path; keep the project listed.
    }

    if (meta) {
      // README quality
      const readme = await readFile(readmePath).catch(() => '');
      for (const marker of PLACEHOLDER_PATTERNS) {
        if (readme.includes(marker)) {
          issues.push(`README still contains placeholder text (${marker.slice(0, 32)}...)`);
          break;
        }
      }

      // Metadata sanity that overlaps with validate but is worth surfacing in doctor.
      if (meta.name && meta.name !== projectNameFromPath(dir)) {
        issues.push(`name "${meta.name}" does not match folder "${projectNameFromPath(dir)}"`);
      }
      if (meta.category && !ALLOWED_CATEGORIES.has(meta.category)) {
        issues.push(`category "${meta.category}" is not allowed`);
      } else if (meta.category && meta.category !== categoryFromPath(dir)) {
        issues.push(`category "${meta.category}" does not match folder placement "${categoryFromPath(dir)}"`);
      }
      if (meta.status && !ALLOWED_STATUSES.has(meta.status)) {
        issues.push(`status "${meta.status}" is not allowed`);
      }
      if (meta.status === 'archived' && !meta.archived_reason) {
        issues.push('archived projects need an archived_reason');
      }
      if (Array.isArray(meta.platforms) && !meta.platforms.length) {
        issues.push('platforms must not be empty');
      }
      for (const platform of meta.platforms || []) {
        if (!ALLOWED_PLATFORMS.has(platform)) {
          issues.push(`unknown platform "${platform}"`);
        }
      }
      for (const dep of meta.dependencies?.shared || []) {
        if (!knownSharedDeps.has(dep)) {
          issues.push(`unknown shared dependency "${dep}"`);
        }
      }
      if (meta.archive_reason && !meta.archived_reason) {
        // harmless typo guard
        issues.push('use archived_reason, not archive_reason');
      }
    }

    if (issues.length === 0) {
      console.log(`${color('green', 'ok')}  ${rel}`);
    } else {
      failures++;
      console.log(`${color('yellow', 'needs attention')}  ${rel}`);
      for (const issue of issues) {
        console.log(`     ${color('gray', '·')} ${issue}`);
      }
    }
  }

  console.log('');
  if (failures === 0) {
    console.log(color('green', `All ${targets.length} project${targets.length === 1 ? '' : 's'} healthy.`));
  } else {
    console.log(color('yellow', `${failures} of ${targets.length} project${targets.length === 1 ? '' : 's'} need attention.`));
    process.exitCode = 1;
  }
}

function resolveProjectSpec(spec, projects) {
  const byName = projects.find((p) => projectNameFromPath(p) === spec);
  if (byName) return byName;

  const byPath = projects.find(
    (p) => relative(REPO_ROOT, p) === spec || p === spec || p === join(PROJECTS_DIR, spec),
  );
  if (byPath) return byPath;

  console.error(color('red', `Project "${spec}" not found under projects/.`));
  process.exit(2);
}

main().catch((err) => {
  console.error(color('red', 'Doctor crashed:'), err);
  process.exit(2);
});
