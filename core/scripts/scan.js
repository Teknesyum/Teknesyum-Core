#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const lib = require('../hooks/lib.js');

const argv = process.argv.slice(2);
const PROFILES = ['eco', 'normal', 'premium'];
const FILE_MAX = 5;
const DOCS = {
  eco: ['README.md'],
  normal: ['README.md', 'CHANGELOG.md'],
  premium: ['README.md', 'CHANGELOG.md', 'README.tr.md'],
};
const LICENSE_FAMILY = [
  ['agpl', /AFFERO|AGPL/i],
  ['gpl', /GNU GENERAL PUBLIC LICENSE|(^|[^A-Z])GPL/i],
  ['lgpl', /LESSER|LGPL/i],
  ['mit', /\bMIT\b/],
  ['apache', /apache/i],
  ['bsd', /\bBSD\b/i],
  ['mpl', /mozilla|\bMPL\b/i],
  ['unlicense', /unlicense/i],
];

function read(f) {
  try {
    return fs.readFileSync(f, 'utf8');
  } catch {
    return '';
  }
}

function json(f) {
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch {
    return null;
  }
}

function git(root, ...args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 20000 });
  return r.error || r.status !== 0 ? null : String(r.stdout || '');
}

function family(text) {
  if (!text) return '';
  for (const [name, re] of LICENSE_FAMILY) if (re.test(text)) return name;
  return 'other';
}

function version(root) {
  const man = json(path.join(root, 'core', '.claude-plugin', 'plugin.json')) || json(path.join(root, '.claude-plugin', 'plugin.json'));
  const pkg = json(path.join(root, 'package.json'));
  return String((man && man.version) || (pkg && pkg.version) || '');
}

function check(name, fn) {
  try {
    const r = fn();
    if (typeof r === 'string') return { name, ok: true, measure: r, fix: '' };
    return { name, ok: !!r.ok, measure: String(r.measure || ''), fix: String(r.fix || '') };
  } catch (e) {
    return { name, ok: false, measure: String((e && e.message) || e), fix: '' };
  }
}

function licenseOk(root) {
  const text = read(path.join(root, 'LICENSE')) || read(path.join(root, 'LICENSE.md')) || read(path.join(root, 'LICENSE.txt'));
  if (!text) return { ok: false, measure: 'no LICENSE file', fix: 'add one, or run scaffold.js license' };
  const want = family(text.slice(0, 400));
  const surfaces = [];
  const pkg = json(path.join(root, 'package.json'));
  if (pkg && pkg.license) surfaces.push(['package.json', family(String(pkg.license))]);
  for (const m of ['core/.claude-plugin/plugin.json', '.claude-plugin/plugin.json']) {
    const j = json(path.join(root, m));
    if (j && j.license) surfaces.push([m, family(String(j.license))]);
  }
  const readme = read(path.join(root, 'README.md'));
  const said = (readme.match(/\b(AGPL|LGPL|GPL|MIT|Apache|BSD|MPL|Unlicense)[-\s]?[0-9.]*/g) || []).map((s) => family(s));
  if (said.length) surfaces.push(['README.md', said.find((s) => s !== want) || want]);
  const off = surfaces.filter(([, f]) => f !== want);
  if (off.length)
    return { ok: false, measure: 'LICENSE is ' + want + ', but ' + off.map(([n, f]) => n + ' says ' + f).join(', '), fix: 'make every surface name the same license' };
  return want + ' on ' + (surfaces.length + 1) + ' surfaces';
}

function planOk(root) {
  const stat = git(root, 'diff', '--stat', 'HEAD', '--');
  const touched = stat ? stat.split('\n').filter((l) => /\|/.test(l)).length : 0;
  const plan = fs.existsSync(path.join(root, 'docs', 'plan.md'));
  if (touched >= FILE_MAX && !plan)
    return { ok: false, measure: touched + ' files changed since HEAD and no docs/plan.md', fix: 'write docs/plan.md, or commit what is done' };
  return touched + ' files changed since HEAD' + (plan ? ', plan on disk' : '');
}

function handoffOk(root) {
  const f = path.join(root, '.claude', 'handoff.md');
  if (!fs.existsSync(f)) return 'none waiting';
  const body = read(f);
  const holes = ['decisions', 'next_action'].filter((s) => new RegExp('## ' + s + '\\s*\\n\\s*\\(fill\\)').test(body));
  if (holes.length) return { ok: false, measure: 'handoff.md still says (fill) under ' + holes.join(' and '), fix: 'write those two sections, they are the only ones the machine cannot' };
  const head = git(root, 'log', '-1', '--format=%ct');
  const at = Math.floor(fs.statSync(f).mtimeMs / 1000);
  if (head && Number(head.trim()) > at) return { ok: false, measure: 'handoff.md is older than the last commit', fix: 'it will be rewritten at session end; if the work is done, move it to trash/' };
  return 'filled, newer than HEAD';
}

