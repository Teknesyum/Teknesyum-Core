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

const ON_PLAN = 180000;
const SLEEP = /\b(sleep|Start-Sleep)\b/i;
const LONG = 'A foreground wait over three minutes holds the owner\'s messages until it ends. Tell the owner in one line what you are waiting for, then rerun the same command with run_in_background: true; the end of the job wakes you.';

function long(input) {
  const i = input || {};
  return !i.run_in_background && Number(i.timeout) > ON_PLAN && SLEEP.test(String(i.command || ''));
}

function decide(j) {
  if (!/^(Bash|PowerShell)$/.test(j.tool_name || '')) return null;
  const input = j.tool_input || {};
  const key = unbounded(input.command) ? 'loop' : long(input) ? 'long' : '';
  if (!key) return null;
  say(j.session_id, banner(key === 'loop' ? 'banner.loop' : 'banner.long'));
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: key === 'loop' ? t('loop.bound') : LONG,
    },
  };
}

module.exports = { unbounded, long, decide, LOOP, BOUND, ON_PLAN };
