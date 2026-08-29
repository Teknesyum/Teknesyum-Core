const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const lib = require('../hooks/lib.js');
const seal = require('../hooks/seal.js');

const argv = process.argv.slice(2);
const CORE = path.resolve(__dirname, '..');

function check(name, fn) {
  try {
    const r = fn();
    if (r === true || r === undefined) return { name, ok: true, message: '' };
    if (r === false) return { name, ok: false, message: '' };
    if (typeof r === 'string') return { name, ok: true, message: r };
    return { name, ok: !!r.ok, message: String(r.message || '') };
  } catch (e) {
    return { name, ok: false, message: String((e && e.message) || e) };
  }
}

function nodeOk() {
  const major = Number(String(process.versions.node).split('.')[0]);
  if (major < 18) return { ok: false, message: 'node ' + process.versions.node + ' is too old; 18 or newer' };
  return 'node ' + process.versions.node;
}

function gitOk() {
  const r = spawnSync('git', ['--version'], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (r.error || r.status !== 0) return { ok: false, message: 'git is not on PATH' };
  return String(r.stdout || '').trim();
}

function tiersOk() {
  const T = JSON.parse(fs.readFileSync(path.join(CORE, 'tiers.json'), 'utf8'));
  const rows = Object.keys(T.cells || {});
  if (!rows.length) return { ok: false, message: 'the tier table has no rows' };
  for (const row of rows)
    for (const p of T.profiles)
      if (!T.cells[row][p]) return { ok: false, message: row + ' has no cell for ' + p };
  return rows.length + ' rows × ' + T.profiles.length + ' profiles';
}

function rolesOk() {
  const dir = path.join(CORE, 'roles');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /\.md$/i.test(f));
  } catch {
    return { ok: false, message: 'core/roles is missing' };
  }
  const T = JSON.parse(fs.readFileSync(path.join(CORE, 'tiers.json'), 'utf8'));
  const bad = [];
  for (const f of files) {
    const body = fs.readFileSync(path.join(dir, f), 'utf8');
    const row = (body.match(/^tier:[ \t]*(\S+)/im) || [])[1];
    if (!row || !T.cells[row]) bad.push(f.replace(/\.md$/i, ''));
  }
  if (bad.length) return { ok: false, message: 'no tier row for: ' + bad.join(', ') };
  return files.length + ' roles resolve';
}

function statuslineOk() {
  const p = path.join(lib.configRoot(), 'settings.json');
  let s;
  try {
    s = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return { ok: false, message: 'settings.json is missing or unreadable - run setup.js --apply' };
  }
  if (!s.statusLine || !s.statusLine.command)
    return { ok: false, message: 'the statusline is not wired - run setup.js --apply' };
  const m = /"([^"]+bridge\.js)"/.exec(String(s.statusLine.command));
  if (m && !fs.existsSync(m[1]))
    return { ok: false, message: 'the statusline points at a file that is gone: ' + m[1] };
  return 'wired';
}

function relayOk(root) {
  const r = lib.relayRoot(root, { git: false });
  if (!r) return { ok: true, message: 'no relay in this project - nothing to check' };
  const need = ['contracts', path.join('contracts', 'd' + 'one'), 'audits', 'live'];
  const gone = need.filter((d) => !fs.existsSync(path.join(r.relay, d)));
  if (gone.length)
    return {
      ok: true,
      message: 'no work has run here yet - ' + gone.length + ' folder(s) appear on the first contract',
    };
  return 'complete';
}

function ledgerOk(root) {
  const r = lib.relayRoot(root, { git: false });
  if (!r) return 'no relay here';
  const unrecorded = seal.auditDone(lib.projectRoot(r.relay), r.relay);
  if (unrecorded && unrecorded.length)
    return {
      ok: false,
      message: 'closed without going through the gate: ' + unrecorded.join(', '),
    };
  return 'every close is in the ledger';
}

function hooksOk() {
  const h = JSON.parse(fs.readFileSync(path.join(CORE, 'hooks', 'hooks.json'), 'utf8')).hooks;
  const missing = [];
  for (const ev of Object.keys(h))
    for (const group of h[ev])
      for (const hook of group.hooks || []) {
        const m = /hooks[\\/]([a-z]+\.js)/i.exec(String(hook.command));
        if (m && !fs.existsSync(path.join(CORE, 'hooks', m[1]))) missing.push(m[1]);
      }
  if (missing.length) return { ok: false, message: 'hooks.json points at files that are gone: ' + missing.join(', ') };
  return Object.keys(h).length + ' events wired';
}

function versionOk() {
  const pkg = JSON.parse(fs.readFileSync(path.join(CORE, '..', 'package.json'), 'utf8'));
  let man = null;
  try {
    man = JSON.parse(fs.readFileSync(path.join(CORE, '.claude-plugin', 'plugin.json'), 'utf8'));
  } catch {
    return { ok: false, message: 'the plugin manifest is missing' };
  }
  if (String(pkg.version) !== String(man.version))
    return {
      ok: false,
      message: 'package.json says ' + pkg.version + ', the plugin manifest says ' + man.version,
    };
  return 'v' + pkg.version;
}

function run(root) {
  return [
    check('node', nodeOk),
    check('git', gitOk),
    check('version', versionOk),
    check('tier table', tiersOk),
    check('roles', rolesOk),
    check('hooks', hooksOk),
    check('statusline', statuslineOk),
    check('relay', () => relayOk(root)),
    check('ledger', () => ledgerOk(root)),
  ];
}

function main() {
  const root = process.cwd();
  const rows = run(root);
  if (argv.includes('--json')) {
    process.stdout.write(JSON.stringify(rows, null, 2) + '\n');
    return process.exit(rows.every((r) => r.ok) ? 0 : 1);
  }
  const width = rows.reduce((n, r) => Math.max(n, r.name.length), 0);
  for (const r of rows)
    process.stdout.write(
      (r.ok ? 'ok   ' : 'FAIL ') + r.name.padEnd(width) + (r.message ? '  ' + r.message : '') + '\n'
    );
  const bad = rows.filter((r) => !r.ok).length;
  process.stdout.write(
    '\n' + (bad ? bad + ' of ' + rows.length + ' need attention.' : 'All ' + rows.length + ' checks pass.') + '\n'
  );
  return process.exit(bad ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run, check };
