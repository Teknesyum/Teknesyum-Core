#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { configRoot, read } = require('./lib.js');

const EVENTS = ['waiting', 'done', 'error'];

const HOOK_EVENT = { Notification: 'waiting', Stop: 'done', StopFailure: 'error' };

const DEFAULTS = {
  waiting: { muted: false, file: 'Windows Startup.wav' },
  done: { muted: false, file: 'ding.wav' },
  error: { muted: false, file: 'Windows Default.wav' },
};

const MEASURED_LENGTH = {
  'Windows Startup.wav': '0,22 s',
  'ding.wav': '0,40 s',
  'Windows Default.wav': '0,41 s',
};

const MAC_DEFAULT = {
  waiting: '/System/Library/Sounds/Tink.aiff',
  done: '/System/Library/Sounds/Pop.aiff',
  error: '/System/Library/Sounds/Basso.aiff',
};


function mediaRoot() {
  if (process.env.TEKNESYUM_SES_KOKU) return process.env.TEKNESYUM_SES_KOKU;
  if (process.platform === 'win32')
    return path.join(process.env.SystemRoot || 'C:\\Windows', 'Media');
  if (process.platform === 'darwin') return '/System/Library/Sounds';
  return '/usr/share/sounds';
}

function machineFile() {
  return path.join(configRoot(), 'teknesyum-beep.json');
}

function projectFile(cwd) {
  return path.join(path.resolve(cwd || '.'), '.claude', 'teknesyum-beep.json');
}

function layers(cwd) {
  return [
    { ad: 'proje', data: read(projectFile(cwd)) },
    { ad: 'makine', data: read(machineFile()) },
  ].filter((k) => k.data && typeof k.data === 'object');
}

function resolveSettings(cwd) {
  const stack = layers(cwd);
  const out = {};
  let blanket = { value: false, source: 'default' };
  for (const k of stack)
    if (typeof k.data.muted === 'boolean' && blanket.source === 'default')
      blanket = { value: k.data.muted, source: k.ad };
  for (const event of EVENTS) {
    const v = DEFAULTS[event];
    const field = {
      muted: v.muted,
      file: v.file,
      hz: 0,
      ms: 0,
      minMs: MIN_MS[event],
      source: 'default',
      mutedSource: '',
      soundSource: '',
      minSource: '',
    };
    for (const k of stack) {
      const o = (k.data.events || {})[event];
      if (!o || typeof o !== 'object') continue;
      if (typeof o.minMs === 'number' && !field.minSource) {
        field.minMs = Math.max(0, o.minMs);
        field.minSource = k.ad;
      }
      if (typeof o.muted === 'boolean' && !field.mutedSource) {
        field.muted = o.muted;
        field.mutedSource = k.ad;
      }
      if (!field.soundSource && (o.file || (o.hz && o.ms))) {
        if (o.hz && o.ms) {
          field.hz = Number(o.hz);
          field.ms = Number(o.ms);
          field.file = '';
        } else {
          field.file = String(o.file);
        }
        field.soundSource = k.ad;
      }
    }
    field.source = field.mutedSource || field.soundSource || 'default';
    out[event] = field;
  }
  return { blanket, events: out };
}

function soundPath(event, file) {
  const cand = [];
  if (file) cand.push(path.isAbsolute(file) ? file : path.join(mediaRoot(), file));
  if (process.platform === 'darwin') cand.push(MAC_DEFAULT[event]);
  cand.push(path.join(mediaRoot(), DEFAULTS[event].file));
  for (const y of cand) {
    try {
      if (y && fs.existsSync(y)) return y;
    } catch {}
  }
  return null;
}

function exec(kmt, arg) {
  try {
    const r = spawnSync(kmt, arg, { stdio: 'ignore', timeout: 8000, windowsHide: true });
    return !!r && !r.error && r.status === 0;
  } catch {
    return false;
  }
}

function present(kmt) {
  try {
    const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [kmt], {
      stdio: 'ignore',
      timeout: 3000,
      windowsHide: true,
    });
    return r.status === 0;
  } catch {
    return false;
  }
}

