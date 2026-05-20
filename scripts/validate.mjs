#!/usr/bin/env node
// Validates every project's fermata.json against the spec.
// Exits non-zero (and CI fails) if any project is invalid.
//
// Usage:
//   node scripts/validate.mjs [--project <path>] [--quiet]

import {
  REPO_ROOT, PROJECTS_DIR, MANIFEST_PATH,
  ALLOWED_CATEGORIES, ALLOWED_PLATFORMS, ALLOWED_STATUSES, ALLOWED_ROLES,
  REQUIRED_LICENSE,
  readJson, findProjects, categoryFromPath, projectNameFromPath,
  parseArgs, color, header, isValidName, isValidDate, fileExists,
  join, relative,
} from './lib/repo.mjs';

const args = parseArgs(process.argv.slice(2));

async function main() {
  const manifest = await readJson(MANIFEST_PATH).catch(() => ({ registry: {} }));
  const knownSharedDeps = new Set(Object.keys(manifest.registry || {}));

  const targets = args.project
    ? [args.project.startsWith('projects/') ? join(REPO_ROOT, args.project) : args.project]
    : await findProjects();

  if (targets.length === 0) {
    if (!args.quiet) console.log(color('gray', 'No projects found yet. Add one with `npm run new`.'));
    return;
  }

  let total = 0;
  const failures = [];

  for (const dir of targets) {
    total++;
    const errors = await validateProject(dir, knownSharedDeps);
    const projectRel = relative(REPO_ROOT, dir);
    if (errors.length === 0) {
      if (!args.quiet) console.log(`${color('green', 'ok')}  ${projectRel}`);
    } else {
      failures.push({ projectRel, errors });
      console.log(`${color('red', 'fail')} ${projectRel}`);
      for (const err of errors) {
        console.log(`     ${color('gray', '·')} ${err}`);
      }
    }
  }

  console.log('');
  if (failures.length === 0) {
    console.log(color('green', `All ${total} project${total === 1 ? '' : 's'} valid.`));
  } else {
    console.log(color('red', `${failures.length} of ${total} project${total === 1 ? '' : 's'} failed validation.`));
    process.exit(1);
  }
}

