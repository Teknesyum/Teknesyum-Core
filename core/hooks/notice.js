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

  const cwd = j.cwd || process.cwd();
  const top = head ? notice(cwd, 'head') : '';
  const end = foot ? notice(cwd, 'foot') : '';
  if (!top && !end) return '';

  const delta = String(j.delta || '');
  let body = foot ? delta.replace(/\s+$/, '') : delta;
  if (head && top) body = body ? top + '\n\n' + body : top;
  if (foot && end && body !== end && (delta.trim() || !body)) body = body ? body + '\n\n' + end : end;

  return JSON.stringify({
    hookSpecificOutput: { hookEventName: 'MessageDisplay', displayContent: body },
  });
}

function notice(cwd, phase) {
  try {
    const { banner } = require(path.join(__dirname, '..', 'scripts', 'statusline.js'));
    return banner(cwd, phase);
  } catch {
    return '';
  }
}
