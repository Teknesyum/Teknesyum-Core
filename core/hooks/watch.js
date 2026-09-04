const fs = require('fs');
const path = require('path');
const { read, write, merge, safe, relayRoot, ensureRelay, checkoutRoot, liveDir, logProblem, sessionId, setNotice, t } = require('./lib.js');
const { status, isContractName, field, owned, raiseOf } = require('./schema.js');
const seal = require('./seal.js');

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let out = '';
  let j = null;
  try {
    j = JSON.parse(raw);
    const deny = dispatch(j);
    if (deny) {
      process.stderr.write('BLOCKED: ' + deny);
      process.exit(2);
    }
    record(j);
    out = halt(j);
  } catch (e) {
    if (j && j.hook_event_name === 'PreToolUse' && AGENT_TOOLS.test(j.tool_name || '') && roleOf(j) === 'auditor') {
      process.stderr.write('BLOCKED: cannot record auditor dispatch: ' + e.message);
      return process.exit(2);
    }
  }
  if (out) process.stdout.write(JSON.stringify({ decision: 'block', reason: out }));
  else if (j) chime(j);
  process.exit(0);
});

function dispatch(j) {
  if ((j.hook_event_name || '') !== 'PreToolUse') return '';
  if (!AGENT_TOOLS.test(j.tool_name || '')) return '';
  const input = j.tool_input || {};
  const asked = String(input.model || '').toLowerCase();
  const role = roleOf(j);
  if (!role) return '';
  const r = relayRoot(j.cwd || process.cwd(), { git: false });
  if (!r) return '';

  let lines = null;
  try {
    const contracts = require('../scripts/contract.js');
    if (!contracts.roleRow(role)) return '';
    if (!asked)
      return 'Set an explicit model for ' + role + '. An omitted model inherits the parent and bypasses the cost ladder. Run contract.js tier --role ' + role + ' first.';
    if (contracts.MODEL_RANK[asked] === undefined)
      return 'Unknown model for ' + role + ': ' + asked + '. Use a model alias supported by tiers.json.';
    lines = contracts.overDispatch(r, role, asked, String(input.prompt || ''));
  } catch {
    return '';
  }
  return lines ? lines.join('\n') : '';
}

function chime(j) {
  if ((j.hook_event_name || '') !== 'Stop') return;
  try {
    const child = require('child_process').spawn(
      process.execPath,
      [path.join(__dirname, 'notify.js'), '--event', 'Stop', '--cwd', j.cwd || process.cwd()],
      { detached: true, stdio: 'ignore', windowsHide: true }
    );
    child.unref();
  } catch {}
}

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
  const raw = String(AGENT_TOOLS.test(j.tool_name || '')
    ? t.subagent_type || j.agent_type || '' : j.agent_type || t.subagent_type || '');
  const clean = raw.replace(/^teknesyum(-core)?:/, '');
  const prompt = String(t.prompt || '');
  const m = /(?:roles|agents)[\\/]([a-z-]+)\.md/i.exec(prompt);
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
  const m = /contracts[\\/]+(?:done[\\/]+)?([A-Za-z]{1,4}\d{1,4})\.md/.exec(String(input.prompt || ''));
  list.push({
    role: role,
    model: String(input.model || ''),
    task: String(input.description || '').slice(0, 60),
    contract: m ? m[1] : '',
    at: Date.now(),
  });
  write(f, list.slice(-12));
}

const COUNSEL = /^(fable|opus)$/;

function counsel(j, r) {
  const ev = j.hook_event_name || '';
  let advice = null;
  try {
    advice = require('../scripts/advice.js');
  } catch {
    return;
  }
  if (ev === 'PreToolUse' && AGENT_TOOLS.test(j.tool_name || '')) {
    const input = j.tool_input || {};
    const model = String(input.model || '').toLowerCase();
    const role = roleOf(j);
    if (role && role !== 'advisor') return;
    if (!COUNSEL.test(model) && role !== 'advisor') return;
    advice.open(r.relay, {
      topic: String(input.description || '').slice(0, 60),
      asker: String(j.model || 'T0'),
      model: model,
      toolUseId: j.tool_use_id,
      prompt: String(input.prompt || ''),
    });
    return;
  }
  if (ev === 'PostToolUse' && AGENT_TOOLS.test(j.tool_name || '')) {
    const response = j.tool_response || {};
    const runId = response.agentId || response.agent_id;
    if (advice.bind(r.relay, j.tool_use_id, runId)) {
      const ended = read(path.join(liveDir(r.relay), safe(runId) + '.json'));
      if (ended && ended.ended && ended.transcript) advice.close(r.relay, '', ended.transcript, runId);
    }
  }
  if (ev === 'SubagentStop') {
    const t = j.agent_transcript_path || j.transcript_path;
    if (t) advice.close(r.relay, '', String(t), j.agent_id);
  }
}

const SHELL_TOOLS = /^(Bash|PowerShell)$/;

function outsideLog(r, rec, j) {
  let owns = [];
  try {
    owns = owned(fs.readFileSync(path.join(r.relay, 'contracts', rec.contract + '.md'), 'utf8')) || [];
  } catch {
    return;
  }
  let out = [];
  try {
    out = seal.outsideChanges(checkoutRoot(r), owns);
  } catch {
    return;
  }
  const seen = new Set(rec.outsideSeen || []);
  const fresh = out.filter((x) => !seen.has(x));
  if (!fresh.length) return;
  rec.outsideSeen = out.slice(0, 200);
  const cmd = String((j.tool_input || {}).command || '')
    .split(String.fromCharCode(10))[0]
    .slice(0, 120);
  logProblem(r.relay, 'shell', rec.contract + ' | ' + cmd + ' | ' + fresh.slice(0, 8).join(' '));
}

