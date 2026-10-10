#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { main, t, banner, say } = require('./lib.js');
const loop = require('./loop.js');

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
  ['yasak.new', /\bgh\s+repo\s+(create|fork)\b/],
  ['yasak.new', /\bgh\s+api\b(?=[^\n]*(\bPOST\b|\s-[fF]\s))[^\n]*(\buser|\borgs\/[^\s\/]+)\/repos\b(?!\/)/],
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
  if (/^[~$%]/.test(s) || /^\/dev\b/.test(s)) return true;
  if (/^([A-Za-z]:[\\/]|[\\/])/.test(s)) return true;
  const rel = path.relative(cwd, path.resolve(cwd, s));
  if (rel === '' || rel === '.') return true;
  return rel.startsWith('..');
}

function temps() {
  const seen = new Set();
  for (const p of [os.tmpdir(), process.env.TEMP, process.env.TMP, process.env.TMPDIR]) {
    if (!p) continue;
    seen.add(path.resolve(p));
    try { seen.add(fs.realpathSync.native(p)); } catch {}
  }
  return [...seen];
}

function expand(target) {
  let s = String(target);
  const env = s.match(/^(?:\$\{?(?:env:)?(TEMP|TMP|TMPDIR)\}?|%(TEMP|TMP)%)(?=$|[\\/])/i);
  if (env) s = (process.env[(env[1] || env[2]).toUpperCase()] || os.tmpdir()) + s.slice(env[0].length);
  else if (/^~(?=$|[\\/])/.test(s)) s = os.homedir() + s.slice(1);
  if (process.platform === 'win32') s = s.replace(/^\/([a-z])(?=$|\/)/i, '$1:');
  return /^\$|%/.test(s) ? null : s;
}

function inTemp(target) {
  const s = expand(target);
  if (!s || !path.isAbsolute(s)) return false;
  const win = process.platform === 'win32';
  const full = path.resolve(s);
  const rels = temps().map((t) => (win ? path.relative(t.toLowerCase(), full.toLowerCase()) : path.relative(t, full)));
  if (rels.includes('')) return false;
  return rels.some((rel) => !rel.startsWith('..') && !path.isAbsolute(rel));
}

function forbidden(cmd, cwd) {
  const s = String(cmd || '');
  if (!s.trim()) return null;
  const root = cwd || process.cwd();
  let temp = false;
  for (const target of targets(s)) {
    if (!outside(target, root)) continue;
    if (!inTemp(target)) return 'yasak.root';
    temp = true;
  }
  for (const [key, re] of RULES) if (re.test(s)) return key;
  return temp ? 'yasak.temp' : null;
}

const RELEASE = /\bgh\s+release\s+(create|upload)\b/;

function gate(cmd, cwd) {
  const s = String(cmd || '');
  if (!RELEASE.test(s)) return '';
  try {
    const base = require('../scripts/base.js');
    const root = base.top(cwd || process.cwd());
    if (!base.installable(root)) return '';
    const other = /(?:--repo|-R)[=\s]+["']?[^\s"'\/]+\/([^\s"']+)/.exec(s);
    if (other && other[1].toLowerCase() !== path.basename(root).toLowerCase()) return '';
    const zips = s.split(/\s+/).map((w) => w.replace(/^["']|["']$/g, '').split('#')[0]).filter((w) => /\.zip$/i.test(w)).map((w) => path.resolve(cwd || root, w));
    const r = base.check(root, zips);
    if (r.ok) return '';
    return t('yasak.base').replace('%R', r.miss.join('; ')).replace('%C', 'node "' + path.join(__dirname, '..', 'scripts', 'base.js') + '" init');
  } catch {
    return '';
  }
}

const ASKED = new Set(['yasak.hist', 'yasak.gone', 'yasak.temp', 'yasak.new']);
const YES = /(^|[^\p{L}])(evet|onay\p{L}*|sil\p{L}*|kaldır\p{L}*|yes|approved?)(?=$|[^\p{L}])/iu;

function lastPrompt(j) {
  const kitap = require('./kitap.js');
  const file = kitap.transcript(j);
  if (!file) return '';
  const list = kitap.entries(file);
  for (let i = list.length - 1; i >= 0; i--) {
    const o = list[i];
    if (!kitap.prompt(o)) continue;
    const c = o.message.content;
    return typeof c === 'string' ? c : c.filter((x) => x && x.type === 'text').map((x) => x.text).join(' ');
  }
  return '';
}

function approved(j) {
  try { return YES.test(lastPrompt(j)); } catch { return false; }
}

function forbid(j) {
  if (j.hook_event_name && j.hook_event_name !== 'PreToolUse') return null;
  if (!/^(Bash|PowerShell)$/.test(j.tool_name || '')) return null;
  const key = forbidden((j.tool_input || {}).command, j.cwd);
  if (!key) {
    const why = gate((j.tool_input || {}).command, j.cwd);
    if (!why) return null;
    say(j.session_id, banner('banner.deny', { '%R': why.split(':')[0] }));
    return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: why } };
  }
  if (ASKED.has(key) && approved(j)) return null;
  say(j.session_id, banner('banner.deny', { '%R': t(key) }));
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: t(key),
    },
  };
}

function decide(j) {
  return forbid(j) || loop.decide(j);
}

if (require.main === module) main(decide);

module.exports = { gate, lastPrompt, forbidden, decide, outside, targets, approved, inTemp, RULES, WIPE, YES };
