const path = require('path');

const CAP = 120;

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let out = '';
  try {
    out = build(JSON.parse(raw));
  } catch {}
  if (out) process.stdout.write(out);
  process.exit(0);
});

function build(j) {
  if (j.hook_event_name !== 'MessageDisplay' || !j.final) return '';
  const line = notice(j.cwd || process.cwd());
  if (!line) return '';
  const delta = String(j.delta || '');
  const body = delta ? delta.replace(/\s+$/, '') + '\n\n' + line : line;
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: body },
  });
}

function notice(cwd) {
  try {
    const { relayRoot } = require('./lib.js');
    if (!relayRoot(cwd, { git: false })) return '';
    const { summary } = require(path.join(__dirname, '..', 'scripts', 'statusline.js'));
    const t = summary(cwd);
    if (!t) return '';
    return ('Teknesyum ▸ ' + t.replace(/^[^·]*·\s*/, '')).slice(0, CAP);
  } catch {
    return '';
  }
}
