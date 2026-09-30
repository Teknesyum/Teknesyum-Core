const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { SORULAR } = require('./okuma.js');

const KOK = path.resolve(__dirname, '..');
const TEKRAR = Number(process.env.ARAYA_TEKRAR || 2);
const KOLLAR = (process.env.ARAYA_KOL || 'kendi,haiku,denetim').split(',');
const TAVAN = process.env.ARAYA_TAVAN || '5';
const ARA = Number(process.env.ARAYA_ARA || 20) * 1000;
const CIKTI = path.join(__dirname, 'araya.jsonl');
const HAM = path.join(__dirname, 'araya-ham');

const ANA = 'core/hooks/dur.js içindeki english() fonksiyonu için test/all.js dosyasına testEnglish adında yeni bir test fonksiyonu yaz: en az üç ok( çağrısıyla uzun İngilizce metin, uzun Türkçe metin ve 25 kelimeden kısa metin durumlarını denesin. Fonksiyonu main() içindeki suites listesine ekle. Sonra node test/all.js çalıştır ve hepsi geçene kadar düzelt.';

const AJAN = {
  okuyucu: {
    description: 'Kullanıcının araya sorduğu kod sorularını dosyaları okuyarak cevaplar ve cevabı istenen dosyaya yazar.',
    prompt: 'Sana verilen soruyu depodaki dosyaları okuyarak cevapla. Cevabı sorunun istediği biçimde, istenen dosyaya yaz. Eksiksiz ve doğru ol.',
    model: 'haiku',
    tools: ['Read', 'Grep', 'Glob', 'Bash', 'Write'],
  },
};

const EK = {
  kendi: null,
  haiku: 'Kullanıcı sen çalışırken araya soru sorarsa soruyu olduğu gibi okuyucu ajanına (Agent aracı, subagent_type: okuyucu) ver; cevap dosyasını ajan yazar. Ajanın cevabını kendin denetleme ya da düzeltme, ana işine dön.',
  denetim: 'Kullanıcı sen çalışırken araya soru sorarsa soruyu okuyucu ajanına (Agent aracı, subagent_type: okuyucu) ver; cevap dosyasını ajan yazar. Ajan dönünce cevabı kendin hızlıca denetle, yanlışsa düzelt, sonra ana işine dön.',
};

function soru(ad) {
  return SORULAR[ad].prompt.replace('cevap.json', `cevap-${ad}.json`);
}

function kopya() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-araya-'));
  for (const g of ['core', 'test', 'package.json']) fs.cpSync(path.join(KOK, g), path.join(d, g), { recursive: true });
  return d;
}

function config() {
  const c = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-araya-cfg-'));
  fs.copyFileSync(path.join(os.homedir(), '.claude', '.credentials.json'), path.join(c, '.credentials.json'));
  return c;
}

function mesaj(text) {
  return JSON.stringify({ type: 'user', message: { role: 'user', content: text } }) + '\n';
}

function anaPuan(d) {
  const src = fs.readFileSync(path.join(d, 'test', 'all.js'), 'utf8');
  const fn = /function testEnglish\(\)[\s\S]*?\n}\n/.exec(src);
  const bagli = /\[\s*'[^']*',\s*testEnglish\s*\]/.test(src);
  const r = spawnSync(process.execPath, [path.join(d, 'test', 'all.js')], { cwd: d, encoding: 'utf8', windowsHide: true, timeout: 600000, env: { ...process.env, TEKNESYUM_BEEP_SESSIZ: '1', TEKNESYUM_PROCS_OFF: '1' } });
  const m = /(\d+) passed, (\d+) failed/.exec(r.stdout || '');
  const gecti = !!m && m[2] === '0' && Number(m[1]) > 631;
  const ok = fn ? (fn[0].match(/\bok\(/g) || []).length : 0;
  return { puan: ((fn ? 1 : 0) + (bagli ? 1 : 0) + (gecti ? 1 : 0) + (ok >= 3 ? 1 : 0)) / 4, test: m ? m[0] : null };
}

