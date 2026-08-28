const path = require('path');

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
  if (j.hook_event_name !== 'MessageDisplay') return '';
  const head = j.index === 0;
  const foot = !!j.final;
  if (!head && !foot) return '';
  const line = notice(j.cwd || process.cwd());
  if (!line) return '';

  const delta = String(j.delta || '');
  let body = foot ? delta.replace(/\s+$/, '') : delta;
  if (head) body = body ? line + '\n\n' + body : line;
  if (foot && body !== line) body = body ? body + '\n\n' + line : line;

  return JSON.stringify({
    hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: body },
  });
}

function notice(cwd) {
  try {
    const { banner } = require(path.join(__dirname, '..', 'scripts', 'statusline.js'));
    return banner(cwd);
  } catch {
    return '';
  }
}
