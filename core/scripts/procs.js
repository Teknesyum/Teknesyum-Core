#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { read, write, stateFile } = require('../hooks/lib.js');

const STALE_MS = 30 * 60 * 1000;
const FRESH_MS = 60 * 1000;
const ROOT = /^claude(\.exe)?$/i;
const SHELL = /^(bash|sh|zsh|dash|fish|powershell|pwsh|cmd)(\.exe)?$/i;
const NOISE = /^(conhost\.exe|sleep(\.exe)?|timeout(\.exe)?)$/i;

function cacheFile() {
  return stateFile('procs');
}

function table() {
  if (process.platform === 'win32') {
    const r = spawnSync(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,@{n="Start";e={[int64](($_.CreationDate - (Get-Date "1970-01-01Z").ToUniversalTime()).TotalMilliseconds)}} | ConvertTo-Json -Compress',
      ],
      { encoding: 'utf8', timeout: 20000, windowsHide: true }
    );
    let rows = [];
    try {
      rows = JSON.parse(r.stdout || '[]');
    } catch {
      return [];
    }
    return (Array.isArray(rows) ? rows : [rows]).map((x) => ({ pid: x.ProcessId, ppid: x.ParentProcessId, name: x.Name || '', start: Number(x.Start) || 0 }));
  }
  const r = spawnSync('ps', ['-eo', 'pid=,ppid=,etimes=,comm='], { encoding: 'utf8', timeout: 20000 });
  const now = Date.now();
  return String(r.stdout || '')
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .filter((p) => p.length >= 4)
    .map((p) => ({ pid: Number(p[0]), ppid: Number(p[1]), name: path.basename(p.slice(3).join(' ')), start: now - Number(p[2]) * 1000 }));
}

function stale(rows, now, staleMs) {
  const byPid = new Map(rows.map((r) => [r.pid, r]));
  function underShell(r) {
    let shell = SHELL.test(r.name);
    let cur = r;
    for (let depth = 0; depth < 64; depth++) {
      const p = byPid.get(cur.ppid);
      if (!p || p.pid === cur.pid) return false;
      if (ROOT.test(p.name)) return shell;
      if (SHELL.test(p.name)) shell = true;
      cur = p;
    }
    return false;
  }
  const hits = [];
  for (const r of rows) {
    if (ROOT.test(r.name) || NOISE.test(r.name) || !r.start) continue;
    if (now - r.start < (staleMs || STALE_MS)) continue;
    if (!underShell(r)) continue;
    hits.push({ pid: r.pid, name: r.name, minutes: Math.floor((now - r.start) / 60000) });
  }
  hits.sort((a, b) => b.minutes - a.minutes);
  return hits;
}

function ring(cwd) {
  try {
    const notify = require('../hooks/notify.js');
    const cfg = notify.resolveSettings(cwd);
    if (cfg.blanket.value) return;
    const field = cfg.events.waiting;
    if (!field || field.muted) return;
    notify.play(field, 'waiting');
  } catch {}
}

function refresh(cwd) {
  const before = read(cacheFile()) || {};
  const now = Date.now();
  const hits = stale(table(), now);
  write(cacheFile(), { at: now, count: hits.length, oldest: hits.length ? hits[0].minutes : 0, names: hits.slice(0, 5).map((h) => h.name) });
  if (hits.length && !(before.count > 0)) ring(cwd);
  return hits;
}

function peek(cwd) {
  const c = read(cacheFile());
  const now = Date.now();
  if (!c || now - (c.at || 0) > FRESH_MS) {
    try {
      const child = spawn(process.execPath, [__filename, 'refresh', '--cwd', cwd || process.cwd()], { detached: true, stdio: 'ignore', windowsHide: true });
      child.unref();
    } catch {}
  }
  return c && c.count > 0 ? c : null;
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--cwd');
  const cwd = at >= 0 ? argv[at + 1] : process.cwd();
  if (argv[0] === 'refresh') {
    try {
      refresh(cwd);
    } catch {}
    process.exit(0);
  }
  const hits = stale(table(), Date.now());
  process.stdout.write(hits.length ? hits.map((h) => h.pid + '  ' + h.name + '  ' + h.minutes + ' min').join('\n') + '\n' : 'nothing stale\n');
}

module.exports = { stale, refresh, peek, table, cacheFile, STALE_MS, FRESH_MS };
