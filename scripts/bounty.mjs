#!/usr/bin/env node
// Fermata bounty board CLI.
//
// Usage:
//   node scripts/bounty.mjs list [--status s] [--track t] [--size z] [--skill k] [--json]
//   node scripts/bounty.mjs show FB-0002 [--json]
//   node scripts/bounty.mjs new --title "..." --track tooling --size s [--difficulty d]
//   node scripts/bounty.mjs claim FB-0002 --who handle [--kind bot --operator handle]
//   node scripts/bounty.mjs drop FB-0002 --who handle [--note "..."]
//   node scripts/bounty.mjs complete FB-0002 --who handle [--pr 42] [--commit sha]
//   node scripts/bounty.mjs validate [--quiet]
//   node scripts/bounty.mjs index
//   node scripts/bounty.mjs stats
//
// Every mutating command accepts --dry-run.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

import { REPO_ROOT, parseArgs, color, header, today, readJson, writeJson } from './lib/repo.mjs';
import {
  BOARD_DIR, BOUNTIES_DIR, TEMPLATES_DIR, PROPOSALS_DIR, INDEX_PATH,
  TRACKS, STATUSES, SIZES, DIFFICULTIES, SIZE_RULES, OPEN_STATUSES, TIERS,
  loadBounties, findBountyById, nextBountyId, slugify, trackFromPath,
  parseAcceptance, parseTitle, parseSections, REQUIRED_SECTIONS, stripComments,
  nowIso, addDays, statusBadge,
} from './lib/bounty.mjs';

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
const DRY = Boolean(args['dry-run']);

const COMMANDS = {
  list: cmdList,
  show: cmdShow,
  new: cmdNew,
  claim: cmdClaim,
  drop: cmdDrop,
  complete: cmdComplete,
  validate: cmdValidate,
  index: cmdIndex,
  stats: cmdStats,
  help: cmdHelp,
};

const handler = COMMANDS[cmd] || (cmd ? unknown : cmdHelp);
await handler();

function unknown() {
  console.error(color('red', `Unknown command: ${cmd}`));
  cmdHelp();
  process.exit(1);
}

function cmdHelp() {
  console.log(`
${header('fermata bounty')} — the bounty board CLI

  ${color('cyan', 'list')}      [--status s] [--track t] [--size z] [--skill k] [--json]
  ${color('cyan', 'show')}      FB-0002 [--json]
  ${color('cyan', 'new')}       --title "..." --track ${TRACKS.join('|')} --size ${SIZES.join('|')}
  ${color('cyan', 'claim')}     FB-0002 --who handle [--kind human|bot] [--operator handle]
  ${color('cyan', 'drop')}      FB-0002 --who handle [--note "..."]
  ${color('cyan', 'complete')}  FB-0002 --who handle [--pr 42] [--commit sha] [--partial]
  ${color('cyan', 'validate')}  [--quiet]        schema + rule check (CI runs this)
  ${color('cyan', 'index')}                      regenerate bounty-board/INDEX.md
  ${color('cyan', 'stats')}                      board summary

Add --dry-run to any mutating command to preview the change.
Docs: bounty-board/README.md · bounty-board/ARCHITECTURE.md
`);
}

// ---------------- list ----------------

async function cmdList() {
  let all = (await loadBounties()).filter((b) => b.data);
  if (args.status) all = all.filter((b) => b.data.status === args.status);
  if (args.track) all = all.filter((b) => b.data.track === args.track);
  if (args.size) all = all.filter((b) => b.data.size === args.size);
  if (args.skill) all = all.filter((b) => (b.data.skills || []).includes(args.skill));
  if (args.label) all = all.filter((b) => (b.data.labels || []).includes(args.label));
  if (args.epic) all = all.filter((b) => b.data.epic === args.epic);
  if (args.claimable) all = all.filter((b) => b.data.status === 'open');

  if (args.json) {
    console.log(JSON.stringify(all.map((b) => ({ ...b.data, path: b.rel })), null, 2));
    return;
  }

  if (all.length === 0) {
    console.log(color('gray', 'No bounties match.'));
    return;
  }

  const rows = all.map((b) => [
    b.data.id,
    statusBadge(b.data.status),
    b.data.track,
    b.data.size,
    String(b.data.reward?.rep ?? 0),
    b.data.title.length > 52 ? b.data.title.slice(0, 49) + '...' : b.data.title,
  ]);
  printTable(['ID', 'STATUS', 'TRACK', 'SIZE', 'REP', 'TITLE'], rows);
  console.log('');
  console.log(color('gray', `${all.length} bounties. \`npm run bounty -- show <id>\` for detail.`));
}

