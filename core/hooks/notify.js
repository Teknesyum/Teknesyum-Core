#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { configRoot, sessionId, sessionFile, read } = require('./lib.js');

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

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

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

function sessionLayer(sid) {
  if (!sid) return null;
  const k = read(sessionFile(sid));
  if (!k || !k.beep) return null;
  const ts = Number(k.ts);
  if (!Number.isFinite(ts) || Date.now() - ts > STALE_MS) return null;
  return k.beep;
}

function layers(cwd, sid) {
  return [
    { ad: 'proje', data: read(projectFile(cwd)) },
    { ad: 'oturum', data: sessionLayer(sid) },
    { ad: 'makine', data: read(machineFile()) },
  ].filter((k) => k.data && typeof k.data === 'object');
}

function resolveSettings(cwd, sid) {
  const stack = layers(cwd, sid);
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
      source: 'default',
      mutedSource: '',
      soundSource: '',
    };
    for (const k of stack) {
      const o = (k.data.events || {})[event];
      if (!o || typeof o !== 'object') continue;
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
    spawnSync(kmt, arg, { stdio: 'ignore', timeout: 8000, windowsHide: true });
    return true;
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

const WINDOW = { waiting: 60000, done: 10000, error: 10000 };

function stampFile() {
  return path.join(configRoot(), 'teknesyum-beep-last.json');
}

function playedRecently(event, simdi) {
  const f = stampFile();
  const d = read(f) || {};
  const last = Number(d[event]) || 0;
  if (last && simdi - last < (WINDOW[event] || 0)) return true;
  d[event] = simdi;
  try {
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify(d));
  } catch {}
  return false;
}

function run(j) {
  const event = HOOK_EVENT[j.hook_event_name];
  if (!event) return;
  const cfg = resolveSettings(j.cwd, j.session_id || sessionId());
  if (cfg.blanket.value) return;
  const field = cfg.events[event];
  if (!field || field.muted) return;
  if (playedRecently(event, Date.now())) return;
  play(field, event);
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
  stampFile,
  playedRecently,
};

if (require.main === module) {
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
