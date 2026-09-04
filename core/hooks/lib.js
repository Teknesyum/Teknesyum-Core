const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function home() {
  return process.env.USERPROFILE || process.env.HOME || '.';
}

function configRoot() {
  return process.env.CLAUDE_CONFIG_DIR || path.join(home(), '.claude');
}

function sessionId() {
  const s = process.env.CLAUDE_CODE_SESSION_ID || process.env.CLAUDE_CODE_HOST_SESSION_ID;
  return s ? String(s) : null;
}

function stateFile(name) {
  return path.join(configRoot(), 'teknesyum', safe(name) + '.json');
}

function read(f) {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return null;
  }
}

function write(f, data) {
  const tmp = f + '.' + process.pid + '.tmp';
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  } catch {
    try {
      fs.unlinkSync(tmp);
    } catch {}
    return false;
  }
  for (let i = 0; i < 5; i += 1) {
    try {
      fs.renameSync(tmp, f);
      return true;
    } catch {
      nap(5);
    }
  }
  try {
    fs.unlinkSync(tmp);
  } catch {}
  return false;
}

function nap(ms) {
  try {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  } catch {}
}

function lock(f, fn) {
  const dir = f + '.lock';
  let held = false;
  fs.mkdirSync(path.dirname(f), { recursive: true });
  for (let i = 0; i < 40; i += 1) {
    try {
      fs.mkdirSync(dir);
      fs.writeFileSync(path.join(dir, 'owner.json'), JSON.stringify({ pid: process.pid }));
      held = true;
      break;
    } catch {
      try {
        const owner = read(path.join(dir, 'owner.json'));
        if (owner && Number.isInteger(owner.pid) && owner.pid > 0) {
          let alive = true;
          try { process.kill(owner.pid, 0); } catch (e) { if (e.code === 'ESRCH') alive = false; }
          if (!alive) {
            fs.unlinkSync(path.join(dir, 'owner.json'));
            fs.rmdirSync(dir);
          }
        }
      } catch {}
      nap(5);
    }
  }
  if (!held) throw new Error('Lock timeout: ' + f);
  try {
    return fn();
  } finally {
    if (held) {
      try {
        fs.unlinkSync(path.join(dir, 'owner.json'));
        fs.rmdirSync(dir);
      } catch {}
    }
  }
}

function merge(f, patch) {
  return lock(f, () => {
    const now = read(f);
    const base = now && typeof now === 'object' && !Array.isArray(now) ? now : {};
    const next = typeof patch === 'function' ? patch(base) : Object.assign({}, base, patch);
    if (!write(f, next)) throw new Error('State write failed: ' + f);
    return next;
  });
}

function norm(p) {
  return path.normalize(String(p)).replace(/\\/g, '/');
}

function safe(s) {
  return String(s)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80);
}

function exists(...p) {
  try {
    return fs.existsSync(path.join(...p));
  } catch {
    return false;
  }
}

const _gitCache = new Map();

function gitInfo(start) {
  const key = path.resolve(start);
  if (_gitCache.has(key)) return _gitCache.get(key);
  const out = askGit(key);
  _gitCache.set(key, out);
  return out;
}

