const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const KOK = path.resolve(__dirname, '..');
const TEKRAR = Number(process.env.OKUMA_TEKRAR || 2);
const MODELLER = (process.env.OKUMA_MODEL || 'haiku,sonnet,opus').split(',');
const TAVAN = process.env.OKUMA_TAVAN || '1.5';
const CIKTI = path.join(__dirname, 'okuma.jsonl');
const HAM = path.join(__dirname, 'okuma-ham');

function fonksiyonlar(d) {
  const satirlar = fs.readFileSync(path.join(d, 'test', 'all.js'), 'utf8').split(/\r?\n/);
  const out = [];
  satirlar.forEach((l, i) => {
    const m = /^(?:async )?function (\w+)\(/.exec(l);
    if (m) out.push({ ad: m[1], bas: i + 1, govde: [] });
    if (out.length) out[out.length - 1].govde.push(l);
  });
  return out.map((f) => ({ ...f, govde: f.govde.join('\n') }));
}

function kancalar(d) {
  return fs.readdirSync(path.join(d, 'core', 'hooks')).filter((f) => f.endsWith('.js')).sort();
}

function olaylar(d) {
  const h = JSON.parse(fs.readFileSync(path.join(d, 'core', 'hooks', 'hooks.json'), 'utf8')).hooks;
  const out = {};
  for (const [ev, arr] of Object.entries(h)) for (const e of arr) for (const x of e.hooks) {
    const m = /hooks\/(\w+\.js)/.exec(x.command);
    if (m) (out[m[1]] = out[m[1]] || []).includes(ev) || out[m[1]].push(ev);
  }
  return out;
}

function f1(dogru, verilen) {
  const a = new Set(dogru);
  const b = new Set((verilen || []).map(String));
  if (!a.size && !b.size) return 1;
  const ortak = [...b].filter((x) => a.has(x)).length;
  if (!ortak) return 0;
  const p = ortak / b.size;
  const r = ortak / a.size;
  return (2 * p * r) / (p + r);
}

const SORULAR = {
  kolay: {
    prompt: 'test/all.js içinde testKapanis fonksiyonu kaçıncı satırda başlıyor ve gövdesinde kaç tane ok( çağrısı var? Cevabı yalnız şu biçimde cevap.json dosyasına yaz: {"satir": <sayı>, "ok": <sayı>}',
    puan: (d, c) => {
      const f = fonksiyonlar(d).find((x) => x.ad === 'testKapanis');
      const ok = (f.govde.match(/\bok\(/g) || []).length;
      return ((c.satir === f.bas ? 1 : 0) + (c.ok === ok ? 1 : 0)) / 2;
    },
  },
  orta: {
    prompt: 'test/all.js dosyasında gövdesinde "dur.js" metni geçen bütün üst düzey fonksiyonları bul. Eksiksiz olsun. Cevabı yalnız şu biçimde cevap.json dosyasına yaz: {"fonksiyonlar": ["ad1", "ad2", ...]}',
    puan: (d, c) => f1(fonksiyonlar(d).filter((f) => f.govde.includes('dur.js')).map((f) => f.ad), c.fonksiyonlar),
  },
  zor: {
    prompt: 'core/hooks altındaki her .js dosyası için iki şey bul: (1) core/hooks/hooks.json içinde doğrudan hangi olay(lar)a bağlı (bağlı değilse boş liste), (2) test/all.js içinde gövdesinde o dosyanın adı (ör. "dur.js") geçen test ile başlayan fonksiyonlar. Eksiksiz olsun. Cevabı yalnız şu biçimde cevap.json dosyasına yaz: {"dosya.js": {"olaylar": ["Stop"], "testler": ["testX"]}, ...}',
    puan: (d, c) => {
      const ol = olaylar(d);
      const fs_ = fonksiyonlar(d).filter((f) => f.ad.startsWith('test'));
      const k = kancalar(d);
      let top = 0;
      for (const dosya of k) {
        const v = c[dosya];
        if (!v) continue;
        const olayPuan = f1(ol[dosya] || [], v.olaylar);
        const testPuan = f1(fs_.filter((f) => f.govde.includes(dosya)).map((f) => f.ad), v.testler);
        top += (olayPuan + testPuan) / 2;
      }
      return top / k.length;
    },
  },
  ozet: {
    prompt: 'core/hooks/dur.js Stop olayında durmayı engelleyen kontrolleri hangi sırayla topluyor? Her kontrolü çağrıldığı adla sırayla listele (başka dosyadan gelen varsa modül.ad biçiminde, ör. defter.short). Ayrıca hiçbir kontrolün çalışmadığı erken çıkış koşulunu j üzerindeki alan adıyla yaz. Cevabı yalnız şu biçimde cevap.json dosyasına yaz: {"sira": ["ad1", ...], "erkenCikis": "<alan adı>"}',
    puan: (d, c) => {
      const kaynak = fs.readFileSync(path.join(d, 'core', 'hooks', 'dur.js'), 'utf8');
      const satir = /const why = \[([^\]]+)\]/.exec(kaynak)[1];
      const dogru = satir.split(',').map((x) => x.trim().replace(/\(j\)$/, '').replace(/^require\('\.\/(\w+)\.js'\)\./, '$1.'));
      const ver = (c.sira || []).map((x) => String(x).replace(/\(j?\)$/, '').trim());
      const sirali = dogru.length === ver.length && dogru.every((x, i) => x === ver[i]) ? 1 : 0;
      return (sirali + f1(dogru, ver) + (/stop_hook_active/.test(String(c.erkenCikis || '')) ? 1 : 0)) / 3;
    },
  },
};

function kopya() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-okuma-'));
  for (const g of ['core', 'test']) fs.cpSync(path.join(KOK, g), path.join(d, g), { recursive: true });
  return d;
}