async function validateProject(projectDir, knownSharedDeps) {
  const errors = [];
  const metaPath = join(projectDir, 'fermata.json');
  const readmePath = join(projectDir, 'README.md');

  if (!fileExists(metaPath)) {
    errors.push('Missing fermata.json.');
    return errors;
  }
  if (!fileExists(readmePath)) {
    errors.push('Missing README.md.');
  }

  let meta;
  try {
    meta = await readJson(metaPath);
  } catch (err) {
    errors.push(err.message);
    return errors;
  }

  // ---- required fields ----
  requireString(meta, 'name', errors);
  requireString(meta, 'displayName', errors, { min: 1, max: 80 });
  requireString(meta, 'description', errors, { min: 10, max: 280 });
  requireString(meta, 'category', errors);
  requireString(meta, 'status', errors);
  requireArray(meta, 'platforms', errors, { min: 1 });
  requireArray(meta, 'authors', errors, { min: 1 });
  requireString(meta, 'license', errors);
  requireString(meta, 'created', errors);

  // ---- name rules ----
  if (meta.name && !isValidName(meta.name)) {
    errors.push(`name "${meta.name}" must match /^[a-z][a-z0-9-]*$/.`);
  }
  const folderName = projectNameFromPath(projectDir);
  if (meta.name && meta.name !== folderName) {
    errors.push(`name "${meta.name}" doesn't match folder name "${folderName}".`);
  }

  // ---- category rules ----
  if (meta.category) {
    if (!ALLOWED_CATEGORIES.has(meta.category)) {
      errors.push(`category "${meta.category}" is not allowed. See docs/CATEGORIES.md.`);
    } else {
      const folderCategory = categoryFromPath(projectDir);
      if (folderCategory !== meta.category) {
        errors.push(`category "${meta.category}" doesn't match folder placement "${folderCategory}".`);
      }
    }
  }

  // ---- status ----
  if (meta.status && !ALLOWED_STATUSES.has(meta.status)) {
    errors.push(`status "${meta.status}" is not allowed. Allowed: ${[...ALLOWED_STATUSES].join(', ')}.`);
  }
  if (meta.status === 'archived' && !meta.archived_reason) {
    errors.push('archived_reason is required when status is "archived".');
  }

  // ---- platforms ----
  if (Array.isArray(meta.platforms)) {
    for (const p of meta.platforms) {
      if (!ALLOWED_PLATFORMS.has(p)) {
        errors.push(`platforms contains unknown value "${p}". Allowed: ${[...ALLOWED_PLATFORMS].join(', ')}.`);
      }
    }
  }

  // ---- license ----
  if (meta.license && meta.license !== REQUIRED_LICENSE) {
    errors.push(`license must be "${REQUIRED_LICENSE}" (got "${meta.license}"). All Fermata projects share the repo license.`);
  }

  // ---- created ----
  if (meta.created && !isValidDate(meta.created)) {
    errors.push(`created "${meta.created}" must be ISO date YYYY-MM-DD.`);
  } else if (meta.created) {
    const created = new Date(meta.created + 'T00:00:00Z');
    if (created.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
      errors.push(`created "${meta.created}" is in the future.`);
    }
  }
  if (meta.updated && !isValidDate(meta.updated)) {
    errors.push(`updated "${meta.updated}" must be ISO date YYYY-MM-DD.`);
  }

  // ---- authors ----
  if (Array.isArray(meta.authors)) {
    let creators = 0;
    for (let i = 0; i < meta.authors.length; i++) {
      const a = meta.authors[i];
      if (!a || typeof a !== 'object') {
        errors.push(`authors[${i}] must be an object.`);
        continue;
      }
      if (!a.name || typeof a.name !== 'string') errors.push(`authors[${i}].name is required.`);
      if (!a.role || !ALLOWED_ROLES.has(a.role)) {
        errors.push(`authors[${i}].role must be one of: ${[...ALLOWED_ROLES].join(', ')}.`);
      }
      if (a.role === 'creator') creators++;
    }
    if (creators !== 1) {
      errors.push(`exactly one author must have role "creator" (found ${creators}).`);
    }
  }

  // ---- dependencies ----
  if (meta.dependencies) {
    const shared = meta.dependencies.shared;
    if (shared !== undefined) {
      if (!Array.isArray(shared)) {
        errors.push('dependencies.shared must be an array of strings.');
      } else {
        for (const dep of shared) {
          if (!knownSharedDeps.has(dep)) {
            errors.push(`dependencies.shared references unknown dep "${dep}". Register it with \`npm run add-dep -- --register ${dep}\` or move it to dependencies.external.`);
          }
        }
      }
    }
    const external = meta.dependencies.external;
    if (external !== undefined && (typeof external !== 'object' || Array.isArray(external))) {
      errors.push('dependencies.external must be an object of name → semver.');
    }
  }

  return errors;
}

function requireString(meta, key, errors, opts = {}) {
  const v = meta[key];
  if (v === undefined || v === null || v === '') {
    errors.push(`${key} is required.`);
    return;
  }
  if (typeof v !== 'string') {
    errors.push(`${key} must be a string.`);
    return;
  }
  if (opts.min !== undefined && v.length < opts.min) {
    errors.push(`${key} is too short (min ${opts.min} chars).`);
  }
  if (opts.max !== undefined && v.length > opts.max) {
    errors.push(`${key} is too long (max ${opts.max} chars).`);
  }
}

function requireArray(meta, key, errors, opts = {}) {
  const v = meta[key];
  if (!Array.isArray(v)) {
    errors.push(`${key} must be an array.`);
    return;
  }
  if (opts.min !== undefined && v.length < opts.min) {
    errors.push(`${key} must have at least ${opts.min} item${opts.min === 1 ? '' : 's'}.`);
  }
}

console.log(header('Validating projects...\n'));
main().catch((err) => {
  console.error(color('red', 'Validator crashed:'), err);
  process.exit(2);
});
