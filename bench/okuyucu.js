const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { SORULAR, f1 } = require('./okuma.js');

const KOK = path.resolve(__dirname, '..');
const TAVAN = process.env.OKUYUCU_TAVAN || '1.2';
const CIKTI = path.join(__dirname, process.env.OKUYUCU_CIKTI || 'okuyucu.jsonl');
const HAM = path.join(__dirname, process.env.OKUYUCU_HAM || 'okuyucu-ham');
const KOLLAR = process.env.OKUYUCU_KOL ? JSON.parse(process.env.OKUYUCU_KOL) : { opus: 2, sinirli: 3, sinirsiz: 1 };

function govdeler(d, dosya) {
  const out = [];
  fs.readFileSync(path.join(d, dosya), 'utf8').split(/\r?\n/).forEach((l, i) => {
    const m = /^(?:async )?function (\w+)\(/.exec(l);
    if (m) out.push({ ad: m[1], govde: [] });
    if (out.length) out[out.length - 1].govde.push(l);
  });
  return out.map((f) => ({ ad: f.ad, govde: f.govde.join('\n') }));
}

const GOREVLER = {
  buyuk: SORULAR.orta,
  orta: {
    prompt: 'core/scripts/kutuphane.js dosyasında gövdesinde diske yazan bir çağrı (writeFileSync, mkdirSync, rmSync ya da renameSync) geçen bütün üst düzey fonksiyonları bul. Eksiksiz olsun. Cevabı yalnız şu biçimde cevap.json dosyasına yaz: {"fonksiyonlar": ["ad1", "ad2", ...]}',
    puan: (d, c) => f1(govdeler(d, 'core/scripts/kutuphane.js').filter((f) => /writeFileSync|mkdirSync|rmSync|renameSync/.test(f.govde)).map((f) => f.ad), c.fonksiyonlar),
  },
};

const SINIRLI = 'Sana verilen soruyu depoyu okuyarak cevapla. Kurallar: dosyayı en fazla bir kez Read ile oku, offset/limit kullanma; daraltmayı yalnız Grep ile yap; toplam en fazla 3 araç çağrısı. Cevabın en fazla 30 satır: adlar, satır numaraları, sayılar. Bulamadıysan uydurma, "bulamadım" de.';
const SINIRSIZ = 'Sana verilen soruyu depoyu okuyarak cevapla. Eksiksiz ve doğru ol.';
const NOT = 'Soru, özet veya bulma türü bir işte 350 satırdan uzun bir dosyayı okuman gerekiyorsa o okumayı kendin yapma: okuyucu ajanına (Agent aracı, subagent_type: okuyucu) ver, dönen cevapla işi bitir.';

function ajan(prompt) {
  return JSON.stringify({ okuyucu: { description: 'Uzun dosyaları okuyup soruyu cevaplar.', prompt, model: process.env.OKUYUCU_MODEL || 'haiku', tools: ['Read', 'Grep', 'Glob'] } });
}

function kopya() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-okuyucu-'));
  for (const g of ['core', 'test']) fs.cpSync(path.join(KOK, g), path.join(d, g), { recursive: true });
  return d;
}

function config() {
  const c = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-okuyucu-cfg-'));
  fs.copyFileSync(path.join(os.homedir(), '.claude', '.credentials.json'), path.join(c, '.credentials.json'));
  return c;
}

function kos(kol, gorev, tekrar) {
  return new Promise((bitir) => {
    const d = kopya();
    const env = { ...process.env, CLAUDE_CONFIG_DIR: config() };
    delete env.CLAUDECODE;
    const args = ['-p', GOREVLER[gorev].prompt, '--model', 'opus', '--permission-mode', 'bypassPermissions', '--output-format', 'stream-json', '--verbose', '--max-budget-usd', TAVAN];
    if (kol !== 'opus') args.push('--agents', ajan(kol === 'sinirli' ? SINIRLI : SINIRSIZ), '--append-system-prompt', NOT);
    const bas = Date.now();
    const p = spawn(process.env.BENCH_CLAUDE || 'claude', args, { cwd: d, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (b) => (out += b));
    p.stderr.on('data', (b) => (out += b));
    p.on('close', () => {
      fs.writeFileSync(path.join(HAM, `${kol}-${gorev}-${tekrar}.txt`), out);
      const olaylar = out.split(/\r?\n/).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      const son = olaylar.filter((x) => x.type === 'result').pop() || {};
      const araclar = (ana) => olaylar.filter((x) => x.type === 'assistant' && (ana ? !x.parent_tool_use_id : x.parent_tool_use_id)).flatMap((x) => (x.message && x.message.content) || []).filter((c) => c.type === 'tool_use').map((c) => c.name);
      let cevap = null;
      let puan = 0;
      try { cevap = JSON.parse(fs.readFileSync(path.join(d, 'cevap.json'), 'utf8')); puan = GOREVLER[gorev].puan(d, cevap); } catch {}
      const satir = {
        kol, gorev, tekrar, ms: Date.now() - bas, puan: Math.round(puan * 100) / 100, usd: son.total_cost_usd || 0,
        modeller: Object.fromEntries(Object.entries(son.modelUsage || {}).map(([k, v]) => [k, Math.round((v.costUSD || 0) * 1000) / 1000])),
        opusArac: araclar(true), okuyucuArac: araclar(false).length, hata: son.is_error ? String(son.subtype || '') : null, cevap,
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
    console.error('Giriş anahtarının süresi bir saatten az; önce claude auth login, sonra yeniden başlat.');
    process.exit(1);
  }
  fs.mkdirSync(HAM, { recursive: true });
  const isler = [];
  for (const [kol, n] of Object.entries(KOLLAR)) for (let t = 1; t <= n; t++) for (const g of Object.keys(GOREVLER)) isler.push([kol, g, t]);
  const PAR = 4;
  for (let i = 0; i < isler.length; i += PAR) await Promise.all(isler.slice(i, i + PAR).map((x) => kos(...x)));
}

if (require.main === module) main();
