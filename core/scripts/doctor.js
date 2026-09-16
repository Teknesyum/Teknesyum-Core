const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const lib = require('../hooks/lib.js');

const argv = process.argv.slice(2);
const CORE = path.resolve(__dirname, '..');

function check(name, fn, keys = ['message']) {
  let r;
  try {
    r = fn();
  } catch (e) {
    r = { ok: false, [keys[0]]: (e && e.message) || e };
  }
  if (r === true || r === undefined) r = { ok: true };
  else if (r === false) r = { ok: false };
  else if (typeof r === 'string') r = { ok: true, [keys[0]]: r };
  const row = { name, ok: !!r.ok };
  for (const k of keys) row[k] = String(r[k] || '');
  return row;
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
  const wired = m ? m[1].split('\\').join('/') : '';
  const ver = /teknesyum-core\/([0-9]+\.[0-9]+\.[0-9]+)\//.exec(wired);
  const now = installedVersion();
  if (ver && now && ver[1] !== now)
    return {
      ok: false,
      message: 'the statusline still runs v' + ver[1] + ' while v' + now + ' is installed - open a new session, or run setup.js --apply',
    };
  return 'wired';
}

function installedVersion() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(CORE, '.claude-plugin', 'plugin.json'), 'utf8'));
    return j && j.version ? String(j.version) : '';
  } catch {
    return '';
  }
}

function mapOk(root) {
  const dir = path.join(root, '.claude');
  const st = require('./map.js').staleness(root, dir);
  if (st.state === 'missing') return { ok: true, message: 'no map yet - node <plugin>/scripts/map.js .' };
  if (st.state === 'unsealed') return { ok: false, message: 'the map does not say which commit it was built from - rebuild it' };
  if (st.state === 'unknown') return { ok: true, message: 'built at ' + String(st.at).slice(0, 8) + ', and HEAD cannot be read' };
  if (st.state === 'stale')
    return {
      ok: false,
      message:
        'the map is ' + (st.behind === null ? 'behind HEAD' : st.behind + ' commits behind') +
        ' and still reads as fact - node <plugin>/scripts/map.js .',
    };
  return 'current with HEAD';
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
  let man = null;
  try {
    man = JSON.parse(fs.readFileSync(path.join(CORE, '.claude-plugin', 'plugin.json'), 'utf8'));
  } catch {
    return { ok: false, message: 'the plugin manifest is missing' };
  }
  let pkg = null;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(CORE, '..', 'package.json'), 'utf8'));
  } catch {
    return 'v' + man.version;
  }
  if (String(pkg.version) !== String(man.version))
    return {
      ok: false,
      message: 'package.json says ' + pkg.version + ', the plugin manifest says ' + man.version,
    };
  return 'v' + pkg.version;
}

function logsOk() {
  const dir = lib.openLogs();
  const spool = !lib.coreRepo();
  let n = 0;
  try {
    n = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length;
  } catch {
    return { ok: true, message: 'no logs written yet - ' + dir };
  }
  if (spool)
    return {
      ok: false,
      message: n + ' log(s) sit in the fallback spool, not in the repo: ' + dir,
    };
  return n + ' open log(s) at ' + dir;
}

function run(root) {
  return [
    check('node', nodeOk),
    check('git', gitOk),
    check('version', versionOk),
    check('hooks', hooksOk),
    check('statusline', statuslineOk),
    check('map', () => mapOk(root)),
    check('logs', logsOk),
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