function config() {
  const c = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-okuma-cfg-'));
  fs.copyFileSync(path.join(os.homedir(), '.claude', '.credentials.json'), path.join(c, '.credentials.json'));
  return c;
}

function kos(model, soru, tekrar) {
  return new Promise((bitir) => {
    const d = kopya();
    const env = { ...process.env, CLAUDE_CONFIG_DIR: config() };
    delete env.CLAUDECODE;
    const args = ['-p', SORULAR[soru].prompt, '--model', model, '--permission-mode', 'bypassPermissions', '--output-format', 'json', '--max-budget-usd', TAVAN];
    const bas = Date.now();
    const p = spawn('claude', args, { cwd: d, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (b) => (out += b));
    p.stderr.on('data', (b) => (out += b));
    p.on('close', () => {
      fs.writeFileSync(path.join(HAM, `${model}-${soru}-${tekrar}.txt`), out);
      let j = {};
      for (const l of out.split(/\r?\n/).reverse()) { try { const x = JSON.parse(l); if (x && x.type === 'result') { j = x; break; } } catch {} }
      let cevap = null;
      let puan = 0;
      try { cevap = JSON.parse(fs.readFileSync(path.join(d, 'cevap.json'), 'utf8')); puan = SORULAR[soru].puan(d, cevap); } catch {}
      const satir = {
        model, soru, tekrar, ms: Date.now() - bas, puan: Math.round(puan * 100) / 100,
        usd: j.total_cost_usd || 0, tur: j.num_turns || 0, modeller: Object.keys(j.modelUsage || {}),
        hata: j.is_error ? String(j.subtype || '') : null, cevap,
      };
      fs.appendFileSync(CIKTI, JSON.stringify(satir) + '\n');
      console.log(JSON.stringify({ ...satir, cevap: undefined }));
      bitir(satir);
    });
  });
}

function anahtarTaze() {
  const o = (JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', '.credentials.json'), 'utf8')).claudeAiOauth) || {};
  return (o.expiresAt || 0) - Date.now() > 60 * 60 * 1000;
}

async function main() {
  if (!anahtarTaze()) {
    console.error('Giriş anahtarının süresi bir saatten az; kopyalar yenilerken ana anahtarı düşürür. Önce claude -p ile tek bir istek at, sonra yeniden başlat.');
    process.exit(1);
  }
  fs.mkdirSync(HAM, { recursive: true });
  const isler = [];
  for (let t = 1; t <= TEKRAR; t++) for (const s of Object.keys(SORULAR)) for (const m of MODELLER) isler.push([m, s, t]);
  const PAR = 4;
  for (let i = 0; i < isler.length; i += PAR) await Promise.all(isler.slice(i, i + PAR).map((x) => kos(...x)));
}

if (require.main === module) main();
module.exports = { SORULAR, fonksiyonlar, olaylar, kancalar, f1 };
