#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { openLogs, coreRepo, stateFile, fold } = require('../hooks/lib.js');

const PREFIX = 'BUG-';
const KINDS = {
  hata: PREFIX,
  yontem: 'YONTEM-',
  teklif: 'TEKLIF-',
};

function slug(s) {
  return fold(String(s))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 70);
}

function flags(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const k = argv[i].slice(2);
    const v = argv[i + 1];
    o[k] = v && !v.startsWith('--') ? v : true;
    if (o[k] !== true) i++;
  }
  return o;
}

function list() {
  const dir = openLogs();
  let f = [];
  try {
    f = fs.readdirSync(dir).filter((x) => x.endsWith('.md'));
  } catch {}
  if (!f.length) return say(['No open bug logs.', '  ' + dir]);
  say([f.length + ' open bug log(s) — ' + dir, ''].concat(f.map((x) => '  ' + x.slice(0, -3))));
}

function note(kind, o) {
  const yontem = kind === 'yontem';
  return [
    '# ' + (yontem ? 'Yöntem: ' : 'Teklif: ') + o.title,
    '',
    '**State:** open',
    '**Tür:** ' + (yontem ? 'Yöntem' : 'Teklif'),
    '**İlk görüldüğü yer:** ' + (o.project || path.basename(process.cwd())) + ', ' + new Date().toISOString().slice(0, 10),
    '**Amaç:** ' + (o.symptom || '(fill in)'),
    '',
    '## ' + (yontem ? 'Karar' : 'Durum'),
    '',
    '(fill in)',
    '',
    '## ' + (yontem ? 'Neden' : 'Teklif'),
    '',
    '(fill in)',
    '',
    '## Core İçin Öneri',
    '',
    '(What Core should change. Without it the log cannot be closed.)',
    '',
  ].join('\n');
}

function write(o) {
  if (!o.title) die('--title is required');
  const dir = openLogs();
  fs.mkdirSync(dir, { recursive: true });
  const kind = String(o.kind || 'hata').toLowerCase();
  if (!KINDS[kind]) die('--kind is one of: ' + Object.keys(KINDS).join(', '));
  const name = KINDS[kind] + slug(o.title) + '.md';
  const file = path.join(dir, name);
  if (fs.existsSync(file)) die('already exists: ' + name);
  const body = kind !== 'hata' ? note(kind, o) : [
    '# Bug: ' + o.title,
    '',
    '**State:** open',
    '**Symptom:** ' + (o.symptom || '(fill in)'),
    '**Source:** ' + (o.source || 'session ' + new Date().toISOString().slice(0, 10)),
    '**Seen in:** ' + (o.project || path.basename(process.cwd())),
    '',
    '---',
    '',
    '## 1. What happened',
    '',
    '(What was done, what was expected, what happened. Repro steps and any measurement.)',
    '',
    '## 2. Measure',
    '',
    '(The one thing that proves this is fixed. Without it the log cannot be closed.)',
    '',
  ].join('\n');
  fs.writeFileSync(file, body, 'utf8');
  const lines = ['Wrote ' + name, '  ' + file];
  if (!coreRepo())
    lines.push(
      '',
      'No core repo found, so this went to the fallback spool.',
      'Set coreRepo in ' + stateFile('config') + ' and move it there.'
    );
  lines.push('', kind === 'hata' ? 'Fill in sections 1 and 2 now.' : 'Fill in every section now.');
  say(lines);
}

function move(o, archive) {
  if (!o.id) die('--id is required');
  const dir = openLogs();
  let from = path.join(dir, o.id.endsWith('.md') ? o.id : PREFIX + slug(o.id) + '.md');
  if (!fs.existsSync(from)) {
    const want = slug(String(o.id).replace(/\.md$/i, ''));
    const hit = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).find(
      (f) => f.endsWith('.md') && slug(f.slice(0, -3)).endsWith(want)
    );
    if (!hit) die('not found: ' + path.basename(from));
    from = path.join(dir, hit);
  }
  if (!archive) {
    fs.unlinkSync(from);
    return say(['Closed and deleted ' + path.basename(from)]);
  }
  const to = path.join(dir, 'closed', path.basename(from));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  let b = fs.readFileSync(from, 'utf8').replace(/^\*\*State:\*\*.*$/m, '**State:** closed');
  fs.writeFileSync(to, b, 'utf8');
  fs.unlinkSync(from);
  say(['Archived ' + path.basename(from), '  ' + to]);
}

function say(lines) {
  process.stdout.write(lines.join('\n') + '\n');
}

function die(m) {
  process.stderr.write(m + '\n');
  process.exit(1);
}

const [cmd, ...rest] = process.argv.slice(2);
const o = flags(rest);
if (cmd === 'write') write(o);
else if (cmd === 'list' || !cmd) list();
else if (cmd === 'close') move(o, false);
else if (cmd === 'archive') move(o, true);
else die('usage: log.js [list|write [--kind hata|yontem|teklif] --title T --symptom S|close --id X|archive --id X]');
