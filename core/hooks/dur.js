#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { main, read, merge, settings, stateFile, errorLog, t, banner, say, replyLang } = require('./lib.js');
const count = require('./count.js');
const { file, sum } = count;

function off() {
  return settings().evidence === false || process.env.TEKNESYUM_KANIT === '0';
}

const CODE = /\.(js|mjs|cjs|jsx|ts|tsx|py|go|rs|java|rb|php|c|h|cc|cpp|cs|swift|kt|sh|bash|ps1|sql|json|ya?ml|toml)$/i;
const ITEM = /^\s*[-*]\s+\S/;
const DONE = /^\s*[-*]\s+\[[xX]\]/;
const REASON = /\s(—|–|--)\s+\S/;

function code(st) {
  return Object.keys(st.files || {}).filter((n) => CODE.test(n));
}

function proven(st, now) {
  return (st.tests || []).some((r) => r.ok !== false && r.sum === now);
}

const TR_CHARS = /[çğışöüÇĞİŞÖÜ]/;
const TR_WORDS = new Set(['ve', 'bir', 'bu', 'için', 'ile', 'da', 'de', 'değil', 'olarak', 'var', 'yok', 'ama', 'çok', 'daha', 'gibi', 'sonra', 'şimdi', 'ne', 'mi', 'ya', 'her', 'kez', 'yani']);
const EN_WORDS = new Set(['the', 'and', 'is', 'are', 'was', 'to', 'of', 'for', 'with', 'that', 'this', 'it', 'in', 'on', 'not', 'now', 'be', 'so', 'but', 'you', 'we', 'i', 'have', 'has', 'what', 'which', 'from']);

function english(text) {
  const prose = String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\S*[\/\\]\S*/g, ' ');
  const words = prose.toLowerCase().match(/[a-zçğıöşü']+/g) || [];
  if (words.length < 25) return false;
  let en = 0;
  let tr = 0;
  for (const w of words) {
    if (EN_WORDS.has(w)) en += 1;
    else if (TR_WORDS.has(w) || TR_CHARS.test(w)) tr += 1;
  }
  return en >= 5 && en > tr * 3;
}

function language(j) {
  if (settings().langCheck === false || replyLang() !== 'tr') return '';
  const said = typeof j.last_assistant_message === 'string' ? j.last_assistant_message : require('./defter.js').lastText(j);
  if (!english(said)) return '';
  say(j.session_id, banner('banner.lang'));
  return t('dur.lang');
}

function jobs(j) {
  const mark = stateFile('jobs-' + String(j.session_id || 'none'));
  let want = null;
  try { want = JSON.parse(fs.readFileSync(mark, 'utf8')); fs.unlinkSync(mark); } catch {}
  if (settings().jobs === false) return '';
  let body = null;
  try { body = fs.readFileSync(path.join(j.cwd || process.cwd(), '.claude', 'jobs.md'), 'utf8'); } catch {}
  if (body === null) {
    if (!want || !want.n) return '';
    say(j.session_id, banner('banner.jobsMissing', { '%N': want.n }));
    return t('dur.jobsMissing').replace('%N', String(want.n));
  }
  const rows = body.split(/\r?\n/).filter((l) => ITEM.test(l));
  if (want && want.n > rows.length) {
    say(j.session_id, banner('banner.jobsShort', { '%N': want.n, '%M': rows.length }));
    return t('dur.jobsShort').replace('%N', String(want.n)).replace('%M', String(rows.length));
  }
  const left = rows.filter((l) => !DONE.test(l) && !REASON.test(l)).map((l) => l.trim());
  if (!left.length) return '';
  say(j.session_id, banner('banner.jobsOpen', { '%N': left.length }));
  return t('dur.jobs').replace('%N', String(left.length)) + '\n' + left.join('\n');
}

function evidence(j) {
  if (off()) return '';
  const f = file(j);
  const st = read(f);
  if (!st) return '';
  if (!code(st).length) return '';
  const seq = Number(st.seq) || 0;
  if (seq === st.stopSeq) return '';
  const now = sum(st.cwd || j.cwd || process.cwd(), Object.keys(st.files || {}));
  merge(f, { stopSum: now, stopSeq: seq });
  if (st.stopSum === now || proven(st, now)) return '';
  say(j.session_id, banner('banner.evidence', { '%N': code(st).length }));
  return t('dur.evidence');
}

const UI = /\.(tsx|jsx|vue|svelte|css|scss|less|html|axaml|xaml)$/i;
const WRITES = /^(Write|Edit|MultiEdit|NotebookEdit)$/;

function desktop(cwd, files) {
  if (files.some((f) => /\.(axaml|xaml)$/i.test(f))) return true;
  if (fs.existsSync(path.join(cwd, 'src-tauri'))) return true;
  try { return /"electron"/.test(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')); } catch { return false; }
}

function shot(u, native) {
  const n = String(u.name || '');
  const i = JSON.stringify(u.input || {});
  if (/computer-use__(screenshot|zoom)$/.test(n)) return true;
  if (/computer-use__computer_batch$/.test(n)) return /screenshot/.test(i);
  if (n === 'Read') return /\.(png|jpe?g|webp|bmp)"/i.test(i);
  if (n === 'Bash' || n === 'PowerShell') return /screenshot|CopyFromScreen|ekran.?goruntu/i.test(i);
  if (native) return false;
  return /Browser|chrome|preview/i.test(n) && /screenshot/.test(n + i);
}

function ui(j) {
  if (settings().ui === false) return '';
  const kitap = require('./kitap.js');
  const file = kitap.transcript(j);
  if (!file) return '';
  const { id, uses } = kitap.turn(kitap.entries(file));
  const edits = uses.map((u, k) => ({ k, f: String((u.input || {}).file_path || '') })).filter((e) => WRITES.test(uses[e.k].name) && UI.test(e.f));
  if (!edits.length) return '';
  const cwd = j.cwd || process.cwd();
  const native = desktop(cwd, edits.map((e) => e.f));
  if (uses.slice(edits[edits.length - 1].k + 1).some((u) => shot(u, native))) return '';
  const mark = stateFile('ui-' + String(j.session_id || 'none'));
  if (read(mark) && read(mark).turn === id) return '';
  try { require('./lib.js').write(mark, { turn: id }); } catch {}
  say(j.session_id, banner('banner.ui', { '%N': edits.length }));
  return t(native ? 'dur.uiNative' : 'dur.ui');
}

function decide(j) {
  if (j.hook_event_name !== 'Stop') return null;
  if (j.stop_hook_active) return null;
  const why = [jobs(j), require('./defter.js').short(j), evidence(j), ui(j), language(j)].filter(Boolean);
  return why.length ? { decision: 'block', reason: why.join('\n\n') } : null;
}

function stop(j) {
  if (j.hook_event_name === 'Stop') {
    try { count.handle(j); } catch (e) { errorLog('count.js', e); }
    try { require('./kitap.js').audit(j); } catch (e) { errorLog('kitap.js', e); }
  }
  return decide(j);
}

if (require.main === module) main(stop);

module.exports = { ui, shot, stop, decide, proven, off, code, jobs, english, language, CODE };
