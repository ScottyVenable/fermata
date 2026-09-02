#!/usr/bin/env node
// Fermata reputation CLI — reads and appends to the REP ledger.
//
// Usage:
//   node scripts/reputation.mjs award --who handle --event bounty.completed --ref FB-0002
//   node scripts/reputation.mjs rebuild          # regenerate every profile from the ledger
//   node scripts/reputation.mjs who handle
//   node scripts/reputation.mjs leaderboard
//   node scripts/reputation.mjs audit [--ledger-only]
//   node scripts/reputation.mjs tiers
//
// The ledger is append-only. Nothing here ever rewrites an existing line;
// corrections are new lines with source="correction".

import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

import { REPO_ROOT, parseArgs, color, header, today, readJson, writeJson } from './lib/repo.mjs';
import {
  LEDGER_DIR, PROFILES_DIR, OVERRIDES_DIR, LEADERBOARD_PATH,
  EVENT_POINTS, TARGET_MULTIPLIERS, TIERS, MAX_MULTIPLIER,
  readLedger, appendEvent, foldLedger, tierFor, computePoints,
  makeEventId, nowIso, quarterOf, findBountyById, loadBounties,
} from './lib/bounty.mjs';

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
const DRY = Boolean(args['dry-run']);

const COMMANDS = {
  award: cmdAward,
  rebuild: cmdRebuild,
  who: cmdWho,
  leaderboard: cmdLeaderboard,
  audit: cmdAudit,
  tiers: cmdTiers,
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
${header('fermata rep')} — the reputation ledger CLI

  ${color('cyan', 'award')}        --who handle --event <event> --ref FB-#### [--points n] [--reason "..."]
  ${color('cyan', 'rebuild')}                  recompute every profile from the ledger
  ${color('cyan', 'who')}          handle      one contributor's standing
  ${color('cyan', 'leaderboard')}              regenerate reputation/LEADERBOARD.md
  ${color('cyan', 'audit')}        [--ledger-only]   integrity + anti-gaming checks
  ${color('cyan', 'tiers')}                    the tier table

The ledger is append-only and normally written by CI, not by hand.
Docs: bounty-board/REPUTATION.md
`);
}

// ---------------- award ----------------

async function cmdAward() {
  const who = (args.who || '').toLowerCase();
  const event = args.event;
  const ref = args.ref;
  if (!who || !event || !ref) {
    die('Usage: rep award --who <handle> --event <event> --ref <FB-####|path|repo>');
  }
  if (!(event in EVENT_POINTS)) {
    die(`Unknown event "${event}". See bounty-board/REPUTATION.md for the list.`);
  }

  let base = args.points !== undefined ? Number(args.points) : EVENT_POINTS[event];
  let multiplier = args.multiplier !== undefined ? Number(args.multiplier) : 1.0;
  let track;

  // bounty.* events derive their value from the bounty itself.
  if (base === null || base === undefined) {
    const bounty = await findBountyById(ref);
    if (!bounty) die(`${event} needs a real bounty ref (got "${ref}"), or an explicit --points.`);
    base = event === 'bounty.bonus' ? (bounty.data.reward.bonus_rep || 0) : bounty.data.reward.rep;
    track = bounty.data.track;
    if (args.multiplier === undefined) {
      multiplier = multiplierFor(bounty.data, who);
    }
  } else {
    const bounty = await findBountyById(ref).catch(() => null);
    if (bounty) track = bounty.data.track;
  }

  const actor = args.actor || process.env.GITHUB_ACTOR || 'manual';
  if (actor.toLowerCase() === who && (args.source || 'manual') !== 'correction') {
    die('Self-awarding is a hard fail. The award must come from a reviewer, a maintainer, or CI.');
  }

  const ts = args.ts || nowIso();
  const event_ = {
    ts,
    id: makeEventId(new Date(ts)),
    event,
    subject: who,
    subject_kind: args.kind === 'bot' ? 'bot' : 'human',
    actor,
    ref,
    ...(args['ref-url'] ? { ref_url: args['ref-url'] } : {}),
    ...(track ? { track } : {}),
    base_points: base,
    multiplier: Math.min(multiplier, MAX_MULTIPLIER),
    points: computePoints(base, multiplier),
    reason: args.reason || defaultReason(event, ref),
    source: args.source || (process.env.GITHUB_ACTIONS ? 'workflow' : 'manual'),
    ...(args.corrects ? { corrects: args.corrects } : {}),
    schema: 1,
  };

  // Idempotency: same (subject, event, ref) is a no-op.
  const existing = await readLedger();
  if (existing.some((e) => e.subject === event_.subject && e.event === event_.event && e.ref === event_.ref && e.source !== 'correction')) {
    console.log(color('yellow', `Already awarded: ${event_.subject} · ${event_.event} · ${event_.ref}. No-op.`));
    return;
  }

  console.log(header(`${DRY ? '[dry-run] would append' : 'Appending'} to ${quarterOf(new Date(ts))}.jsonl`));
  console.log(JSON.stringify(event_, null, 2));
  if (!DRY) {
    await appendEvent(event_);
    console.log('');
    console.log(`  ${color('green', `${event_.points >= 0 ? '+' : ''}${event_.points} REP`)} → @${who} (base ${base} × ${event_.multiplier})`);
    console.log(color('gray', '  Run `npm run rep -- rebuild` to refresh profiles and the leaderboard.'));
  }
}

function multiplierFor(b, who) {
  let m = 1.0;
  const types = (b.targets || []).map((t) => t.type);
  if (types.includes('project')) m *= TARGET_MULTIPLIERS.project;
  else if (types.includes('external-repo')) m *= TARGET_MULTIPLIERS['external-repo'];
  if ((b.labels || []).includes('help-wanted-urgent')) m *= 1.25;
  if (b.requested_by?.handle?.toLowerCase() === who) m *= 0.5;
  return Math.min(Number(m.toFixed(3)), MAX_MULTIPLIER);
}

function defaultReason(event, ref) {
  return `${event} on ${ref}.`;
}

// ---------------- rebuild ----------------

async function cmdRebuild() {
  const events = await readLedger();
  const profiles = foldLedger(events);

  // Merge in the hand-editable override files.
  const overrides = new Map();
  if (existsSync(OVERRIDES_DIR)) {
    for (const f of (await readdir(OVERRIDES_DIR)).filter((f) => f.endsWith('.json'))) {
      const o = await readJson(join(OVERRIDES_DIR, f));
      overrides.set(f.replace(/\.json$/, '').toLowerCase(), o);
    }
  }

  if (DRY) {
    console.log(`[dry-run] ${profiles.size} profiles from ${events.length} events.`);
    for (const p of profiles.values()) console.log(`  @${p.handle}  ${p.rep_lifetime} REP  ${p.tier}`);
    return;
  }

  await mkdir(PROFILES_DIR, { recursive: true });
  // Profiles are fully derived: clear before writing so deleted handles don't linger.
  for (const f of (await readdir(PROFILES_DIR)).filter((f) => f.endsWith('.json'))) {
    await rm(join(PROFILES_DIR, f));
  }

  for (const p of profiles.values()) {
    const o = overrides.get(p.handle) || {};
    const merged = {
      handle: p.handle,
      kind: o.kind || p.kind,
      ...(o.display_name ? { display_name: o.display_name } : {}),
      ...(o.pronouns ? { pronouns: o.pronouns } : {}),
      ...(o.bio ? { bio: o.bio } : {}),
      ...(o.avatar_url ? { avatar_url: o.avatar_url } : {}),
      ...(o.links ? { links: o.links } : {}),
      ...(o.operator ? { operator: o.operator } : {}),
      rep_lifetime: p.rep_lifetime,
      rep_season: p.rep_season,
      season: p.season,
      tier: p.tier,
      first_seen: p.first_seen,
      last_active: p.last_active,
      counts: p.counts,
      tracks: p.tracks,
      badges: p.badges,
      recent: p.recent,
    };
    await writeJson(join(PROFILES_DIR, `${p.handle}.json`), merged);
  }

  console.log(`${color('green', 'rebuilt')} ${profiles.size} profile${profiles.size === 1 ? '' : 's'} from ${events.length} ledger event${events.length === 1 ? '' : 's'}.`);
}

// ---------------- who ----------------

async function cmdWho() {
  const handle = (args._[1] || args.who || '').toLowerCase();
  if (!handle) die('Usage: rep who <handle>');
  const profiles = foldLedger(await readLedger());
  const p = profiles.get(handle);
  if (!p) { console.log(color('gray', `No ledger activity for @${handle} yet.`)); return; }

  const tier = TIERS.find((t) => t.key === p.tier);
  const next = TIERS[TIERS.indexOf(tier) + 1];

  console.log('');
  console.log(header(`@${p.handle}  ${tier.symbol} ${tier.name}`));
  console.log('');
  console.log(`  ${color('gray', 'Lifetime'.padEnd(14))}${p.rep_lifetime} REP`);
  console.log(`  ${color('gray', 'This season'.padEnd(14))}${p.rep_season} REP (${p.season})`);
  if (next) console.log(`  ${color('gray', 'Next tier'.padEnd(14))}${next.symbol} ${next.name} in ${Math.max(0, next.min - p.rep_lifetime)} REP`);
  console.log(`  ${color('gray', 'Active'.padEnd(14))}${p.first_seen} → ${p.last_active}`);
  console.log(`  ${color('gray', 'Concurrency'.padEnd(14))}${tier.concurrency} claims`);
  console.log('');
  console.log(header('Counts'));
  for (const [k, v] of Object.entries(p.counts)) if (v) console.log(`  ${k.padEnd(22)}${v}`);
  if (Object.keys(p.tracks).length) {
    console.log('');
    console.log(header('By track'));
    for (const [k, v] of Object.entries(p.tracks)) console.log(`  ${k.padEnd(22)}${v} REP`);
  }
  if (p.badges.length) {
    console.log('');
    console.log(header('Badges'));
    console.log(`  ${p.badges.join(' · ')}`);
  }
  console.log('');
  console.log(header('Recent'));
  for (const r of p.recent.slice(0, 8)) {
    console.log(`  ${r.ts.slice(0, 10)}  ${String(r.event).padEnd(24)} ${String(r.ref).padEnd(12)} ${r.points >= 0 ? '+' : ''}${r.points}`);
  }
  console.log('');
}

// ---------------- leaderboard ----------------

async function cmdLeaderboard() {
  const events = await readLedger();
  const profiles = [...foldLedger(events).values()];
  const season = quarterOf();
  const humans = profiles.filter((p) => p.kind === 'human').sort((a, b) => b.rep_lifetime - a.rep_lifetime);
  const bots = profiles.filter((p) => p.kind === 'bot').sort((a, b) => b.rep_lifetime - a.rep_lifetime);
  const bySeason = [...profiles].filter((p) => p.rep_season > 0).sort((a, b) => b.rep_season - a.rep_season);

  const L = [];
  L.push('<!-- GENERATED by `npm run rep -- leaderboard`. Do not edit by hand. -->');
  L.push('');
  L.push('# Leaderboard');
  L.push('');
  L.push(`_Season ${season} · ${profiles.length} contributors · ${events.length} ledger events · generated ${today()}_`);
  L.push('');
  L.push('Lifetime REP determines your tier and never decays. Season REP resets quarterly and');
  L.push('drives the season board, so a good quarter beats a long history.');
  L.push('');

  L.push(`## Season ${season}`);
  L.push('');
  if (!bySeason.length) L.push('_No activity this season yet._');
  else {
    L.push('| # | Contributor | Season REP | Lifetime | Tier |');
    L.push('| --- | --- | --- | --- | --- |');
    bySeason.forEach((p, i) => {
      const t = TIERS.find((t) => t.key === p.tier);
      L.push(`| ${i + 1} | [@${p.handle}](profiles/${p.handle}.json)${p.kind === 'bot' ? ' 🤖' : ''} | **${p.rep_season}** | ${p.rep_lifetime} | ${t.symbol} ${t.name} |`);
    });
  }
  L.push('');

  L.push('## Lifetime — humans');
  L.push('');
  if (!humans.length) L.push('_Nobody yet. Be first._');
  else {
    L.push('| # | Contributor | REP | Tier | Bounties | Reviews | Projects | Badges |');
    L.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
    humans.forEach((p, i) => {
      const t = TIERS.find((t) => t.key === p.tier);
      L.push(`| ${i + 1} | [@${p.handle}](profiles/${p.handle}.json) | **${p.rep_lifetime}** | ${t.symbol} ${t.name} | ${p.counts.bounties_completed} | ${p.counts.reviews} | ${p.counts.projects_published} | ${p.badges.length ? p.badges.join(', ') : '—'} |`);
    });
  }
  L.push('');

  L.push('## Lifetime — bots');
  L.push('');
  L.push('_Bots are capped at ♫ Phrase and cannot review, approve, or promote._');
  L.push('');
  if (!bots.length) L.push('_No bot contributors yet._');
  else {
    L.push('| # | Bot | Operator | REP | Bounties |');
    L.push('| --- | --- | --- | --- | --- |');
    bots.forEach((p, i) => {
      L.push(`| ${i + 1} | [@${p.handle}](profiles/${p.handle}.json) | ${p.operator ? '@' + p.operator : '—'} | **${p.rep_lifetime}** | ${p.counts.bounties_completed} |`);
    });
  }
  L.push('');
  L.push('---');
  L.push('');
  L.push('<sub>Regenerate with `npm run rep -- leaderboard`. Full spec: [REPUTATION.md](../REPUTATION.md).</sub>');
  L.push('');

  const out = L.join('\n');
  if (DRY) { console.log(out); return; }
  await mkdir(join(LEADERBOARD_PATH, '..'), { recursive: true });
  await writeFile(LEADERBOARD_PATH, out, 'utf8');
  console.log(`${color('green', 'wrote')} ${relative(REPO_ROOT, LEADERBOARD_PATH)} — ${profiles.length} contributors.`);
}

