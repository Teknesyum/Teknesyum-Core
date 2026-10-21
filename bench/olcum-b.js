'use strict';

// Olcum turu B kolu: kod baglami araclari, VidShrink src/ kopyasinda 4 soru.
// Kosu bench-low alt ajaniyla yapilir (claude -p bu ortamda kimlik dogrulayamadi);
// bu betik istemi uretir, alt ajan transkriptlerinden token/$ toplar ve cevaplari puanlar.
//   node bench/olcum-b.js --istem q1-ayar graphify 1
//   node bench/olcum-b.js --topla <oturum-subagents-dizini>

const fs = require('fs');
const path = require('path');
const maliyet = require('./maliyet');

const KOK = path.resolve(__dirname, '..');
const KOPYA = 'C:/Users/Administrator/olcum-dis/vidshrink-kopya';
const DIS = 'C:/Users/Administrator/olcum-dis';
const CEVAP = DIS + '/cevaplar';
const SONUC = path.join(KOK, 'bench', 'olcum-b.jsonl');
const ETIKET = 'olcumB ';

const SORULAR = {
  'q1-ayar': {
    metin: 'Gelişmiş ayarlardaki ses kanalı seçimi (ComboBox CmbAdvAudioChannels, ör. "Mono") FFmpeg komut satırındaki `-ac` argümanına kadar hangi dosya ve metotlardan geçiyor? Zinciri sırayla ver. `-ac` argümanını listeye gerçekte hangi metot ekliyor?',
    denetim: [
      ['MainWindow (ApplyAdvancedOptions)', /ApplyAdvancedOptions|MainWindow\.axaml\.cs/],
      ['PlanCalculator', /PlanCalculator/],
      ['FfmpegArguments', /FfmpegArguments/],
      ['StreamMapping', /StreamMapping/],
      ['AudioCodecArguments', /AudioCodecArguments/],
    ],
  },
  'q2-kabuk': {
    metin: 'Windows Gezgini sağ tık menüsündeki hızlı küçültme girdisi (ör. "Gmail (25 MB)") tıklandığında istek hangi dosya ve metotlardan geçerek FFmpeg argümanlarının kurulduğu yere ulaşıyor? Kayıt defterine yazılan komutun biçimi ne, ve `--kucult` argümanı hangi hedef MB değerlerini kabul ediyor?',
    denetim: [
      ['ShellRegistration/ShellMenu', /ShellRegistration|ShellMenu/],
      ['Program.cs / ShellShrinkStartup', /ShellShrinkStartup|Program\.cs/],
      ['ShrinkRequestResolver', /ShrinkRequestResolver/],
      ['ShrinkJobWindow', /ShrinkJobWindow/],
      ['EncodeRunner', /EncodeRunner/],
      ['FfmpegArguments', /FfmpegArguments/],
      ['--kucult', /--kucult/],
      ['hedefler 8/16/20/25/50/100', /(?=[\s\S]*\b8\b)(?=[\s\S]*\b16\b)(?=[\s\S]*\b20\b)(?=[\s\S]*\b25\b)(?=[\s\S]*\b50\b)(?=[\s\S]*\b100\b)/],
    ],
  },
  'q3-etki': {
    metin: '`StreamMapping.Decide` metodunun imzasını değiştirirsem src/ altında onu doğrudan çağıran metotlar (dosya + metot) hangileri, ve bu çağıranları çağıran metotlar (bir seviye yukarı) hangileri? Aynı adlı başka sınıfların Decide metotlarını karıştırma.',
    denetim: [
      ['BuildDetailedCore', /BuildDetailedCore/],
      ['ForOutput', /ForOutput/],
      ['FfmpegArguments.Build', /FfmpegArguments/],
      ['EncodeRunner', /EncodeRunner/],
      ['CliApp', /CliApp/],
    ],
  },
  'q4-sembol': {
    metin: 'Ses izini videoyla hizalamak için yeniden kodlanan ses izine varsayılan olarak verilen FFmpeg ses süzgeci metni hangi sabitte tanımlı (dosya, sınıf, ad) ve değeri tam olarak ne?',
    denetim: [
      ['StreamMapping', /StreamMapping/],
      ['SesHizalama', /SesHizalama/],
      ['aresample=async=1:first_pts=0', /aresample=async=1:first_pts=0/],
    ],
  },
};

