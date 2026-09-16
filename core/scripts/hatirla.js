#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const PAGE_CHARS = 40000;
const CLOSING = 800;
const TMP = 'tmp';
const SKIP = /<(system-reminder|task-notification|ci-monitor-event|command-name|local-command-stdout)\b/;
const SINIF = ['Açık', 'Kararını bekliyor', 'Belirsiz'];

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

function hasTool(content) {
  return Array.isArray(content) && content.some((b) => b && b.type === 'tool_use');
}

function turns(file) {
  let raw = '';
  try { raw = fs.readFileSync(file, 'utf8'); } catch { return []; }
  const oturum = path.basename(file, '.jsonl').slice(0, 4);
  const out = [];
  let cur = null;
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let j;
    try { j = JSON.parse(line); } catch { continue; }
    if (j.isSidechain) continue;
    const content = j.message && j.message.content;
    if (j.type === 'user') {
      if (j.isMeta || j.isCompactSummary) continue;
      const body = text(content).trim();
      if (!body || SKIP.test(body)) continue;
      cur = { text: body, at: Date.parse(j.timestamp) || 0, oturum, closing: '' };
      out.push(cur);
      continue;
    }
    if (j.type !== 'assistant' || !cur) continue;
    if (hasTool(content)) { cur.closing = ''; continue; }
    const said = text(content).trim();
    if (said) cur.closing = said;
  }
  return out;
}

function prompts(file) {
  const out = [];
  for (const t of turns(file)) if (!out.includes(t.text)) out.push(t.text);
  return out;
}

