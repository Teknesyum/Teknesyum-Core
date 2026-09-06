const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');
const { kur } = require('./varyant');

const KOK = path.resolve(__dirname, '..');
const RUN = path.join(__dirname, 'run.js');
const SONUC = path.join(__dirname, 'cikarma.jsonl');
const sessiz = kur('c1-sessiz').hedef;
const KOSULAR = [
  { ad: 'k0siz-cue', env: { BENCH_K0: '' }, tasks: '07-slugify-uc-parca', repeat: 3 },
  { ad: 'k0siz-sessiz', env: { BENCH_K0: '', BENCH_EKLENTI: sessiz }, tasks: '07-slugify-uc-parca', repeat: 3 },
  { ad: 'c1-sessiz', env: { BENCH_EKLENTI: sessiz }, tasks: '07-slugify-uc-parca', repeat: 1 },
  { ad: 'c2-kucuk', env: { BENCH_K0: path.join(__dirname, 'k0', 'kucuksuz.md') }, tasks: '06-slugify-cli', repeat: 3 },
];

for (const k of KOSULAR) {
  console.log('== ' + k.ad + ' ' + k.tasks + ' x' + k.repeat);
  const r = spawnSync(process.execPath, [RUN, '--scope', 'tam', '--tasks', k.tasks, '--arms', 'core', '--repeat', String(k.repeat), '--sonuc', SONUC, '--configTemplate', process.env.BENCH_CONFIG || path.join(os.homedir(), '.claude')], {
    cwd: KOK, stdio: 'inherit', windowsHide: true, env: { ...process.env, BENCH_VARYANT: k.ad, ...k.env },
  });
  console.log('== ' + k.ad + ' bitti, kod ' + r.status);
}
