const fs = require('fs');
const path = require('path');
const { spawnSync, spawn } = require('child_process');
const { stateFile, read, write, configRoot, pluginRoot } = require('../hooks/lib.js');

const argv = process.argv.slice(2);
const REPO = 'https://github.com/Teknesyum/Teknesyum-Core';
const TTL = 7 * 24 * 60 * 60 * 1000;

function parse(v) {
  const m = /(\d+)\.(\d+)\.(\d+)/.exec(String(v || ''));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function newer(a, b) {
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) return false;
  for (let i = 0; i < 3; i += 1) {
    if (x[i] > y[i]) return true;
    if (x[i] < y[i]) return false;
  }
  return false;
}

function installed() {
  const roots = [pluginRoot(), path.resolve(__dirname, '..')];
  for (const r of roots) {
    if (!r) continue;
    try {
      const j = JSON.parse(fs.readFileSync(path.join(r, '.claude-plugin', 'plugin.json'), 'utf8'));
      if (j && j.version) return String(j.version);
    } catch {}
  }
  return '';
}

function fromMarketplace() {
  const p = path.join(configRoot(), 'plugins', 'marketplaces', 'teknesyum', '.claude-plugin', 'marketplace.json');
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const row = (j.plugins || []).find((x) => x && x.name === 'teknesyum-core');
    return row && row.version ? String(row.version) : '';
  } catch {
    return '';
  }
}

function cached() {
  const c = read(stateFile('version')) || {};
  return { latest: String(c.latest || ''), checkedAt: Number(c.checkedAt || 0) };
}

function known() {
  const c = cached().latest;
  const m = fromMarketplace();
  return newer(m, c) ? m : c;
}

function due() {
  return Date.now() - cached().checkedAt > TTL;
}

function ask() {
  const r = spawnSync('git', ['ls-remote', '--tags', '--refs', REPO], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 20000,
    maxBuffer: 4 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return '';
  let best = '';
  for (const line of String(r.stdout || '').split('\n')) {
    const m = /refs\/tags\/v?(\d+\.\d+\.\d+)\s*$/.exec(line.trim());
    if (m && (!best || newer(m[1], best))) best = m[1];
  }
  return best;
}

function fetch() {
  const found = ask();
  const now = cached();
  write(stateFile('version'), {
    latest: found || now.latest || '',
    checkedAt: Date.now(),
  });
  return found;
}

function hint() {
  const here = installed();
  const there = known();
  return here && there && newer(there, here) ? there : '';
}

function maybeRefresh() {
  if (!due()) return false;
  try {
    const child = spawn(process.execPath, [__filename, 'fetch'], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function main() {
  const cmd = argv[0] || 'check';
  if (cmd === 'fetch') {
    fetch();
    return process.exit(0);
  }
  const here = installed() || '?';
  const there = argv.includes('--offline') ? known() : fetch() || known();
  if (!there) {
    process.stdout.write(
      'v' + here + ' installed. The latest could not be read - no network, or the tags could not be listed.\n'
    );
    return process.exit(0);
  }
  if (newer(there, here))
    process.stdout.write(
      'v' + here + ' installed, v' + there + ' released.\n\nUpdate from inside Claude Code:\n  /plugin update teknesyum-core@teknesyum\n'
    );
  else process.stdout.write('v' + here + ' installed, and that is the latest.\n');
  return process.exit(0);
}

if (require.main === module) main();
module.exports = { newer, parse, installed, known, hint, due, maybeRefresh, fetch, cached };
