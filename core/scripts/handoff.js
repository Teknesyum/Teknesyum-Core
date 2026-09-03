const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { relayRoot, projectRoot, liveDir, read } = require('../hooks/lib.js');
const seal = require('../hooks/seal.js');

const argv = process.argv.slice(2);
const INTENT = '## Intent';
const MARK = '<!-- teknesyum:handoff -->';

function git(root, args) {
  const r = spawnSync('git', ['-C', root].concat(args), {
    encoding: 'utf8',
    timeout: 20000,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return '';
  return String(r.stdout || '').trim();
}

function field(name, body) {
  const m = new RegExp('^' + name + ':[ \\t]*(.+)$', 'im').exec(String(body));
  return m ? m[1].trim() : '';
}

function contracts(relay) {
  const dir = path.join(relay, 'contracts');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => /\.md$/i.test(f));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      let body = '';
      try {
        body = fs.readFileSync(path.join(dir, f), 'utf8');
      } catch {}
      const title = (body.match(/^#[ \t]+(.+)$/m) || [])[1] || '';
      return {
        id: f.replace(/\.md$/i, ''),
        status: field('status', body) || 'open',
        round: field('round', body) || '1',
        title: title.trim(),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function closed(relay, n) {
  const rows = seal.ledgerRead(relay) || [];
  return rows
    .filter((r) => r && r.id)
    .slice(-n)
    .reverse();
}

function stuck(relay) {
  const t = read(path.join(liveDir(relay), '_tally.json')) || {};
  const by = t.byAgent || {};
  return Object.keys(by)
    .filter((k) => Number(by[k].fails || 0) >= 2)
    .map((k) => k + ' (' + by[k].fails + ' failures' + (by[k].contract ? ' on ' + by[k].contract : '') + ')');
}

function intentOf(file) {
  let body = '';
  try {
    body = fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
  const i = body.indexOf(INTENT);
  if (i < 0) return '';
  const rest = body.slice(i + INTENT.length);
  const next = /\n## /.exec(rest);
  return (next ? rest.slice(0, next.index) : rest).trim();
}

function render(root, relay, intent) {
  const open = contracts(relay);
  const dirty = git(root, ['status', '--porcelain'])
    .split('\n')
    .filter(Boolean);
  const lines = [];
  lines.push(MARK);
  lines.push('# Handoff');
  lines.push('');
  lines.push('Where this project stands. The facts below are written by a hook and cost');
  lines.push('nothing; the intent under them is written by hand, once, when it changes.');
  lines.push('');
  lines.push(INTENT);
  lines.push('');
  lines.push(intent || '_not written yet - one paragraph on what is being attempted and why._');
  lines.push('');
  lines.push('## Contracts open');
  lines.push('');
  if (!open.length) lines.push('None.');
  else
    for (const c of open)
      lines.push('- `' + c.id + '` — ' + c.status + ', round ' + c.round + (c.title ? ' — ' + c.title : ''));
  lines.push('');
  lines.push('## Closed last');
  lines.push('');
  const last = closed(relay, 5);
  if (!last.length) lines.push('Nothing in the ledger yet.');
  else
    for (const r of last)
      lines.push('- `' + r.id + '` — ' + (r.result || 'done') + (r.at ? ' — ' + String(r.at).slice(0, 16).replace('T', ' ') : ''));
  lines.push('');
  lines.push('## Tree');
  lines.push('');
  lines.push('- branch: `' + (git(root, ['rev-parse', '--abbrev-ref', 'HEAD']) || '?') + '`');
  lines.push('- head: `' + (git(root, ['log', '-1', '--pretty=%h %s']) || '?') + '`');
  lines.push('- uncommitted files: ' + dirty.length);
  const bad = stuck(relay);
  if (bad.length) {
    lines.push('');
    lines.push('## Agents in trouble');
    lines.push('');
    for (const b of bad) lines.push('- ' + b);
  }
  lines.push('');
  return lines.join('\n');
}

function rootArg() {
  const i = argv.indexOf('--root');
  return i >= 0 && argv[i + 1] ? argv[i + 1] : process.cwd();
}

function writeAt(relay, root) {
  const file = path.join(relay, 'HANDOFF.md');
  const body = render(root, relay, intentOf(file));
  let now = '';
  try {
    now = fs.readFileSync(file, 'utf8');
  } catch {}
  if (now === body) return false;
  try {
    fs.writeFileSync(file, body, 'utf8');
  } catch {
    return false;
  }
  return true;
}

function where() {
  const r = relayRoot(rootArg(), { git: false });
  if (!r) return null;
  return { relay: r.relay, root: projectRoot(r.relay), file: path.join(r.relay, 'HANDOFF.md') };
}

function write() {
  const w = where();
  if (!w) return 1;
  writeAt(w.relay, w.root);
  return 0;
}

function show() {
  const w = where();
  if (!w) {
    process.stdout.write('No relay here - nothing to hand over.\n');
    return 1;
  }
  write();
  try {
    process.stdout.write(fs.readFileSync(w.file, 'utf8'));
  } catch {}
  return 0;
}

function intent() {
  const w = where();
  if (!w) return 1;
  const text = argv.slice(1).join(' ').trim();
  if (!text) {
    process.stdout.write('Give the paragraph: handoff.js intent "what is being attempted and why"\n');
    return 2;
  }
  let body = '';
  try {
    body = fs.readFileSync(w.file, 'utf8');
  } catch {
    body = render(w.root, w.relay, '');
  }
  const i = body.indexOf(INTENT);
  if (i < 0) body = render(w.root, w.relay, text);
  else {
    const rest = body.slice(i + INTENT.length);
    const next = /\n## /.exec(rest);
    body = body.slice(0, i + INTENT.length) + '\n\n' + text + '\n' + (next ? rest.slice(next.index) : '\n');
  }
  fs.writeFileSync(w.file, body, 'utf8');
  process.stdout.write('Intent recorded in ' + path.relative(w.root, w.file).replace(/\\/g, '/') + '\n');
  return 0;
}

const OWED = 'OWED.md';
const OWED_CAP = 3;
const OWED_LINE = 60;
const STALE_DAYS = 3;

function owedFile(relay) {
  return path.join(relay, OWED);
}

function owedRead(relay) {
  let body = '';
  try {
    body = fs.readFileSync(owedFile(relay), 'utf8');
  } catch {
    return [];
  }
  const out = [];
  for (const line of body.split('\n')) {
    const m = /^- (\d{4}-\d{2}-\d{2}) (.+)$/.exec(line.trim());
    if (m) out.push({ at: m[1], text: m[2] });
  }
  return out.slice(0, OWED_CAP);
}

function owedWrite(relay, items) {
  const body = items.map((x) => '- ' + x.at + ' ' + x.text).join('\n');
  fs.writeFileSync(owedFile(relay), body ? body + '\n' : '', 'utf8');
}

function ageDays(at) {
  const t = Date.parse(at + 'T00:00:00Z');
  if (!t) return 0;
  return Math.max(0, Math.floor((Date.now() - t) / 86400000));
}

function owedCue(relay) {
  const items = owedRead(relay);
  if (!items.length) return '';
  const parts = items.map((x) => {
    const d = ageDays(x.at);
    return x.text + (d >= STALE_DAYS ? ' (stale, ' + d + 'd)' : d ? ' (' + d + 'd)' : '');
  });
  return 'owed: ' + parts.join('; ') + ' - do it this turn or tell the user why not';
}

function owe() {
  const w = where();
  if (!w) return 1;
  const add = flag('--add');
  const done = flag('--done');

  if (add) {
    const text = add.replace(/\s+/g, ' ').trim();
    if (!text) return say('Give the sentence: handoff.js owe --add "ask fable about X"');
    if (text.length > OWED_LINE)
      return say('An owed line is at most ' + OWED_LINE + ' characters; this one is ' + text.length + '.');
    const items = owedRead(w.relay);
    if (items.some((x) => x.text === text)) return say('Already owed - nothing added.');
    if (items.length >= OWED_CAP)
      return say(
        'Three is the ceiling and it is full. Close one with --done, or the work is not a',
        'debt at all: open a contract, or put it in the roadmap.'
      );
    items.push({ at: new Date().toISOString().slice(0, 10), text: text });
    owedWrite(w.relay, items);
    return say('Owed (' + items.length + '/' + OWED_CAP + '): ' + text);
  }

  if (done) {
    const n = Number(done);
    const because = flag('--because');
    const items = owedRead(w.relay);
    if (!items.length) return say('Nothing is owed.');
    if (!(n >= 1 && n <= items.length)) return say('Give the number: 1..' + items.length);
    if (!because || !because.trim())
      return say('Say why it is closed: --because "..." - a debt closed in silence is a debt dropped.');
    const gone = items.splice(n - 1, 1)[0];
    owedWrite(w.relay, items);
    trail(w, gone, because.trim());
    return say('Closed: ' + gone.text);
  }

  const items = owedRead(w.relay);
  if (!items.length) return say('Nothing is owed.');
  return say.apply(null, items.map((x, i) => i + 1 + '. ' + x.text + ' (' + ageDays(x.at) + 'd)'));
}

function trail(w, item, because) {
  const line = '- ' + new Date().toISOString().slice(0, 10) + ' closed: ' + item.text + ' - ' + because;
  let body = '';
  try {
    body = fs.readFileSync(w.file, 'utf8');
  } catch {
    body = '';
  }
  const head = '## Closed debts';
  const i = body.indexOf(head);
  if (i < 0) body = body.replace(/\s*$/, '\n\n' + head + '\n\n' + line + '\n');
  else {
    const rest = body.slice(i + head.length);
    body = body.slice(0, i + head.length) + '\n\n' + line + rest.replace(/^\s*\n/, '\n');
  }
  fs.writeFileSync(w.file, body, 'utf8');
}

function flag(name) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? String(argv[i + 1]) : '';
}

function say() {
  process.stdout.write(Array.prototype.slice.call(arguments).join('\n') + '\n');
  return 0;
}

function main() {
  const cmd = argv[0] || 'write';
  if (cmd === 'write') return process.exit(write());
  if (cmd === 'show') return process.exit(show());
  if (cmd === 'intent') return process.exit(intent());
  if (cmd === 'owe') return process.exit(owe());
  process.stdout.write(
    [
      'handoff.js - where the project stands, for whoever opens it next',
      '',
      '  write            refresh the mechanical part (a hook does this; costs nothing)',
      '  show             refresh and print it',
      '  intent "..."     replace the one paragraph a model writes',
      '  owe              list what is owed; --add "...", --done N --because "..."',
      '',
    ].join('\n')
  );
  return process.exit(0);
}

if (require.main === module) main();
module.exports = { render, write, writeAt, intentOf, contracts, owedCue, owedRead, OWED, OWED_CAP, OWED_LINE };
