const { spawnSync } = require('child_process');
const { norm } = require('../hooks/lib.js');

const HIGH_PATHS = [
  /(^|\/)(auth|authn|authz|session|login|token|credential|secret)s?(\/|\.|$)/i,
  /(^|\/)migrations?(\/|$)/i,
  /(^|\/)\.claude\/(hooks|settings)/i,
  /(^|\/)(hooks?|middleware|guard)s?\/[^/]+\.(js|ts|mjs|cjs|py|cs|go|rs)$/i,
  /(^|\/)(Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/)/i,
  /(^|\/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Cargo\.toml|go\.mod|requirements\.txt|pyproject\.toml|[^/]+\.csproj)$/i,
  /(^|\/)(settings|config|appsettings)[^/]*\.(json|ya?ml|toml)$/i,
];

const DIFF_LIMIT = 300;
const FILE_LIMIT = 8;
const SPOT_LIMIT = 40;

function git(root, args) {
  const r = spawnSync('git', ['-C', root].concat(args), {
    encoding: 'utf8',
    timeout: 20000,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return null;
  return String(r.stdout || '');
}

function baseRef(root) {
  const head = (git(root, ['rev-parse', '--abbrev-ref', 'HEAD']) || '').trim();
  let main = (git(root, ['symbolic-ref', '--quiet', '--short', 'refs/remotes/origin/HEAD']) || '')
    .trim()
    .replace(/^origin\//, '');
  if (!main)
    for (const c of ['main', 'master'])
      if (git(root, ['rev-parse', '--verify', '--quiet', c]) !== null) {
        main = c;
        break;
      }
  if (!main || main === head) return 'HEAD';
  const mb = (git(root, ['merge-base', 'HEAD', main]) || '').trim();
  return mb || 'HEAD';
}

function gitNumstat(root, paths, base) {
  const from = base || 'HEAD';
  const out = git(root, ['diff', '--numstat', from, '--'].concat(paths));
  if (out === null) return null;
  let lines = 0;
  let files = 0;
  for (const row of out.split('\n')) {
    const m = /^(\d+|-)\t(\d+|-)\t/.exec(row);
    if (!m) continue;
    files += 1;
    lines += (Number(m[1]) || 0) + (Number(m[2]) || 0);
  }
  const classes = { A: 0, M: 0, D: 0, R: 0 };
  const names = git(root, ['diff', '--name-status', from, '--'].concat(paths));
  if (names !== null)
    for (const row of names.split('\n')) {
      const k = /^([AMDRCT])\d*\t/.exec(row);
      if (!k) continue;
      const c = k[1] === 'C' ? 'A' : k[1] === 'T' ? 'M' : k[1];
      classes[c] += 1;
    }
  return { lines, files, classes, base: from };
}

function spots(root, paths, base) {
  const out = git(root, ['diff', '-U0', base || 'HEAD', '--'].concat(paths));
  if (out === null) return [];
  const found = [];
  let file = null;
  for (const row of out.split('\n')) {
    const f = /^\+\+\+ b\/(.+)$/.exec(row);
    if (f) {
      file = f[1].trim();
      continue;
    }
    const h = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@ ?(.*)$/.exec(row);
    if (!h || !file) continue;
    const count = h[2] === undefined ? 1 : Number(h[2]);
    if (!count) continue;
    const start = Number(h[1]);
    found.push({
      file,
      from: start,
      to: start + count - 1,
      symbol: h[3].trim().slice(0, 80) || null,
    });
  }
  return found;
}

function spotLines(where) {
  return where.map(
    (s) =>
      '  ' + s.file + ':' + (s.from === s.to ? s.from : s.from + '-' + s.to) + (s.symbol ? '  ' + s.symbol : '')
  );
}

function assess(root, owns) {
  const reasons = [];
  for (const p of owns) {
    const n = norm(p);
    if (HIGH_PATHS.some((re) => re.test(n))) reasons.push('sensitive path: ' + n);
  }
  if (owns.length > FILE_LIMIT) reasons.push('owns ' + owns.length + ' files (limit ' + FILE_LIMIT + ')');
  const base = owns.length ? baseRef(root) : 'HEAD';
  const stat = owns.length ? gitNumstat(root, owns, base) : null;
  if (owns.length && stat === null) reasons.push('the diff could not be read, so its size is unknown');
  if (stat && stat.lines > DIFF_LIMIT)
    reasons.push('diff ' + stat.lines + ' lines (limit ' + DIFF_LIMIT + ')');
  if (stat && stat.classes.D)
    reasons.push('deletes ' + stat.classes.D + ' file' + (stat.classes.D > 1 ? 's' : ''));
  if (stat && stat.classes.R)
    reasons.push('renames ' + stat.classes.R + ' file' + (stat.classes.R > 1 ? 's' : ''));
  const where = owns.length ? spots(root, owns, base).slice(0, SPOT_LIMIT) : [];
  return { level: reasons.length ? 'high' : 'low', reasons, stat, spots: where };
}

function resolve(root, owns, declared) {
  const computed = assess(root, owns);
  if (String(declared || '').toLowerCase() === 'high' && computed.level === 'low')
    return {
      level: 'high',
      reasons: ['declared high by the contract author'],
      stat: computed.stat,
      spots: computed.spots,
    };
  return computed;
}

const IRREVERSIBLE_PATHS = [
  /(^|\/)migrations?(\/|$)/i,
  /(^|\/)releases?(\/|$)/i,
  /(^|\/)schema\.sql$/i,
  /(^|\/)\.github\/workflows\/[^/]*release[^/]*\.ya?ml$/i,
];

const IRREVERSIBLE_COMMANDS = [
  /git\s+push\b[^\r\n]*(--force|-f\b)/i,
  /git\s+(rebase|filter-branch|filter-repo)\b/i,
  /git\s+reset\s+--hard\b/i,
  /git\s+tag\s+-d\b/i,
  /gh\s+release\s+(create|delete)\b/i,
  /npm\s+publish\b/i,
  /\b(drop\s+table|truncate\s+table)\b/i,
  /\brm\s+-rf\b/i,
];

function irreversible(owns, steps) {
  const reasons = [];
  for (const p of owns || []) {
    const n = norm(p);
    if (IRREVERSIBLE_PATHS.some((re) => re.test(n))) reasons.push('irreversible path: ' + n);
  }
  for (const s of steps || [])
    if (IRREVERSIBLE_COMMANDS.some((re) => re.test(String(s))))
      reasons.push('irreversible command: ' + String(s).slice(0, 60));
  return { hit: reasons.length > 0, reasons };
}

module.exports = {
  assess,
  resolve,
  irreversible,
  spots,
  spotLines,
  baseRef,
  HIGH_PATHS,
  DIFF_LIMIT,
  FILE_LIMIT,
  SPOT_LIMIT,
  IRREVERSIBLE_PATHS,
  IRREVERSIBLE_COMMANDS,
};