// ---------------- show ----------------

async function cmdShow() {
  const id = (args._[1] || args.id || '').toUpperCase();
  const found = await requireBounty(id);
  if (args.json) {
    console.log(JSON.stringify({ ...found.data, path: found.rel }, null, 2));
    return;
  }
  const b = found.data;
  const readme = await readFile(join(found.dir, 'README.md'), 'utf8').catch(() => '');
  const criteria = parseAcceptance(readme);

  console.log('');
  console.log(header(`${b.id}  ${b.title}`));
  console.log(color('gray', found.rel));
  console.log('');
  line('Status', statusBadge(b.status));
  line('Track', b.track);
  line('Size', `${b.size} (${b.claim?.ttl_days ?? SIZE_RULES[b.size]?.ttl ?? '-'}d TTL)`);
  line('Difficulty', b.difficulty);
  line('Reward', `${b.reward.rep} REP${b.reward.bonus_rep ? ` (+${b.reward.bonus_rep} bonus)` : ''}`);
  if (b.epic) line('Epic', b.epic);
  if (b.labels?.length) line('Labels', b.labels.join(', '));
  if (b.skills?.length) line('Skills', b.skills.join(', '));
  if (b.depends_on?.length) line('Depends on', b.depends_on.join(', '));
  if (b.blocks?.length) line('Blocks', b.blocks.join(', '));
  if (b.children?.length) line('Children', b.children.join(', '));
  if (b.claim?.current) {
    line('Claimed by', `@${b.claim.current.handle} (expires ${b.claim.current.expires_at?.slice(0, 10)})`);
  }
  if (b.completion) line('Completed by', `@${b.completion.handle} — ${b.completion.rep_awarded} REP`);
  console.log('');
  console.log(header(`Acceptance criteria (${criteria.length})`));
  for (const c of criteria) console.log(`  ${c.checked ? color('green', '[x]') : '[ ]'} ${c.text}`);
  console.log('');
  if (b.status === 'open') {
    console.log(color('cyan', `  npm run bounty -- claim ${b.id} --who <yourhandle>`));
    console.log('');
  }

  function line(k, v) {
    console.log(`  ${color('gray', (k + ':').padEnd(14))}${v}`);
  }
}

// ---------------- new ----------------

