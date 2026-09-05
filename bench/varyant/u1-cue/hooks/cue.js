const fs = require('fs');
const path = require('path');
const { read, lang } = require('./lib.js');
const count = require('./count.js');

function cue(j) {
  if (j.hook_event_name !== 'UserPromptSubmit') return '';
  const st = read(count.file(j)) || { files: {}, edited: 0, diff: 0, cwd: j.cwd };
  const n = Object.keys(st.files || {}).length;
  const satir = st.edited == null ? st.diff || 0 : st.edited;
  const plan = fs.existsSync(path.join(j.cwd || process.cwd(), 'docs', 'plan.md'));
  if (lang() === 'tr')
    return 'Sayım: ' + n + ' dosya, ' + satir + ' satır, docs/plan.md ' + (plan ? 'var' : 'yok') + '. Tek dosya: yap; beş ve üstü dosya: önce plan.';
  return 'Count: ' + n + ' files, ' + satir + ' lines, docs/plan.md ' + (plan ? 'present' : 'missing') + '. One file: do it; five or more: plan first.';
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = '';
    try { out = cue(JSON.parse(raw)); } catch {}
    if (out) process.stdout.write(out + '\n');
    process.exit(0);
  });
}

module.exports = { cue };
