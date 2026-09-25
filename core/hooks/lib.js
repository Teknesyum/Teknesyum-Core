const fs = require('fs');
const path = require('path');

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

function safe(s) {
  return String(s)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80);
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

function replyLang() {
  const set = settings().replyLang;
  if (set) return String(set).toLowerCase();
  try {
    const m = /\b(?:answer|reply|respond)\s+in\s+(turkish|english)\b/i.exec(fs.readFileSync(path.join(configRoot(), 'CLAUDE.md'), 'utf8'));
    if (m) return m[1].toLowerCase() === 'turkish' ? 'tr' : 'en';
  } catch {}
  return lang();
}

const BANNER = 'Teknesyum Core > ';

function banner(key, vars) {
  let s = t(key);
  for (const [k, v] of Object.entries(vars || {})) s = s.split(k).join(String(v));
  return BANNER + s;
}

function queue(session) {
  return stateFile('banner-' + String(session || 'none'));
}

function say(session, lines) {
  const add = [].concat(lines || []).filter(Boolean);
  if (!add.length) return;
  try {
    merge(queue(session), (b) => {
      const now = Array.isArray(b.lines) ? b.lines : [];
      return { lines: now.concat(add.filter((l) => !now.includes(l))).slice(-6) };
    });
  } catch {}
}

function sayBlock(session, text, key) {
  const body = String(text || '').trim();
  if (!body) return;
  try {
    merge(queue(session), (b) => {
      let now = Array.isArray(b.lines) ? b.lines : [];
      if (key) now = now.filter((l) => !(l && typeof l === 'object' && l.key === key));
      if (now.some((l) => l && typeof l === 'object' && l.block === body)) return { lines: now };
      return { lines: now.concat([key ? { block: body, key } : { block: body }]).slice(-6) };
    });
  } catch {}
}

function drain(session) {
  const f = queue(session);
  if (!fs.existsSync(f)) return [];
  let lines = [];
  try {
    lock(f, () => {
      const b = read(f);
      lines = (b && Array.isArray(b.lines) && b.lines) || [];
      fs.unlinkSync(f);
    });
  } catch {}
  return lines;
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

function slot(name, root) {
  return name + '-' + require('crypto').createHash('sha1').update(path.resolve(String(root || process.cwd()))).digest('hex').slice(0, 12);
}

function makeGate(o) {
  const mark = o.mark.replace(/[[\]]/g, '\\$&') + '(\\d{3})\\]\\]';
  return function gate(j) {
    if (j.tool_name !== 'Agent') return null;
    const input = j.tool_input || {};
    const m = new RegExp(mark).exec(String(input.prompt || ''));
    if (!m) return null;
    const id = m[1];
    const file = stateFile(slot(o.state, j.cwd));
    const st = read(file) || {};
    const deny = (why) => ({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: why },
    });
    if (st.id !== id) return deny(t(o.state + '.unknown').replace('%ID', id));
    if (st.spent) return deny(t(o.state + '.spent').replace('%ID', id));
    if (String(input.prompt).length > o.max) return deny(t(o.state + '.long'));
    write(file, { ...st, spent: true, spentAt: new Date().toISOString() });
    return null;
  };
}

function arg(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 || i === argv.length - 1 ? '' : argv[i + 1];
}

function fold(text) {
  return String(text || '').replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u');
}

function nextNumber(dir) {
  let top = 0;
  try {
    for (const n of fs.readdirSync(dir)) {
      const m = /^(\d{3})-/.exec(n);
      if (m) top = Math.max(top, Number(m[1]));
    }
  } catch {}
  return top + 1;
}

function errorLog(name, e) {
  try {
    fs.appendFileSync(stateFile('hook-errors').replace(/\.json$/, '.log'), new Date().toISOString() + ' ' + name + ' ' + String((e && e.stack) || e) + '\n');
  } catch {}
}

function main(handle, o = {}) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try {
      const out = handle(JSON.parse(raw || o.empty || ''));
      if (out) process.stdout.write(typeof out === 'string' ? out : JSON.stringify(out));
    } catch (e) {
      if (o.log) errorLog(o.log, e);
    }
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = {
  main,
  errorLog,
  arg,
  fold,
  nextNumber,
  makeGate,
  slot,
  home,
  configRoot,
  sessionId,
  stateFile,
  read,
  write,
  lock,
  merge,
  safe,
  settings,
  coreRepo,
  lang,
  replyLang,
  t,
  banner,
  queue,
  say,
  sayBlock,
  drain,
  BANNER,
  openLogs,
  openLogCount,
};
