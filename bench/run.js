const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const maliyet = require('./maliyet');

const KOK = path.resolve(__dirname, '..');
const GOREVLER = ['01-slugify', '02-click', '03-wrap-ansi', '04-gray-matter', '05-requests'];
const KOLLAR = ['eco', 'native-eco', 'normal', 'native-normal', 'premium', 'native-premium'];
const TEKRAR = 3;
const TAVAN_MS = 30 * 60 * 1000;

function argAl(bayrak, varsayilan) {
  const i = process.argv.indexOf(bayrak);
  if (i === -1 || i === process.argv.length - 1) return varsayilan;
  return process.argv[i + 1];
}

function coreArm(arm) {
  return arm.startsWith('native-') ? arm.slice('native-'.length) : arm;
}

function koltukOku(arm) {
  const tiers = JSON.parse(fs.readFileSync(path.join(KOK, 'core', 'tiers.json'), 'utf8'));
  const koltuk = tiers.cells.builder[coreArm(arm)];
  if (!koltuk) throw new Error('koltuk bulunamadi: ' + arm);
  return koltuk;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function karistir(dizi, seed) {
  const rastgele = mulberry32(seed);
  const kopya = dizi.slice();
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(rastgele() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}

function planOlustur(kapsam, seed) {
  const gorevler = kapsam === 'tam' ? GOREVLER : GOREVLER.slice(0, 2);
  const liste = [];
  for (const taskId of gorevler) {
    for (const arm of KOLLAR) {
      const seat = koltukOku(arm);
      for (let repeat = 1; repeat <= TEKRAR; repeat++) {
        liste.push({ taskId, arm, seat, repeat });
      }
    }
  }
  return karistir(liste, seed);
}

function gorevOku(taskId, gorevKok) {
  const kok = gorevKok || path.join(KOK, 'bench', 'gorevler');
  const gorevYolu = path.join(kok, taskId + '.md');
  const metin = fs.readFileSync(gorevYolu, 'utf8');
  const eslesme = metin.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!eslesme) throw new Error('gorev frontmatter eksik: ' + gorevYolu + ' -> "---" ile baslayan repo/sha bloklu bir onbaslik bekleniyor');
  const on = {};
  for (const satir of eslesme[1].split('\n')) {
    const kv = satir.match(/^(\w+):\s*(.+)$/);
    if (kv) on[kv[1]] = kv[2].trim();
  }
  if (!on.repo || !on.sha) throw new Error('gorev frontmatter repo/sha eksik: ' + gorevYolu);
  return { repo: on.repo, sha: on.sha, prompt: eslesme[2].trim() };
}

function encodeCwd(cwd) {
  return cwd.replace(/[^a-zA-Z0-9]/g, '-');
}

function agacOldur(pid) {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(pid), '/T', '/F']);
  } else {
    try { process.kill(-pid, 'SIGKILL'); } catch { try { process.kill(pid, 'SIGKILL'); } catch {} }
  }
}

function silGeriDonusumsuz(dizin) {
  try { fs.rmSync(dizin, { recursive: true, force: true }); } catch {}
}

function eklentiKur(configDizini, profil) {
  const surum = JSON.parse(fs.readFileSync(path.join(KOK, 'core', '.claude-plugin', 'plugin.json'), 'utf8')).version;
  const kaynak = path.join(os.homedir(), '.claude', 'plugins', 'cache', 'teknesyum', 'teknesyum-core', surum);
  const hedef = path.join(configDizini, 'plugins', 'cache', 'teknesyum', 'teknesyum-core', surum);
  fs.mkdirSync(path.dirname(hedef), { recursive: true });
  fs.cpSync(kaynak, hedef, { recursive: true });
  fs.writeFileSync(
    path.join(configDizini, 'settings.json'),
    JSON.stringify({ enabledPlugins: { 'teknesyum-core@teknesyum': true } }, null, 2)
  );
  const teknesyumDizini = path.join(configDizini, 'teknesyum');
  fs.mkdirSync(teknesyumDizini, { recursive: true });
  fs.writeFileSync(path.join(teknesyumDizini, 'config.json'), JSON.stringify({
    lang: 'en',
    contractLang: 'en',
    profile: profil,
    notify: false,
    research: false,
    projectsRoot: null,
    privateRepo: null,
    installedAt: new Date().toISOString(),
    pluginDir: hedef.replace(/\\/g, '/'),
    coreRepo: null,
  }, null, 2));
}

