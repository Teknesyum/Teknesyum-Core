#!/usr/bin/env node
const { t } = require('./lib.js');

const RULES = [
  ['yasak.wipe', /\brm\s+(-\w*\s+)*-\w*[rR]\w*f|\brm\s+(-\w*\s+)*-\w*f\w*[rR]/],
  ['yasak.wipe', /\bRemove-Item\b[^\n]*-Recurse\b[^\n]*-Force\b|\bRemove-Item\b[^\n]*-Force\b[^\n]*-Recurse\b/i],
  ['yasak.wipe', /\brmdir\s+\/s\b/i],
  ['yasak.root', /\brm\b[^\n|]*\s(\/|~|\$HOME|[A-Za-z]:\\)(\s|$|\*)/],
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

function forbidden(cmd) {
  const s = String(cmd || '');
  if (!s.trim()) return null;
  for (const [key, re] of RULES) if (re.test(s)) return key;
  return null;
}

function decide(j) {
  if (j.hook_event_name && j.hook_event_name !== 'PreToolUse') return null;
  if (!/^(Bash|PowerShell)$/.test(j.tool_name || '')) return null;
  const key = forbidden((j.tool_input || {}).command);
  if (!key) return null;
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

module.exports = { forbidden, decide, RULES };
