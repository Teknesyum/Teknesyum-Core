const { relayRoot } = require('./lib.js');
const { summary } = require('../scripts/statusline.js');

const MAX = 120;

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let out = '';
  try {
    out = title(JSON.parse(raw));
  } catch {}
  if (out) process.stdout.write(JSON.stringify({ terminalSequence: osc(out) }));
  process.exit(0);
});

function osc(text) {
  return '\u001b]0;' + text + '\u0007';
}

function title(j) {
  const cwd = j.cwd || (j.workspace && j.workspace.current_dir) || process.cwd();
  const r = relayRoot(cwd, { git: false });
  if (!r) return '';
  const s = summary(cwd);
  if (!s) return '';
  return ('Teknesyum \u25b8 ' + s).slice(0, MAX);
}