function askGit(start) {
  try {
    const top = path.resolve(
      execFileSync('git', ['-C', path.resolve(start), 'rev-parse', '--show-toplevel'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim()
    );
    let common = execFileSync('git', ['-C', top, 'rev-parse', '--git-common-dir'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    common = path.resolve(top, common);
    if (path.basename(common).toLowerCase() === '.git') common = path.dirname(common);
    return { top, common };
  } catch {
    return null;
  }
}

function linkedRoot(d) {
  let raw = '';
  try {
    const g = path.join(d, '.git');
    if (!fs.statSync(g).isFile()) return null;
    raw = fs.readFileSync(g, 'utf8');
  } catch {
    return null;
  }
  const m = /^gitdir:\s*(.+)$/m.exec(raw);
  if (!m) return null;
  let gitdir = path.resolve(d, m[1].trim());
  try { gitdir = fs.realpathSync(gitdir); } catch {}
  let common = path.dirname(path.dirname(gitdir));
  try {
    const marker = path.join(gitdir, 'commondir');
    if (fs.existsSync(marker)) {
      common = path.resolve(gitdir, fs.readFileSync(marker, 'utf8').trim());
      try { common = fs.realpathSync(common); } catch {}
    }
  } catch {}
  if (path.basename(common).toLowerCase() === '.git') common = path.dirname(common);
  return common;
}

function relayRoot(start, opt) {
  let d = path.resolve(start || '.');
  for (;;) {
    const main = linkedRoot(d);
    if (main) {
      const shared = path.join(main, '.claude', 'relay');
      if (fs.existsSync(shared)) return { relay: shared, worktree: d };
    }
    const c = path.join(d, '.claude', 'relay');
    if (fs.existsSync(c)) return { relay: c, worktree: null };
    if (fs.existsSync(path.join(d, '.git'))) break;
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  if (opt && opt.git === false) return null;
  const git = gitInfo(start);
  if (!git) return null;
  const relay = path.join(git.common, '.claude', 'relay');
  if (!fs.existsSync(relay)) return null;
  return { relay, worktree: norm(git.top) !== norm(git.common) ? git.top : null };
}

const RELAY_IGNORE = ['live/', 'HANDOFF.md', ''].join('\n');

function ensureRelay(start) {
  const found = relayRoot(start);
  if (found) return found;
  const git = gitInfo(start);
  if (!git) return null;
  const relay = path.join(git.common, '.claude', 'relay');
  try {
    fs.mkdirSync(path.join(relay, 'live'), { recursive: true });
    const ig = path.join(relay, '.gitignore');
    if (!fs.existsSync(ig)) fs.writeFileSync(ig, RELAY_IGNORE);
  } catch {
    return null;
  }
  return { relay, worktree: norm(git.top) !== norm(git.common) ? git.top : null };
}

function liveDir(relay) {
  return path.join(relay, 'live');
}

function projectRoot(relay) {
  return path.dirname(path.dirname(relay));
}

function checkoutRoot(context) {
  return path.resolve(context.worktree || projectRoot(context.relay));
}

function realPath(target) {
  let at = path.resolve(target);
  const tail = [];
  for (;;) {
    try { return path.join(fs.realpathSync(at), ...tail.reverse()); }
    catch (e) {
      if (e.code !== 'ENOENT') throw e;
      const up = path.dirname(at);
      if (up === at) throw e;
      tail.push(path.basename(at));
      at = up;
    }
  }
}

function pathKey(target) {
  const value = norm(realPath(target));
  return process.platform === 'win32' ? value.toLowerCase() : value;
}

function inside(root, target) {
  const rel = path.relative(pathKey(root), pathKey(target));
  return rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel);
}

function logProblem(relay, source, line) {
  const live = liveDir(relay);
  try {
    fs.mkdirSync(live, { recursive: true });
    fs.appendFileSync(
      path.join(live, 'problems.log'),
      new Date().toISOString().replace('T', ' ').slice(0, 19) + ' | ' + source + ' | ' + line + '\n'
    );
  } catch {}
}

function pluginRoot(id) {
  const name = id || 'teknesyum-core@teknesyum';
  try {
    const j = read(path.join(configRoot(), 'plugins', 'installed_plugins.json'));
    const k = j && j.plugins && j.plugins[name] && j.plugins[name][0];
    if (!k) return null;
    if (k.installPath && fs.existsSync(k.installPath)) return k.installPath;
    if (!k.version) return null;
    const [market, pkg] = name.split('@').reverse();
    const p = path.join(configRoot(), 'plugins', 'cache', market, pkg, k.version);
    return fs.existsSync(p) ? p : null;
  } catch {
    return null;
  }
}

function settings() {
  return read(stateFile('config')) || {};
}

let _strings = null;

function strings() {
  if (_strings) return _strings;
  _strings = read(path.join(__dirname, '..', 'strings.json')) || {};
  return _strings;
}

let _lang = null;

function lang() {
  if (_lang) return _lang;
  const l = String(settings().lang || 'en').toLowerCase();
  _lang = /^[a-z]{2}$/.test(l) ? l : 'en';
  return _lang;
}

function t(key) {
  const row = strings()[key];
  if (!row) return key;
  return row[lang()] || row.en || key;
}

function rewire() {
  const here = path.resolve(__dirname, '..');
  const bridge = path.join(here, 'scripts', 'bridge.js').replace(/\\/g, '/');
  const p = path.join(configRoot(), 'settings.json');
  const s = read(p);
  if (!s || !s.statusLine || typeof s.statusLine.command !== 'string') return false;
  const cur = s.statusLine.command;
  if (cur.indexOf('bridge.js') < 0 || cur.indexOf(bridge) >= 0) return false;
  if (!/teknesyum[\\/-]/i.test(cur)) return false;
  if (!fs.existsSync(bridge)) return false;
  s.statusLine = { type: 'command', command: 'node "' + bridge + '"', padding: 0 };
  if (!write(p, s)) return false;
  const cfg = read(stateFile('config')) || {};
  cfg.pluginDir = here;
  write(stateFile('config'), cfg);
  return true;
}
function coreRepo() {
  const seen = [process.env.TEKNESYUM_CORE, settings().coreRepo];
  let d = path.resolve(__dirname, '..', '..');
  for (;;) {
    seen.push(d);
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  for (const c of seen) {
    try {
      if (c && fs.existsSync(path.join(c, 'core', '.claude-plugin', 'plugin.json'))) return c;
    } catch {}
  }
  return null;
}

function openLogs() {
  const repo = coreRepo();
  return repo
    ? path.join(repo, 'logs', 'openlogs')
    : path.join(configRoot(), 'teknesyum', 'openlogs');
}

function openLogCount() {
  try {
    return fs.readdirSync(openLogs()).filter((f) => f.endsWith('.md')).length;
  } catch {
    return 0;
  }
}

const NOTICE = '_duyuru.json';
const NOTICE_TTL = 120 * 1000;

function noticeFile(relay) {
  return path.join(liveDir(relay), NOTICE);
}

function setNotice(relay, text) {
  if (!relay || !text) return false;
  const f = noticeFile(relay);
  const cur = read(f);
  if (cur && cur.text === text) return false;
  write(f, { text: String(text).slice(0, 80), at: Date.now() });
  return true;
}

function getNotice(relay) {
  const cur = read(noticeFile(relay));
  if (!cur || !cur.text) return '';
  if (!cur.at || Date.now() - cur.at > NOTICE_TTL) return '';
  return String(cur.text);
}

const PINNED = {
  win32: [
    'HKCU\\Environment',
    'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment',
  ],
};

const RC = ['.bashrc', '.bash_profile', '.zshrc', '.profile'];

function pinnedInShell(name) {
  const at = home();
  if (!at) return false;
  const re = new RegExp('^[ \\t]*(export[ \\t]+)?' + name + '[ \\t]*=', 'm');
  for (const f of RC) {
    try {
      if (re.test(fs.readFileSync(path.join(at, f), 'utf8'))) return true;
    } catch {}
  }
  return false;
}

function envPinned(name, probe = {}) {
  if (!/^[A-Z_][A-Z0-9_]*$/i.test(String(name || ''))) return false;
  if ((probe.pinnedInShell || pinnedInShell)(name)) return true;
  const keys = PINNED[probe.platform || process.platform];
  if (!keys) return false;
  for (const key of keys) {
    try {
      const out = (probe.execFileSync || execFileSync)('reg', ['query', key, '/v', name], {
        encoding: 'utf8',
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      if (new RegExp('\\b' + name + '\\b', 'i').test(out || '')) return true;
    } catch {}
  }
  return false;
}

module.exports = {
  envPinned,
  home,
  configRoot,
  sessionId,
  stateFile,
  read,
  write,
  lock,
  merge,
  norm,
  safe,
  exists,
  gitInfo,
  relayRoot,
  ensureRelay,
  liveDir,
  projectRoot,
  checkoutRoot,
  realPath,
  pathKey,
  inside,
  logProblem,
  pluginRoot,
  settings,
  rewire,
  coreRepo,
  lang,
  t,
  openLogs,
  openLogCount,
  setNotice,
  getNotice,
};
