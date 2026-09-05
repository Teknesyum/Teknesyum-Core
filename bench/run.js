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

function planOlustur(kapsam, seed, secim = {}) {
  const gorevler = kapsam === 'tam' ? GOREVLER : GOREVLER.slice(0, 2);
  const kollar = secim.kollar && secim.kollar.length ? secim.kollar : KOLLAR;
  const tekrar = secim.tekrar || TEKRAR;
  const tekrarBas = secim.tekrarBas || 1;
  for (const arm of kollar) if (!KOLLAR.includes(arm)) throw new Error('bilinmeyen kol: ' + arm);
  const liste = [];
  for (const taskId of gorevler) {
    for (const arm of kollar) {
      const seat = koltukOku(arm);
      for (let repeat = tekrarBas; repeat <= tekrar; repeat++) {
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

function mdSay(dizin) {
  if (!fs.existsSync(dizin)) return 0;
  let n = 0;
  for (const girdi of fs.readdirSync(dizin, { withFileTypes: true })) {
    if (girdi.isDirectory()) n += mdSay(path.join(dizin, girdi.name));
    else if (girdi.name.endsWith('.md')) n += 1;
  }
  return n;
}

function relaySay(calismaDizini, oturumDizini) {
  const altAjanDizini = path.join(oturumDizini, 'subagents');
  const altAjan = fs.existsSync(altAjanDizini)
    ? fs.readdirSync(altAjanDizini).filter((d) => /^agent-.*\.jsonl$/.test(d)).length
    : 0;
  return {
    contracts: mdSay(path.join(calismaDizini, '.claude', 'relay', 'contracts')),
    subagents: altAjan,
  };
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

// Dar başlangıç, ölçülmedi: bu makinede giriş yapılmış bir config dizini yok, o yüzden
// hangi dosyaların kimlik doğrulama için gerçekten gerekli olduğu bilinmiyor. Yalnız bu
// ikisi kopyalanır; listede olmayan her şey — bilinen ya da bilinmeyen — sessizce atlanır.
// Eksik çıkarsa ön kontrol zaten yakalar ve kullanıcıya söyler.
const IZIN_VERILEN_CONFIG_GIRDILERI = ['.credentials.json', '.claude.json'];

function configSablonundanKopyala(sablonDizini, hedefDizini) {
  for (const girdi of IZIN_VERILEN_CONFIG_GIRDILERI) {
    const kaynakYolu = path.join(sablonDizini, girdi);
    if (!fs.existsSync(kaynakYolu)) continue;
    fs.cpSync(kaynakYolu, path.join(hedefDizini, girdi), { recursive: true });
  }
}

const ONKONTROL_ISTEMI = 'ping';

function gercekOnKontrolCalistirici(argumanlar, secenekler) {
  const sonuc = spawnSync('claude', argumanlar, { ...secenekler, encoding: 'utf8', windowsHide: true });
  const kod = typeof sonuc.status === 'number' ? sonuc.status : 1;
  const cikti = (sonuc.stdout || '') + (sonuc.stderr || '');
  return { kod, cikti };
}

function onKontrolMesaji(kod, cikti) {
  const ilkSatir = cikti ? cikti.trim().split('\n')[0] : '';
  return [
    'Ön kontrol başarısız: kimlik doğrulama bu ortamda çalışmıyor (kod ' + kod + (ilkSatir ? ', ' + ilkSatir : '') + ').',
    'Kimlik doğrulama koşu başına temiz config dizininde bulunmuyor.',
    'Çözüm: ANTHROPIC_API_KEY ortam değişkenini ayarlayın, ya da bir kez `claude` ile giriş yapılmış bir config dizinini --configTemplate <dizin> ile verin.',
  ].join('\n');
}

function onKontrolYap(secenekler = {}) {
  const env = secenekler.env || process.env;
  const mkdtemp = secenekler.mkdtemp || ((onEk) => fs.mkdtempSync(path.join(os.tmpdir(), onEk)));
  const calistirici = secenekler.calistirici || gercekOnKontrolCalistirici;
  const kopyala = secenekler.kopyala || configSablonundanKopyala;
  const apiKeyVar = !!env.ANTHROPIC_API_KEY;
  const configDizini = mkdtemp('tkc-bench-onkontrol-');
  try {
    if (!apiKeyVar && secenekler.configTemplate) {
      kopyala(secenekler.configTemplate, configDizini);
    }
    const calismaEnv = { ...env, CLAUDE_CONFIG_DIR: configDizini };
    const argumanlar = ['-p', ONKONTROL_ISTEMI, '--model', 'sonnet', '--effort', 'low'];
    const { kod, cikti } = calistirici(argumanlar, { env: calismaEnv });
    const basarili = kod === 0;
    return { basarili, kod, cikti, apiKeyVar, mesaj: basarili ? null : onKontrolMesaji(kod, cikti) };
  } finally {
    silGeriDonusumsuz(configDizini);
  }
}

async function koşuYap(kosu, batchId, ccVersion, bagimlar = {}) {
  const git = bagimlar.git || gercekGit;
  const calistirici = bagimlar.calistirici || gercekCalistirici;
  const kabulCalistir = bagimlar.kabulCalistir || gercekKabulCalistir;
  const mkdtemp = bagimlar.mkdtemp || ((onEk) => fs.mkdtempSync(path.join(os.tmpdir(), onEk)));
  const disEnv = bagimlar.env || process.env;

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
    relay: null,
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
    if (!disEnv.ANTHROPIC_API_KEY && bagimlar.configTemplate) {
      (bagimlar.kopyala || configSablonundanKopyala)(bagimlar.configTemplate, configDizini);
    }
    if (!arm.startsWith('native-')) eklentiKur(configDizini, coreArm(arm));
    const env = { ...disEnv, CLAUDE_CONFIG_DIR: configDizini };
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
      satir.relay = relaySay(calismaDizini, oturumDizini);
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

async function calistir(kapsam, seed, secenekler = {}) {
  const plan = planOlustur(kapsam, seed, secenekler.secim);
  const batchId = 'b' + Date.now().toString(36) + '-' + seed;
  const ccVersion = secenekler.ccVersion !== undefined ? secenekler.ccVersion : ccVersionOku();
  const sonucYolu = secenekler.sonucYolu || path.join(KOK, 'bench', 'sonuc.jsonl');
  for (const kosu of plan) {
    const satir = await koşuYap(kosu, batchId, ccVersion, secenekler);
    fs.appendFileSync(sonucYolu, JSON.stringify(satir) + '\n');
  }
}

async function onKontrolluCalistir(kapsam, seed, secenekler = {}) {
  const onKontrolFn = secenekler.onKontrolYap || onKontrolYap;
  const onKontrol = onKontrolFn({
    configTemplate: secenekler.configTemplate,
    env: secenekler.env,
    calistirici: secenekler.onKontrolCalistirici,
    mkdtemp: secenekler.onKontrolMkdtemp,
    kopyala: secenekler.kopyala,
  });
  if (!onKontrol.basarili) {
    return { basladi: false, mesaj: onKontrol.mesaj, onKontrol };
  }
  await calistir(kapsam, seed, secenekler);
  return { basladi: true, onKontrol };
}

function main() {
  const configTemplate = argAl('--configTemplate', undefined);
  if (process.argv.includes('--onkontrol')) {
    const sonuc = onKontrolYap({ configTemplate });
    if (sonuc.mesaj) console.error(sonuc.mesaj);
    else console.log('Ön kontrol başarılı (kod 0).');
    process.exit(sonuc.basarili ? 0 : 1);
  }
  const kapsam = argAl('--scope', 'pilot');
  if (kapsam !== 'pilot' && kapsam !== 'tam') {
    console.error('bilinmeyen --scope: ' + kapsam);
    process.exit(1);
  }
  const seed = Number(argAl('--seed', '1'));
  const kollarArg = argAl('--arms', '');
  const secim = {
    kollar: kollarArg ? kollarArg.split(',').map((k) => k.trim()).filter(Boolean) : null,
    tekrar: Number(argAl('--repeat', '0')) || null,
    tekrarBas: Number(argAl('--repeatFrom', '0')) || null,
  };
  const sonucYolu = argAl('--sonuc', null);
  const plan = planOlustur(kapsam, seed, secim);
  if (process.argv.includes('--plan')) {
    for (const satir of plan) {
      console.log(JSON.stringify({ taskId: satir.taskId, arm: satir.arm, seat: satir.seat, repeat: satir.repeat }));
    }
    process.exit(0);
  }
  onKontrolluCalistir(kapsam, seed, { configTemplate, secim, sonucYolu: sonucYolu ? path.resolve(sonucYolu) : undefined }).then((sonuc) => {
    if (!sonuc.basladi) {
      console.error(sonuc.mesaj);
      process.exit(1);
    }
    process.exit(0);
  }).catch((hata) => {
    console.error(hata.message);
    process.exit(1);
  });
}

if (require.main === module) main();

module.exports = {
  planOlustur, koltukOku, coreArm, encodeCwd, gorevOku, eklentiKur, relaySay,
  sonSessionId, koşuYap, ccVersionOku, KOLLAR, GOREVLER,
  calistir, onKontrolluCalistir, onKontrolYap, configSablonundanKopyala,
  onKontrolMesaji, IZIN_VERILEN_CONFIG_GIRDILERI,
};
