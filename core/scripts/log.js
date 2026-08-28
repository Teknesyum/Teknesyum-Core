#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { configRoot, read, settings } = require('../hooks/lib.js');

const PREFIX = 'BUG-';

function repoRoot() {
  const seen = [process.env.TEKNESYUM_CORE, settings().coreRepo];
  let d = path.resolve(__dirname, '..', '..');
  for (;;) {
    seen.push(d);
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  for (const c of seen) {
    try {
      if (c && fs.existsSync(path.join(c, 'core', '.claude-plugin', 'plugin.json'))) return c;
    } catch {}
  }
  return null;
}

function openDir() {
  const repo = repoRoot();
  return repo
    ? path.join(repo, 'logs', 'openlogs')
    : path.join(configRoot(), 'teknesyum', 'openlogs');
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
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
  const dir = openDir();
  let f = [];
  try {
    f = fs.readdirSync(dir).filter((x) => x.endsWith('.md'));
  } catch {}
  if (!f.length) return say(['No open bug logs.', '  ' + dir]);
  say([f.length + ' open bug log(s) — ' + dir, ''].concat(f.map((x) => '  ' + x.slice(0, -3))));
}

function write(o) {
  if (!o.title) die('--title is required');
  const dir = openDir();
  fs.mkdirSync(dir, { recursive: true });
  const name = PREFIX + slug(o.title) + '.md';
  const file = path.join(dir, name);
  if (fs.existsSync(file)) die('already exists: ' + name);
  const body = [
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
  say(['Wrote ' + name, '  ' + file, '', 'Fill in sections 1 and 2 now.']);
}

function move(o, archive) {
  if (!o.id) die('--id is required');
  const dir = openDir();
  const from = path.join(dir, o.id.endsWith('.md') ? o.id : PREFIX + slug(o.id) + '.md');
  if (!fs.existsSync(from)) die('not found: ' + path.basename(from));
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
else die('usage: log.js [list|write --title T --symptom S|close --id X|archive --id X]');
