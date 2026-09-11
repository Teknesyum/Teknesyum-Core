#!/usr/bin/env node
const { t, banner, say } = require('./lib.js');

const LOOP = /\b(until|while)\b[\s\S]*\b(sleep|Start-Sleep)\b|\b(sleep|Start-Sleep)\b[\s\S]*\b(until|while)\b/i;
const BOUND = [
  /\btimeout\b/i,
  /\bSECONDS\b/,
  /\bfor\b/,
  /\bread\b/,
  /\bseq\b/,
  /\bdate\s+\+%s/,
  /\bGet-Date\b/i,
  /\bStopwatch\b/i,
  /[+-]=|\+\+|--(?!\w)/,
  /\$\{?\w+\}?\s+-(lt|le|gt|ge)\b/,
  /-(lt|le|gt|ge)\s+\$?\d/i,
  /\$\w+\s*-(lt|le|gt|ge)\s*/i,
  /\|\s*head\b/,
  /\bmax-time\b/,
];

function unbounded(cmd) {
  const s = String(cmd || '');
  if (!LOOP.test(s)) return false;
  return !BOUND.some((r) => r.test(s));
}

function decide(j) {
  if (!/^(Bash|PowerShell)$/.test(j.tool_name || '')) return null;
  const cmd = (j.tool_input || {}).command;
  if (!unbounded(cmd)) return null;
  say(j.session_id, banner('banner.loop'));
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: t('loop.bound'),
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

module.exports = { unbounded, decide, LOOP, BOUND };
