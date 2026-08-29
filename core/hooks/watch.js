const fs = require('fs');
const path = require('path');
const { read, write, safe, relayRoot, liveDir, sessionId, setNotice, t } = require('./lib.js');

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  try {
    record(JSON.parse(raw));
  } catch {}
  process.exit(0);
});

const WRITE_TOOLS = /^(Write|Edit|NotebookEdit)$/;
const AGENT_TOOLS = /^(Agent|Task)$/;
const STALE_MS = 24 * 60 * 60 * 1000;

function agentKey(j) {
  if (j.agent_id) return String(j.agent_id);
  const t = j.agent_transcript_path || j.transcript_path;
  if (t) return path.basename(String(t)).replace(/\.jsonl$/i, '');
  return sessionId() || 'main';
}

function roleOf(j) {
  const t = j.tool_input || {};
  const raw = String(j.agent_type || t.subagent_type || '');
  const clean = raw.replace(/^teknesyum(-core)?:/, '');
  if (clean) return clean;
  const prompt = String(t.prompt || '');
  const m = /roles[\\/]([a-z-]+)\.md/i.exec(prompt);
  return m ? m[1].toLowerCase() : '';
}

function bumpTally(live, step, fails) {
  const f = path.join(live, '_tally.json');
  const cur = read(f) || {};
  write(f, { steps: (cur.steps || 0) + (step ? 1 : 0), fails: fails });
}

function record(j) {
  const cwd = j.cwd || process.cwd();
  const r = relayRoot(cwd, { git: false });
  if (!r) return;
  const live = liveDir(r.relay);
  try {
    fs.mkdirSync(live, { recursive: true });
  } catch {
    return;
  }

  const ev = j.hook_event_name || '';
  const key = safe(agentKey(j));
  const file = path.join(live, key + '.json');
  const now = new Date().toISOString();
  const rec = read(file) || { id: key, role: '', files: [], steps: 0, started: now };

  const role = roleOf(j);
  if (role && role !== 'general-purpose') rec.role = role;
  rec.updated = now;
  rec.event = ev;

  if (ev === 'SubagentStop' || ev === 'Stop' || ev === 'SessionEnd') rec.ended = now;
  else delete rec.ended;

  if (ev === 'SubagentStop' && rec.role) setNotice(r.relay, rec.role + ' ' + t('notice.done'));

  if (ev === 'PostToolUseFailure') {
    rec.fails = (rec.fails || 0) + 1;
    rec.failedTool = j.tool_name || '';
    bumpTally(live, false, rec.fails);
    write(file, rec);
    sweep(live);
    return;
  }

  if (ev === 'PostToolUse') {
    rec.steps = (rec.steps || 0) + 1;
    rec.fails = 0;
    bumpTally(live, true, 0);
    rec.tool = j.tool_name || '';
    if (WRITE_TOOLS.test(j.tool_name || '')) {
      const t = j.tool_input || {};
      const target = t.file_path || t.notebook_path || '';
      if (target) {
        const rel = path.relative(path.dirname(path.dirname(r.relay)), target).replace(/\\/g, '/');
        if (!rec.files.includes(rel)) rec.files.push(rel);
      }
    }
  }

  if (AGENT_TOOLS.test(j.tool_name || '') && ev === 'PreToolUse') {
    const child = roleOf(j);
    if (child) {
      rec.spawned = (rec.spawned || []).concat(child).slice(-40);
    }
  }

  write(file, rec);
  if (ev === 'SessionEnd') closeAll(live, now);
  sweep(live);
}

function closeAll(live, now) {
  let files = [];
  try {
    files = fs.readdirSync(live).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  } catch {
    return;
  }
  for (const f of files) {
    const p = path.join(live, f);
    const a = read(p);
    if (!a || a.ended) continue;
    a.ended = now;
    a.stop_reason = 'session_end';
    write(p, a);
  }
}

function sweep(live) {
  let files = [];
  try {
    files = fs.readdirSync(live).filter((f) => f.endsWith('.json'));
  } catch {
    return;
  }
  const cutoff = Date.now() - STALE_MS;
  for (const f of files) {
    if (f.startsWith('_')) continue;
    const p = path.join(live, f);
    try {
      if (fs.statSync(p).mtimeMs < cutoff) fs.unlinkSync(p);
    } catch {}
  }
}