function record(j) {
  const cwd = j.cwd || process.cwd();
  const r = relayRoot(cwd, { git: false }) || (AGENT_TOOLS.test(j.tool_name || '') ? ensureRelay(cwd) : null);
  if (!r) return;
  try {
    counsel(j, r);
  } catch {}
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
  if (j.session_id) rec.sessionId = j.session_id;
  if (!AGENT_TOOLS.test(j.tool_name || '')) rec.checkoutRoot = checkoutRoot(r);

  const role = roleOf(j);
  if (!AGENT_TOOLS.test(j.tool_name || '') && role && (!GENERIC.test(role) || !rec.role)) rec.role = role;
  rec.updated = now;
  rec.event = ev;

  if (ev === 'SubagentStop' || ev === 'Stop' || ev === 'SessionEnd') {
    rec.ended = now;
    rec.endedBy = ev;
    if (ev === 'SubagentStop' && j.agent_transcript_path) rec.transcript = j.agent_transcript_path;
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
    if (rec.contract && SHELL_TOOLS.test(j.tool_name || '')) outsideLog(r, rec, j);
    if (WRITE_TOOLS.test(j.tool_name || '')) {
      const t = j.tool_input || {};
      const target = t.file_path || t.notebook_path || '';
      if (target) {
        const rel = path.relative(checkoutRoot(r), target).replace(/\\/g, '/');
        const contractName = path.relative(path.join(r.relay, 'contracts'), target);
        if (isContractName(contractName)) {
          const id = contractName.replace(/\.md$/i, '');
          const body = fs.readFileSync(target, 'utf8');
          if (!rec.contract) Object.assign(rec, { contract: id, contractSteps: 0, round: field('round', body) || '1' });
          const raised = path.join(live, '_raise', safe(id) + '.json');
          if (!fs.existsSync(raised)) {
            const asked = raiseOf(body);
            write(raised, { raise: asked ? asked.raise : '', why: asked ? asked.why : '', at: Date.now() });
          }
        }
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
    const input = j.tool_input || {};
    const m = /contracts[\\/]+(?:done[\\/]+)?([A-Za-z]{1,4}\d{1,4}[A-Za-z]{0,3})\.md/i.exec(String(input.prompt || ''));
    if (child === 'auditor') {
      if (!m || !j.tool_use_id) throw new Error('Auditor dispatch needs an exact contract path and host tool_use_id before launch');
      const body = fs.readFileSync(path.join(r.relay, 'contracts', m[1] + '.md'), 'utf8');
      const root = checkoutRoot(r);
      const head = require('child_process').spawnSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
      if (head.status !== 0) throw new Error('Cannot bind auditor HEAD');
      const pending = {
        id: String(j.tool_use_id), parentId: key, role: child, contract: m[1], round: field('round', body) || '1',
        checkoutRoot: root, reviewStarted: now, reviewHead: head.stdout.trim(), reviewDiffHash: seal.ownsDigest(root, owned(body)),
        reviewContractHash: seal.digest(body), promptHash: seal.digest(String(input.prompt || '')),
      };
      if (!write(path.join(live, '_dispatch', safe(j.tool_use_id) + '.json'), pending)) throw new Error('Cannot record auditor dispatch');
    }
    if (child) {
      rec.spawned = (rec.spawned || []).concat(child).slice(-40);
      logCall(live, child, j.tool_input || {});
    }
  }

  if (AGENT_TOOLS.test(j.tool_name || '') && ev === 'PostToolUse') {
    const response = j.tool_response || {};
    const childId = response.agentId || response.agent_id;
    if (childId) {
      const input = j.tool_input || {};
      const m = /contracts[\\/]+(?:done[\\/]+)?([A-Za-z]{1,4}\d{1,4}[A-Za-z]{0,3})\.md/i.exec(String(input.prompt || ''));
      const pending = j.tool_use_id && read(path.join(live, '_dispatch', safe(j.tool_use_id) + '.json'));
      const bound = pending && pending.parentId === key && pending.promptHash === seal.digest(String(input.prompt || '')) ? pending : null;
      let round = '';
      if (m) for (const dir of ['contracts', 'contracts/done']) {
        try { round = field('round', fs.readFileSync(path.join(r.relay, dir, m[1] + '.md'), 'utf8')); break; } catch {}
      }
      merge(path.join(live, safe(childId) + '.json'), (cur) => ({
        id: String(childId), files: [], steps: 0, started: now, ...cur,
        role: roleOf(j) || cur.role || '', contract: m ? m[1] : cur.contract || '',
        round: bound ? bound.round : round || cur.round || '',
        requestedModel: String(input.model || ''),
        model: String(response.resolvedModel || response.model || cur.model || ''),
        parentId: key, sessionId: j.session_id || cur.sessionId || '', updated: now,
        ...(bound ? { dispatchId: bound.id, checkoutRoot: cur.checkoutRoot || bound.checkoutRoot,
          reviewStarted: bound.reviewStarted, reviewHead: bound.reviewHead, reviewDiffHash: bound.reviewDiffHash, reviewContractHash: bound.reviewContractHash } : {}),
      }));
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
  const currentSession = sessionId();
  for (const f of files) {
    const p = path.join(live, f);
    const a = read(p);
    if (!a || a.ended) continue;
    if (currentSession && a.sessionId && a.sessionId !== currentSession) continue;
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
    else if (s === 'open') {
      const blocked = require('../scripts/contract.js').blockers(r.relay, id, body);
      if (!blocked.length) open.push(id);
    }
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
      if (fs.statSync(p).mtimeMs < cutoff) {
        const rec = read(p);
        if (rec && rec.role === 'auditor') continue;
        fs.unlinkSync(p);
      }
    } catch {}
  }
}