function docsOk(root, profile) {
  const v = version(root);
  if (!v) return { ok: false, measure: 'no version in package.json or the plugin manifest', fix: 'add one' };
  const missing = [];
  const stale = [];
  for (const d of DOCS[profile]) {
    const text = read(path.join(root, d));
    if (!text) {
      missing.push(d);
      continue;
    }
    if (d === 'CHANGELOG.md') {
      if (!new RegExp('^##\\s*\\[?v?' + v.replace(/\./g, '\\.') + '\\]?', 'm').test(text)) stale.push(d + ' has no section for ' + v);
      continue;
    }
    const tags = text.match(/\/v([0-9]+\.[0-9]+\.[0-9]+)\/install\./g) || [];
    const wrong = tags.filter((t) => !t.includes('/v' + v + '/'));
    if (wrong.length) stale.push(d + ' installs ' + wrong[0].replace(/^\/|\/install\.$/g, '') + ', not v' + v);
  }
  if (missing.length || stale.length)
    return { ok: false, measure: [].concat(missing.map((m) => m + ' is missing'), stale).join('; '), fix: 'release.js cut rewrites the install lines and the changelog' };
  return DOCS[profile].length + ' documents agree on v' + v;
}

function testsOk(root) {
  const pkg = json(path.join(root, 'package.json'));
  if (!pkg) return 'no package.json, nothing to run';
  const s = pkg.scripts && pkg.scripts.test;
  if (!s || /no test specified/.test(s)) return { ok: false, measure: 'package.json has no test script', fix: 'add one; the count hook records what it runs' };
  return 'npm test -> ' + s;
}

function trashOk(root) {
  const dir = path.join(root, 'trash');
  if (!fs.existsSync(dir)) return 'no trash/ yet';
  const names = new Set();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name));
      else if (/\.(js|mjs|cjs|json|md)$/.test(e.name)) names.add(e.name);
    }
  };
  walk(dir);
  if (!names.size) return 'empty';
  const live = (git(root, 'ls-files', '--', ':!trash', ':!docs', ':!bench', ':!*.md', ':!.gitignore') || '').split('\n').filter(Boolean);
  const ignored = read(path.join(root, '.gitignore'));
  for (const n of [...names]) if (live.some((f) => path.basename(f) === n) || ignored.includes(n)) names.delete(n);
  if (!names.size) return 'every retired name has a live twin';
  const hits = [];
  for (const f of live) {
    const text = read(path.join(root, f));
    for (const n of names) if (n !== path.basename(f) && text.includes(n)) hits.push(n + ' <- ' + f);
  }
  if (hits.length) return { ok: false, measure: hits.slice(0, 5).join('; '), fix: 'a live file still names something in trash/: restore it, or cut the reference' };
  return names.size + ' retired files, none referenced by live code';
}

function mapOk(root) {
  const st = require('./map.js').staleness(root, path.join(root, '.claude'));
  if (st.state === 'missing') return { ok: false, measure: 'no import map', fix: 'node <plugin>/scripts/map.js .' };
  if (st.state === 'stale') return { ok: false, measure: 'map is ' + (st.behind === null ? 'behind HEAD' : st.behind + ' commits behind'), fix: 'node <plugin>/scripts/map.js .' };
  if (st.state === 'unsealed') return { ok: false, measure: 'map does not name its commit', fix: 'rebuild it' };
  return 'current with HEAD';
}

function run(root, profile) {
  return [
    check('license', () => licenseOk(root)),
    check('plan', () => planOk(root)),
    check('handoff', () => handoffOk(root)),
    check('docs', () => docsOk(root, profile)),
    check('tests', () => testsOk(root)),
    check('trash', () => trashOk(root)),
    check('map', () => mapOk(root)),
  ];
}

function profileOf() {
  const given = argv.find((a) => PROFILES.includes(a));
  if (given) return given;
  const cfg = lib.read(lib.stateFile('config')) || {};
  return PROFILES.includes(cfg.profile) ? cfg.profile : 'normal';
}

function main() {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(
      [
        'scan.js [eco|normal|premium] [--json]',
        '',
        'Reads the project as it stands and says what falls short: license surfaces, plan',
        'against the five-file threshold, handoff holes, documents against the version, a',
        'test script, trash/ references, the import map. Nothing is written, no model runs.',
        'The profile only widens the document set; it defaults to the one in your config.',
      ].join('\n') + '\n'
    );
    return;
  }
  const root = process.cwd();
  const profile = profileOf();
  const rows = run(root, profile);
  if (argv.includes('--json')) {
    process.stdout.write(JSON.stringify({ profile, rows }, null, 2) + '\n');
    return process.exit(rows.every((r) => r.ok) ? 0 : 1);
  }
  const width = rows.reduce((n, r) => Math.max(n, r.name.length), 0);
  process.stdout.write('scan ' + profile + ' · ' + path.basename(root) + (version(root) ? ' v' + version(root) : '') + '\n\n');
  for (const r of rows) {
    process.stdout.write((r.ok ? 'ok   ' : 'SHORT ') + r.name.padEnd(width) + '  ' + r.measure + '\n');
    if (!r.ok && r.fix) process.stdout.write(' '.repeat(width + 8) + '-> ' + r.fix + '\n');
  }
  const bad = rows.filter((r) => !r.ok).length;
  process.stdout.write('\n' + (bad ? bad + ' of ' + rows.length + ' short.' : 'All ' + rows.length + ' pass.') + '\n');
  return process.exit(bad ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run, PROFILES };
