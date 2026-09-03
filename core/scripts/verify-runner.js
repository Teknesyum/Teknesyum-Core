// Synchronous callers delegate supervision here so the timeout can kill the
// process tree BEFORE its shell disappears. This process never invokes an LLM.
const { spawn, spawnSync } = require('child_process');
let input = '';
process.stdin.on('data', (s) => { input += s; });
process.stdin.on('end', () => {
  const { root, step, timeout } = JSON.parse(input);
  const child = spawn(step, { cwd: root, shell: true, windowsHide: true,
    detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
  const chunks = [];
  let bytes = 0, timedOut = false, swept = null, overflow = false, error = '';
  function kill() {
    if (!child.pid) return false;
    if (process.platform === 'win32') {
      const r = spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
        encoding: 'utf8', windowsHide: true, timeout: 10000,
      });
      return !r.error && r.status === 0;
    }
    try { process.kill(-child.pid, 'SIGKILL'); return true; } catch { return false; }
  }
  function capture(s) {
    bytes += s.length;
    if (bytes <= 16 * 1024 * 1024) chunks.push(s);
    else if (!overflow) { overflow = true; swept = kill(); }
  }
  child.stdout.on('data', capture); child.stderr.on('data', capture);
  const timer = setTimeout(() => { timedOut = true; swept = kill(); }, timeout);
  child.on('error', (e) => { error = String(e.message); });
  child.on('close', (code) => {
    clearTimeout(timer);
    process.stdout.write(JSON.stringify({ code: timedOut || overflow || error ? -1 : code,
      timedOut, swept, text: Buffer.concat(chunks).toString('utf8'),
      error: error || (overflow ? 'verify output exceeded 16 MiB' : timedOut ? 'verify deadline exceeded' : '') }));
  });
});
