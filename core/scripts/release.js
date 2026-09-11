const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const path = require('path');
const { spawnSync } = require('child_process');

const argv = process.argv.slice(2);
const ROOT = path.resolve(__dirname, '..', '..');
const NOTES = path.join(ROOT, '.changes');
const BUMPS = ['patch', 'minor', 'major'];
const INSTALLERS = ['install.ps1', 'install.sh'];

function arg(name) {
  const i = argv.indexOf('--' + name);
  return i >= 0 ? argv[i + 1] : null;
}

function git(args) {
  const r = spawnSync('git', ['-C', ROOT].concat(args), {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 60000,
    maxBuffer: 8 * 1024 * 1024,
  });
  return { ok: !r.error && r.status === 0, out: String(r.stdout || '').trim(), err: String(r.stderr || '').trim() };
}

function gh(args, opts) {
  const r = spawnSync('gh', args, {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 120000,
    maxBuffer: 8 * 1024 * 1024,
    shell: process.platform === 'win32',
    input: opts && opts.input,
  });
  return { ok: !r.error && r.status === 0, out: String(r.stdout || '').trim(), err: String(r.stderr || '').trim() };
}

function say(lines, code) {
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(code || 0);
}

function notes() {
  let files = [];
  try {
    files = fs.readdirSync(NOTES).filter((f) => /\.md$/i.test(f));
  } catch {
    return [];
  }
  return files
    .map((f) => {
      const body = fs.readFileSync(path.join(NOTES, f), 'utf8');
      const bump = String((body.match(/^bump:[ \t]*(\w+)/im) || [])[1] || 'patch').toLowerCase();
      const text = body
        .replace(/^bump:.*$/im, '')
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      return { file: f, bump: BUMPS.includes(bump) ? bump : 'patch', text };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

function next(version, bump) {
  const [a, b, c] = String(version).split('.').map(Number);
  if (bump === 'major') return [a + 1, 0, 0].join('.');
  if (bump === 'minor') return [a, b + 1, 0].join('.');
  return [a, b, c + 1].join('.');
}

function current() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
}

function stampJson(file, version) {
  const body = fs.readFileSync(file, 'utf8');
  const out = body.replace(/("version":[ \t]*")[^"]+(")/, '$1' + version + '$2');
  if (out === body) throw new Error('no version field in ' + file);
  fs.writeFileSync(file, out, 'utf8');
}

function stampPins(version) {
  const tag = 'v' + version;
  const files = ['README.md', 'README.tr.md', 'install.ps1', 'install.sh', 'docs/kurulum/cursor-prompt.md'];
  const touched = [];
  for (const f of files) {
    const p = path.join(ROOT, f);
    let body;
    try {
      body = fs.readFileSync(p, 'utf8');
    } catch {
      continue;
    }
    const out = body.replace(/(Teknesyum-Core\/)v\d+\.\d+\.\d+(\/)/g, '$1' + tag + '$2');
    if (out !== body) {
      fs.writeFileSync(p, out, 'utf8');
      touched.push(f);
    }
  }
  return touched;
}

function assets(version, dir) {
  const tag = 'v' + version;
  const files = [];
  for (const f of INSTALLERS) {
    const r = spawnSync('git', ['-C', ROOT, 'show', tag + ':' + f], { windowsHide: true, timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
    if (r.error || r.status !== 0) throw new Error(f + ' is not in tag ' + tag);
    const hex = crypto.createHash('sha256').update(r.stdout).digest('hex');
    fs.writeFileSync(path.join(dir, f), r.stdout);
    fs.writeFileSync(path.join(dir, f + '.sha256'), hex + '  ' + f + '\n', 'utf8');
    files.push(f, f + '.sha256');
  }
  return files;
}

function notesFor(version) {
  let body = '';
  try {
    body = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  } catch {
    return '';
  }
  const head = '## v' + version;
  const lines = body.split('\n');
  const i = lines.findIndex((l) => l.trim() === head);
  if (i < 0) return '';
  const out = [];
  for (const l of lines.slice(i + 1)) {
    if (/^## /.test(l)) break;
    out.push(l);
  }
  return out.join('\n').trim();
}

function publish() {
  const version = arg('version') || current();
  const tag = 'v' + version;
  if (!git(['rev-parse', '-q', '--verify', 'refs/tags/' + tag]).ok) return say([tag + ' is not a tag here. Cut it first.'], 1);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teknesyum-release-'));
  let files;
  try {
    files = assets(version, dir);
  } catch (e) {
    return say([String(e.message || e)], 1);
  }
  const has = gh(['release', 'view', tag, '--json', 'tagName']);
  if (!has.ok) {
    const c = gh(['release', 'create', tag, '--title', tag, '--notes-file', '-'], { input: notesFor(version) + '\n' });
    if (!c.ok) return say(['gh release create failed:', c.err], 1);
  } else {
    const e = gh(['release', 'edit', tag, '--title', tag]);
    if (!e.ok) return say(['gh release edit failed:', e.err], 1);
  }
  const u = gh(['release', 'upload', tag, '--clobber'].concat(files.map((f) => path.join(dir, f))));
  if (!u.ok) return say(['gh release upload failed:', u.err], 1);
  fs.rmSync(dir, { recursive: true, force: true });
  return say([tag + ' is published with ' + files.join(', ') + '.']);
}

function changelog(version, entries) {
  const p = path.join(ROOT, 'CHANGELOG.md');
  let body = '';
  try {
    body = fs.readFileSync(p, 'utf8');
  } catch {
    body = '# Changelog\n';
  }
  const block = ['', '## v' + version, ''].concat(entries.map((e) => '- ' + e)).concat(['']).join('\n');
  const head = body.indexOf('\n## ');
  const out = head < 0 ? body.trimEnd() + '\n' + block : body.slice(0, head) + block + body.slice(head);
  fs.writeFileSync(p, out, 'utf8');
}

function status() {
  const pending = notes();
  const now = current();
  if (!pending.length)
    return say([
      'v' + now + ' is the version on disk, and nothing is waiting to go out.',
      '',
      'Write what changed as it happens:',
      '  node <plugin>/scripts/release.js note --bump patch "what changed"',
    ]);
  const bump = pending.some((n) => n.bump === 'major')
    ? 'major'
    : pending.some((n) => n.bump === 'minor')
      ? 'minor'
      : 'patch';
  const lines = ['v' + now + ' → v' + next(now, bump) + ' (' + bump + ')', ''];
  for (const n of pending) for (const t of n.text) lines.push('- ' + t);
  lines.push('', 'Cut it with: node <plugin>/scripts/release.js cut');
  return say(lines);
}

function note() {
  const bump = String(arg('bump') || 'patch').toLowerCase();
  if (!BUMPS.includes(bump)) return say(['--bump is one of: ' + BUMPS.join(', ')], 2);
  const text = argv.filter((a, i) => a !== 'note' && !/^--/.test(a) && argv[i - 1] !== '--bump').join(' ').trim();
  if (!text) return say(['Say what changed: release.js note --bump patch "the gate stops guessing at shell"'], 2);
  fs.mkdirSync(NOTES, { recursive: true });
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  const stamp = git(['rev-parse', '--short', 'HEAD']).out || 'wip';
  const file = path.join(NOTES, stamp + '-' + (slug || 'change') + '.md');
  fs.writeFileSync(file, 'bump: ' + bump + '\n\n' + text + '\n', 'utf8');
  return say(['Recorded in .changes/' + path.basename(file) + ' - it goes out with the next cut.']);
}

function cut() {
  const pending = notes();
  if (!pending.length) return say(['Nothing is waiting. Write a note first.'], 1);
  const st = git(['status', '--porcelain']);
  if (!st.ok) return say(['git status failed, so the tree cannot be read:', st.err], 1);
  if (st.out) return say(['The tree is dirty. Commit or stash first.'], 1);

  const now = current();
  const bump = pending.some((n) => n.bump === 'major')
    ? 'major'
    : pending.some((n) => n.bump === 'minor')
      ? 'minor'
      : 'patch';
  const version = next(now, bump);
  const entries = pending.flatMap((n) => n.text);

  stampJson(path.join(ROOT, 'package.json'), version);
  stampJson(path.join(ROOT, 'core', '.claude-plugin', 'plugin.json'), version);
  const pinned = stampPins(version);
  changelog(version, entries);
  for (const n of pending) fs.rmSync(path.join(NOTES, n.file), { force: true });

  if (argv.includes('--dry')) return say(['v' + now + ' → v' + version + ' prepared, nothing committed.']);

  const a = git(['add', '-A']);
  if (!a.ok) return say(['git add failed, so nothing was committed:', a.err], 1);
  const c = git(['commit', '-m', 'Release ' + version]);
  if (!c.ok) return say(['git commit failed:', c.err], 1);
  const t = git(['tag', '-a', 'v' + version, '-m', 'v' + version]);
  if (!t.ok) return say(['git tag failed:', t.err], 1);
  return say([
    'v' + version + ' is cut, and the install lines now point at it' + (pinned.length ? ' (' + pinned.join(', ') + ')' : '') + '.',
    '',
    'Publish it with:',
    '  git push origin main --follow-tags',
    '  node <plugin>/scripts/release.js publish',
  ]);
}

function main() {
  const cmd = argv[0];
  if (cmd === 'note') return note();
  if (cmd === 'cut') return cut();
  if (cmd === 'publish') return publish();
  if (cmd === 'status' || !cmd) return status();
  return say([
    'release.js - the version is decided by notes, not by memory',
    '',
    '  note --bump patch|minor|major "what changed"',
    '                      leave a note now, while you still remember',
    '  status              what the next version would be and why',
    '  cut [--dry]         stamp both manifests, the install lines and the changelog,',
    '                      then commit and tag',
    '  publish [--version X.Y.Z]',
    '                      create the GitHub release titled vX.Y.Z from the changelog,',
    '                      upload install.ps1, install.sh and their .sha256 files',
  ]);
}

if (require.main === module) main();
module.exports = { notes, next, stampPins, assets, notesFor };
