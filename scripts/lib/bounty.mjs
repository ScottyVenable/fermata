// Shared primitives for the Fermata bounty board and reputation ledger.
// Node 18+ built-ins only — same constraint as lib/repo.mjs.
//
// Everything that touches bounty-board/ on disk goes through this module, so
// scripts/bounty.mjs and scripts/reputation.mjs never duplicate IO or rules.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { REPO_ROOT, readJson, writeJson } from './repo.mjs';

// ---------- paths ----------

export const BOARD_DIR = join(REPO_ROOT, 'bounty-board');
export const BOUNTIES_DIR = join(BOARD_DIR, 'bounties');
export const TEMPLATES_DIR = join(BOARD_DIR, 'templates');
export const PROPOSALS_DIR = join(BOARD_DIR, 'proposals');
export const EPICS_DIR = join(BOARD_DIR, 'epics');
export const REPUTATION_DIR = join(BOARD_DIR, 'reputation');
export const LEDGER_DIR = join(REPUTATION_DIR, 'ledger');
export const PROFILES_DIR = join(REPUTATION_DIR, 'profiles');
export const OVERRIDES_DIR = join(PROFILES_DIR, '_overrides');
export const INDEX_PATH = join(BOARD_DIR, 'INDEX.md');
export const LEADERBOARD_PATH = join(REPUTATION_DIR, 'LEADERBOARD.md');

// ---------- enums ----------

export const TRACKS = [
  'tooling', 'automation', 'docs', 'design', 'web', 'projects', 'ecosystem', 'meta',
];

export const STATUSES = [
  'draft', 'open', 'claimed', 'in-review', 'completed', 'blocked', 'cancelled', 'expired',
];

export const OPEN_STATUSES = new Set(['open', 'claimed', 'in-review', 'blocked']);

export const SIZES = ['xs', 's', 'm', 'l', 'xl', 'epic'];

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

// REP bands and TTLs per size. See ARCHITECTURE.md#sizes.
export const SIZE_RULES = {
  xs:   { min: 10,  max: 25,   ttl: 7,  concurrency: 0, minTier: 'rest' },
  s:    { min: 30,  max: 75,   ttl: 14, concurrency: 1, minTier: 'rest' },
  m:    { min: 80,  max: 200,  ttl: 21, concurrency: 1, minTier: 'note' },
  l:    { min: 220, max: 500,  ttl: 30, concurrency: 2, minTier: 'note' },
  xl:   { min: 550, max: 1200, ttl: 60, concurrency: 2, minTier: 'phrase' },
  epic: { min: 0,   max: 0,    ttl: 0,  concurrency: 0, minTier: 'rest' },
};

// ID ranges reserved per track. See README.md#id-scheme.
export const ID_RANGES = {
  tooling:    [1, 99],
  automation: [1, 99],
  docs:       [1, 99],
  design:     [1, 99],
  projects:   [1, 99],
  web:        [1, 99],
  ecosystem:  [100, 399],
  meta:       [900, 999],
};

export const TIERS = [
  { key: 'rest',     symbol: '\u{1D17D}', name: 'Rest',     min: 0,    concurrency: 1 },
  { key: 'note',     symbol: '\u266A',    name: 'Note',     min: 100,  concurrency: 2 },
  { key: 'measure',  symbol: '\u{1D100}', name: 'Measure',  min: 250,  concurrency: 2 },
  { key: 'phrase',   symbol: '\u266B',    name: 'Phrase',   min: 500,  concurrency: 3 },
  { key: 'movement', symbol: '\u{1D106}', name: 'Movement', min: 1000, concurrency: 4 },
  { key: 'fermata',  symbol: '\u{1D110}', name: 'Fermata',  min: 2500, concurrency: 4 },
  { key: 'coda',     symbol: '\u{1D10C}', name: 'Coda',     min: 5000, concurrency: 4 },
];

// Base point values per event. See REPUTATION.md.
export const EVENT_POINTS = {
  'bounty.completed': null,   // taken from the bounty's reward.rep
  'bounty.bonus': null,       // taken from the bounty's reward.bonus_rep
  'bounty.first': 25,
  'bounty.streak': 20,
  'bounty.rescued': 30,
  'bounty.authored': 15,
  'proposal.promoted': 10,
  'review.completed': 15,
  'review.thorough': 10,
  'triage.completed': 5,
  'steward.quarter': 50,
  'mentor.assist': 20,
  'project.published': 75,
  'project.contribution': 40,
  'project.maintained': 30,
  'project.graduated': 100,
  'project.documented': 25,
  'external.merged': 50,
  'external.reported': 10,
  'ecosystem.integration': 60,
  'community.answered': 5,
  'good-faith-collision': 5,
  'claim.dropped-cleanly': 0,
  'security.reported': 75,
  'claim.expired-silent': -10,
  'claim.expired-repeat': -25,
  'submission.abandoned': -15,
  'conduct.violation': -100,
  'award.corrected': null,    // explicit
};

