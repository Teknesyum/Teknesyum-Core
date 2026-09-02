const fs = require('fs');
const path = require('path');
const { read, write, merge, safe, relayRoot, ensureRelay, liveDir, sessionId, setNotice, t } = require('./lib.js');
const { status, isContractName } = require('./schema.js');

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let out = '';
  try {
    const j = JSON.parse(raw);
    record(j);
    out = halt(j);
  } catch {}
  if (out) process.stdout.write(JSON.stringify({ decision: 'block', reason: out }));
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

const GENERIC = /^(worker|general-purpose|claude|task|agent)$/i;

function roleOf(j) {
  const t = j.tool_input || {};
  const raw = String(j.agent_type || t.subagent_type || '');
  const clean = raw.replace(/^teknesyum(-core)?:/, '');
  const prompt = String(t.prompt || '');
  const m = /roles[\\/]([a-z-]+)\.md/i.exec(prompt);
  if (m && (!clean || GENERIC.test(clean))) return m[1].toLowerCase();
  if (clean) return clean;
  return m ? m[1].toLowerCase() : '';
}

function bumpTally(live, step, fails, agent, contract) {
  const f = path.join(live, '_tally.json');
  merge(f, (cur) => {
    const by = cur.byAgent && typeof cur.byAgent === 'object' ? Object.assign({}, cur.byAgent) : {};
    if (agent) {
      if (fails) by[agent] = { fails: fails, contract: contract || '' };
      else delete by[agent];
    }
    let worst = 0;
    for (const k of Object.keys(by)) worst = Math.max(worst, Number(by[k].fails || 0));
    return { steps: (cur.steps || 0) + (step ? 1 : 0), fails: worst, byAgent: by };
  });
}

function logCall(live, role, input) {
  const f = path.join(live, '_calls.json');
  const cur = read(f);
  const list = Array.isArray(cur) ? cur : [];
  const m = /contracts[\\/]+([A-Za-z]{1,4}\d{1,4})\.md/.exec(String(input.prompt || ''));
  list.push({
    role: role,
    model: String(input.model || ''),
    task: String(input.description || '').slice(0, 60),
    contract: m ? m[1] : '',
    at: Date.now(),
  });
  write(f, list.slice(-12));
}

function record(j) {
  const cwd = j.cwd || process.cwd();
  const r = relayRoot(cwd, { git: false }) || (AGENT_TOOLS.test(j.tool_name || '') ? ensureRelay(cwd) : null);
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

  if (ev === 'SubagentStop' || ev === 'Stop' || ev === 'SessionEnd') {
    rec.ended = now;
    rec.endedBy = ev;
  } else if (!rec.endedBy || rec.endedBy === 'Stop') {
    delete rec.ended;
    delete rec.endedBy;
  }

  if (ev === 'SubagentStop' && rec.role) setNotice(r.relay, rec.role + ' ' + t('notice.done'));

  if (ev === 'PostToolUseFailure') {
    rec.fails = (rec.fails || 0) + 1;
    rec.failedTool = j.tool_name || '';
    bumpTally(live, false, rec.fails, key, rec.contract || '');
    save(file, rec);
    return;
  }

  if (ev === 'PostToolUse') {
    rec.steps = (rec.steps || 0) + 1;
    if (rec.contract) rec.contractSteps = (rec.contractSteps || 0) + 1;
    rec.fails = 0;
    bumpTally(live, true, 0, key, rec.contract || '');
    rec.tool = j.tool_name || '';
    if (WRITE_TOOLS.test(j.tool_name || '')) {
      const t = j.tool_input || {};
      const target = t.file_path || t.notebook_path || '';
      if (target) {
        const rel = path.relative(path.dirname(path.dirname(r.relay)), target).replace(/\\/g, '/');
        const outside = rel.startsWith('../') || path.isAbsolute(rel);
        if (outside) {
          rec.outsideFiles = rec.outsideFiles || [];
          if (!rec.outsideFiles.includes(rel)) rec.outsideFiles.push(rel);
        } else if (!rec.files.includes(rel)) rec.files.push(rel);
      }
    }
  }

  if (AGENT_TOOLS.test(j.tool_name || '') && ev === 'PreToolUse') {
    const child = roleOf(j);
    if (child) {
      rec.spawned = (rec.spawned || []).concat(child).slice(-40);
      logCall(live, child, j.tool_input || {});
    }
  }

  save(file, rec);
  if (ev === 'PreCompact') {
    try {
      require('../scripts/handoff.js').writeAt(r.relay, path.dirname(path.dirname(r.relay)));
    } catch {}
    return;
  }
  if (ev === 'SessionEnd') {
    closeAll(live, now);
    try {
      require('../scripts/handoff.js').writeAt(r.relay, path.dirname(path.dirname(r.relay)));
    } catch {}
    try {
      require('../scripts/update.js').maybeRefresh();
    } catch {}
  }
  if (ev === 'SessionEnd' || ev === 'Stop') abandoned(r.relay, live, now);
  if (ev === 'SessionEnd' || ev === 'Stop' || ev === 'SubagentStop') sweep(live);
}

