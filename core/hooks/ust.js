#!/usr/bin/env node
const fs = require('fs');
const { main, t, say, banner, stateFile, read, write, BANNER } = require('./lib.js');
const advice = require('../scripts/advice.js');

const RANK = { haiku: 1, sonnet: 2, opus: 3, fable: 4 };
const MARK = /\[\[[a-z]+:\d{3}\]\]/i;
const KESIT = 96 * 1024;

function rank(name) {
  const s = String(name || '').toLowerCase();
  for (const key of Object.keys(RANK)) if (s.includes(key)) return RANK[key];
  return 0;
}

function tail(file) {
  try {
    const size = fs.statSync(file).size;
    const from = Math.max(0, size - KESIT);
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(size - from);
    fs.readSync(fd, buf, 0, buf.length, from);
    fs.closeSync(fd);
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

function own(file) {
  const text = tail(file);
  let best = 0;
  const re = /"model"\s*:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(text))) {
    const r = rank(m[1]);
    if (r > best) best = r;
  }
  return best;
}

function kisa(s) {
  const one = String(s || '').replace(/\s+/g, ' ').trim();
  return one.length > 48 ? one.slice(0, 47) + '…' : one;
}

function line(j) {
  if (j.tool_name !== 'Agent') return '';
  const input = j.tool_input || {};
  const called = rank(input.model);
  if (!called) return '';
  if (MARK.test(String(input.prompt || ''))) return '';
  if (called <= own(j.transcript_path || '')) return '';
  const what = kisa(input.description || input.subagent_type || '');
  let s = t('banner.upper')
    .split('%M')
    .join(String(input.model))
    .split('%D')
    .join(what || t('banner.upperWork'));
  return BANNER + s;
}

const READER = /(^|:)okuyucu$/;

function reader(j) {
  if (j.tool_name !== 'Agent') return '';
  const input = j.tool_input || {};
  if (!READER.test(String(input.subagent_type || ''))) return '';
  return BANNER + t('banner.okuyor').split('%D').join(kisa(input.description || input.prompt || ''));
}

function haiku(j) {
  if (j.tool_name !== 'Agent' || !/haiku/i.test(String((j.tool_input || {}).model || ''))) return null;
  if (/haiku/i.test(require('./yasak.js').lastPrompt(j))) return null;
  return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: t('ust.haiku') } };
}

const PENCERE = 15 * 60 * 1000;
const ESIK = 16;

function yogun(j, now = Date.now()) {
  if (j.tool_name !== 'Agent') return '';
  const f = stateFile('ajan-yogun-' + (j.session_id || 'x'));
  const s = read(f) || {};
  const at = (s.at || []).filter((x) => now - x < PENCERE).concat(now);
  const uyar = at.length >= ESIK && !(s.uyardi && now - s.uyardi < PENCERE);
  write(f, { at, uyardi: uyar ? now : s.uyardi });
  if (!uyar) return '';
  say(j.session_id, banner('banner.yogun', { '%N': at.length }));
  return t('ust.yogun').split('%N').join(String(at.length));
}

function gate(j) {
  const h = haiku(j);
  if (h) return h;
  const deny = advice.gate(j);
  if (!deny && j.tool_name === 'Agent') {
    const input = j.tool_input || {};
    require('./defter.js').agent(j.cwd || process.cwd(), input.description || input.subagent_type || '');
  }
  const l = line(j);
  if (l) say(j.session_id, l);
  const r = deny ? '' : reader(j);
  if (r) say(j.session_id, r);
  if (deny) return deny;
  const y = yogun(j);
  return y ? { hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: y } } : deny;
}

if (require.main === module) main(gate);

module.exports = { gate, line, rank, haiku, reader, yogun, ESIK };
