const { spawnSync } = require('child_process');
const { norm } = require('../hooks/lib.js');

const HIGH_PATHS = [
  /(^|\/)(auth|authn|authz|session|login|token|credential|secret)s?(\/|\.|$)/i,
  /(^|\/)migrations?(\/|$)/i,
  /(^|\/)\.claude\/(hooks|settings)/i,
  /(^|\/)(hooks?|middleware|guard)s?\/[^/]+\.(js|ts|mjs|cjs|py|cs|go|rs)$/i,
  /(^|\/)(Dockerfile|docker-compose\.ya?ml|\.github\/workflows\/)/i,
  /(^|\/)(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Cargo\.toml|go\.mod|requirements\.txt|pyproject\.toml|\*\.csproj)$/i,
  /(^|\/)(settings|config|appsettings)[^/]*\.(json|ya?ml|toml)$/i,
];

const DIFF_LIMIT = 300;
const FILE_LIMIT = 8;

function gitNumstat(root, paths) {
  const r = spawnSync('git', ['-C', root, 'diff', '--numstat', 'HEAD', '--'].concat(paths), {
    encoding: 'utf8',
    timeout: 20000,
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
  });
  if (r.error || r.status !== 0) return null;
  let lines = 0;
  let files = 0;
  for (const row of String(r.stdout || '').split('\n')) {
    const m = /^(\d+|-)\t(\d+|-)\t/.exec(row);
    if (!m) continue;
    files += 1;
    lines += (Number(m[1]) || 0) + (Number(m[2]) || 0);
  }
  return { lines, files };
}

function assess(root, owns) {
  const reasons = [];
  for (const p of owns) {
    const n = norm(p);
    if (HIGH_PATHS.some((re) => re.test(n))) reasons.push('sensitive path: ' + n);
  }
  if (owns.length > FILE_LIMIT) reasons.push('owns ' + owns.length + ' files (limit ' + FILE_LIMIT + ')');
  const stat = owns.length ? gitNumstat(root, owns) : null;
  if (stat && stat.lines > DIFF_LIMIT)
    reasons.push('diff ' + stat.lines + ' lines (limit ' + DIFF_LIMIT + ')');
  return { level: reasons.length ? 'high' : 'low', reasons, stat };
}

function resolve(root, owns, declared) {
  const computed = assess(root, owns);
  if (String(declared || '').toLowerCase() === 'high' && computed.level === 'low')
    return { level: 'high', reasons: ['declared high by the contract author'], stat: computed.stat };
  return computed;
}

module.exports = { assess, resolve, HIGH_PATHS, DIFF_LIMIT, FILE_LIMIT };