const NOTLAR = {
  taban: '',
  graphify: `Bu kopya için hazır bir kod grafiği var. Önce Bash ile graphify çalıştır, yetmezse yerleşik araçlara geç: \`${DIS}/graphify/venv/Scripts/graphify.exe <query "soru" | explain "Sembol" | path "A" "B" | affected "Sembol"> --graph ${DIS}/graphify/idx/graphify-out/graph.json\` (ad belirsizse çıktıdaki tam id'yi ver).`,
  probe: `Önce Bash ile probe çalıştır, yetmezse yerleşik araçlara geç: \`${DIS}/probe/node_modules/@probelabs/probe/bin/probe.exe search "terim1 AND terim2" ${KOPYA}/src --max-tokens 3000\` (BM25 sıralı, kod bloklarını bütün döndürür); \`probe.exe extract <dosya>:<satır>\` tek bloğu verir.`,
  'ast-grep': `Önce Bash ile ast-grep çalıştır (yapısal C# arama), yetmezse yerleşik araçlara geç: \`${DIS}/ast-grep/node_modules/@ast-grep/cli/ast-grep.exe run -l csharp -p 'Sinif.Metot($$$)' ${KOPYA}/src\` gibi; yorumları ve metin eşleşmelerini ayırır.`,
  crg: `Önce Bash ile code-review-graph çalıştır, yetmezse yerleşik araçlara geç: \`cd ${KOPYA} && ${DIS}/crg/venv/Scripts/code-review-graph.exe <alt komut>\` (grafik kurulu). Çağıranlar için: \`query callers_of "${KOPYA}/src/<Proje>/<Dosya>.cs::<Sinif>.<Metot>"\`; kısa ad belirsizse araç aday listesi verir, oradaki tam adı kullan. Diğer alt komutlar: \`query callees_of\`, \`impact\`, \`--help\`.`,
  cbm: `Önce Bash ile codebase-memory-mcp CLI çalıştır, yetmezse yerleşik araçlara geç: \`${DIS}/cbm/bin/codebase-memory-mcp.exe cli <search_graph|trace_path|get_code_snippet|search_code> '<json argümanlar>'\` (proje adı: CBMPROJE).`,
  qmd: `Önce Bash ile qmd çalıştır, yetmezse yerleşik araçlara geç: \`QMD_CONFIG_DIR=${DIS}/qmd/cfg XDG_CACHE_HOME=${DIS}/qmd/cache ${DIS}/qmd/node_modules/.bin/qmd search "terimler" -c vs -n 5\` (BM25 tam metin, satır numaralı parça döndürür; src altındaki .cs dosyaları "vs" koleksiyonunda indekslendi; \`qmd get qmd://vs/<yol>:<satır>\` dosyayı verir).`,
};

function notAl(kol) {
  let n = NOTLAR[kol];
  if (n === undefined) throw new Error('bilinmeyen kol: ' + kol);
  if (process.env.CBM_PROJE) n = n.replace('CBMPROJE', process.env.CBM_PROJE);
  if (process.env.QMD_CMD) n = n.replace('QMDCMD', process.env.QMD_CMD);
  return n;
}

function cevapYolu(soruId, kol, tekrar) {
  return `${CEVAP}/${soruId}-${kol}-r${tekrar}.md`;
}

function istem(soruId, kol, tekrar) {
  const satirlar = [
    `Kök: ${KOPYA} (bir C# / Avalonia projesinin src/ kopyası). Yalnız bu klasörü oku, kod değiştirme, başka klasöre bakma. Kısa çalış.`,
    kol === 'taban' ? 'Yerleşik Grep, Glob ve Read araçlarını kullan.' : notAl(kol),
    '',
    'Soru: ' + SORULAR[soruId].metin,
    '',
    `Cevabı, dosya yollarını ve metot adlarını açıkça yazarak Write ile ${cevapYolu(soruId, kol, tekrar)} dosyasına yaz.`,
  ];
  return satirlar.join('\n');
}

function puanla(soruId, metin) {
  const sonuc = SORULAR[soruId].denetim.map(([ad, re]) => ({ ad, var: re.test(metin || '') }));
  const tutan = sonuc.filter((s) => s.var).length;
  return { tutan, toplam: sonuc.length, dogru: tutan === sonuc.length, eksik: sonuc.filter((s) => !s.var).map((s) => s.ad) };
}

