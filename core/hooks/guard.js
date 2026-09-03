const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { read, write, merge, safe, norm, relayRoot, projectRoot, liveDir, logProblem, settings, envPinned } = require('./lib.js');
const { RANK, isContractName, status, isKnownStatus, field, list, owned } = require('./schema.js');

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let j = {};
  try {
    j = JSON.parse(raw);
  } catch {
    return failClosed('hook input is not valid JSON');
  }
  try {
    decide(j);
  } catch (e) {
    return failClosed('the gate threw: ' + String((e && e.message) || e), j.cwd);
  }
  process.exit(0);
});

let _hatch = null;

function hatchOpen() {
  if (process.env.TEKNESYUM_GATE_OPEN !== '1') return false;
  if (_hatch !== null) return _hatch;
  _hatch = !envPinned('TEKNESYUM_GATE_OPEN');
  return _hatch;
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
  if (next === null) return;
  if (!isKnownStatus(next))
    return block(
      'Unknown contract status: `' + next + '`.',
      'Valid: open, active, submitted, blocked, accepted, done, sealed.'
    );
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
  if (next === 'blocked' || prev === 'blocked') return;
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
  const bad = list('owns', content).filter((x) => /[\\/]$/.test(String(x)));
  if (!bad.length) return;
  return block(
    'owns contains a directory path: ' + bad.join(', '),
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
  if (rec.contract === path.basename(abs, '.md')) return;
  merge(f, (cur) =>
    Object.assign({ id: safe(String(agentId)), files: [] }, cur, {
      contract: path.basename(abs, '.md'),
      contractSteps: 0,
    })
  );
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

function exhausted(target, agentId) {
  if (!agentId) return;
  const abs = path.resolve(target);
  if (/\/\.claude\/relay\//i.test(norm(abs))) return;
  const r = relayRoot(path.dirname(abs), { git: false });
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

function boundary(target, agentId) {
  if (!agentId) return;
  const abs = path.resolve(target);
  const n = norm(abs);
  if (/\/\.claude\/relay\//i.test(n)) return;
  const r = relayRoot(path.dirname(abs), { git: false });
  if (!r) return;
  const rec = read(bindingFile(r.relay, agentId));
  if (!rec || !rec.contract) return;
  const owns = ownedBy(r.relay, rec.contract);
  if (!owns || !owns.length) return;
  const rel = norm(path.relative(projectRoot(r.relay), abs)).toLowerCase();
  if (owns.some((o) => norm(o).toLowerCase() === rel)) return;
  return block(
    rel + ' is outside the owns set of ' + rec.contract + '.',
    'owns: ' + owns.join(', '),
    '',
    'Do not widen the contract to fit the edit. Record the blocker under ## Checkpoint',
    'and return, or ask T0 for a contract that owns this file.'
  );
}

const MERGING = /^git\s+(?:-[^\s]+\s+)*(merge|push)\b/i;

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
  if (hatchOpen()) return;
  const open = unfinished(j.cwd);
  if (!open.length) return;
  return block(
    'A contract is still on the ladder: ' + open.join(', ') + '.',
    'This command reaches ' + hit.target + '.',
    '',
    'Work reaches main through the gate, not around it. Close it first:',
    '  node <plugin>/scripts/contract.js complete --id <ID>',
    '',
    'If this push has nothing to do with that contract, run it with TEKNESYUM_GATE_OPEN=1.',
    ...(hatchNailedOpen()
      ? [
          '',
          'TEKNESYUM_GATE_OPEN is set permanently in your environment and is being ignored.',
          'An escape hatch is per command; one left open is no gate at all. Clear it with',
          '  [Environment]::SetEnvironmentVariable("TEKNESYUM_GATE_OPEN", $null, "User")',
        ]
      : [])
  );
}

function decide(j) {
  const tool = j.tool_name || '';
  const t = j.tool_input || {};
  const agentId = j.agent_id || null;

  if (tool === 'Bash' || tool === 'PowerShell') return merging(j);

  if (/^(Write|Edit|NotebookEdit)$/.test(tool)) {
    const target = t.file_path || t.notebook_path || '';
    if (!target) return;
    sealedArea(target);
    owedByHand(target);
    bind(target, agentId);
    boundary(target, agentId);
    exhausted(target, agentId);
    if (tool === 'Write') {
      priorArt(target);
      router(target, t.content || '');
      ownsSchema(target, t.content || '');
      verifySchema(target, t.content || '');
    } else if (tool === 'Edit' && ROUTER.test(norm(path.resolve(target)))) {
      router(target, edited(target, t));
    }
    regression(target, tool === 'Write' ? t.content || '' : t.new_string || '');
    if (!DONE.test(norm(target))) return;
    return block(
      'contracts/done/ is read only.',
      'Completion goes through: node <plugin>/scripts/contract.js complete --id <ID>'
    );
  }
}

function block(...lines) {
  process.stderr.write('BLOCKED: ' + lines.join('\n'));
  process.exit(2);
}
