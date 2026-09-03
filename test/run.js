const { spawnSync } = require('child_process');
const path = require('path');
for (const file of ['all.js', 'audit-regressions.js', 'verify-timeout.js']) {
  const r = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: 'inherit', windowsHide: true });
  if (r.error || r.status !== 0) { process.exitCode = r.status || 1; break; }
}
