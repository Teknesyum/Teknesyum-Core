const fs = require('fs');
const path = require('path');
const { read, relayRoot, liveDir, rewire } = require('./lib.js');

const CAP = 200;
const LOG_ASK = /(^|\s)(log|günlük|gunluk)\s*(yaz|tut)\w*/i;
const STALE_MS = 12 * 60 * 60 * 1000;

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let out = '';
  try {
    out = cue(JSON.parse(raw));
  } catch {}
  if (out) process.stdout.write(out.slice(0, CAP));
  process.exit(0);
});

function cue(j) {
  const ev = j.hook_event_name || '';
  if (ev === 'UserPromptSubmit') {
    try {
      require('./notify.js').stamp('prompt', Date.now(), j.cwd);
    } catch {}
    return join(owedCue(j), logCue(j));
  }
  if (ev === 'SessionStart') {
    try {
      rewire();
    } catch {}
    return join(owedCue(j), relayCue(j));
  }
  return '';
}

function join(a, b) {
  return [a, b].filter(Boolean).join(' | ');
}

function owedCue(j) {
  const r = relayRoot(j.cwd || process.cwd(), { git: false });
  if (!r) return '';
  try {
    return require('../scripts/handoff.js').owedCue(r.relay);
  } catch {
    return '';
  }
}

function logCue(j) {
  if (!LOG_ASK.test(String(j.prompt || ''))) return '';
  const s = path.join(path.resolve(__dirname, '..'), 'scripts', 'log.js').split(path.sep).join('/');
  return 'Never hand-write a bug log. Run: node "' + s + '" write --title T --symptom S';
}

function relayCue(j) {
  const r = relayRoot(j.cwd || process.cwd());
  if (!r) return '';
  const open = names(path.join(r.relay, 'contracts'), (f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
  const live = running(liveDir(r.relay));
  if (!open.length && !live.length) return '';
  const parts = ['read .claude/relay/ before writing code.'];
  if (open.length) parts.push('open: ' + open.slice(0, 8).join(', '));
  if (live.length) parts.push('live: ' + live.slice(0, 6).join(', '));
  return parts.join(' | ');
}

function running(live) {
  const cutoff = Date.now() - STALE_MS;
  const out = [];
  for (const f of names(live, (n) => n.endsWith('.json') && !n.startsWith('_'))) {
    const p = path.join(live, f);
    const a = read(p);
    if (!a || a.ended || !a.role) continue;
    const seen = Date.parse(a.updated || a.started || '') || 0;
    if (seen && seen < cutoff) continue;
    if (!out.includes(a.role)) out.push(a.role);
  }
  return out;
}

function names(dir, keep) {
  try {
    return fs.readdirSync(dir).filter(keep);
  } catch {
    return [];
  }
}
