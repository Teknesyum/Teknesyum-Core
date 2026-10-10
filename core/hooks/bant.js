#!/usr/bin/env node
const { main, drain, say, sayBlock, banner } = require('./lib.js');
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
  if (j.final) {
    try { say(j.session_id, kitap.line(j)); } catch {}
    try {
      const raf = require('./defter.js').shelf(j.cwd || process.cwd());
      if (raf.n) sayBlock(j.session_id, '[later.md](' + raf.rel + ') · ' + raf.n, 'raf');
    } catch {}
  }
  const lines = drain(j.session_id);
  if (!lines.length) return cizik === raw ? '' : JSON.stringify({ hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: cizik } });
  const block = lines
    .map((l) => (l && typeof l === 'object' && l.block ? String(l.block) : '`' + String(l).replace(/`/g, "'") + '`'))
    .join('\n\n');
  const delta = cizik;
  const body = !delta.trim() ? block : top ? block + '\n\n' + delta : delta.replace(/\s+$/, '') + '\n\n' + block;
  return JSON.stringify({ hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: body } });
}

if (require.main === module) main(build);

module.exports = { build, serit };
