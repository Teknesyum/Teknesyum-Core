const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { read, write, safe, norm, relayRoot, projectRoot, checkoutRoot, pathKey, inside, liveDir, logProblem, settings } = require('./lib.js');
const { RANK, isContractName, status, isKnownStatus, field, owned, definitions, fault: schemaFault } = require('./schema.js');

let raw = '';
let call = null;
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let j = {};
  try {
    j = JSON.parse(raw);
  } catch {
    return failClosed('hook input is not valid JSON');
  }
  call = j;
  try {
    decide(j);
  } catch (e) {
    return failClosed('the gate threw: ' + String((e && e.message) || e), j.cwd);
  }
  process.exit(0);
});

function hatchOpen(command) {
  const cmd = String(command || '');
  return /^\s*TEKNESYUM_GATE_OPEN=1\s+git\s+/i.test(cmd) && !/[;\r\n|]|&&/.test(cmd);
}

function hatchNailedOpen() {
  return process.env.TEKNESYUM_GATE_OPEN === '1' && !hatchOpen();
}

function failClosed(why, cwd) {
  if (hatchOpen()) return process.exit(0);
  try {
    if (!relayRoot(cwd || process.cwd(), { git: false })) return process.exit(0);
  } catch {
    return process.exit(0);
  }
  return block(
    why + '.',
    'The gate could not verify and fell closed.',
    'To pass deliberately, run with TEKNESYUM_GATE_OPEN=1.'
  );
}