export const MAX_MULTIPLIER = 2.0;

export const TARGET_MULTIPLIERS = {
  'repo-path': 1.0,
  'new-project': 1.0,
  'project': 1.5,
  'external-repo': 1.25,
};

export const BADGE_RULES = [
  { key: 'first-bounty',    test: (p) => p.counts.bounties_completed >= 1 },
  { key: 'good-neighbor',   test: (p) => (p.counts.project_contributions || 0) >= 5 },
  { key: 'outward-bound',   test: (p) => (p.counts.external_merged || 0) >= 3 },
  { key: 'polymath',        test: (p) => Object.keys(p.tracks || {}).length >= 4 },
  { key: 'bug-hunter',      test: (p) => (p.counts.reviews_thorough || 0) >= 5 },
  { key: 'founder',         test: (p) => (p.counts.bounties_authored || 0) >= 10 },
  { key: 'machine',         test: (p) => p.kind === 'bot' && p.counts.bounties_completed >= 10 },
  { key: 'ecosystem',       test: (p) => (p.tracks || {}).ecosystem > 0 },
];

// ---------- bounty discovery ----------

// Walks bounties/ and returns every directory containing a bounty.json.
export async function findBounties(dir = BOUNTIES_DIR, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  if (entries.some((e) => e.isFile() && e.name === 'bounty.json')) {
    out.push(dir);
    return out;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    await findBounties(join(dir, entry.name), out);
  }
  return out;
}

export async function loadBounties() {
  const dirs = await findBounties();
  const loaded = [];
  for (const dir of dirs) {
    try {
      const data = await readJson(join(dir, 'bounty.json'));
      loaded.push({ dir, rel: relative(REPO_ROOT, dir), data });
    } catch (err) {
      loaded.push({ dir, rel: relative(REPO_ROOT, dir), data: null, error: err.message });
    }
  }
  loaded.sort((a, b) => String(a.data?.id).localeCompare(String(b.data?.id)));
  return loaded;
}

export async function findBountyById(id) {
  const all = await loadBounties();
  return all.find((b) => b.data && b.data.id === id.toUpperCase()) || null;
}

export function trackFromPath(dir) {
  const parts = relative(BOUNTIES_DIR, dir).split(sep);
  return parts[0];
}

export function bountyFolderName(id, slug) {
  return `${id}-${slug}`;
}

export async function nextBountyId(track) {
  const [lo, hi] = ID_RANGES[track] || [1000, 9999];
  const all = await loadBounties();
  const used = new Set(all.filter((b) => b.data?.id).map((b) => Number(b.data.id.slice(3))));
  for (let n = lo; n <= hi; n++) {
    if (!used.has(n)) return `FB-${String(n).padStart(4, '0')}`;
  }
  // Range exhausted — fall back to the general pool.
  for (let n = 1000; n <= 9999; n++) {
    if (!used.has(n)) return `FB-${String(n).padStart(4, '0')}`;
  }
  throw new Error('No free bounty IDs.');
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter((w) => !['a', 'an', 'the', 'and', 'for', 'to', 'of', 'in', 'add'].includes(w))
    .slice(0, 5)
    .join('-');
}

// ---------- README parsing ----------

export const REQUIRED_SECTIONS = [
  'Summary', 'Context', 'Scope', 'Out of scope', 'Acceptance criteria',
  'Deliverables', 'Definition of done', 'Reward', 'Getting started', 'Notes',
];

export function stripComments(md) {
  return md.replace(/<!--[\s\S]*?-->/g, '');
}

export function parseSections(md) {
  const clean = stripComments(md);
  const sections = {};
  const re = /^##\s+(.+?)\s*$/gm;
  let match;
  const marks = [];
  while ((match = re.exec(clean)) !== null) {
    marks.push({ name: match[1].trim(), start: match.index + match[0].length });
  }
  for (let i = 0; i < marks.length; i++) {
    const end = i + 1 < marks.length ? clean.lastIndexOf('##', marks[i + 1].start) : clean.length;
    sections[marks[i].name] = clean.slice(marks[i].start, end).trim();
  }
  return sections;
}

export function parseAcceptance(md) {
  const sections = parseSections(md);
  const body = sections['Acceptance criteria'];
  if (!body) return [];
  // Stop at the Bonus subsection — bonus items are counted separately.
  const main = body.split(/^###\s+Bonus/m)[0];
  return [...main.matchAll(/^\s*-\s*\[([ xX])\]\s+(.+)$/gm)].map((m) => ({
    checked: m[1].toLowerCase() === 'x',
    text: m[2].trim(),
  }));
}

export function parseTitle(md) {
  const m = stripComments(md).match(/^#\s+(.+?)\s*$/m);
  if (!m) return null;
  // "FB-0002: Title" → "Title"
  return m[1].replace(/^FB-\d{4}\s*[:\u2014-]\s*/, '').trim();
}

// ---------- front matter ----------

export function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim().replace(/\s+#.*$/, '').trim();
    if (value === '') value = null;
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^-?\d+$/.test(value)) value = Number(value);
    out[kv[1]] = value;
  }
  return out;
}

