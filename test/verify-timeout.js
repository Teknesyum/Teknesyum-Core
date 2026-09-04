const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-timeout-'));
const contract = require.resolve('../core/scripts/contract.js');
fs.writeFileSync(path.join(root, 'child.js'), 'setTimeout(()=>{}, 10000);');
fs.writeFileSync(path.join(root, 'parent.js'), `const c=require('child_process').spawn(process.execPath,['child.js'],{stdio:'ignore'});require('fs').writeFileSync('pid',String(c.pid));setTimeout(()=>{},10000);`);
const r = spawnSync(process.execPath, ['-e', 'console.log(JSON.stringify(require(process.argv[1]).runVerify(process.argv[2],["node parent.js"])))', contract, root], {
  encoding: 'utf8', windowsHide: true, timeout: 20000, env: { ...process.env, TEKNESYUM_VERIFY_TIMEOUT_MS: '600' },
});
let alive = false;
const pid = Number(fs.readFileSync(path.join(root, 'pid'), 'utf8'));
try { process.kill(pid, 0); alive = true; } catch {}
if (alive) { try { process.kill(pid, 'SIGKILL'); } catch {} }
const results = JSON.parse(r.stdout);
const ok = results[0].timedOut && !results[0].ok && results[0].swept && !alive;
const legacy = spawnSync('node parent.js', { cwd: root, shell: true, windowsHide: true, timeout: 600, encoding: 'utf8', detached: process.platform !== 'win32' });
if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(legacy.pid), '/T', '/F'], { windowsHide: true, timeout: 10000 });
else { try { process.kill(-legacy.pid, 'SIGKILL'); } catch {} }
const legacyPid = Number(fs.readFileSync(path.join(root, 'pid'), 'utf8'));
let legacyAlive = false;
try { process.kill(legacyPid, 0); legacyAlive = true; } catch {}
if (legacyAlive) { try { process.kill(legacyPid, 'SIGKILL'); } catch {} }
console.log(JSON.stringify({ passed: ok, childAliveAfterTimeout: alive, legacyChildAliveAfterCleanup: legacyAlive, result: results[0], fixture: root }, null, 2));
process.exitCode = ok ? 0 : 1;
