#!/usr/bin/env node
const { main, drain, say, banner } = require('./lib.js');
const kitap = require('./kitap.js');

const BASLIK = [
  [/^[ \t]*#{1,6}[ \t]*(Ön Özet|Earlier)[ \t]*$/gim, 'banner.onozet'],
  [/^[ \t]*#{1,6}[ \t]*(Özet|Summary)[ \t]*$/gim, 'banner.ozet'],
];

function serit(text) {
  let out = String(text || '');
  for (const [re, key] of BASLIK) out = out.replace(re, () => '`' + banner(key).replace(/`/g, "'") + '`');
  return out;
}

function build(j) {
  if (!j || j.hook_event_name !== 'MessageDisplay') return '';
  const top = j.index === 0;
  const raw = String(j.delta || '');
  const cizik = serit(raw);
  if (!top && !j.final) return cizik === raw ? '' : JSON.stringify({ hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: cizik } });
  let raf = '';
  if (j.final) {
    try { say(j.session_id, kitap.line(j)); } catch {}
    try {
      const r = require('./defter.js').shelf(j.cwd || process.cwd());
      if (r.n && !/later\.md\)/.test(raw)) raf = '[later.md](' + r.rel + ') · ' + r.n;
    } catch {}
  }
  const lines = drain(j.session_id);
  if (!lines.length && !raf) return cizik === raw ? '' : JSON.stringify({ hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: cizik } });
  const block = lines
    .map((l) => (l && typeof l === 'object' && l.block ? String(l.block) : '`' + String(l).replace(/`/g, "'") + '`'))
    .join('\n\n');
  const delta = cizik;
  const ust = !lines.length ? delta : !delta.trim() ? block : top ? block + '\n\n' + delta : delta.replace(/\s+$/, '') + '\n\n' + block;
  const body = raf ? ust.replace(/\s+$/, '') + '\n\n' + raf : ust;
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: body } });
}

if (require.main === module) main(build);

module.exports = { build, serit };
