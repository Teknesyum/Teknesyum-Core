const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { read, write } = require('./lib.js');
const count = require('./count.js');

function komut(cwd) {
  try {
    const pj = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    if (pj.scripts && pj.scripts.test && !/no test specified/.test(pj.scripts.test)) return 'npm test --silent';
  } catch {}
  return '';
}

function verify(j) {
  if (j.hook_event_name !== 'Stop' || j.stop_hook_active) return '';
  const f = count.file(j);
  const st = read(f);
  if (!st || !Object.keys(st.files || {}).length || st.verified) return '';
  const cwd = st.cwd || j.cwd || process.cwd();
  const cmd = komut(cwd);
  if (!cmd) return '';
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', windowsHide: true, timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
  const ok = !r.error && r.status === 0;
  const text = String(r.stdout || '') + String(r.stderr || '');
  st.verified = { cmd, ok, at: new Date().toISOString() };
  write(f, st);
  if (ok) return '';
  return JSON.stringify({ decision: 'block', reason: cmd + ' failed:\n' + text.slice(-1500) });
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = '';
    try { out = verify(JSON.parse(raw)); } catch {}
    if (out) process.stdout.write(out);
    process.exit(0);
  });
}

module.exports = { verify };