const DONE = /(^|\/)\.claude\/relay\/contracts\/done\//i;
const ROUTER = /(^|\/)CLAUDE\.md$/i;
const CANONICAL = /contract\.js["']?[ \t]+(complete|close)\b/i;

function relayOf(p) {
  const r = relayRoot(path.dirname(path.resolve(p)));
  return r ? r.relay : null;
}

function canonicalContract(target) {
  const abs = path.resolve(target);
  const relay = relayOf(abs);
  if (!relay) return null;
  const rel = path.relative(path.join(relay, 'contracts'), abs);
  if (!rel || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) return null;
  return isContractName(rel) ? abs : null;
}

function regression(target, nextBody) {
  if (!canonicalContract(target)) return;
  const next = status(nextBody);
  if (next === null) return block('The contract must retain a status field.');
  if (!isKnownStatus(next))
    return block(
      'Unknown contract status: `' + next + '`.',
      'Valid: open, active, submitted, blocked, accepted, done, sealed.'
    );
  if (['accepted', 'done', 'sealed'].includes(next))
    return block('Terminal status is written only by contract.js complete/close.');
  let prev = null;
  try {
    prev = status(fs.readFileSync(target, 'utf8'));
  } catch {
    return;
  }
  if (!isKnownStatus(prev)) {
    const relay = relayOf(target);
    if (relay)
      logProblem(
        relay,
        'guard',
        'unknown previous status: ' + (prev === null ? '-' : prev) + ' - ' + path.basename(target)
      );
    return block(
      'The contract on disk has an unrecognized status: `' + (prev === null ? '-' : prev) + '`.',
      'Fix the `status:` line to a valid value first.'
    );
  }
  if (next === 'blocked') return;
  if (prev === 'blocked') {
    if (next === 'open' || next === 'active') return;
    return block('A blocked contract must return to active before submission.');
  }
  if (prev === 'open' && RANK[next] > RANK.active)
    return block(
      'Status skipped a rung: open -> ' + next + '.',
      'Mark `active` before submitting; recovery needs to know work started.'
    );
  if (prev === 'submitted' && next === 'active')
    return staleCheckpoint(target)
      ? block(
          'The checkpoint still reads as finished while the contract reopens.',
          'Update `## Checkpoint` to the current round first.'
        )
      : undefined;
  if (RANK[next] >= RANK[prev]) return;
  return block('Status regression: ' + prev + ' -> ' + next + '.');
}

const FINISHED = /(submitted|complete|finished|accepted|done)/i;

function staleCheckpoint(target) {
  let body = '';
  try {
    body = fs.readFileSync(target, 'utf8');
  } catch {
    return false;
  }
  const head = body.match(/^##[ \t]*Checkpoint[ \t]*$/im);
  if (!head) return false;
  const rest = body.slice(head.index + head[0].length);
  const end = rest.search(/^##[ \t]/m);
  return FINISHED.test(end === -1 ? rest : rest.slice(0, end));
}

function newProject(root) {
  if (settings().research === false) return false;
  try {
    if (fs.existsSync(path.join(root, 'docs', 'scans'))) return false;
  } catch {
    return false;
  }
  try {
    if (fs.readdirSync(path.join(root, '.claude', 'relay', 'contracts', 'done')).length)
      return false;
  } catch {}
  try {
    return require('../scripts/map.js').scan(root).length < 10;
  } catch {
    return false;
  }
}

function planPath(target) {
  const abs = path.resolve(target);
  const relay = relayOf(abs);
  if (!relay) return null;
  return norm(abs) === norm(path.join(relay, 'PLAN.md')) ? abs : null;
}

function priorArt(target) {
  const p = canonicalContract(target) || planPath(target);
  if (!p || fs.existsSync(p)) return;
  const relay = relayOf(p);
  if (!relay || !newProject(projectRoot(relay))) return;
  return block(
    'This looks like a project from scratch and no prior art was read.',
    'Run the scout role first; it writes docs/scans/.',
    'To skip on purpose, set "research": false in ~/.claude/teknesyum/config.json.'
  );
}

function edited(target, t) {
  const next = String(t.new_string || '');
  let body;
  try {
    body = fs.readFileSync(target, 'utf8');
  } catch {
    return next;
  }
  const prev = String(t.old_string || '');
  if (!prev) return body + next;
  if (t.replace_all) return body.split(prev).join(next);
  const i = body.indexOf(prev);
  return i === -1 ? body : body.slice(0, i) + next + body.slice(i + prev.length);
}

function router(target, content) {
  const p = norm(path.resolve(target));
  if (!ROUTER.test(p)) return;
  if (/(^|\/)\.claude\/CLAUDE\.md$/i.test(p)) return;
  const lines = String(content)
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => !x.startsWith('<!--'));
  if (lines.length <= 2 && lines.every((x) => /^@\S+\.md$/.test(x))) return;
  return block(
    'Router files carry a body only in AGENTS.md.',
    'CLAUDE.md may hold one line: @AGENTS.md'
  );
}

function ownsSchema(target, content) {
  const n = norm(path.resolve(target));
  if (!/\/contracts\/[^/]+\.md$/i.test(n)) return;
  if (/\/done\//i.test(n)) return;
  if (!/^owns:/im.test(content)) return;
  const owns = owned(content);
  let fault = owns.filter((x) => /[\\/]$/.test(String(x))).map((x) => 'owns contains a directory path: ' + x)[0] || '';
  if (!fault) {
    const r = relayRoot(path.dirname(path.resolve(target)), { git: false });
    if (r) {
      try {
        const caller = relayRoot((call && call.cwd) || process.cwd(), { git: false }) || r;
        fault = require('./seal.js').ownsFault(checkoutRoot(caller), owns);
      } catch {}
    }
  }
  if (!fault) return;
  return block(
    fault,
    'A directory digest does not change when its contents do, so the seal would lie.',
    'List the files the contract touches, one by one.'
  );
}

function verifySchema(target, content) {
  const n = norm(path.resolve(target));
  if (!/\/contracts\/[^/]+\.md$/i.test(n)) return;
  if (/\/done\//i.test(n)) return;
  if (!/^owns:/im.test(content)) return;
  if (/^verify:/im.test(content)) return;
  return block(
    'The contract has no `verify:` block.',
    'List the commands that prove acceptance; each must exit 0.',
    'Use `verify:` followed by "  - <command>" lines, or `verify: []` with a written reason.'
  );
}

const SEALED_DIRS = /(^|\/)\.claude\/relay\/(audits|live)\//i;
const OWED_FILE = /(^|\/)\.claude\/relay\/OWED\.md$/i;

function owedByHand(target) {
  if (!OWED_FILE.test(norm(path.resolve(target)))) return;
  return block(
    'OWED.md is written by the command, not by hand.',
    'A debt nobody can see is not a debt:',
    '  node <plugin>/scripts/handoff.js owe --add "ask fable about X"',
    '  node <plugin>/scripts/handoff.js owe --done 1 --because "..."'
  );
}

function sealedArea(target) {
  if (!SEALED_DIRS.test(norm(path.resolve(target)))) return;
  return block(
    'audits/ and live/ are written by the gate, never by hand.',
    'An audit record is created by:',
    '  node <plugin>/scripts/contract.js audit --id <ID> --run-id <agent> --verification "..."',
    'That command computes headSha and diffHash itself, so they cannot be supplied.'
  );
}

function bindingFile(relay, agentId) {
  return path.join(liveDir(relay), safe(String(agentId)) + '.json');
}

function bind(target, agentId) {
  if (!agentId) return;
  const abs = canonicalContract(target);
  if (!abs) return;
  const relay = relayOf(abs);
  if (!relay) return;
  const f = bindingFile(relay, agentId);
  const rec = read(f) || {};
  if (rec.contract && rec.contract !== path.basename(abs, '.md'))
    return block('This agent is already bound to ' + rec.contract + '; it cannot rebind by editing another contract.');
}

function ownedBy(relay, id) {
  try {
    return owned(fs.readFileSync(path.join(relay, 'contracts', id + '.md'), 'utf8'));
  } catch {
    return null;
  }
}

const CEILING = 150;

function ceilingOf(body) {
  const n = Number(String(field('ceiling', body)).trim());
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : CEILING;
}

const RELAY_CLI = /contract\.js["']?\s+(complete|close|submit|audit|check|precheck|tier)\b/i;

function exhausted(target, agentId) {
  if (!agentId) return;
  if (target) {
    const abs = path.resolve(target);
    if (/\/\.claude\/relay\//i.test(norm(abs))) return;
  }
  const r = relayRoot((call && call.cwd) || process.cwd(), { git: false });
  if (!r) return;
  const rec = read(bindingFile(r.relay, agentId));
  if (!rec || !rec.contract) return;
  let body = '';
  try {
    body = fs.readFileSync(path.join(r.relay, 'contracts', rec.contract + '.md'), 'utf8');
  } catch {
    return;
  }
  const cap = ceilingOf(body);
  const spent = Number(rec.contractSteps || 0);
  if (spent < cap) return;
  return block(
    rec.contract + ' has spent its ceiling: ' + spent + ' steps of ' + cap + '.',
    'Nothing more can be written under it.',
    '',
    'Record where you got to under ## Checkpoint and submit, or ask T0 for a',
    'smaller contract. To raise the bar on purpose, add a "ceiling: <n>" line.'
  );
}

const NESTED_TTL = 10 * 60 * 1000;

function nestedRepos(root, depth) {
  const out = [];
  let entries = [];
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name === '.git') continue;
    if (/^(node_modules|trash|bin|obj|dist|target|vendor|.claude|.vs|.venv)$/i.test(e.name)) continue;
    const full = path.join(root, e.name);
    if (fs.existsSync(path.join(full, '.git'))) out.push(full);
    else if ((depth || 0) < 3) out.push(...nestedRepos(full, (depth || 0) + 1));
  }
  return out;
}

function dirtyOf(dir) {
  const r = spawnSync('git', ['-C', dir, 'status', '--porcelain'], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 5000,
  });
  if (r.status !== 0) return [];
  return String(r.stdout || '')
    .split(String.fromCharCode(10))
    .map((x) => x.trim())
    .filter(Boolean);
}

function spilled(agentId) {
  if (!agentId) return;
  const r = relayRoot((call && call.cwd) || process.cwd(), { git: false });
  if (!r) return;
  const rec = read(bindingFile(r.relay, agentId));
  if (!rec || !rec.contract) return;
  const root = checkoutRoot(r);
  if (!root) return;
  const f = path.join(liveDir(r.relay), '_nested.json');
  let state = read(f);
  const stale =
    !state ||
    !Array.isArray(state.repos) ||
    state.contract !== rec.contract ||
    Date.now() - Number(state.at || 0) > NESTED_TTL;
  if (stale) {
    const kept = (state && state.dirty) || {};
    const fresh = { contract: rec.contract, at: Date.now(), repos: nestedRepos(root, 0), dirty: {} };
    for (const d of fresh.repos) fresh.dirty[d] = Object.prototype.hasOwnProperty.call(kept, d) ? kept[d] : dirtyOf(d);
    write(f, fresh);
    if (!state || !Array.isArray(state.repos)) return;
    state = fresh;
  }
  for (const d of state.repos) {
    if (!fs.existsSync(path.join(d, '.git'))) continue;
    const now = dirtyOf(d);
    const before = state.dirty[d] || [];
    const fresh = now.filter((x) => before.indexOf(x) < 0);
    if (!fresh.length) continue;
    state.dirty[d] = now;
    write(f, state);
    const where = path.relative(root, d).split(String.fromCharCode(92)).join('/');
    logProblem(r.relay, 'guard', rec.contract + ' spilled into ' + where + ': ' + fresh.slice(0, 3).join(' | '));
    return block(
      rec.contract + ' has changed files inside ' + where + ', a repository of its own.',
      '',
      ...fresh.slice(0, 6).map((x) => '  ' + x),
      fresh.length > 6 ? '  ... and ' + (fresh.length - 6) + ' more' : '',
      '',
      'A contract owns paths in its own checkout. A bulk rewrite that walks the tree must',
      'skip nested repositories; revert them there before going on.'
    );
  }
}

function boundary(target, agentId) {
  if (!agentId) return;
  const abs = path.resolve(target);
  const r = relayRoot((call && call.cwd) || process.cwd(), { git: false });
  if (!r) return;
  const rec = read(bindingFile(r.relay, agentId));
  if (rec && rec.role === 'auditor') return block('An auditor cannot write files; return findings to the coordinator.');
  if (inside(r.relay, abs)) return;
  if (!rec || !rec.contract) return;
  const owns = ownedBy(r.relay, rec.contract);
  if (!owns || !owns.length) return block('The bound contract has no readable owns set.');
  const root = checkoutRoot(r);
  if (rec.checkoutRoot && pathKey(rec.checkoutRoot) !== pathKey(root)) return block('The agent belongs to another checkout.');
  const rel = norm(path.relative(root, abs));
  if (inside(root, abs) && owns.some((o) => pathKey(path.resolve(root, o)) === pathKey(abs))) return;
  return block(
    rel + ' is outside the owns set of ' + rec.contract + '.',
    'owns: ' + owns.join(', '),
    '',
    'Do not widen the contract to fit the edit. Record the blocker under ## Checkpoint',
    'and return, or ask T0 for a contract that owns this file.'
  );
}

const MERGING = /^git\s+(?:-[^\s]+\s+)*(merge|push)(?=\s|$)/i;

const PROTECTED = /^(main|master)$/i;

function segments(raw) {
  const text = String(raw).replace(/<<-?\s*['"]?(\w+)['"]?[\s\S]*?^\s*\1\s*$/gm, ' ');
  return text
    .split(/[\n;]|&&|\|\||\|/)
    .map((s) => s.trim().replace(/^[A-Za-z_][A-Za-z0-9_]*=\S*\s+/, ''))
    .filter(Boolean);
}

function branch(cwd) {
  const r = spawnSync('git', ['-C', cwd || process.cwd(), 'symbolic-ref', '--quiet', '--short', 'HEAD'], {
    encoding: 'utf8',
    timeout: 5000,
    windowsHide: true,
  });
  if (r.error || r.status !== 0) return '';
  return String(r.stdout || '').trim();
}

function words(part) {
  return part
    .split(/\s+/)
    .slice(1)
    .filter((w) => w && !w.startsWith('-'));
}

function pushTarget(part, cwd) {
  const w = words(part).filter((x) => x !== 'push');
  const ref = w[1] || '';
  if (!ref) return branch(cwd);
  const dst = ref.includes(':') ? ref.split(':').pop() : ref;
  return dst.replace(/^refs\/heads\//, '');
}

function forcing(part) {
  return /(^|\s)(-f|--force|--force-with-lease)(\s|=|$)/.test(part);
}

function protectedWork(cmd, cwd) {
  for (const part of segments(cmd)) {
    const m = MERGING.exec(part);
    if (!m) continue;
    const target = m[1].toLowerCase() === 'push' ? pushTarget(part, cwd) : branch(cwd);
    if (!PROTECTED.test(String(target))) continue;
    return { part, target, force: m[1].toLowerCase() === 'push' && forcing(part) };
  }
  return null;
}

function unfinished(cwd) {
  const r = relayRoot(cwd || process.cwd(), { git: false });
  if (!r) return [];
  const dir = path.join(r.relay, 'contracts');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter(isContractName);
  } catch {
    return [];
  }
  const held = [];
  for (const f of files) {
    let body = '';
    try {
      body = fs.readFileSync(path.join(dir, f), 'utf8');
    } catch {
      continue;
    }
    const s = status(body);
    if (s === 'submitted' || s === 'active') held.push(f.replace(/\.md$/i, '') + ' (' + s + ')');
  }
  return held;
}

function merging(j) {
  const cmd = String((j.tool_input || {}).command || '');
  const hit = protectedWork(cmd, j.cwd);
  if (!hit) return;
  if (hit.force)
    return block(
      'A forced push to ' + hit.target + ' rewrites what everyone else already has.',
      '',
      'The gate does not carry this one, open or closed. Ask for it in one sentence and',
      'let the person who owns the branch answer.'
    );
  if (hatchOpen(cmd)) return;
  const open = unfinished(j.cwd);
  if (!open.length) return;
  return block(
    'A contract is still on the ladder: ' + open.join(', ') + '.',
    'This command reaches ' + hit.target + '.',
    '',
    'Work reaches main through the gate, not around it. Close it first:',
    '  node <plugin>/scripts/contract.js complete --id <ID>',
    '',
    'For one unrelated push, use a single Bash command: TEKNESYUM_GATE_OPEN=1 git push ...',
    ...(hatchNailedOpen()
      ? [
          '',
          'An inherited TEKNESYUM_GATE_OPEN is being ignored; it cannot authorize this command.',
          'If it is stored in your user environment, clear it with',
          '  [Environment]::SetEnvironmentVariable("TEKNESYUM_GATE_OPEN", $null, "User")',
        ]
      : [])
  );
}

function decide(j) {
  const tool = j.tool_name || '';
  const t = j.tool_input || {};
  const agentId = j.agent_id || null;

  if (tool === 'Bash' || tool === 'PowerShell') {
    const cmd = String(t.command || '');
    if (!RELAY_CLI.test(cmd)) exhausted('', agentId);
    spilled(agentId);
    return merging(j);
  }

  if (/^(Write|Edit|NotebookEdit)$/.test(tool)) {
    const target = t.file_path || t.notebook_path || '';
    if (!target) return;
    sealedArea(target);
    owedByHand(target);
    bind(target, agentId);
    boundary(target, agentId);
    exhausted(target, agentId);
    const content = tool === 'Write' ? t.content || '' : tool === 'Edit' ? edited(target, t) : '';
    if (tool === 'Write' || tool === 'Edit') {
      priorArt(target);
      router(target, content);
      if (canonicalContract(target)) {
        const fault = schemaFault(content);
        if (fault) return block(fault);
        let prev = '';
        try { prev = fs.readFileSync(target, 'utf8'); } catch {}
        for (const name of ['status', 'round', 'role', 'verify', 'owns']) {
          if (definitions(name, prev).length && !definitions(name, content).length)
            return block('Contract field cannot be erased: ' + name);
        }
        if (agentId && prev) {
          if (JSON.stringify(owned(prev)) !== JSON.stringify(owned(content))) return block('A worker cannot change its owns set.');
          for (const name of ['round', 'role', 'agent', 'run-id'])
            if (field(name, prev) !== field(name, content)) return block('A worker cannot change contract ' + name + '.');
        }
      }
      ownsSchema(target, content);
      verifySchema(target, content);
      regression(target, content);
    }
    if (!DONE.test(norm(target))) return;
    return block(
      'contracts/done/ is read only.',
      'Completion goes through: node <plugin>/scripts/contract.js complete --id <ID>'
    );
  }
}

function refused(why) {
  const j = call;
  if (!j) return;
  try {
    const r = relayRoot(j.cwd || process.cwd(), { git: false });
    if (!r) return;
    const t = j.tool_input || {};
    const what = String(t.file_path || t.notebook_path || t.command || '').replace(/\s+/g, ' ').slice(0, 120);
    const dir = liveDir(r.relay);
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(
      path.join(dir, 'refused.log'),
      [
        new Date().toISOString().replace('T', ' ').slice(0, 19),
        j.tool_name || '-',
        j.agent_id || '-',
        what || '-',
        String(why || '').replace(/\s+/g, ' ').slice(0, 160),
      ].join(' | ') + '\n'
    );
  } catch {}
}

function block(...lines) {
  refused(lines[0]);
  process.stderr.write('BLOCKED: ' + lines.join('\n'));
  process.exit(2);
}