function save(file, rec) {
  merge(file, (cur) => {
    const next = Object.assign({}, cur, rec);
    if (cur.contract && !rec.contract) next.contract = cur.contract;
    if (Array.isArray(cur.files)) {
      const seen = new Set(next.files || []);
      for (const f of cur.files) if (!seen.has(f)) (next.files = next.files || []).push(f);
    }
    if (!rec.ended) delete next.ended;
    return next;
  });
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

function lastSaid(file) {
  if (!file) return '';
  try {
    const fd = fs.openSync(file, 'r');
    const size = fs.fstatSync(fd).size;
    const len = Math.min(size, 65536);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, size - len);
    fs.closeSync(fd);
    const lines = buf.toString('utf8').split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      let row = null;
      try {
        row = JSON.parse(lines[i]);
      } catch {
        continue;
      }
      const m = row && row.message;
      if (!m || m.role !== 'assistant') continue;
      const c = m.content;
      const text = Array.isArray(c)
        ? c
            .filter((x) => x && x.type === 'text')
            .map((x) => x.text)
            .join(' ')
        : String(c || '');
      if (text.trim()) return text.trim();
    }
  } catch {}
  return '';
}

function asksAQuestion(j) {
  const said = lastSaid(j.transcript_path);
  return /\?[)\?"'*_\s]*$/.test(said);
}

function halt(j) {
  if ((j.hook_event_name || '') !== 'Stop' || j.stop_hook_active) return '';
  const r = relayRoot(j.cwd || process.cwd(), { git: false });
  if (!r) return '';
  const dir = path.join(r.relay, 'contracts');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(isContractName);
  } catch {
    return '';
  }
  const submitted = [];
  const open = [];
  for (const f of files) {
    let body = '';
    try {
      body = fs.readFileSync(path.join(dir, f), 'utf8');
    } catch {
      continue;
    }
    const s = status(body);
    const id = f.replace(/\.md$/i, '');
    if (s === 'submitted') submitted.push(id);
    else if (s === 'open') open.push(id);
  }

  if (submitted.length)
    return [
      submitted.join(', ') + ' is submitted and still waiting on you.',
      'Audit it, then say what happens next in the same turn: the verdict goes to whoever',
      'delivered it, and their next contract goes with it. A turn does not close on a',
      'delivery it left unanswered.',
    ].join('\n');

  const idle = open.filter((id) => !heldContracts(liveDir(r.relay)).has(id));
  if (idle.length)
    return [
      'Unassigned work is queued: ' + idle.join(', ') + ' - and this turn is ending.',
      'Hand it to an agent before you close. If the next step is really the user to decide,',
      'put it under a closing heading and stop again - this gate fires once.',
    ].join('\n');

  return '';
}

function heldContracts(live) {
  const held = new Set();
  let rows = [];
  try {
    rows = fs.readdirSync(live).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
  } catch {
    return held;
  }
  for (const f of rows) {
    const r = read(path.join(live, f));
    if (r && !r.ended && r.contract) held.add(String(r.contract));
  }
  return held;
}

function abandoned(relay, live, now) {
  const dir = path.join(relay, 'contracts');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(isContractName);
  } catch {
    return;
  }
  const held = heldContracts(live);
  const open = [];
  for (const f of files) {
    const id = f.replace(/\.md$/i, '');
    if (held.has(id)) continue;
    let body = '';
    try {
      body = fs.readFileSync(path.join(dir, f), 'utf8');
    } catch {
      continue;
    }
    if (status(body) === 'active') open.push(id);
  }
  const marks = path.join(live, '_stale.json');
  let fresh = [];
  merge(marks, (cur) => {
    const seen = Array.isArray(cur.ids) ? cur.ids : [];
    fresh = open.filter((id) => !seen.includes(id));
    return { ids: open, at: now };
  });
  if (!fresh.length) return;
  try {
    const seal = require('./seal.js');
    for (const id of fresh) seal.ledgerAppend(relay, { id: id, result: 'stale', at: now });
  } catch {}
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
