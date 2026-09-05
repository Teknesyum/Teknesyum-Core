'use strict';

const fs = require('fs');
const path = require('path');
const O = require('./olcum');

const PROMPT = [
  'Bu depoya dört küçük ESM dosyası ekle: `a.js`, `b.js`, `c.js`, `d.js`.',
  'Her biri kendi adını döndüren tek bir varsayılan fonksiyon export etsin (örnek: `export default () => "a"`).',
  'Dosyaları tek tek yaz, başka bir şey yapma; bitince tek cümleyle bildir.',
].join(' ');

async function kosu(arm, tekrar, env, sonucYolu, saklaKok) {
  const configDizini = O.configHazirla(arm);
  const cwd = O.depoHazirla();
  try {
    const r = await O.claudeKos({ prompt: PROMPT, cwd, configDizini, env, tavanMs: 10 * 60 * 1000 });
    const satir = { arm, repeat: tekrar, kod: r.kod, ms: r.ms, usdCli: r.json && r.json.total_cost_usd, numTurns: r.json && r.json.num_turns };
    if (r.sid) {
      const od = O.oturumDizini(configDizini, cwd, r.sid);
      const satirlar = O.transkript(od);
      const arac = O.aracCagrilari(satirlar);
      Object.assign(satir, O.usdOku(od), {
        aracCagrisi: arac.length,
        araclar: arac.map((a) => a.sig),
        kanca: O.kancaSay(od),
        planYazildi: fs.existsSync(path.join(cwd, 'docs', 'plan.md')),
        dosyalar: ['a.js', 'b.js', 'c.js', 'd.js'].filter((d) => fs.existsSync(path.join(cwd, d))).length,
        transcript: O.sakla(od, path.join(saklaKok, arm + '-r' + tekrar)),
      });
    }
    O.ekle(sonucYolu, satir);
    console.log(arm + ' r' + tekrar + ' ' + JSON.stringify({ usd: satir.usd, arac: satir.aracCagrisi, cue: satir.kanca && satir.kanca.cueHits, plan: satir.planYazildi }));
  } finally {
    O.sil(configDizini);
    O.sil(cwd);
  }
}

async function main() {
  const env = O.kimlikEnv();
  const tekrar = Number(O.argAl('--repeat', '5'));
  const kollar = O.argAl('--arms', 'core,native').split(',');
  const sonucYolu = path.resolve(O.argAl('--sonuc', path.join(O.KOK, 'bench', 'uyari.jsonl')));
  const batch = 'u' + Date.now().toString(36);
  const saklaKok = path.join(O.KOK, 'bench', 'oturumlar', batch);
  for (let r = 1; r <= tekrar; r++) for (const arm of kollar) await kosu(arm, r, env, sonucYolu, saklaKok);
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