// ---------- ledger ----------

export function quarterOf(date = new Date()) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
}

export function ledgerPathFor(date = new Date()) {
  return join(LEDGER_DIR, `${quarterOf(date)}.jsonl`);
}

export function makeEventId(date = new Date()) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  const stamp = `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}_` +
                `${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}`;
  const rand = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  return `ev_${stamp}_${rand}`;
}

export async function readLedger() {
  const events = [];
  let files;
  try {
    files = (await readdir(LEDGER_DIR)).filter((f) => f.endsWith('.jsonl')).sort();
  } catch {
    return events;
  }
  for (const file of files) {
    const raw = await readFile(join(LEDGER_DIR, file), 'utf8');
    raw.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//')) return;
      try {
        events.push({ ...JSON.parse(trimmed), _file: file, _line: i + 1 });
      } catch (err) {
        throw new Error(`${file}:${i + 1} is not valid JSON — ${err.message}`);
      }
    });
  }
  return events;
}

export async function appendEvent(event) {
  await mkdir(LEDGER_DIR, { recursive: true });
  const path = ledgerPathFor(new Date(event.ts));
  const line = JSON.stringify(event) + '\n';
  const prefix = existsSync(path) ? '' : '';
  await writeFile(path, prefix + line, { encoding: 'utf8', flag: 'a' });
  return path;
}

export function computePoints(base, multiplier) {
  const capped = Math.min(multiplier, MAX_MULTIPLIER);
  return Math.sign(base) * Math.round(Math.abs(base) * capped);
}

export function tierFor(points) {
  let current = TIERS[0];
  for (const t of TIERS) if (points >= t.min) current = t;
  return current;
}

// Fold the ledger into per-handle profiles. Pure — no IO.
export function foldLedger(events, { season = quarterOf() } = {}) {
  const profiles = new Map();

  const ensure = (handle, kind) => {
    if (!profiles.has(handle)) {
      profiles.set(handle, {
        handle,
        kind: kind || 'human',
        rep_lifetime: 0,
        rep_season: 0,
        season,
        tier: 'rest',
        first_seen: null,
        last_active: null,
        counts: {},
        tracks: {},
        badges: [],
        recent: [],
      });
    }
    const p = profiles.get(handle);
    if (kind === 'bot') p.kind = 'bot';
    return p;
  };

  const bump = (p, key, n = 1) => { p.counts[key] = (p.counts[key] || 0) + n; };

  for (const ev of events) {
    const p = ensure(String(ev.subject).toLowerCase(), ev.subject_kind);
    const day = String(ev.ts).slice(0, 10);
    p.rep_lifetime += ev.points;
    if (quarterOf(ev.ts) === season) p.rep_season += ev.points;
    if (!p.first_seen || day < p.first_seen) p.first_seen = day;
    if (!p.last_active || day > p.last_active) p.last_active = day;

    if (ev.track) p.tracks[ev.track] = (p.tracks[ev.track] || 0) + ev.points;

    switch (ev.event) {
      case 'bounty.completed': bump(p, 'bounties_completed'); break;
      case 'bounty.authored': bump(p, 'bounties_authored'); break;
      case 'review.completed': bump(p, 'reviews'); break;
      case 'review.thorough': bump(p, 'reviews_thorough'); break;
      case 'project.published': bump(p, 'projects_published'); break;
      case 'project.contribution': bump(p, 'project_contributions'); break;
      case 'external.merged': bump(p, 'external_merged'); break;
      default: break;
    }

    p.recent.unshift({ ts: ev.ts, event: ev.event, ref: ev.ref, points: ev.points });
    if (p.recent.length > 20) p.recent.pop();
  }

  for (const p of profiles.values()) {
    p.tier = tierFor(p.rep_lifetime).key;
    p.counts = {
      bounties_completed: 0, bounties_authored: 0, reviews: 0,
      projects_published: 0, external_merged: 0, ...p.counts,
    };
    p.badges = BADGE_RULES.filter((b) => {
      try { return b.test(p); } catch { return false; }
    }).map((b) => b.key);
  }

  return profiles;
}

// ---------- misc ----------

export function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function addDays(iso, days) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function statusBadge(status) {
  return {
    draft: '\u25CB draft',
    open: '\u25CF open',
    claimed: '\u25D0 claimed',
    'in-review': '\u25D1 in-review',
    completed: '\u2713 completed',
    blocked: '\u25A0 blocked',
    cancelled: '\u2715 cancelled',
    expired: '\u25CB expired',
  }[status] || status;
}

export { readJson, writeJson };
