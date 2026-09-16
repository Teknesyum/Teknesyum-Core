const fs = require('fs');
const path = require('path');
const { settings, t } = require('./lib.js');

const LEDGER = path.join('.claude', 'acik.md');
const JOBS = path.join('.claude', 'jobs.md');
const LATER = path.join('.claude', 'sonra.md');
const ITEM = /^\s*[-*]\s+\S/;
const DONE = /^\s*[-*]\s+\[[xX]\]/;
const OPEN_BOX = /^\s*[-*]\s+\[ \]\s*/;
const SEP = /\s+(?:—|–|--)\s+/;
const MAX_LINES = 12;
const MAX_CHARS = 600;
const LINE_CHARS = 140;
const SHORT = 40;

function off() {
  return settings().jobs === false;
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function fileStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function body(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return null; }
}

function lines(text) {
  return String(text || '').split(/\r?\n/);
}

function job(line) {
  return line.replace(/^\s*[-*]\s+(\[[ xX]\]\s*)?/, '').split(SEP)[0].trim();
}

function entry(line, source) {
  const text = line.replace(/^\s*[-*]\s+(\[[ xX]\]\s*)?/, '').trim();
  const parts = text.split(SEP);
  const what = parts[0].trim();
  const why = parts.slice(1).join(' — ').trim() || source;
  return '- [ ] ' + what + ' — ' + stamp() + ' — ' + why;
}

function append(cwd, rows) {
  if (!rows.length) return 0;
  const file = path.join(cwd, LEDGER);
  const have = body(file);
  const known = new Set(lines(have).filter((l) => ITEM.test(l) && !DONE.test(l)).map(job));
  const add = [];
  for (const r of rows) {
    const k = job(r);
    if (!k || known.has(k)) continue;
    known.add(k);
    add.push(r);
  }
  if (!add.length) return 0;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const head = have && have.trim() ? have.replace(/\s*$/, '\n') : '';
  fs.writeFileSync(file, head + add.join('\n') + '\n', 'utf8');
  return add.length;
}

function toTrash(cwd, from, name) {
  const bin = path.join(cwd, 'trash');
  fs.mkdirSync(bin, { recursive: true });
  fs.renameSync(from, path.join(bin, name + '-' + fileStamp() + '.md'));
}

function openOf(text) {
  return lines(text).filter((l) => ITEM.test(l) && !DONE.test(l));
}

function absorbJobs(cwd) {
  const file = path.join(cwd, JOBS);
  const text = body(file);
  if (text === null) return 0;
  let n = 0;
  try { n = append(cwd, openOf(text).map((l) => entry(l, 'jobs.md'))); } catch {}
  try { toTrash(cwd, file, 'jobs'); } catch {}
  return n;
}

function absorbLater(cwd) {
  const file = path.join(cwd, LATER);
  const text = body(file);
  if (text === null) return 0;
  let n = 0;
  try { n = append(cwd, openOf(text).map((l) => entry(l, 'sonra.md'))); } catch { return 0; }
  try { toTrash(cwd, file, 'sonra'); } catch {}
  return n;
}

function prune(cwd) {
  const file = path.join(cwd, LEDGER);
  const text = body(file);
  if (text === null) return [];
  const all = lines(text);
  const done = all.filter((l) => DONE.test(l));
  const keep = all.filter((l) => !DONE.test(l));
  if (done.length) {
    try {
      const bin = path.join(cwd, 'trash');
      fs.mkdirSync(bin, { recursive: true });
      fs.writeFileSync(path.join(bin, 'acik-' + fileStamp() + '.md'), done.join('\n') + '\n', 'utf8');
      const rest = keep.join('\n').trim();
      if (rest) fs.writeFileSync(file, rest + '\n', 'utf8');
      else fs.unlinkSync(file);
    } catch {}
  }
  return keep.filter((l) => ITEM.test(l)).map((l) => l.trim());
}

function open(cwd) {
  return openOf(body(path.join(cwd, LEDGER))).map((l) => l.trim());
}

function render(rows) {
  if (!rows.length) return '';
  const head = t('defter.head').replace('%N', String(rows.length));
  const out = [];
  let used = head.length;
  for (const r of rows.slice(0, MAX_LINES)) {
    const l = r.length > LINE_CHARS ? r.slice(0, LINE_CHARS - 1) + '…' : r;
    if (used + l.length + 1 > MAX_CHARS && out.length) break;
    out.push(l);
    used += l.length + 1;
  }
  if (out.length < rows.length) out.push(t('defter.more').replace('%N', String(rows.length - out.length)));
  return head + '\n' + out.join('\n');
}

function ledger(cwd) {
  if (off()) return { text: '', moved: 0 };
  const moved = absorbJobs(cwd) + absorbLater(cwd);
  return { text: render(prune(cwd)), moved };
}

function agent(cwd, description) {
  if (off()) return 0;
  const what = String(description || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  if (!what) return 0;
  try { return append(cwd, ['- [ ] ajan: ' + what + ' — ' + stamp() + ' — ' + t('defter.agent')]); } catch { return 0; }
}

function lastText(j) {
  if (typeof j.last_assistant_message === 'string') return j.last_assistant_message;
  const p = j.transcript_path;
  if (!p) return null;
  let text = '';
  try {
    const size = fs.statSync(p).size;
    const from = Math.max(0, size - 256 * 1024);
    const fd = fs.openSync(p, 'r');
    const buf = Buffer.alloc(size - from);
    fs.readSync(fd, buf, 0, buf.length, from);
    fs.closeSync(fd);
    text = buf.toString('utf8');
  } catch { return null; }
  const rows = text.split('\n').reverse();
  for (const row of rows) {
    let o;
    try { o = JSON.parse(row); } catch { continue; }
    if (!o || o.type !== 'assistant' || !o.message || !Array.isArray(o.message.content)) continue;
    const said = o.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    if (said.trim()) return said;
  }
  return null;
}

function short(j) {
  if (off()) return '';
  const said = lastText(j);
  if (said === null || said.trim().length > SHORT) return '';
  const left = open(j.cwd || process.cwd());
  if (!left.length) return '';
  return t('defter.short').replace('%N', String(left.length)) + '\n' + left.slice(0, MAX_LINES).join('\n');
}

module.exports = { ledger, agent, short, open, prune, append, entry, job, render, lastText, LEDGER, JOBS, LATER, SHORT };