function jsonl(yol) {
  if (!fs.existsSync(yol)) return [];
  return fs.readFileSync(yol, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function ilkCagriGirdi(satirlar) {
  for (const s of satirlar) {
    if (s.type !== 'assistant' || !s.message || !s.message.usage || s.message.model === '<synthetic>') continue;
    const u = s.message.usage;
    return (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
  }
  return null;
}

function sure(satirlar) {
  const z = satirlar.map((s) => Date.parse(s.timestamp)).filter(Number.isFinite);
  return z.length ? Math.max(...z) - Math.min(...z) : null;
}

function araclar(satirlar) {
  const ad = {};
  const bash = [];
  for (const s of satirlar) {
    if (s.type !== 'assistant' || !s.message || !Array.isArray(s.message.content)) continue;
    for (const p of s.message.content) {
      if (p.type !== 'tool_use') continue;
      ad[p.name] = (ad[p.name] || 0) + 1;
      if (p.name === 'Bash') bash.push(String((p.input || {}).command || ''));
    }
  }
  return { ad, bash };
}

const ARAC_IZI = { graphify: 'graphify.exe', probe: 'probe.exe', 'ast-grep': 'ast-grep.exe', crg: 'code-review-graph.exe', cbm: 'codebase-memory-mcp.exe', qmd: '.bin/qmd' };

function topla(dizin) {
  const tarife = maliyet.tarifeOku(path.join(KOK, 'docs', 'tarife.json'));
  const eski = new Set(jsonl(SONUC).map((s) => s.ajan));
  let eklenen = 0;
  for (const d of fs.readdirSync(dizin)) {
    if (!d.endsWith('.meta.json')) continue;
    const meta = JSON.parse(fs.readFileSync(path.join(dizin, d), 'utf8'));
    if (!String(meta.description || '').startsWith(ETIKET)) continue;
    const ajan = d.replace(/\.meta\.json$/, '');
    if (eski.has(ajan)) continue;
    const [soruId, kol, r] = meta.description.slice(ETIKET.length).trim().split(/\s+/);
    const tekrar = Number(String(r).replace(/^r/, ''));
    const tr = jsonl(path.join(dizin, ajan + '.jsonl'));
    if (!tr.length) continue;
    const sepet = {};
    const gor = new Map();
    const tmp = path.join(dizin, ajan);
    const t = maliyet.tokenlar(tmp);
    for (const [m, u] of Object.entries(t)) sepet[m] = u;
    let usd = null; let usdHata = null;
    try { usd = maliyet.usdHesapla(sepet, tarife).toplam; } catch (e) { usdHata = e.message; }
    const tok = { girdi: 0, cikti: 0, cacheYazma: 0, cacheOkuma: 0 };
    for (const u of Object.values(sepet)) {
      tok.girdi += u.input_tokens; tok.cikti += u.output_tokens; tok.cacheYazma += u.cache_creation_input_tokens; tok.cacheOkuma += u.cache_read_input_tokens;
    }
    const a = araclar(tr);
    const cy = cevapYolu(soruId, kol, tekrar);
    const cevap = fs.existsSync(cy) ? fs.readFileSync(cy, 'utf8') : null;
    const satir = {
      ajan, soruId, kol, tekrar, model: Object.keys(sepet)[0] || null, ajanTuru: meta.agentType,
      ms: sure(tr), tokens: tok, toplamToken: tok.girdi + tok.cikti + tok.cacheYazma + tok.cacheOkuma,
      usd, usdHata, ilkCagriGirdi: ilkCagriGirdi(tr), notBayt: kol === 'taban' ? 0 : Buffer.byteLength(notAl(kol)),
      aracSayisi: Object.values(a.ad).reduce((x, y) => x + y, 0), araclar: a.ad,
      aracKullanildi: ARAC_IZI[kol] ? a.bash.filter((c) => c.includes(ARAC_IZI[kol])).length : 0,
      puan: puanla(soruId, cevap), cevapBayt: cevap ? Buffer.byteLength(cevap) : 0,
    };
    void gor;
    fs.appendFileSync(SONUC, JSON.stringify(satir) + '\n');
    eklenen++;
    console.log([soruId, kol, 'r' + tekrar, usd != null ? '$' + usd.toFixed(3) : 'usd? ' + usdHata, satir.ms != null ? (satir.ms / 1000).toFixed(0) + 's' : '', satir.puan.tutan + '/' + satir.puan.toplam, 'arac=' + satir.aracSayisi, 'kullandi=' + satir.aracKullanildi].join(' '));
  }
  const tum = jsonl(SONUC);
  console.log('eklenen ' + eklenen + ', toplam satir ' + tum.length + ', toplam $' + tum.reduce((x, s) => x + (s.usd || 0), 0).toFixed(2));
}

function main() {
  const i = process.argv.indexOf('--istem');
  if (i !== -1) { console.log(istem(process.argv[i + 1], process.argv[i + 2], process.argv[i + 3] || '1')); return; }
  const j = process.argv.indexOf('--topla');
  if (j !== -1) { topla(process.argv[j + 1]); return; }
  console.error('kullanim: --istem <soru> <kol> <tekrar> | --topla <subagents-dizini>');
  process.exit(1);
}

if (require.main === module) main();

module.exports = { SORULAR, NOTLAR, puanla, istem };