function play(field, event) {
  if (process.env.TEKNESYUM_BEEP_SESSIZ) return false;
  try {
    if (process.platform === 'win32' && field.hz && field.ms)
      return exec('powershell', [
        '-NoProfile',
        '-Command',
        '[console]::beep(' + Math.round(field.hz) + ',' + Math.round(field.ms) + ')',
      ]);
    const p = soundPath(event, field.file);
    if (!p) return false;
    if (process.platform === 'win32')
      return exec('powershell', [
        '-NoProfile',
        '-Command',
        "(New-Object Media.SoundPlayer '" + p.replace(/'/g, "''") + "').PlaySync()",
      ]);
    if (process.platform === 'darwin') return exec('afplay', [p]);
    if (present('paplay')) return exec('paplay', [p]);
    if (present('aplay')) return exec('aplay', ['-q', p]);
    try {
      process.stderr.write('\u0007');
    } catch {}
    return true;
  } catch {
    return false;
  }
}

const CALLS_YOU = /^(permission_prompt|agent_needs_input|elicitation_dialog|elicitation_url_dialog)$/;

function wanted(j) {
  const kind = String((j && j.notification_type) || '');
  if (kind) return CALLS_YOU.test(kind);
  return !busy(j && j.cwd);
}

const BUSY_MS = 45000;

function busy(cwd) {
  try {
    const { relayRoot, liveDir, read: readJson } = require('./lib.js');
    const r = relayRoot(cwd || process.cwd(), { git: false });
    if (!r) return false;
    const dir = liveDir(r.relay);
    const now = Date.now();
    for (const f of fs.readdirSync(dir)) {
      if (!/\.json$/.test(f) || f[0] === '_') continue;
      const rec = readJson(path.join(dir, f));
      if (!rec || rec.ended) continue;
      const at = Date.parse(rec.updated || rec.started || '') || 0;
      if (at && now - at < BUSY_MS) return true;
    }
  } catch {}
  return false;
}

const WINDOW = { waiting: 60000, done: 10000, error: 10000 };

const MIN_MS = { waiting: 0, done: 0, error: 0 };

function stampFile() {
  return path.join(configRoot(), 'teknesyum-beep-last.json');
}

function scope(cwd) {
  try {
    return path.resolve(cwd || process.cwd()).toLowerCase();
  } catch {
    return '.';
  }
}

function slot(cwd) {
  const d = read(stampFile()) || {};
  const v = d[scope(cwd)];
  return v && typeof v === 'object' ? v : {};
}

function recently(event, simdi, cwd) {
  const last = Number(slot(cwd)[event]) || 0;
  return !!last && simdi - last < (WINDOW[event] || 0);
}

function stamp(event, simdi, cwd) {
  const f = stampFile();
  const d = read(f) || {};
  const k = scope(cwd);
  if (!d[k] || typeof d[k] !== 'object') d[k] = {};
  d[k][event] = simdi;
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(d));
  } catch {}
}

function playedRecently(event, simdi, cwd) {
  if (recently(event, simdi, cwd)) return true;
  stamp(event, simdi, cwd);
  return false;
}

function tooQuick(field, now, cwd) {
  const min = Number(field.minMs) || 0;
  if (min <= 0) return false;
  const at = Number(slot(cwd).prompt) || 0;
  return !!at && now - at < min;
}

function run(j) {
  const event = HOOK_EVENT[j.hook_event_name];
  if (!event) return;
  const cfg = resolveSettings(j.cwd);
  if (cfg.blanket.value) return;
  const field = cfg.events[event];
  if (!field || field.muted) return;
  const now = Date.now();
  if (event === 'done' && tooQuick(field, now, j.cwd)) return;
  if (event === 'waiting' && !wanted(j)) return;
  if (recently(event, now, j.cwd)) return;
  if (play(field, event)) stamp(event, now, j.cwd);
}

module.exports = {
  EVENTS,
  HOOK_EVENT,
  DEFAULTS,
  MEASURED_LENGTH,
  MAC_DEFAULT,
  mediaRoot,
  machineFile,
  projectFile,
  resolveSettings,
  play,
  soundPath,
  WINDOW,
  MIN_MS,
  BUSY_MS,
  busy,
  CALLS_YOU,
  wanted,
  tooQuick,
  stampFile,
  scope,
  playedRecently,
  recently,
  stamp,
};

if (require.main === module) {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--event');
  if (at >= 0) {
    const where = argv.indexOf('--cwd');
    try {
      run({ hook_event_name: argv[at + 1], cwd: where >= 0 ? argv[where + 1] : process.cwd() });
    } catch {}
    process.exit(0);
  }
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try {
      run(JSON.parse(raw));
    } catch {}
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}
