const fs = require('fs');
const path = require('path');
const { read, write, safe, projectRoot } = require('../hooks/lib.js');

const DIR = 'docs/danisma';
const PENDING = '_pending.json';
const TAIL = 2 * 1024 * 1024;

function dir(relay) {
  return path.join(projectRoot(relay), DIR);
}

function pendingFile(relay) {
  return path.join(dir(relay), PENDING);
}

function slugOf(text) {
  const s = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return s || 'danisma';
}

function nextNumber(at) {
  let top = 0;
  let names = [];
  try {
    names = fs.readdirSync(at);
  } catch {
    return 1;
  }
  for (const n of names) {
    const m = /^(\d{3})-/.exec(n);
    if (m) top = Math.max(top, Number(m[1]));
  }
  return top + 1;
}

function lastReply(transcript) {
  let body = '';
  try {
    const size = fs.statSync(transcript).size;
    const fd = fs.openSync(transcript, 'r');
    const from = Math.max(0, size - TAIL);
    const buf = Buffer.alloc(size - from);
    fs.readSync(fd, buf, 0, buf.length, from);
    fs.closeSync(fd);
    body = buf.toString('utf8');
  } catch {
    return '';
  }
  const lines = body.split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    let row = null;
    try {
      row = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    if (!row || row.type !== 'assistant') continue;
    const content = row.message && row.message.content;
    if (!Array.isArray(content)) continue;
    const text = content
      .filter((b) => b && b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (text) return text;
  }
  return '';
}

function open(relay, o) {
  const at = dir(relay);
  try {
    fs.mkdirSync(at, { recursive: true });
  } catch {
    return '';
  }
  const n = nextNumber(at);
  const name = String(n).padStart(3, '0') + '-' + safe(slugOf(o.topic || o.model)) + '.md';
  const file = path.join(at, name);
  const body = [
    '# ' + (o.topic || 'Danisma'),
    '',
    '- soran: ' + (o.asker || 'T0'),
    '- danisilan: ' + (o.model || ''),
    '- tarih: ' + new Date().toISOString().slice(0, 10),
    '',
    '## Sorulan',
    '',
    String(o.prompt || '').trim(),
    '',
    '## Donen',
    '',
    '_cevap bekleniyor_',
    '',
  ].join('\n');
  try {
    fs.writeFileSync(file, body);
  } catch {
    return '';
  }
  const cur = read(pendingFile(relay));
  const list = Array.isArray(cur) ? cur : [];
  list.push({ file: name, model: String(o.model || ''), toolUseId: String(o.toolUseId || ''), runId: '', at: Date.now() });
  write(pendingFile(relay), list.slice(-8));
  return name;
}

function bind(relay, toolUseId, runId) {
  if (!toolUseId || !runId) return false;
  const cur = read(pendingFile(relay));
  const list = Array.isArray(cur) ? cur : [];
  const matches = list.filter((x) => x.toolUseId === String(toolUseId));
  if (matches.length !== 1) return false;
  matches[0].runId = String(runId);
  write(pendingFile(relay), list);
  return true;
}

function close(relay, model, transcript, runId) {
  const cur = read(pendingFile(relay));
  const list = Array.isArray(cur) ? cur : [];
  if (!list.length) return '';
  // Completion order and model are not identities. An unrelated builder must
  // never become the answer to a pending advisor question.
  if (!runId) return '';
  const matches = list.filter((x) => x.runId === String(runId));
  if (matches.length !== 1) return '';
  const i = list.indexOf(matches[0]);
  const entry = list[i];
  const reply = lastReply(transcript);
  if (!reply) return '';
  const file = path.join(dir(relay), entry.file);
  let body = '';
  try {
    body = fs.readFileSync(file, 'utf8');
  } catch {
    list.splice(i, 1);
    write(pendingFile(relay), list);
    return '';
  }
  try {
    fs.writeFileSync(file, body.replace('_cevap bekleniyor_', reply.trim()));
  } catch {
    return '';
  }
  list.splice(i, 1);
  write(pendingFile(relay), list);
  return entry.file;
}

function list(relay) {
  let names = [];
  try {
    names = fs.readdirSync(dir(relay)).filter((n) => /^\d{3}-.*\.md$/.test(n));
  } catch {
    return [];
  }
  return names.sort();
}

function main(argv) {
  const cmd = argv[0];
  const rel = require('../hooks/lib.js').relayRoot(process.cwd(), { git: false });
  if (!rel) {
    process.stdout.write('no relay here\n');
    return 1;
  }
  if (cmd === 'list') {
    const rows = list(rel.relay);
    process.stdout.write(rows.length ? rows.join('\n') + '\n' : 'nothing recorded\n');
    return 0;
  }
  process.stdout.write('usage: advice.js list\n');
  return 1;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));

module.exports = { open, bind, close, list, lastReply, slugOf, DIR };
