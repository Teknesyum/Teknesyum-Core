#!/usr/bin/env node
const path = require('path');
const { t, banner, say } = require('./lib.js');

const WIPE = [
  /\brm\s+(?:-\S+\s+)*-\S*[rR]\S*f|\brm\s+(?:-\S+\s+)*-\S*f\S*[rR]/,
  /\bRemove-Item\b[^\n;|]*-Recurse\b[^\n;|]*-Force\b|\bRemove-Item\b[^\n;|]*-Force\b[^\n;|]*-Recurse\b/i,
  /\brmdir\s+\/s\b/i,
  /\brm\s+(?:-\S+\s+)*-\S*[rR]/,
];

const RULES = [
  ['yasak.disk', /\b(mkfs(\.\w+)?|fdisk|diskpart|Format-Volume|format\s+[a-z]:)\b/i],
  ['yasak.disk', /\bdd\b[^\n]*\bof=\/dev\//],
  ['yasak.hist', /\bgit\s+push\b[^\n]*(--force(?!-with-lease)|(^|\s)-f(\s|$))/],
  ['yasak.hist', /\bgit\s+reset\b[^\n]*--hard\b/],
  ['yasak.hist', /\bgit\s+clean\b[^\n]*-\w*[dfx]/],
  ['yasak.hist', /\bgit\s+branch\b[^\n]*\s-D\b/],
  ['yasak.gone', /\bgh\s+(repo|release)\s+delete\b/],
  ['yasak.gone', /\bgit\s+push\b[^\n]*\s:\S/],
  ['yasak.pipe', /\b(curl|wget|iwr|Invoke-WebRequest)\b[^\n]*\|[^\n]*\b(sh|bash|zsh|python|node|iex|Invoke-Expression)\b/i],
  ['yasak.perm', /\bchmod\s+(-R\s+)?777\b/],
  ['yasak.kill', /\b(kill(all)?\s+-9\s+-1|:\(\)\s*\{.*\|.*&.*\}\s*;?\s*:)/],
  ['yasak.kill', /\bshutdown\b|\bStop-Computer\b|\bRestart-Computer\b/i],
];

function targets(cmd) {
  return String(cmd)
    .split(/[;|&\n]+/)
    .filter((part) => WIPE.some((r) => r.test(part)))
    .flatMap((part) =>
      part
        .trim()
        .split(/\s+/)
        .slice(1)
        .filter((w) => w && !w.startsWith('-') && !/^\/[a-z]$/i.test(w))
        .map((w) => w.replace(/^["']|["']$/g, ''))
    );
}

function outside(target, cwd) {
  const s = String(target);
  if (/^[~$]/.test(s) || /^\/dev\b/.test(s)) return true;
  if (/^([A-Za-z]:[\\/]|[\\/])/.test(s)) return true;
  const rel = path.relative(cwd, path.resolve(cwd, s));
  if (rel === '' || rel === '.') return true;
  return rel.startsWith('..');
}

function forbidden(cmd, cwd) {
  const s = String(cmd || '');
  if (!s.trim()) return null;
  const root = cwd || process.cwd();
  for (const target of targets(s)) if (outside(target, root)) return 'yasak.root';
  for (const [key, re] of RULES) if (re.test(s)) return key;
  return null;
}

function decide(j) {
  if (j.hook_event_name && j.hook_event_name !== 'PreToolUse') return null;
  if (!/^(Bash|PowerShell)$/.test(j.tool_name || '')) return null;
  const key = forbidden((j.tool_input || {}).command, j.cwd);
  if (!key) return null;
  say(j.session_id, banner('banner.deny', { '%R': t(key) }));
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: t(key),
    },
  };
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try {
      const out = decide(JSON.parse(raw));
      if (out) process.stdout.write(JSON.stringify(out));
    } catch {}
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { forbidden, decide, outside, targets, RULES, WIPE };
