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
    fs.renameSync(tmp, f);
  } catch {
    try {
      fs.unlinkSync(tmp);
    } catch {}
  }
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

function relayRoot(start, opt) {
  let d = path.resolve(start || '.');
  for (;;) {
    const c = path.join(d, '.claude', 'relay');
    if (fs.existsSync(c)) return { relay: c, worktree: null };
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

function liveDir(relay) {
  return path.join(relay, 'live');
}

function projectRoot(relay) {
  return path.dirname(path.dirname(relay));
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

module.exports = {
  home,
  configRoot,
  sessionId,
  stateFile,
  read,
  write,
  norm,
  safe,
  exists,
  gitInfo,
  relayRoot,
  liveDir,
  projectRoot,
  logProblem,
  pluginRoot,
  settings,
  coreRepo,
  openLogs,
  openLogCount,
};
