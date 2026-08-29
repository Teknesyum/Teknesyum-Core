const fs = require('fs');
const path = require('path');
const { read, write, safe, norm, relayRoot, projectRoot, liveDir, logProblem, settings } = require('./lib.js');
const { RANK, isContractName, status, isKnownStatus, list, owned } = require('./schema.js');

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

function failClosed(why, cwd) {
  if (process.env.TEKNESYUM_GATE_OPEN === '1') return process.exit(0);
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
  const rec = read(f) || { id: safe(String(agentId)), files: [] };
  if (rec.contract === path.basename(abs, '.md')) return;
  rec.contract = path.basename(abs, '.md');
  write(f, rec);
}

function ownedBy(relay, id) {
  try {
    return owned(fs.readFileSync(path.join(relay, 'contracts', id + '.md'), 'utf8'));
  } catch {
    return null;
  }
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

function decide(j) {
  const tool = j.tool_name || '';
  const t = j.tool_input || {};
  const agentId = j.agent_id || null;

  if (/^(Write|Edit|NotebookEdit)$/.test(tool)) {
    const target = t.file_path || t.notebook_path || '';
    if (!target) return;
    sealedArea(target);
    bind(target, agentId);
    boundary(target, agentId);
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

  if (tool !== 'Bash') return;
  const cmd = String(t.command || '');
  if (/relay[\\/](audits|live)/i.test(cmd) && !cmd.split(/[\n;]|&&|\|\||\|/).every(readsOnly))
    return block(
      'audits/ and live/ are written by the gate, never from the shell.',
      'Use: node <plugin>/scripts/contract.js audit --id <ID> --run-id <agent> --verification "..."'
    );
  if (!/contracts[\\/]done/i.test(cmd)) return;
  const parts = cmd.split(/[\n;]|&&|\|\||\|/).filter((x) => /contracts[\\/]done/i.test(x));
  if (!parts.length || parts.every(allowed)) return;
  return block(
    'Shell access to contracts/done/ is limited to reads and the canonical command.',
    'Completion goes through: node <plugin>/scripts/contract.js complete --id <ID>'
  );
}

const READ_CMDS = new Set([
  'cat','type','less','more','head','tail','wc','ls','dir','grep','rg','egrep','fgrep','find',
  'stat','file','diff','cmp','sed','awk','cut','sort','uniq','tr','basename','dirname','realpath',
  'readlink','md5sum','sha256sum','get-content','get-childitem','select-string','test-path',
  'resolve-path','get-item',
]);

const GIT_SAFE = new Set([
  'status','diff','log','show','ls-files','grep','cat-file','blame','add','commit','push',
]);

function readsOnly(part) {
  const p = String(part).replace(/#[^\n]*$/g, '').trim();
  if (!/relay[\\/](audits|live)/i.test(p)) return true;
  if (/>>?[ \t]*["']?[^\s"'|;&]*relay[\\/](audits|live)/i.test(p)) return false;
  const m = /^[(\s]*(?:[A-Za-z_]\w*=\S*\s+)*(\S+)/.exec(p);
  if (!m) return false;
  const name = path
    .basename(m[1].replace(/["']/g, ''))
    .toLowerCase()
    .replace(/\.(exe|cmd|bat|ps1)$/, '');
  return READ_CMDS.has(name) || name === 'git';
}

function allowed(part) {
  const p = String(part).replace(/#[^\n]*$/g, '').trim();
  if (!/contracts[\\/]done/i.test(p)) return true;
  if (CANONICAL.test(p)) return true;
  if (/>>?[ \t]*["']?[^\s"'|;&]*contracts[\\/]done/i.test(p)) return false;
  if (/[ \t]-i\b/.test(p) || /-delete\b|-exec\b/.test(p)) return false;
  const m = /^[(\s]*(?:[A-Za-z_]\w*=\S*\s+)*(\S+)/.exec(p);
  if (!m) return false;
  const name = path
    .basename(m[1].replace(/["']/g, ''))
    .toLowerCase()
    .replace(/\.(exe|cmd|bat|ps1)$/, '');
  if (name === 'git') {
    const sub = (p.match(/\bgit\b[^\S\n]+(?:-C[^\S\n]+\S+[^\S\n]+)?([a-z-]+)/i) || [])[1];
    return GIT_SAFE.has(String(sub).toLowerCase());
  }
  return READ_CMDS.has(name);
}

function block(...lines) {
  process.stderr.write('BLOCKED: ' + lines.join('\n'));
  process.exit(2);
}