// ---------------- audit ----------------

async function cmdAudit() {
  const problems = [];
  const flags = [];

  let events;
  try {
    events = await readLedger();
  } catch (err) {
    console.error(color('red', `Ledger unreadable: ${err.message}`));
    process.exit(1);
  }

  const seenIds = new Set();
  const seenTriples = new Set();
  let prevTs = '';

  for (const ev of events) {
    const at = `${ev._file}:${ev._line}`;
    for (const f of ['ts', 'id', 'event', 'subject', 'subject_kind', 'actor', 'ref', 'base_points', 'multiplier', 'points', 'reason', 'source', 'schema']) {
      if (ev[f] === undefined) problems.push(`${at} missing required field \`${f}\`.`);
    }
    if (!(ev.event in EVENT_POINTS)) problems.push(`${at} unknown event "${ev.event}".`);
    if (seenIds.has(ev.id)) problems.push(`${at} duplicate event id ${ev.id}.`);
    seenIds.add(ev.id);

    if (ev.ts < prevTs) problems.push(`${at} out-of-order timestamp (${ev.ts} < ${prevTs}).`);
    prevTs = ev.ts;

    if (ev.multiplier > MAX_MULTIPLIER) problems.push(`${at} multiplier ${ev.multiplier} exceeds the ×${MAX_MULTIPLIER} cap.`);
    const expected = computePoints(ev.base_points, ev.multiplier);
    if (ev.points !== expected) problems.push(`${at} points ${ev.points} ≠ round(${ev.base_points} × ${ev.multiplier}) = ${expected}.`);

    if (String(ev.actor).toLowerCase() === String(ev.subject).toLowerCase() && ev.source !== 'correction') {
      problems.push(`${at} self-award by @${ev.subject}.`);
    }
    if (ev.source === 'correction' && !ev.corrects) problems.push(`${at} correction without a \`corrects\` id.`);
    if (String(ev.event).startsWith('external.') && !ev.ref_url) problems.push(`${at} external event without ref_url.`);

    const triple = `${ev.subject}|${ev.event}|${ev.ref}`;
    if (ev.source !== 'correction') {
      if (seenTriples.has(triple)) problems.push(`${at} duplicate award: ${triple}.`);
      seenTriples.add(triple);
    }
  }

  // Dangling refs against real bounties.
  if (!args['ledger-only']) {
    const known = new Set((await loadBounties()).filter((b) => b.data).map((b) => b.data.id));
    for (const ev of events) {
      if (/^FB-\d{4}$/.test(ev.ref) && !known.has(ev.ref)) {
        problems.push(`${ev._file}:${ev._line} references unknown bounty ${ev.ref}.`);
      }
    }
  }

  // --- heuristics (flags, not failures) ---
  const bySubject = groupBy(events, (e) => e.subject);
  for (const [subject, evs] of bySubject) {
    const season = evs.filter((e) => quarterOf(e.ts) === quarterOf());
    const seasonTotal = season.reduce((n, e) => n + e.points, 0);
    if (seasonTotal > 0) {
      const byActor = groupBy(season, (e) => e.actor);
      for (const [actor, aevs] of byActor) {
        const share = aevs.reduce((n, e) => n + e.points, 0) / seasonTotal;
        if (share > 0.8 && actor !== 'github-actions[bot]' && season.length > 3) {
          flags.push(`@${subject}: ${Math.round(share * 100)}% of season REP awarded by @${actor}.`);
        }
      }
    }
    // Burst detection
    const sorted = [...evs].sort((a, b) => a.ts.localeCompare(b.ts));
    for (let i = 5; i < sorted.length; i++) {
      const dt = new Date(sorted[i].ts) - new Date(sorted[i - 5].ts);
      if (dt < 10 * 60 * 1000) {
        flags.push(`@${subject}: 6 awards within 10 minutes around ${sorted[i].ts}.`);
        break;
      }
    }
  }

  // Reciprocal review loops
  const reviewPairs = new Map();
  for (const ev of events) {
    if (!String(ev.event).startsWith('review.')) continue;
    const key = `${ev.actor}->${ev.subject}`;
    reviewPairs.set(key, (reviewPairs.get(key) || 0) + 1);
  }
  for (const [key, n] of reviewPairs) {
    const [a, b] = key.split('->');
    const back = reviewPairs.get(`${b}->${a}`) || 0;
    if (n > 5 && back > 5) flags.push(`Reciprocal review loop: @${a} ↔ @${b} (${n}/${back}).`);
  }

  // Profiles must match a fresh fold.
  if (!args['ledger-only'] && existsSync(PROFILES_DIR)) {
    const fresh = foldLedger(events);
    for (const f of (await readdir(PROFILES_DIR)).filter((f) => f.endsWith('.json'))) {
      const handle = f.replace(/\.json$/, '');
      const onDisk = await readJson(join(PROFILES_DIR, f));
      const computed = fresh.get(handle);
      if (!computed) { problems.push(`profiles/${f} has no ledger events — stale. Run \`rep rebuild\`.`); continue; }
      if (onDisk.rep_lifetime !== computed.rep_lifetime) {
        problems.push(`profiles/${f} says ${onDisk.rep_lifetime} REP, ledger says ${computed.rep_lifetime}. Run \`rep rebuild\`.`);
      }
    }
  }

  console.log('');
  console.log(header(`Audited ${events.length} ledger event${events.length === 1 ? '' : 's'}`));
  console.log('');
  for (const f of flags) console.log(`${color('yellow', 'flag')} ${f}`);
  for (const p of problems) console.log(`${color('red', 'fail')} ${p}`);
  console.log('');
  if (problems.length === 0) {
    console.log(color('green', `Ledger integrity OK.${flags.length ? ` ${flags.length} flag${flags.length === 1 ? '' : 's'} for human review.` : ''}`));
  } else {
    console.log(color('red', `${problems.length} integrity problem${problems.length === 1 ? '' : 's'}.`));
    process.exit(1);
  }
}

function groupBy(arr, fn) {
  const m = new Map();
  for (const x of arr) {
    const k = fn(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return m;
}

// ---------------- tiers ----------------

function cmdTiers() {
  console.log('');
  console.log(header('  TIER          SYMBOL   REP     CONCURRENT CLAIMS'));
  for (const t of TIERS) {
    console.log(`  ${t.name.padEnd(14)}${t.symbol.padEnd(9)}${String(t.min).padEnd(8)}${t.concurrency}`);
  }
  console.log('');
  console.log(color('gray', '  Full spec: bounty-board/REPUTATION.md#tiers'));
  console.log('');
}

function die(msg) {
  console.error(color('red', msg));
  process.exit(1);
}
