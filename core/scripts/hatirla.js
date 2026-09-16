#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

const PAGE = 60;
const MAX_CHARS = 1200;
const TMP = 'tmp';
const SKIP = /<(system-reminder|task-notification|ci-monitor-event|command-name|local-command-stdout)\b/;

function tmpDir(cwd) {
  return path.join(path.resolve(cwd || process.cwd()), TMP);
}

function projectDir(cwd) {
  const root = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  const slug = path.resolve(cwd || process.cwd()).split(/[\\/:]/).join('-');
  return path.join(root, 'projects', slug);
}

function files(cwd) {
  const dir = projectDir(cwd);
  let rows = [];
  try {
    rows = fs.readdirSync(dir)
      .filter((f) => f.endsWith('.jsonl'))
      .map((f) => path.join(dir, f))
      .map((f) => ({ f, at: fs.statSync(f).mtimeMs }))
      .sort((a, b) => b.at - a.at);
  } catch { return []; }
  return rows.map((r) => r.f);
}

function newest(cwd) {
  const all = files(cwd);
  return all.length ? all[0] : '';
}

function text(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter((b) => b && b.type === 'text').map((b) => String(b.text || '')).join('\n');
}

function prompts(file) {
  let raw = '';
  try { raw = fs.readFileSync(file, 'utf8'); } catch { return []; }
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let j;
    try { j = JSON.parse(line); } catch { continue; }
    if (j.type !== 'user' || j.isMeta) continue;
    const body = text(j.message && j.message.content).trim();
    if (!body || SKIP.test(body)) continue;
    const kisa = body.length > MAX_CHARS ? body.slice(0, MAX_CHARS) + ' ...' : body;
    if (!out.includes(kisa)) out.push(kisa);
  }
  return out;
}

function jobs(cwd) {
  const bin = path.join(path.resolve(cwd || process.cwd()), 'trash');
  let files = [];
  try {
    files = fs.readdirSync(bin).filter((n) => /^jobs-.*\.md$/.test(n)).sort().slice(-5);
  } catch { return []; }
  const out = [];
  for (const n of files) {
    let body = '';
    try { body = fs.readFileSync(path.join(bin, n), 'utf8'); } catch { continue; }
    for (const l of body.split(/\r?\n/)) {
      const s = l.trim();
      if (/^[-*]\s+\[ \]/.test(s) && !out.includes(s)) out.push(s);
    }
  }
  return out;
}

function gather(cwd, transcript, sayfa) {
  const n = Math.max(1, parseInt(sayfa, 10) || 1);
  const list = transcript ? [transcript] : files(cwd);
  const want = n * PAGE + 1;
  const asked = [];
  const used = [];
  for (const f of list) {
    if (asked.length >= want) break;
    used.push(f);
    const ps = prompts(f).reverse();
    for (const p of ps) if (!asked.includes(p)) asked.push(p);
  }
  const more = asked.length > n * PAGE;
  const page = asked.slice((n - 1) * PAGE, n * PAGE).reverse();
  const left = n === 1 ? jobs(cwd) : [];
  const head = ['# Geçmiş istekler · sayfa ' + n, '', 'Kaynak: ' + (used.join(', ') || 'bulunamadı'), 'İstek sayısı: ' + page.length, more ? 'Devamı var: topla --sayfa ' + (n + 1) : 'Kayıtların başına varıldı', ''];
  const body = page.map((p, i) => '## ' + (i + 1) + '\n' + p).join('\n\n');
  const tail = left.length ? ['', '# Kapanmamış iş satırları', ''].concat(left) : [];
  return { page: n, more, count: page.length, text: head.concat(body, tail).join('\n') + '\n' };
}

function write(cwd, name, body) {
  const dir = tmpDir(cwd);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, name);
  fs.writeFileSync(out, body, 'utf8');
  return out;
}

function record(cwd, reply) {
  const body = fs.readFileSync(reply, 'utf8').trim();
  const head = '# İş hatırlatıcı\n\nTarih: ' + new Date().toISOString().slice(0, 16).replace('T', ' ') + '\n\n';
  return write(cwd, 'hatirlatici.md', head + body + '\n');
}

function cli(argv) {
  const cmd = argv[0] || '';
  const flag = (n) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : ''; };
  const cwd = flag('--cwd') || process.cwd();
  if (cmd === 'topla') {
    const g = gather(cwd, flag('--transcript'), flag('--sayfa'));
    const out = write(cwd, 'gecmis-' + g.page + '.md', g.text);
    const next = g.more ? 'devamı var: node "' + __filename + '" topla --sayfa ' + (g.page + 1) : 'kayıtların başına varıldı';
    process.stdout.write(out + '\n' + g.count + ' istek · ' + next + '\n');
    return 0;
  }
  if (cmd === 'record') {
    const reply = flag('--reply');
    if (!reply) { process.stdout.write('kullanim: hatirla.js record --reply <dosya>\n'); return 2; }
    process.stdout.write(record(cwd, reply) + '\n');
    return 0;
  }
  process.stdout.write('kullanim: hatirla.js topla [--sayfa N] [--transcript <dosya>] [--cwd <klasor>]\n         hatirla.js record --reply <dosya> [--cwd <klasor>]\n');
  return cmd ? 2 : 0;
}

if (require.main === module) process.exit(cli(process.argv.slice(2)));

module.exports = { gather, prompts, files, jobs, newest, record, write, tmpDir, cli, TMP, PAGE };
