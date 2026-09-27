#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { openLogs, coreRepo, uiRepo, stateFile, fold } = require('../hooks/lib.js');

const UI = /teknesyum-ui|\bui\s+(eklenti|plugin)|\b(scaffold|scan|uc|artik|raf|esle|setup)\.js\b|\btemplates\/(durum|kur|denetim)\b/i;

function target(o) {
  const to = String(o.to || '').toLowerCase();
  if (to === 'ui' || to === 'core') return to;
  return UI.test([o.title, o.symptom].join(' ')) ? 'ui' : 'core';
}

function dirs() {
  const out = [openLogs('core')];
  if (uiRepo()) out.push(openLogs('ui'));
  return out;
}

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
  const out = [];
  for (const dir of dirs()) {
    let f = [];
    try {
      f = fs.readdirSync(dir).filter((x) => x.endsWith('.md'));
    } catch {}
    if (out.length) out.push('');
    if (!f.length) out.push('No open bug logs.', '  ' + dir);
    else out.push(f.length + ' open bug log(s) — ' + dir, '', ...f.map((x) => '  ' + x.slice(0, -3)));
  }
  say(out);
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
  const to = target(o);
  const dir = openLogs(to);
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
  const lines = ['Wrote ' + name + (to === 'ui' && uiRepo() ? ' (teknesyum-ui)' : ''), '  ' + file];
  if (!coreRepo())
    lines.push(
      '',
      'No core repo found, so this went to the fallback spool.',
      'Set coreRepo in ' + stateFile('config') + ' and move it there.'
    );
  lines.push('', kind === 'hata' ? 'Fill in sections 1 and 2 now.' : 'Fill in every section now.');
  say(lines);
}

function find(id) {
  const want = slug(id.replace(/\.md$/i, ''));
  for (const dir of dirs()) {
    const exact = path.join(dir, id.endsWith('.md') ? id : PREFIX + slug(id) + '.md');
    if (fs.existsSync(exact)) return exact;
    const hit = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).find(
      (f) => f.endsWith('.md') && slug(f.slice(0, -3)).endsWith(want)
    );
    if (hit) return path.join(dir, hit);
  }
  die('not found: ' + id);
}

function route(o) {
  if (!o.id) die('--id is required');
  const to = String(o.to || '').toLowerCase();
  if (to !== 'ui' && to !== 'core') die('--to is ui or core');
  if (to === 'ui' && !uiRepo()) die('no teknesyum-ui repo found; set uiRepo in ' + stateFile('config'));
  const from = find(String(o.id));
  const dir = openLogs(to);
  const dest = path.join(dir, path.basename(from));
  if (path.resolve(dest) === path.resolve(from)) return say(['Already there: ' + dest]);
  fs.mkdirSync(dir, { recursive: true });
  fs.renameSync(from, dest);
  say(['Moved ' + path.basename(from), '  ' + dest]);
}

function move(o, archive) {
  if (!o.id) die('--id is required');
  const from = find(String(o.id));
  const dir = path.dirname(from);
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
else if (cmd === 'route') route(o);
else die('usage: log.js [list|write [--kind hata|yontem|teklif] [--to ui|core] --title T --symptom S|close --id X|archive --id X|route --id X --to ui|core]');
