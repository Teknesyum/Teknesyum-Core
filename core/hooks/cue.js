const fs = require('fs');
const path = require('path');
const { read, relayRoot, liveDir } = require('./lib.js');

const CAP = 200;
const LOG_ASK = /(^|\s)(log|günlük|gunluk)\s*(yaz|tut)\b/i;

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
  if (ev === 'UserPromptSubmit') return logCue(j);
  if (ev === 'SessionStart' || ev === 'PostCompact') return relayCue(j);
  return '';
}

function logCue(j) {
  if (!LOG_ASK.test(String(j.prompt || ''))) return '';
  const s = path.join(path.resolve(__dirname, '..'), 'scripts', 'log.js').split(path.sep).join('/');
  return 'Bug log requested. Run: node "' + s + '" write --title T --symptom S. Never hand-write it.';
}

function relayCue(j) {
  const r = relayRoot(j.cwd || process.cwd(), { git: false });
  if (!r) return '';
  const open = names(path.join(r.relay, 'contracts'), (f) => f.endsWith('.md')).map((f) => f.slice(0, -3));
  const live = names(liveDir(r.relay), (f) => f.endsWith('.json') && !f.startsWith('_'))
    .map((f) => read(path.join(liveDir(r.relay), f)))
    .filter((a) => a && !a.ended && a.role)
    .map((a) => a.role);
  if (!open.length && !live.length) return '';
  const parts = [];
  if (open.length) parts.push('Open relay: ' + open.slice(0, 8).join(', '));
  if (live.length) parts.push('live: ' + [...new Set(live)].slice(0, 6).join(', '));
  parts.push('read .claude/relay/ before writing code.');
  return parts.join(' | ');
}

function names(dir, keep) {
  try {
    return fs.readdirSync(dir).filter(keep);
  } catch {
    return [];
  }
}