function commits(cwd, since) {
  let raw = '';
  try {
    raw = execFileSync('git', ['log', '--all', '--format=%ct%x09%h%x09%s', '--since=' + Math.floor(since / 1000)], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { return []; }
  return raw.split(/\r?\n/).filter(Boolean).map((l) => {
    const [at, hash, ...s] = l.split('\t');
    return { at: Number(at) * 1000, hash, title: s.join('\t') };
  });
}

function openLines(file) {
  let body = '';
  try { body = fs.readFileSync(file, 'utf8'); } catch { return []; }
  return body.split(/\r?\n/).map((l) => l.trim()).filter((s) => /^[-*]\s+\[ \]/.test(s));
}

function jobs(cwd) {
  const root = path.resolve(cwd || process.cwd());
  const bin = path.join(root, 'trash');
  let names = [];
  try { names = fs.readdirSync(bin).filter((n) => /^jobs-.*\.md$/.test(n)).sort().slice(-5); } catch {}
  const out = [];
  const add = (label, file) => {
    for (const s of openLines(file)) if (!out.some((o) => o.line === s)) out.push({ label, line: s });
  };
  for (const n of names) add('trash/' + n, path.join(bin, n));
  add('.claude/jobs.md', path.join(root, '.claude', 'jobs.md'));
  add('docs/plan.md', path.join(root, 'docs', 'plan.md'));
  return out;
}

function stamp(ms) {
  if (!ms) return '?';
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function collect(cwd, transcript, gun) {
  const list = transcript ? [transcript] : files(cwd);
  const since = gun ? Date.now() - gun * 86400000 : 0;
  let all = [];
  for (const f of list) {
    if (since && !transcript) {
      try { if (fs.statSync(f).mtimeMs < since) continue; } catch { continue; }
    }
    all = all.concat(turns(f));
  }
  all.sort((a, b) => b.at - a.at);
  const seen = new Set();
  const kept = [];
  for (const t of all) {
    if (since && t.at && t.at < since) continue;
    if (seen.has(t.text)) continue;
    seen.add(t.text);
    kept.push(t);
  }
  const oldest = kept.length ? kept[kept.length - 1].at : Date.now();
  const log = commits(path.resolve(cwd || process.cwd()), oldest);
  const chrono = kept.slice().reverse();
  chrono.forEach((t, i) => {
    const until = i + 1 < chrono.length ? chrono[i + 1].at : Infinity;
    t.commits = log.filter((c) => c.at >= t.at && c.at < until);
  });
  return kept;
}

function block(t) {
  const kapanis = t.closing ? t.closing.slice(0, CLOSING) + (t.closing.length > CLOSING ? ' ...' : '') : 'yok';
  const com = t.commits && t.commits.length ? t.commits.map((c) => c.hash + ' ' + c.title).join('; ') : 'yok';
  return '## ' + stamp(t.at) + ' · ' + t.oturum + '\n\n' + t.text + '\n\n**Kapanış:** ' + kapanis + '\n\n**Commit:** ' + com;
}

function paginate(kept) {
  const pages = [];
  let cur = [];
  let size = 0;
  for (const t of kept) {
    const b = block(t);
    if (cur.length && size + b.length > PAGE_CHARS) { pages.push(cur); cur = []; size = 0; }
    cur.push({ t, b });
    size += b.length;
  }
  if (cur.length) pages.push(cur);
  return pages;
}

function gather(cwd, transcript, gun) {
  const kept = collect(cwd, transcript, gun);
  const pages = paginate(kept);
  const left = jobs(cwd);
  return pages.map((items, i) => {
    const n = i + 1;
    const chrono = items.slice().reverse();
    const iz = items.filter((x) => !x.t.closing).length;
    const from = stamp(chrono[0].t.at);
    const to = stamp(chrono[chrono.length - 1].t.at);
    const head = ['# Geçmiş istekler · sayfa ' + n + ' / ' + pages.length, '', from + ' – ' + to + ' · ' + items.length + ' istek', ''];
    const tail = n === 1 && left.length ? ['', '# Kapanmamış iş satırları', ''].concat(left.map((o) => o.line + ' (' + o.label + ')')) : [];
    const body = chrono.map((x) => x.b).join('\n\n');
    return { page: n, count: items.length, from, to, iz, satir: n === 1 ? left.length : 0, text: head.concat(body, tail).join('\n') + '\n' };
  });
}

function write(cwd, name, body) {
  const dir = tmpDir(cwd);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, name);
  fs.writeFileSync(out, body, 'utf8');
  return out;
}

function clear(cwd) {
  const dir = tmpDir(cwd);
  try {
    for (const n of fs.readdirSync(dir)) if (/^gecmis-\d+\.md$/.test(n)) fs.unlinkSync(path.join(dir, n));
  } catch {}
}

function topla(cwd, transcript, gun) {
  clear(cwd);
  const pages = gather(cwd, transcript, gun);
  const lines = pages.map((p) => {
    const f = write(cwd, 'gecmis-' + p.page + '.md', p.text);
    return p.page + ' · ' + p.from + ' – ' + p.to + ' · ' + p.count + ' istek · ' + p.iz + ' kapanışsız' + (p.satir ? ' · ' + p.satir + ' açık iş satırı' : '') + ' · ' + f;
  });
  const total = pages.reduce((s, p) => s + p.count, 0);
  write(cwd, 'gecmis-dizin.json', JSON.stringify({ sayfa: pages.length, istek: total }));
  return { pages, total, index: (lines.length ? lines.join('\n') : 'kayıt bulunamadı') + '\n' + pages.length + ' sayfa · ' + total + ' istek\n' };
}

function classes(body) {
  const out = SINIF.map(() => 0);
  let at = -1;
  for (const l of body.split(/\r?\n/)) {
    const h = /^##\s+(.+?)\s*$/.exec(l);
    if (h) { at = SINIF.findIndex((s) => s.toLocaleLowerCase('tr') === h[1].toLocaleLowerCase('tr')); continue; }
    if (at > -1 && /^\s*[-*]\s+\[ \]/.test(l)) out[at]++;
  }
  return out;
}

function record(cwd, body, sayfa) {
  let dizin = {};
  try { dizin = JSON.parse(fs.readFileSync(path.join(tmpDir(cwd), 'gecmis-dizin.json'), 'utf8')); } catch {}
  const pages = Number(sayfa) || dizin.sayfa || 0;
  const istek = dizin.istek || 0;
  const reply = String(body || '').trim();
  const [acik, karar, belirsiz] = classes(reply);
  const tarih = stamp(Date.now()).slice(0, 10);
  const head = '# Hatırlatıcı · ' + tarih + ' · ' + pages + ' sayfa, ' + istek + ' istek\n\n';
  const file = write(cwd, 'hatirlatici.md', head + reply + '\n');
  const line = pages + ' sayfa · ' + istek + ' istek · ' + acik + ' açık · ' + karar + ' karar · ' + belirsiz + ' belirsiz · ' + TMP + '/hatirlatici.md';
  return { file, line, counts: { acik, karar, belirsiz } };
}

function show(cwd, line) {
  const f = newest(cwd);
  if (!f) return;
  try { require('../hooks/lib.js').sayBlock(path.basename(f, '.jsonl'), line); } catch {}
}

function cli(argv) {
  const cmd = argv[0] || '';
  const flag = (n) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : ''; };
  const cwd = flag('--cwd') || process.cwd();
  if (cmd === 'topla') {
    const r = topla(cwd, flag('--transcript'), Number(flag('--gun')) || 0);
    process.stdout.write(r.index);
    return 0;
  }
  if (cmd === 'record') {
    const reply = flag('--reply');
    const ajan = flag('--ajan');
    let body = '';
    if (reply) body = fs.readFileSync(reply, 'utf8');
    else if (ajan) {
      const advice = require('./advice.js');
      const f = advice.agentFile(cwd, ajan);
      body = f ? advice.agentReply(f).text : '';
      if (!body) { process.stdout.write('ajan kaydı bulunamadı: ' + ajan + '\n'); return 1; }
    } else { process.stdout.write('kullanim: hatirla.js record --ajan <agentId> | --reply <dosya> [--sayfa N]\n'); return 2; }
    const r = record(cwd, body, flag('--sayfa'));
    show(cwd, r.line);
    process.stdout.write(r.line + '\n');
    return 0;
  }
  process.stdout.write('kullanim: hatirla.js topla [--gun N] [--transcript <dosya>] [--cwd <klasor>]\n         hatirla.js record --ajan <agentId> | --reply <dosya> [--sayfa N] [--cwd <klasor>]\n');
  return cmd ? 2 : 0;
}

if (require.main === module) process.exit(cli(process.argv.slice(2)));

module.exports = { gather, topla, turns, prompts, files, jobs, commits, newest, record, classes, write, tmpDir, cli, TMP, PAGE_CHARS, CLOSING, SINIF };
