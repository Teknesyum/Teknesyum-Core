'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const O = require('./olcum');
const { gorevOku } = require('./run');

const GOREV = '06-slugify-cli';
const ANLAMLI = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit', 'Bash', 'PowerShell']);

function kabul(cwd) {
  const yol = path.join(O.KOK, 'bench', 'gorevler', GOREV + '.kabul.sh');
  const r = spawnSync('bash', [yol, cwd], { encoding: 'utf8', windowsHide: true });
  return { pass: r.status === 0, son: String((r.stdout || '') + (r.stderr || '')).trim().split('\n').slice(-2).join(' | ') };
}

function oturumOzeti(od) {
  const satirlar = O.transkript(od);
  const arac = O.aracCagrilari(satirlar);
  const t0 = O.ilkKullaniciZamani(satirlar);
  const ilk = arac.find((a) => ANLAMLI.has(a.name));
  return {
    m: O.usdOku(od), arac, kanca: O.kancaSay(od),
    ilkAracMs: arac.length && t0 ? arac[0].ts - t0 : null,
    ilkAnlamliMs: ilk && t0 ? ilk.ts - t0 : null,
    ilkAnlamli: ilk ? ilk.sig : null,
  };
}

async function cift(arm, tekrar, env, maxTurns, sonucYolu, saklaKok) {
  const gorev = gorevOku(GOREV);
  const configDizini = O.configHazirla(arm);
  const cwd = O.klonla(gorev.repo, gorev.sha);
  const satir = { arm, repeat: tekrar, maxTurns, gorev: GOREV };
  try {
    const r1 = await O.claudeKos({ prompt: gorev.prompt, cwd, configDizini, env, ekArgs: ['--max-turns', String(maxTurns)] });
    satir.s1 = { kod: r1.kod, ms: r1.ms, numTurns: r1.json && r1.json.num_turns, stop: r1.json && (r1.json.terminal_reason || r1.json.subtype) };
    let s1Imzalar = new Set();
    if (r1.sid) {
      const od1 = O.oturumDizini(configDizini, cwd, r1.sid);
      const o1 = oturumOzeti(od1);
      s1Imzalar = new Set(o1.arac.map((a) => a.sig));
      Object.assign(satir.s1, { usd: o1.m.usd, tokens: o1.m.tokens, aracCagrisi: o1.arac.length, kanca: o1.kanca, transcript: O.sakla(od1, path.join(saklaKok, arm + '-r' + tekrar + '-s1')) });
    }
    const handoffYolu = path.join(cwd, '.claude', 'handoff.md');
    satir.handoffVar = fs.existsSync(handoffYolu);
    if (satir.handoffVar) {
      const h = path.join(saklaKok, arm + '-r' + tekrar + '-s1');
      fs.mkdirSync(h, { recursive: true });
      fs.copyFileSync(handoffYolu, path.join(h, 'handoff.md'));
    }
    satir.s1Kabul = kabul(cwd);

    const r2 = await O.claudeKos({ prompt: 'devam et', cwd, configDizini, env });
    satir.s2 = { kod: r2.kod, ms: r2.ms, numTurns: r2.json && r2.json.num_turns, stop: r2.json && (r2.json.terminal_reason || r2.json.subtype) };
    if (r2.sid) {
      const od2 = O.oturumDizini(configDizini, cwd, r2.sid);
      const o2 = oturumOzeti(od2);
      const tekrarlar = o2.arac.filter((a) => s1Imzalar.has(a.sig)).map((a) => a.sig);
      Object.assign(satir.s2, {
        usd: o2.m.usd, tokens: o2.m.tokens, aracCagrisi: o2.arac.length, kanca: o2.kanca,
        tekrarAraci: tekrarlar.length, tekrarlar, ilkAracMs: o2.ilkAracMs, ilkAnlamliMs: o2.ilkAnlamliMs, ilkAnlamli: o2.ilkAnlamli,
        araclar: o2.arac.map((a) => a.sig),
        transcript: O.sakla(od2, path.join(saklaKok, arm + '-r' + tekrar + '-s2')),
      });
    }
    satir.s2Kabul = kabul(cwd);
    O.ekle(sonucYolu, satir);
    console.log(arm + ' r' + tekrar + ' ' + JSON.stringify({ handoff: satir.handoffVar, s1pass: satir.s1Kabul.pass, s2pass: satir.s2Kabul.pass, tekrar: satir.s2 && satir.s2.tekrarAraci, usd2: satir.s2 && satir.s2.usd }));
  } finally {
    O.sil(configDizini);
    O.sil(cwd);
  }
}

async function main() {
  const env = O.kimlikEnv();
  const tekrar = Number(O.argAl('--repeat', '5'));
  const maxTurns = Number(O.argAl('--maxTurns', '6'));
  const kollar = O.argAl('--arms', 'core,native').split(',');
  const sonucYolu = path.resolve(O.argAl('--sonuc', path.join(O.KOK, 'bench', 'devam.jsonl')));
  const batch = 'd' + Date.now().toString(36);
  const saklaKok = path.join(O.KOK, 'bench', 'oturumlar', batch);
  for (let r = 1; r <= tekrar; r++) for (const arm of kollar) await cift(arm, r, env, maxTurns, sonucYolu, saklaKok);
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
