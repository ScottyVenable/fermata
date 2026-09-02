#!/usr/bin/env node
// Typechecks every TypeScript project in the repo.
// A project is "TypeScript-shaped" if it has a tsconfig.json. Plain JS / HTML
// experiments are skipped.
//
// Usage:
//   node scripts/typecheck.mjs                       # check all TS projects
//   node scripts/typecheck.mjs --project vivarium    # check one by name/path

import { spawnSync } from 'node:child_process';
import { relative } from 'node:path';

import {
  REPO_ROOT, PROJECTS_DIR,
  findProjects, projectNameFromPath,
  parseArgs, color, header, fileExists, join,
} from './lib/repo.mjs';

const TSC = join(REPO_ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const args = parseArgs(process.argv.slice(2));

async function main() {
  const projects = await findProjects();
  const targets = args.project
    ? [resolveProjectSpec(args.project, projects)]
    : projects.filter((p) => hasTsConfig(p));

  if (targets.length === 0) {
    console.log(color('gray', 'No TypeScript projects found. Nothing to typecheck.'));
    return;
  }

  if (!fileExists(TSC)) {
    console.error(color('red', 'TypeScript is not installed. Run `npm ci` (or `npm install`) first.'));
    process.exit(1);
  }

  console.log(header(`Typechecking ${targets.length} TypeScript project${targets.length === 1 ? '' : 's'}...\n`));

  let failures = 0;
  for (const dir of targets) {
    const rel = relative(REPO_ROOT, dir);
    const cfg = join(dir, 'tsconfig.json');
    const result = spawnSync(process.execPath, [TSC, '--noEmit', '-p', cfg], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
    if (result.status === 0) {
      console.log(`${color('green', 'ok')}  ${rel}`);
    } else {
      failures++;
      console.log(`${color('red', 'fail')} ${rel}`);
      if (output) console.log(output);
    }
  }

  console.log('');
  if (failures === 0) {
    console.log(color('green', `All ${targets.length} TS project${targets.length === 1 ? '' : 's'} typechecked.`));
  } else {
    console.log(color('red', `${failures} of ${targets.length} project${targets.length === 1 ? '' : 's'} failed.`));
    process.exit(1);
  }
}

function hasTsConfig(dir) {
  return fileExists(join(dir, 'tsconfig.json'));
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
  console.error(color('red', 'Typechecker crashed:'), err);
  process.exit(2);
});