async function cmdNew() {
  const title = args.title;
  const track = args.track;
  const size = args.size || 's';
  const difficulty = args.difficulty || 'intermediate';
  const who = args.who || 'yourhandle';

  if (!title || !track) die('Usage: bounty new --title "..." --track <track> [--size s]');
  if (!TRACKS.includes(track)) die(`--track must be one of: ${TRACKS.join(', ')}`);
  if (!SIZES.includes(size)) die(`--size must be one of: ${SIZES.join(', ')}`);
  if (!DIFFICULTIES.includes(difficulty)) die(`--difficulty must be one of: ${DIFFICULTIES.join(', ')}`);

  const id = args.id ? args.id.toUpperCase() : await nextBountyId(track);
  const slug = args.slug || slugify(title);
  const dir = join(BOUNTIES_DIR, track, `${id}-${slug}`);
  if (existsSync(dir)) die(`${relative(REPO_ROOT, dir)} already exists.`);

  const rules = SIZE_RULES[size];
  const rep = args.rep ? Number(args.rep) : rules.min;

  const data = {
    id, title, slug, track,
    status: 'draft',
    size, difficulty,
    reward: { rep, bonus_rep: 0, cash: null },
    labels: [],
    skills: [],
    targets: [],
    requested_by: { handle: who, kind: args.kind === 'bot' ? 'bot' : 'human' },
    created: today(),
    updated: today(),
    deadline: null,
    epic: args.epic || null,
    depends_on: [],
    blocks: [],
    claim: { ttl_days: rules.ttl, max_concurrent: 1, current: null, history: [] },
    acceptance_count: 5,
    completion: null,
  };

  let readme = await readFile(join(TEMPLATES_DIR, 'BOUNTY_TEMPLATE.md'), 'utf8');
  readme = readme
    .replace(/^# FB-####: .*$/m, `# ${id}: ${title}`)
    .replace(/FB-####/g, id)
    .replace(/^> \*\*Track\*\*.*$/m,
      `> **Track** \`${track}\` · **Size** \`${size}\` · **Difficulty** \`${difficulty}\` · **Reward** \`${rep} REP\``)
    .replace(/^> \*\*Status\*\*.*$/m,
      `> **Status** \`draft\` · **Claim TTL** ${rules.ttl} days · **Epic** ${data.epic || '—'}`);

  console.log(header(`${DRY ? '[dry-run] would create' : 'Creating'} ${relative(REPO_ROOT, dir)}`));
  if (!DRY) {
    await mkdir(join(dir, 'claims'), { recursive: true });
    await writeJson(join(dir, 'bounty.json'), data);
    await writeFile(join(dir, 'README.md'), readme, 'utf8');
    await writeFile(join(dir, 'claims', '.gitkeep'), '', 'utf8');
  }
  console.log(`  ${color('green', 'bounty.json')}  ${id} · ${track} · ${size} · ${rep} REP`);
  console.log(`  ${color('green', 'README.md')}    from BOUNTY_TEMPLATE.md`);
  console.log('');
  console.log('Next: fill in the README (delete the HTML comments), set acceptance_count,');
  console.log(`then \`npm run bounty -- validate\` and open a PR.`);
}

// ---------------- claim ----------------

async function cmdClaim() {
  const id = (args._[1] || '').toUpperCase();
  const who = (args.who || '').toLowerCase();
  const kind = args.kind === 'bot' ? 'bot' : 'human';
  if (!who) die('Usage: bounty claim FB-#### --who <handle>');
  if (kind === 'bot' && !args.operator) die('Bot claims require --operator <handle>.');

  const found = await requireBounty(id);
  const b = found.data;
  if (b.status !== 'open') die(`${id} is ${b.status}, not open.`);

  const claimedAt = nowIso();
  const ttl = b.claim?.ttl_days ?? SIZE_RULES[b.size].ttl;
  const record = {
    handle: who, kind, claimed_at: claimedAt,
    expires_at: addDays(claimedAt, ttl), outcome: 'active', pr: null,
  };
  if (kind === 'bot') record.operator = args.operator;

  b.status = 'claimed';
  b.claim.current = record;
  b.updated = today();

  const claimFile = join(found.dir, 'claims', `${claimedAt.slice(0, 10)}-${who}.md`);
  let claimDoc = await readFile(join(TEMPLATES_DIR, 'CLAIM_TEMPLATE.md'), 'utf8');
  claimDoc = claimDoc
    .replace(/^bounty: FB-####$/m, `bounty: ${id}`)
    .replace(/^handle: yourhandle$/m, `handle: ${who}`)
    .replace(/^kind: human.*$/m, `kind: ${kind}`)
    .replace(/^operator:.*$/m, `operator: ${args.operator || ''}`)
    .replace(/^claimed_at: .*$/m, `claimed_at: ${claimedAt}`)
    .replace(/^expires_at: .*$/m, `expires_at: ${record.expires_at}`)
    .replace(/^# Claim: FB-####$/m, `# Claim: ${id}`)
    .replace(/^- \*\*YYYY-MM-DD\*\* — Claimed\.$/m, `- **${claimedAt.slice(0, 10)}** — Claimed.`);

  console.log(header(`${DRY ? '[dry-run] would claim' : 'Claiming'} ${id} for @${who}`));
  if (!DRY) {
    await mkdir(join(found.dir, 'claims'), { recursive: true });
    await writeJson(join(found.dir, 'bounty.json'), b);
    await writeFile(claimFile, claimDoc, 'utf8');
  }
  console.log(`  status  open → ${color('green', 'claimed')}`);
  console.log(`  expires ${record.expires_at.slice(0, 10)} (${ttl} days)`);
  console.log(`  wrote   ${relative(REPO_ROOT, claimFile)}`);
  console.log('');
  console.log(`Open a PR titled ${color('cyan', `claim: ${id} ${b.slug}`)} with just these two files.`);
}

// ---------------- drop ----------------

async function cmdDrop() {
  const id = (args._[1] || '').toUpperCase();
  const who = (args.who || '').toLowerCase();
  const found = await requireBounty(id);
  const b = found.data;
  if (!b.claim?.current) die(`${id} has no active claim.`);
  if (who && b.claim.current.handle !== who) die(`${id} is claimed by @${b.claim.current.handle}, not @${who}.`);

  const released = { ...b.claim.current, released_at: nowIso(), outcome: 'dropped', note: args.note || '' };
  b.claim.history = [...(b.claim.history || []), released];
  b.claim.current = null;
  b.status = 'open';
  b.updated = today();

  console.log(header(`${DRY ? '[dry-run] would drop' : 'Dropping'} claim on ${id}`));
  if (!DRY) await writeJson(join(found.dir, 'bounty.json'), b);
  console.log(`  status claimed → ${color('green', 'open')}`);
  console.log(color('gray', '  Dropping cleanly costs 0 REP. Add a note to your claim file explaining why.'));
}

// ---------------- complete ----------------

async function cmdComplete() {
  const id = (args._[1] || '').toUpperCase();
  const who = (args.who || '').toLowerCase();
  if (!who) die('Usage: bounty complete FB-#### --who <handle> [--pr 42]');

  const found = await requireBounty(id);
  const b = found.data;
  if (b.status === 'completed') die(`${id} is already completed.`);

  const readme = await readFile(join(found.dir, 'README.md'), 'utf8');
  const criteria = parseAcceptance(readme);
  const unchecked = criteria.filter((c) => !c.checked);
  if (unchecked.length && !args.partial && !args.force) {
    console.log(color('yellow', `${unchecked.length} acceptance criteria are unchecked:`));
    for (const c of unchecked) console.log(`  [ ] ${c.text}`);
    die('Check them in the README, or pass --partial for scaled credit.');
  }

  const multiplier = Number(args.multiplier || computeMultiplier(b, who));
  const ratio = args.partial ? (criteria.length ? (criteria.length - unchecked.length) / criteria.length : 0) : 1;
  const awarded = Math.round(b.reward.rep * multiplier * ratio);

  b.status = 'completed';
  b.updated = today();
  b.completion = {
    handle: who,
    kind: b.claim?.current?.kind || 'human',
    merged_at: nowIso(),
    pr: args.pr ? Number(args.pr) : undefined,
    commit: args.commit || undefined,
    rep_awarded: awarded,
    multiplier,
    reviewers: args.reviewers ? String(args.reviewers).split(',') : [],
    partial: Boolean(args.partial),
  };
  if (b.claim?.current) {
    b.claim.history = [...(b.claim.history || []), { ...b.claim.current, released_at: nowIso(), outcome: 'delivered', pr: args.pr ? Number(args.pr) : null }];
    b.claim.current = null;
  }

  console.log(header(`${DRY ? '[dry-run] would complete' : 'Completing'} ${id}`));
  if (!DRY) await writeJson(join(found.dir, 'bounty.json'), b);
  console.log(`  criteria   ${criteria.length - unchecked.length}/${criteria.length}`);
  console.log(`  multiplier ×${multiplier}`);
  console.log(`  award      ${color('green', `${awarded} REP`)} → @${who}`);
  console.log('');
  console.log(`Now record it: ${color('cyan', `npm run rep -- award --who ${who} --event bounty.completed --ref ${id}`)}`);
}

function computeMultiplier(b, who) {
  let m = 1.0;
  const targets = b.targets || [];
  if (targets.some((t) => t.type === 'project')) m *= 1.5;
  else if (targets.some((t) => t.type === 'external-repo')) m *= 1.25;
  if ((b.labels || []).includes('help-wanted-urgent')) m *= 1.25;
  if (b.requested_by?.handle?.toLowerCase() === who) m *= 0.5;
  return Math.min(Number(m.toFixed(3)), 2.0);
}

// ---------------- validate ----------------

async function cmdValidate() {
  const all = await loadBounties();
  const failures = [];
  const warnings = [];
  const seenIds = new Map();

  const schema = await readJson(join(BOARD_DIR, 'schemas', 'bounty.schema.json')).catch(() => null);
  const enums = schema ? {} : {};

  for (const b of all) {
    const errs = [];
    const warns = [];
    if (!b.data) { failures.push({ rel: b.rel, errs: [b.error] }); continue; }
    const d = b.data;

    // --- required fields ---
    for (const f of ['id', 'title', 'slug', 'track', 'status', 'size', 'difficulty', 'reward', 'requested_by', 'created', 'claim', 'acceptance_count']) {
      if (d[f] === undefined || d[f] === null) errs.push(`Missing required field \`${f}\`.`);
    }
    if (errs.length) { failures.push({ rel: b.rel, errs }); continue; }

    // --- enums ---
    if (!/^FB-\d{4}$/.test(d.id)) errs.push(`id "${d.id}" must match FB-####.`);
    if (!TRACKS.includes(d.track)) errs.push(`track "${d.track}" is not one of: ${TRACKS.join(', ')}.`);
    if (!STATUSES.includes(d.status)) errs.push(`status "${d.status}" is not one of: ${STATUSES.join(', ')}.`);
    if (!SIZES.includes(d.size)) errs.push(`size "${d.size}" is not one of: ${SIZES.join(', ')}.`);
    if (!DIFFICULTIES.includes(d.difficulty)) errs.push(`difficulty "${d.difficulty}" is invalid.`);

    // --- uniqueness ---
    if (seenIds.has(d.id)) errs.push(`Duplicate id — also used by ${seenIds.get(d.id)}.`);
    else seenIds.set(d.id, b.rel);

    // --- folder naming ---
    const folder = b.rel.split('/').pop();
    if (folder !== `${d.id}-${d.slug}`) errs.push(`Folder "${folder}" should be "${d.id}-${d.slug}".`);
    const dirTrack = trackFromPath(b.dir);
    if (dirTrack !== 'archived' && dirTrack !== d.track) {
      errs.push(`Filed under ${dirTrack}/ but track is "${d.track}".`);
    }
    if (dirTrack === 'archived' && !['cancelled', 'completed', 'expired'].includes(d.status)) {
      errs.push(`Archived bounties must be cancelled/completed/expired, not "${d.status}".`);
    }

    // --- reward bands ---
    const rules = SIZE_RULES[d.size];
    if (rules && d.size !== 'epic') {
      if (d.reward.rep < rules.min || d.reward.rep > rules.max) {
        errs.push(`reward.rep ${d.reward.rep} is outside the ${d.size} band (${rules.min}–${rules.max}).`);
      }
    } else if (d.size === 'epic' && d.reward.rep !== 0) {
      errs.push('epic-sized bounties must have reward.rep of 0 — value lives in their children.');
    }

    // --- title length ---
    if (d.title.length < 10 || d.title.length > 100) errs.push(`title must be 10–100 chars (is ${d.title.length}).`);
    if (!/^[a-z][a-z0-9-]*$/.test(d.slug)) errs.push(`slug "${d.slug}" must be lowercase-hyphenated.`);

    // --- README ---
    const readmePath = join(b.dir, 'README.md');
    if (!existsSync(readmePath)) {
      errs.push('Missing README.md.');
    } else {
      const readme = await readFile(readmePath, 'utf8');
      const heading = parseTitle(readme);
      if (heading && heading !== d.title) {
        errs.push(`README H1 "${heading}" does not match title "${d.title}".`);
      }
      const sections = parseSections(readme);
      for (const s of REQUIRED_SECTIONS) {
        if (!(s in sections)) errs.push(`README is missing the "## ${s}" section.`);
      }
      if (sections['Out of scope'] !== undefined && sections['Out of scope'].length < 10) {
        errs.push('"Out of scope" must not be empty.');
      }
      const criteria = parseAcceptance(readme);
      if (criteria.length < 3) errs.push(`Needs at least 3 acceptance criteria (has ${criteria.length}).`);
      if (criteria.length !== d.acceptance_count) {
        errs.push(`acceptance_count is ${d.acceptance_count} but README has ${criteria.length} checkboxes.`);
      }
      if (/<!--/.test(readme) && d.status !== 'draft') {
        warns.push('README still contains template HTML comments.');
      }
    }

    // --- claim consistency ---
    if (d.status === 'claimed' && !d.claim.current) errs.push('status is "claimed" but claim.current is null.');
    if (d.status === 'open' && d.claim.current) errs.push('status is "open" but claim.current is set.');
    if (d.status === 'completed' && !d.completion) errs.push('status is "completed" but completion is null.');
    if (d.claim.current?.kind === 'bot' && !d.claim.current.operator) {
      errs.push('Bot claim is missing an accountable `operator`.');
    }
    if (d.status === 'blocked' && !d.blocked_reason) errs.push('Blocked bounties need a blocked_reason.');
    if (d.status === 'cancelled' && !d.cancelled_reason) errs.push('Cancelled bounties need a cancelled_reason.');

    if (errs.length) failures.push({ rel: b.rel, errs });
    if (warns.length) warnings.push({ rel: b.rel, warns });
  }

  // --- cross-bounty references ---
  const known = new Set(all.filter((b) => b.data?.id).map((b) => b.data.id));
  for (const b of all) {
    if (!b.data) continue;
    const errs = [];
    for (const dep of [...(b.data.depends_on || []), ...(b.data.blocks || []), ...(b.data.children || [])]) {
      if (!known.has(dep)) errs.push(`References unknown bounty ${dep}.`);
    }
    if ((b.data.depends_on || []).includes(b.data.id)) errs.push('Depends on itself.');
    if (errs.length) failures.push({ rel: b.rel, errs });
  }
  const cycle = detectCycle(all);
  if (cycle) failures.push({ rel: 'dependency graph', errs: [`Cycle detected: ${cycle.join(' → ')}`] });

  // --- report ---
  if (!args.quiet) {
    for (const b of all) {
      if (!failures.some((f) => f.rel === b.rel)) {
        console.log(`${color('green', 'ok')}   ${b.rel}`);
      }
    }
  }
  for (const w of warnings) {
    console.log(`${color('yellow', 'warn')} ${w.rel}`);
    for (const m of w.warns) console.log(`     ${color('gray', '·')} ${m}`);
  }
  for (const f of failures) {
    console.log(`${color('red', 'fail')} ${f.rel}`);
    for (const m of f.errs) console.log(`     ${color('gray', '·')} ${m}`);
  }
  console.log('');
  if (failures.length === 0) {
    console.log(color('green', `All ${all.length} bounties valid.${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? '' : 's'})` : ''}`));
  } else {
    console.log(color('red', `${failures.length} problem${failures.length === 1 ? '' : 's'} across ${all.length} bounties.`));
    process.exit(1);
  }
}

function detectCycle(all) {
  const graph = new Map();
  for (const b of all) if (b.data) graph.set(b.data.id, b.data.depends_on || []);
  const state = new Map();
  let cycle = null;
  const visit = (node, path) => {
    if (cycle) return;
    if (state.get(node) === 'done') return;
    if (state.get(node) === 'active') { cycle = [...path.slice(path.indexOf(node)), node]; return; }
    state.set(node, 'active');
    for (const next of graph.get(node) || []) visit(next, [...path, node]);
    state.set(node, 'done');
  };
  for (const node of graph.keys()) visit(node, []);
  return cycle;
}

// ---------------- index ----------------

async function cmdIndex() {
  const all = (await loadBounties()).filter((b) => b.data);
  const open = all.filter((b) => b.data.status === 'open');
  const claimed = all.filter((b) => ['claimed', 'in-review'].includes(b.data.status));
  const blocked = all.filter((b) => b.data.status === 'blocked');
  const done = all.filter((b) => b.data.status === 'completed');
  const closed = all.filter((b) => ['cancelled', 'expired'].includes(b.data.status));
  const drafts = all.filter((b) => b.data.status === 'draft');

  const totalOpenRep = open.reduce((n, b) => n + (b.data.reward?.rep || 0), 0);

  const L = [];
  L.push('<!-- GENERATED by `npm run bounty -- index`. Do not edit by hand. -->');
  L.push('');
  L.push('# Bounty Index');
  L.push('');
  L.push(`_Last generated: ${today()} · ${all.length} bounties · ${open.length} open · ${totalOpenRep} REP unclaimed_`);
  L.push('');
  L.push('| | Count |');
  L.push('| --- | --- |');
  L.push(`| ● Open | ${open.length} |`);
  L.push(`| ◐ Claimed / in review | ${claimed.length} |`);
  L.push(`| ■ Blocked | ${blocked.length} |`);
  L.push(`| ✓ Completed | ${done.length} |`);
  L.push(`| ○ Draft | ${drafts.length} |`);
  L.push(`| ✕ Cancelled / expired | ${closed.length} |`);
  L.push('');
  L.push('---');
  L.push('');

  const goodFirst = open.filter((b) => (b.data.labels || []).includes('good-first-bounty'));
  if (goodFirst.length) {
    L.push('## Good first bounties');
    L.push('');
    L.push('New here? Start with one of these.');
    L.push('');
    L.push(...table(goodFirst));
    L.push('');
  }

  L.push('## Open');
  L.push('');
  if (open.length === 0) L.push('_Nothing open. Post one._');
  else {
    for (const track of TRACKS) {
      const inTrack = open.filter((b) => b.data.track === track);
      if (!inTrack.length) continue;
      L.push(`### ${track}`);
      L.push('');
      L.push(...table(inTrack));
      L.push('');
    }
  }

  if (claimed.length) {
    L.push('## In flight');
    L.push('');
    L.push('| ID | Title | Claimed by | Expires |');
    L.push('| --- | --- | --- | --- |');
    for (const b of claimed) {
      const c = b.data.claim?.current;
      L.push(`| [${b.data.id}](${link(b)}) | ${b.data.title} | ${c ? '@' + c.handle : '—'} | ${c?.expires_at?.slice(0, 10) || '—'} |`);
    }
    L.push('');
  }

  if (blocked.length) {
    L.push('## Blocked');
    L.push('');
    L.push('| ID | Title | Reason |');
    L.push('| --- | --- | --- |');
    for (const b of blocked) L.push(`| [${b.data.id}](${link(b)}) | ${b.data.title} | ${b.data.blocked_reason || '—'} |`);
    L.push('');
  }

  if (drafts.length) {
    L.push('## Drafts');
    L.push('');
    L.push('_Not yet claimable._');
    L.push('');
    L.push(...table(drafts));
    L.push('');
  }

  if (done.length) {
    L.push('## Completed');
    L.push('');
    L.push('| ID | Title | By | REP |');
    L.push('| --- | --- | --- | --- |');
    for (const b of done) {
      L.push(`| [${b.data.id}](${link(b)}) | ${b.data.title} | @${b.data.completion?.handle || '?'} | ${b.data.completion?.rep_awarded ?? 0} |`);
    }
    L.push('');
  }

  if (closed.length) {
    L.push('## Cancelled / expired');
    L.push('');
    L.push(...table(closed));
    L.push('');
  }

  // Epics
  const epicDirs = await readdir(join(BOARD_DIR, 'epics'), { withFileTypes: true }).catch(() => []);
  const epics = epicDirs.filter((e) => e.isDirectory()).map((e) => e.name);
  if (epics.length) {
    L.push('## Epics');
    L.push('');
    L.push('| Epic | Bounties | Total REP |');
    L.push('| --- | --- | --- |');
    for (const e of epics) {
      const id = e.slice(0, 8);
      const members = all.filter((b) => b.data.epic === id);
      const rep = members.reduce((n, b) => n + (b.data.reward?.rep || 0), 0);
      L.push(`| [${e}](epics/${e}/) | ${members.length} | ${rep} |`);
    }
    L.push('');
  }

  L.push('---');
  L.push('');
  L.push('<sub>Regenerate with `npm run bounty -- index`. Filter live with `npm run bounty -- list --status open`.</sub>');
  L.push('');

  const out = L.join('\n');
  if (DRY) { console.log(out); return; }
  await writeFile(INDEX_PATH, out, 'utf8');
  console.log(`${color('green', 'wrote')} ${relative(REPO_ROOT, INDEX_PATH)} — ${all.length} bounties, ${open.length} open.`);

  function table(list) {
    const rows = ['| ID | Title | Size | Difficulty | REP | Skills |', '| --- | --- | --- | --- | --- | --- |'];
    for (const b of list) {
      rows.push(`| [${b.data.id}](${link(b)}) | ${b.data.title} | \`${b.data.size}\` | ${b.data.difficulty} | **${b.data.reward.rep}**${b.data.reward.bonus_rep ? ` (+${b.data.reward.bonus_rep})` : ''} | ${(b.data.skills || []).join(', ') || '—'} |`);
    }
    return rows;
  }
  function link(b) {
    return b.rel.replace(/^bounty-board\//, '') + '/';
  }
}

// ---------------- stats ----------------

async function cmdStats() {
  const all = (await loadBounties()).filter((b) => b.data);
  const by = (fn) => all.reduce((m, b) => (m[fn(b)] = (m[fn(b)] || 0) + 1, m), {});
  console.log('');
  console.log(header('Board'));
  console.log(`  ${all.length} bounties`);
  console.log(`  ${all.filter((b) => OPEN_STATUSES.has(b.data.status)).length} live`);
  console.log(`  ${all.filter((b) => b.data.status === 'open').reduce((n, b) => n + b.data.reward.rep, 0)} REP unclaimed`);
  console.log('');
  console.log(header('By status'));
  for (const [k, v] of Object.entries(by((b) => b.data.status))) console.log(`  ${k.padEnd(12)}${v}`);
  console.log('');
  console.log(header('By track'));
  for (const [k, v] of Object.entries(by((b) => b.data.track))) console.log(`  ${k.padEnd(12)}${v}`);
  console.log('');
  console.log(header('By size'));
  for (const [k, v] of Object.entries(by((b) => b.data.size))) console.log(`  ${k.padEnd(12)}${v}`);
  console.log('');
}

// ---------------- helpers ----------------

async function requireBounty(id) {
  if (!id) die('Provide a bounty ID, e.g. FB-0002.');
  const found = await findBountyById(id);
  if (!found) die(`No bounty with id ${id}. Try \`npm run bounty -- list\`.`);
  return found;
}

function die(msg) {
  console.error(color('red', msg));
  process.exit(1);
}

function printTable(headers, rows) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => stripAnsi(r[i]).length)));
  const fmt = (cells) => cells.map((c, i) => c + ' '.repeat(widths[i] - stripAnsi(c).length)).join('  ');
  console.log(header(fmt(headers)));
  for (const r of rows) console.log(fmt(r));
}

function stripAnsi(s) {
  return String(s).replace(/\u001b\[[0-9;]*m/g, '');
}