function kos(kol, tekrar) {
  return new Promise((bitir) => {
    const d = kopya();
    const env = { ...process.env, CLAUDE_CONFIG_DIR: config() };
    delete env.CLAUDECODE;
    const args = ['-p', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--model', 'opus', '--permission-mode', 'bypassPermissions', '--max-budget-usd', TAVAN];
    if (kol !== 'kendi') args.push('--agents', JSON.stringify(AJAN), '--append-system-prompt', EK[kol]);
    const bas = Date.now();
    const p = spawn('claude', args, { cwd: d, env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let sonCikti = Date.now();
    p.stdout.on('data', (b) => { out += b; sonCikti = Date.now(); });
    p.stderr.on('data', (b) => (out += b));
    p.stdin.write(mesaj(ANA));
    const adlar = Object.keys(SORULAR);
    const gonderim = {};
    const varis = {};
    adlar.forEach((ad, i) => setTimeout(() => { gonderim[ad] = Date.now(); try { p.stdin.write(mesaj(soru(ad))); } catch {} }, ARA * (i + 1)));
    const bekci = setInterval(() => {
      for (const ad of adlar) if (!varis[ad] && fs.existsSync(path.join(d, `cevap-${ad}.json`))) varis[ad] = Date.now();
      const satirlar = out.trim().split(/\r?\n/);
      const bosta = satirlar.slice(-3).some((l) => /"type":"result"/.test(l)) && Date.now() - sonCikti > 20000;
      const tamam = Object.keys(gonderim).length === adlar.length && (bosta || Date.now() - bas > 25 * 60 * 1000);
      if (tamam && p.stdin.writable) p.stdin.end();
      if (Date.now() - bas > 30 * 60 * 1000) p.kill();
    }, 2000);
    p.on('close', () => {
      clearInterval(bekci);
      fs.writeFileSync(path.join(HAM, `${kol}-${tekrar}.txt`), out);
      const olaylar = out.split(/\r?\n/).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      const sonuc = olaylar.filter((x) => x.type === 'result');
      const son = sonuc[sonuc.length - 1] || {};
      const devir = olaylar.filter((x) => x.type === 'assistant' && !x.parent_tool_use_id).flatMap((x) => (x.message && x.message.content) || []).filter((c) => c.type === 'tool_use' && /^(Agent|Task)$/.test(c.name)).map((c) => (c.input || {}).subagent_type || '?');
      const yan = {};
      for (const ad of adlar) {
        let c = null;
        let pn = 0;
        try { c = JSON.parse(fs.readFileSync(path.join(d, `cevap-${ad}.json`), 'utf8')); pn = SORULAR[ad].puan(d, c); } catch {}
        yan[ad] = { puan: Math.round(pn * 100) / 100, sn: varis[ad] && gonderim[ad] ? Math.round((varis[ad] - gonderim[ad]) / 1000) : null };
      }
      const ana = anaPuan(d);
      const satir = {
        kol, tekrar, ms: Date.now() - bas, ana: ana.puan, test: ana.test, yan,
        yanOrt: Math.round((adlar.reduce((s, a) => s + yan[a].puan, 0) / adlar.length) * 100) / 100,
        usd: son.total_cost_usd || 0, sonucSayisi: sonuc.length,
        modeller: Object.fromEntries(Object.entries(son.modelUsage || {}).map(([k, v]) => [k, Math.round((v.costUSD || 0) * 1000) / 1000])),
        devir, hata: sonuc.filter((x) => x.is_error).map((x) => x.subtype),
      };
      fs.appendFileSync(CIKTI, JSON.stringify(satir) + '\n');
      console.log(JSON.stringify(satir));
      bitir(satir);
    });
  });
}

function anahtarTaze() {
  const o = (JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude', '.credentials.json'), 'utf8')).claudeAiOauth) || {};
  return (o.expiresAt || 0) - Date.now() > 90 * 60 * 1000;
}

async function main() {
  if (!anahtarTaze()) {
    console.error('Giriş anahtarının süresi 90 dakikadan az; kopyalar yenilerken ana anahtarı düşürür. Önce claude auth login, sonra yeniden başlat.');
    process.exit(1);
  }
  fs.mkdirSync(HAM, { recursive: true });
  const isler = [];
  for (let t = 1; t <= TEKRAR; t++) for (const k of KOLLAR) isler.push([k, t]);
  const PAR = Number(process.env.ARAYA_PAR || 3);
  for (let i = 0; i < isler.length; i += PAR) await Promise.all(isler.slice(i, i + PAR).map((x) => kos(...x)));
}

if (require.main === module) main();
