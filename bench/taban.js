'use strict';

const path = require('path');
const O = require('./olcum');

const SORULAR = [
  'JavaScript\'te Array.prototype.flat ne yapar?',
  'Git\'te rebase ile merge farkı nedir?',
  'HTTP 304 ne anlama gelir?',
  'Python\'da liste ile demet arasındaki fark nedir?',
  'TCP ile UDP arasındaki temel fark nedir?',
  'Big-O gösteriminde O(n log n) hangi algoritmalarda görülür?',
  'SQL\'de LEFT JOIN ile INNER JOIN farkı nedir?',
  'Node.js\'te event loop nedir?',
  'CSS\'te flexbox ile grid ne zaman tercih edilir?',
  'Unicode ile UTF-8 arasındaki ilişki nedir?',
  'Bir mutex ile semaphore arasındaki fark nedir?',
  'REST ile GraphQL arasındaki temel fark nedir?',
  'Docker imajı ile konteyner farkı nedir?',
  'JavaScript\'te closure nedir?',
  'Regex\'te tembel (lazy) nicelik belirteci ne demektir?',
  'Bir hash tablosunda çarpışma nasıl çözülür?',
  'Semantic versioning\'de minor sürüm ne zaman artar?',
  'Bash\'te $? neyi tutar?',
  'JSON ile YAML arasındaki pratik fark nedir?',
  'Idempotent HTTP metodu ne demektir?',
];
const EK = ' Araç kullanma, en fazla iki cümleyle cevapla.';

async function oturum(arm, oturumNo, tur, env, sonucYolu, saklaKok) {
  const configDizini = O.configHazirla(arm);
  const cwd = O.depoHazirla();
  let sid = null;
  try {
    for (let t = 1; t <= tur; t++) {
      const soru = SORULAR[(oturumNo * 7 + t) % SORULAR.length] + EK;
      const ekArgs = ['--max-turns', '1'];
      if (sid) ekArgs.push('--resume', sid);
      const r = await O.claudeKos({ prompt: soru, cwd, configDizini, env, ekArgs, tavanMs: 5 * 60 * 1000 });
      if (!r.json) {
        O.ekle(sonucYolu, { arm, session: oturumNo, turn: t, hata: r.err || ('kod ' + r.kod) });
        break;
      }
      sid = r.json.session_id;
      const u = r.json.usage || {};
      O.ekle(sonucYolu, {
        arm, session: oturumNo, turn: t, sid,
        girdi: u.input_tokens || 0, cacheYazma: u.cache_creation_input_tokens || 0,
        cacheOkuma: u.cache_read_input_tokens || 0, cikti: u.output_tokens || 0,
        usdCli: r.json.total_cost_usd, apiMs: r.json.duration_api_ms, ms: r.ms, numTurns: r.json.num_turns,
      });
    }
    if (sid) {
      const od = O.oturumDizini(configDizini, cwd, sid);
      const satirlar = O.transkript(od);
      const kanca = O.kancaSay(od);
      const arac = O.aracCagrilari(satirlar).length;
      const m = O.usdOku(od);
      O.ekle(sonucYolu, { arm, session: oturumNo, turn: 0, sid, ozet: true, kanca, aracCagrisi: arac, ...m, transcript: O.sakla(od, path.join(saklaKok, arm + '-s' + oturumNo)) });
    }
  } finally {
    O.sil(configDizini);
    O.sil(cwd);
  }
}

async function main() {
  const env = O.kimlikEnv();
  const oturumSayisi = Number(O.argAl('--sessions', '5'));
  const tur = Number(O.argAl('--turns', '20'));
  const kollar = O.argAl('--arms', 'core,native').split(',');
  const sonucYolu = path.resolve(O.argAl('--sonuc', path.join(O.KOK, 'bench', 'taban.jsonl')));
  const batch = 't' + Date.now().toString(36);
  const saklaKok = path.join(O.KOK, 'bench', 'oturumlar', batch);
  for (let s = 1; s <= oturumSayisi; s++) {
    for (const arm of kollar) {
      await oturum(arm, s, tur, env, sonucYolu, saklaKok);
      console.log(arm + ' s' + s + ' bitti');
    }
  }
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