function sonSessionId(projeDizini) {
  if (!fs.existsSync(projeDizini)) return null;
  const dosyalar = fs.readdirSync(projeDizini)
    .filter((d) => d.endsWith('.jsonl'))
    .map((d) => ({ ad: d.slice(0, -'.jsonl'.length), mtime: fs.statSync(path.join(projeDizini, d)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return dosyalar.length ? dosyalar[0].ad : null;
}

function ccVersionOku() {
  const r = spawnSync('claude', ['--version'], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0 || !r.stdout) return null;
  const eslesme = r.stdout.match(/(\d+\.\d+\.\d+)/);
  return eslesme ? eslesme[1] : r.stdout.trim().split('\n')[0];
}

const gercekGit = {
  klonla(repo, hedef) {
    return spawnSync('git', ['clone', '--quiet', repo, hedef], { windowsHide: true });
  },
  checkoutYap(dizin, sha) {
    return spawnSync('git', ['checkout', '--quiet', sha], { cwd: dizin, windowsHide: true });
  },
};

function gercekCalistirici(komut, argumanlar, secenekler) {
  return new Promise((resolve) => {
    const cocuk = spawn(komut, argumanlar, { ...secenekler, detached: process.platform !== 'win32' });
    let zamanAsimi = false;
    const zamanlayici = setTimeout(() => {
      zamanAsimi = true;
      agacOldur(cocuk.pid);
    }, TAVAN_MS);
    cocuk.on('close', (kod) => {
      clearTimeout(zamanlayici);
      resolve({ kod, zamanAsimi });
    });
    cocuk.on('error', () => {
      clearTimeout(zamanlayici);
      resolve({ kod: 1, zamanAsimi: false });
    });
  });
}

function gercekKabulCalistir(kabulYolu, calismaDizini) {
  return spawnSync('bash', [kabulYolu, calismaDizini], { windowsHide: true });
}

async function koşuYap(kosu, batchId, ccVersion, bagimlar = {}) {
  const git = bagimlar.git || gercekGit;
  const calistirici = bagimlar.calistirici || gercekCalistirici;
  const kabulCalistir = bagimlar.kabulCalistir || gercekKabulCalistir;
  const mkdtemp = bagimlar.mkdtemp || ((onEk) => fs.mkdtempSync(path.join(os.tmpdir(), onEk)));

  const { taskId, arm, seat, repeat } = kosu;
  const [model, effort] = seat.split('/');
  const baslangic = Date.now();
  const configDizini = mkdtemp('tkc-bench-config-');
  const calismaDizini = mkdtemp('tkc-bench-work-');
  const satir = {
    batchId, taskId, arm, seat, repeat,
    modelId: null, ccVersion,
    repoPin: null,
    startedAt: new Date(baslangic).toISOString(),
    wallMs: null, pass: false, dropped: false, dropReason: null,
    tokens: null, usd: null, usdSource: null,
  };
  try {
    const gorev = gorevOku(taskId, bagimlar.gorevKok);
    satir.repoPin = gorev.repo + '@' + gorev.sha;
    const klon = git.klonla(gorev.repo, calismaDizini);
    const checkout = klon.status === 0 ? git.checkoutYap(calismaDizini, gorev.sha) : null;
    if (klon.status !== 0 || !checkout || checkout.status !== 0) {
      satir.dropped = true;
      satir.dropReason = 'setup';
      satir.wallMs = Date.now() - baslangic;
      return satir;
    }
    if (!arm.startsWith('native-')) eklentiKur(configDizini, coreArm(arm));
    const env = { ...process.env, CLAUDE_CONFIG_DIR: configDizini };
    const argumanlar = ['-p', gorev.prompt, '--model', model, '--effort', effort];
    const { zamanAsimi } = await calistirici('claude', argumanlar, { cwd: calismaDizini, env, windowsHide: true });
    satir.wallMs = Date.now() - baslangic;

    const projeDizini = path.join(configDizini, 'projects', encodeCwd(calismaDizini));
    const sessionId = sonSessionId(projeDizini);
    if (sessionId) {
      const oturumDizini = path.join(projeDizini, sessionId);
      satir.modelId = maliyet.anaModel(oturumDizini);
      const sepet = maliyet.tokenlar(oturumDizini);
      const tarife = maliyet.tarifeOku(path.join(KOK, 'docs', 'tarife.json'));
      const { toplam, usdSource } = maliyet.usdHesapla(sepet, tarife);
      satir.tokens = sepet;
      satir.usd = toplam;
      satir.usdSource = usdSource;
    }

    if (zamanAsimi) {
      satir.dropped = true;
      satir.dropReason = 'ceiling';
    } else if (!sessionId || !satir.modelId) {
      satir.dropped = true;
      satir.dropReason = 'modelId-okunamadi';
    } else {
      const kabulYolu = path.join(KOK, 'bench', 'gorevler', taskId + '.kabul.sh');
      const kabul = kabulCalistir(kabulYolu, calismaDizini);
      satir.pass = kabul.status === 0;
    }
  } finally {
    silGeriDonusumsuz(configDizini);
    silGeriDonusumsuz(calismaDizini);
  }
  return satir;
}

async function calistir(kapsam, seed) {
  const plan = planOlustur(kapsam, seed);
  const batchId = 'b' + Date.now().toString(36) + '-' + seed;
  const ccVersion = ccVersionOku();
  const sonucYolu = path.join(KOK, 'bench', 'sonuc.jsonl');
  for (const kosu of plan) {
    const satir = await koşuYap(kosu, batchId, ccVersion);
    fs.appendFileSync(sonucYolu, JSON.stringify(satir) + '\n');
  }
}

function main() {
  const kapsam = argAl('--scope', 'pilot');
  if (kapsam !== 'pilot' && kapsam !== 'tam') {
    console.error('bilinmeyen --scope: ' + kapsam);
    process.exit(1);
  }
  const seed = Number(argAl('--seed', '1'));
  const plan = planOlustur(kapsam, seed);
  if (process.argv.includes('--plan')) {
    for (const satir of plan) {
      console.log(JSON.stringify({ taskId: satir.taskId, arm: satir.arm, seat: satir.seat, repeat: satir.repeat }));
    }
    process.exit(0);
  }
  calistir(kapsam, seed).then(() => process.exit(0)).catch((hata) => {
    console.error(hata.message);
    process.exit(1);
  });
}

if (require.main === module) main();

module.exports = {
  planOlustur, koltukOku, coreArm, encodeCwd, gorevOku, eklentiKur,
  sonSessionId, koşuYap, ccVersionOku, KOLLAR, GOREVLER,
};
