const fs = require('fs');
const os = require('os');
const { spawnSync } = require('child_process');
const path = require('path');
const source = path.resolve(__dirname, '..');
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-suite-'));
const repo = path.join(sandbox, 'repo');
fs.mkdirSync(repo);
const excluded = new Set(['.git', '.claude', 'node_modules', 'Teknesyum-Base']);
for (const item of fs.readdirSync(source))
  if (!excluded.has(item)) fs.cpSync(path.join(source, item), path.join(repo, item), { recursive: true });
const config = path.join(sandbox, 'config');
fs.mkdirSync(config);
const env = { ...process.env, CLAUDE_CONFIG_DIR: config, TEKNESYUM_BEEP_SESSIZ: '1', TEKNESYUM_GATE_OPEN: '' };
delete env.CLAUDE_CODE_SESSION_ID;
delete env.CLAUDE_CODE_HOST_SESSION_ID;
const summaries = [];
for (const file of ['all.js', 'audit-regressions.js', 'closure-integrity.js', 'verify-timeout.js']) {
  const r = spawnSync(process.execPath, [path.join(repo, 'test', file)], {
    cwd: repo, env, stdio: 'inherit', windowsHide: true,
  });
  summaries.push({ file, exitCode: r.status, error: r.error ? r.error.message : null });
}
console.log(JSON.stringify({ suiteSandbox: sandbox, summaries }));
process.exitCode = summaries.some((r) => r.exitCode !== 0 || r.error) ? 1 : 0;
