const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { liveDir, setNotice, write } = require('./lib.js');

// When a bound builder stops, the close runs here instead of costing the
// coordinator a turn: submit, then complete. Whatever the gate says is written
// to live/_kapanis/<id>.json and the coordinator reads that. A failed close is
// recorded and left alone - the contract stays submitted, nothing retries.
const CONTRACT = path.join(__dirname, '..', 'scripts', 'contract.js');

function tail(s, n) {
  return String(s || '').trim().split('\n').slice(-n).join('\n');
}

function step(root, args) {
  const r = spawnSync(process.execPath, [CONTRACT].concat(args), {
    cwd: root, encoding: 'utf8', windowsHide: true, timeout: 20 * 60 * 1000,
  });
  return { code: r.status === null ? -1 : r.status, tail: tail((r.stdout || '') + (r.stderr || ''), 12) };
}

function resultPath(relay, id) {
  return path.join(liveDir(relay), '_kapanis', id + '.json');
}

function run(relay, root, id, agentId) {
  const out = { id, agent: agentId || '', at: new Date().toISOString(), submit: null, complete: null, closed: false };
  out.submit = step(root, ['submit', '--id', id]);
  if (out.submit.code === 0) {
    out.complete = step(root, ['complete', '--id', id]);
    out.closed = out.complete.code === 0;
  }
  write(resultPath(relay, id), out);
  try {
    setNotice(relay, id + (out.closed ? ' kapandi' : ' kapanmadi - live/_kapanis/' + id + '.json'));
  } catch {}
  return out;
}

function launch(relay, root, id, agentId) {
  try {
    const child = spawn(process.execPath, [__filename, '--relay', relay, '--root', root, '--id', id, '--agent', agentId || ''], {
      detached: true, stdio: 'ignore', windowsHide: true,
    });
    child.unref();
    return true;
  } catch {
    return false;
  }
}

function argOf(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? String(process.argv[i + 1] || '') : '';
}

if (require.main === module) {
  const relay = argOf('--relay');
  const root = argOf('--root');
  const id = argOf('--id');
  if (relay && root && id) run(relay, root, id, argOf('--agent'));
}

module.exports = { run, launch, resultPath };
