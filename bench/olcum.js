'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const maliyet = require('./maliyet');
const { eklentiKur, encodeCwd, kancaSay } = require('./run');

const KOK = path.resolve(__dirname, '..');
const KOLTUK = 'sonnet/low';

function argAl(bayrak, varsayilan) {
  const i = process.argv.indexOf(bayrak);
  if (i === -1 || i === process.argv.length - 1) return varsayilan;
  return process.argv[i + 1];
}

function kimlikEnv() {
  const env = { ...process.env };
  if (!env.ANTHROPIC_API_KEY && !env.CLAUDE_CODE_OAUTH_TOKEN && process.platform === 'win32') {
    const r = spawnSync('powershell', ['-NoProfile', '-Command', "[Environment]::GetEnvironmentVariable('CLAUDE_CODE_OAUTH_TOKEN','User')"], { encoding: 'utf8', windowsHide: true });
    const t = (r.stdout || '').trim();
    if (t) env.CLAUDE_CODE_OAUTH_TOKEN = t;
  }
  if (!env.ANTHROPIC_API_KEY && !env.CLAUDE_CODE_OAUTH_TOKEN) throw new Error('kimlik yok: ANTHROPIC_API_KEY ya da CLAUDE_CODE_OAUTH_TOKEN gerekli');
  return env;
}

function gecici(onEk) {
  return fs.mkdtempSync(path.join(os.tmpdir(), onEk));
}

function sil(dizin) {
  try { fs.rmSync(dizin, { recursive: true, force: true }); } catch {}
}

function configHazirla(arm) {
  const configDizini = gecici('tkc-olcum-config-');
  if (arm === 'core') eklentiKur(configDizini);
  return configDizini;
}

function depoHazirla(dosyalar = { 'README.md': 'deneme\n' }) {
  const dizin = gecici('tkc-olcum-work-');
  for (const [ad, icerik] of Object.entries(dosyalar)) fs.writeFileSync(path.join(dizin, ad), icerik);
  spawnSync('git', ['init', '-q'], { cwd: dizin, windowsHide: true });
  spawnSync('git', ['add', '.'], { cwd: dizin, windowsHide: true });
  spawnSync('git', ['-c', 'user.email=bench@teknesyum', '-c', 'user.name=bench', 'commit', '-qm', 'init'], { cwd: dizin, windowsHide: true });
  return dizin;
}

function klonla(repo, sha) {
  const dizin = gecici('tkc-olcum-work-');
  const k = spawnSync('git', ['clone', '--quiet', repo, dizin], { windowsHide: true });
  if (k.status !== 0) throw new Error('clone basarisiz: ' + repo);
  const c = spawnSync('git', ['checkout', '--quiet', sha], { cwd: dizin, windowsHide: true });
  if (c.status !== 0) throw new Error('checkout basarisiz: ' + sha);
  return dizin;
}

function claudeKos({ prompt, cwd, configDizini, env, koltuk = KOLTUK, ekArgs = [], tavanMs = 20 * 60 * 1000 }) {
  const [model, effort] = koltuk.split('/');
  const args = ['-p', prompt, '--model', model, '--effort', effort, '--permission-mode', 'bypassPermissions', '--output-format', 'json', ...ekArgs];
  const baslangic = Date.now();
  return new Promise((resolve) => {
    const cocuk = spawn('claude', args, { cwd, env: { ...env, CLAUDE_CONFIG_DIR: configDizini }, windowsHide: true });
    let out = '';
    let err = '';
    cocuk.stdout.on('data', (d) => { out += d; });
    cocuk.stderr.on('data', (d) => { err += d; });
    let asim = false;
    const z = setTimeout(() => { asim = true; spawnSync('taskkill', ['/pid', String(cocuk.pid), '/T', '/F']); }, tavanMs);
    cocuk.on('close', (kod) => {
      clearTimeout(z);
      let json = null;
      try { json = JSON.parse(out.trim().split('\n').filter(Boolean).pop()); } catch {}
      resolve({ kod, asim, ms: Date.now() - baslangic, json, sid: json && json.session_id, err: err.slice(-400) });
    });
    cocuk.on('error', () => { clearTimeout(z); resolve({ kod: 1, asim: false, ms: Date.now() - baslangic, json: null, sid: null, err: 'spawn' }); });
  });
}

function oturumDizini(configDizini, cwd, sid) {
  return path.join(configDizini, 'projects', encodeCwd(cwd), sid);
}

function transkript(oturumDizin) {
  const yol = oturumDizin + '.jsonl';
  if (!fs.existsSync(yol)) return [];
  return fs.readFileSync(yol, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

function imza(name, input) {
  const i = input || {};
  const hedef = i.file_path || i.command || i.pattern || i.path || i.url || i.prompt || '';
  return name + ':' + String(hedef).slice(0, 200);
}

function aracCagrilari(satirlar) {
  const liste = [];
  for (const s of satirlar) {
    if (s.type !== 'assistant' || !s.message || !Array.isArray(s.message.content)) continue;
    for (const p of s.message.content) {
      if (p.type === 'tool_use') liste.push({ ts: Date.parse(s.timestamp) || null, name: p.name, input: p.input, sig: imza(p.name, p.input) });
    }
  }
  return liste;
}

function ilkKullaniciZamani(satirlar) {
  const u = satirlar.find((s) => s.type === 'user' && s.timestamp);
  return u ? Date.parse(u.timestamp) : null;
}

function usdOku(oturumDizin) {
  const sepet = maliyet.tokenlar(oturumDizin);
  const tarife = maliyet.tarifeOku(path.join(KOK, 'docs', 'tarife.json'));
  const { toplam, usdSource } = maliyet.usdHesapla(sepet, tarife);
  const t = { girdi: 0, cikti: 0, cacheYazma: 0, cacheOkuma: 0 };
  const es = { girdi: 'input_tokens', cikti: 'output_tokens', cacheYazma: 'cache_creation_input_tokens', cacheOkuma: 'cache_read_input_tokens' };
  for (const m of Object.values(sepet)) for (const k of Object.keys(t)) t[k] += m[es[k]] || 0;
  return { tokens: t, usd: toplam, usdSource, model: maliyet.anaModel(oturumDizin) };
}

function sakla(oturumDizin, hedef) {
  fs.mkdirSync(hedef, { recursive: true });
  const yol = oturumDizin + '.jsonl';
  if (fs.existsSync(yol)) fs.copyFileSync(yol, path.join(hedef, 'oturum.jsonl'));
  const alt = path.join(oturumDizin, 'subagents');
  if (fs.existsSync(alt)) fs.cpSync(alt, path.join(hedef, 'subagents'), { recursive: true });
  return path.relative(KOK, hedef).split(path.sep).join('/');
}

function yuzdelik(dizi, p) {
  if (!dizi.length) return null;
  const s = dizi.slice().sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1));
  return s[i];
}

function medyan(dizi) {
  return yuzdelik(dizi, 50);
}

function ekle(yol, satir) {
  fs.appendFileSync(yol, JSON.stringify(satir) + '\n');
}

function jsonlOku(yol) {
  if (!fs.existsSync(yol)) return [];
  return fs.readFileSync(yol, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

module.exports = {
  KOK, KOLTUK, argAl, kimlikEnv, gecici, sil, configHazirla, depoHazirla, klonla, claudeKos,
  oturumDizini, transkript, aracCagrilari, ilkKullaniciZamani, usdOku, sakla, yuzdelik, medyan,
  ekle, jsonlOku, kancaSay,
};
