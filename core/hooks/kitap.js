const fs = require('fs');
const path = require('path');
const { configRoot, stateFile, read, write, banner, say } = require('./lib.js');

const TAIL = 512 * 1024;
const SHOW = /kutuphane\.js["']?\s+show\s+([^|;&\r\n]+)/g;
const DECLARED = /^[^\n]*(?:Kullanılan kitaplar|Books used)\s*:\s*(.+)$/im;

function slash(p) {
  return String(p || '').split('\\').join('/').replace(/\/+$/, '');
}

function roots() {
  const conf = slash(configRoot());
  return {
    priv: slash(process.env.TEKNESYUM_PRIVATE || conf + '/teknesyum-private'),
    shelf: slash(process.env.TEKNESYUM_KUTUPHANE || conf + '/teknesyum/kutuphane'),
    yordam: conf + '/teknesyum/yordam.md',
  };
}

function under(file, root) {
  const a = file.toLowerCase();
  const b = root.toLowerCase() + '/';
  return a.startsWith(b) ? file.slice(b.length) : null;
}

function entries(file) {
  let text = '';
  try {
    const size = fs.statSync(file).size;
    const from = Math.max(0, size - TAIL);
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(size - from);
    fs.readSync(fd, buf, 0, buf.length, from);
    fs.closeSync(fd);
    text = buf.toString('utf8');
  } catch {
    return [];
  }
  const out = [];
  for (const row of text.split('\n')) {
    try { out.push(JSON.parse(row)); } catch {}
  }
  return out;
}

function prompt(o) {
  if (!o || o.type !== 'user' || o.isMeta || o.isSidechain || o.isCompactSummary || !o.message) return false;
  const c = o.message.content;
  if (typeof c === 'string') return !/^\s*<(system-reminder|task-notification)/.test(c);
  return Array.isArray(c) && !c.some((x) => x && x.type === 'tool_result') && c.some((x) => x && x.type === 'text');
}

function turn(list) {
  let at = -1;
  for (let i = list.length - 1; i >= 0; i--) if (prompt(list[i])) { at = i; break; }
  const uses = [];
  for (const o of list.slice(at + 1)) {
    if (!o || o.type !== 'assistant' || o.isSidechain || !o.message || !Array.isArray(o.message.content)) continue;
    for (const c of o.message.content) if (c && c.type === 'tool_use') uses.push(c);
  }
  return { id: at >= 0 ? String(list[at].uuid || at) : '', uses };
}

function fromFile(file, r) {
  const f = slash(file);
  if (!f) return null;
  const inPriv = under(f, r.priv);
  if (inPriv !== null) return inPriv.replace(/^private\//, '');
  const inShelf = under(f, r.shelf);
  if (inShelf !== null) return inShelf.replace(/\.md$/i, '');
  if (f.toLowerCase() === r.yordam.toLowerCase()) return 'yordam.md';
  const skill = /\/skills\/([^/]+)\//i.exec(f);
  return skill ? skill[1] : null;
}

function books(uses) {
  const r = roots();
  const out = [];
  const add = (b) => { if (b && !out.includes(b)) out.push(b); };
  for (const u of uses) {
    const i = u.input || {};
    if (u.name === 'Skill') add(String(i.skill || '').split(':').pop().trim());
    else if (u.name === 'Read') add(fromFile(i.file_path, r));
    else if (u.name === 'Bash' || u.name === 'PowerShell') {
      for (const m of String(i.command || '').matchAll(SHOW))
        for (const s of m[1].trim().split(/\s+/)) if (s && !s.startsWith('-')) add(s.replace(/["']/g, ''));
    }
  }
  return out;
}

function transcript(j) {
  if (j.transcript_path) return j.transcript_path;
  const st = read(stateFile(String(j.session_id || 'none')));
  return (st && st.transcript) || '';
}

function used(j) {
  const file = transcript(j);
  if (!file) return { id: '', list: [] };
  const { id, uses } = turn(entries(file));
  return { id, list: books(uses) };
}

function line(j) {
  if (!j || !j.final) return '';
  const { id, list } = used(j);
  if (!list.length) return '';
  const f = stateFile('kitap-' + String(j.session_id || 'none'));
  const st = read(f) || {};
  const seen = st.turn === id && Array.isArray(st.shown) ? st.shown : [];
  if (list.every((b) => seen.includes(b))) return '';
  try { write(f, { turn: id, shown: list }); } catch {}
  return banner('banner.books', { '%S': list.join(' · ') });
}

function declared(text) {
  const m = DECLARED.exec(String(text || ''));
  if (!m) return null;
  return m[1].split(/\s*[·,]\s*/).map((s) => s.replace(/[`*]/g, '').trim()).filter(Boolean);
}

function audit(j) {
  if (!j || j.hook_event_name !== 'Stop') return '';
  const said = declared(typeof j.last_assistant_message === 'string' ? j.last_assistant_message : require('./defter.js').lastText(j));
  if (!said) return '';
  const { list } = used(j);
  const base = (s) => path.basename(s).replace(/\.md$/i, '').toLowerCase();
  const got = list.map(base);
  const want = said.map(base);
  if (want.every((s) => got.includes(s)) && got.every((s) => want.includes(s))) return '';
  const msg = banner('banner.booksDiff', { '%D': said.join(' · '), '%R': list.join(' · ') || '-' });
  say(j.session_id, msg);
  return msg;
}

module.exports = { line, audit, books, turn, declared, used, entries, transcript };
