#!/usr/bin/env node
const fs = require('fs');
const { main, t, say, BANNER } = require('./lib.js');
const advice = require('../scripts/advice.js');

const RANK = { haiku: 1, sonnet: 2, opus: 3, fable: 4 };
const MARK = /\[\[[a-z]+-\d{3}\]\]/i;
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

function gate(j) {
  const deny = advice.gate(j);
  const l = line(j);
  if (l) say(j.session_id, l);
  return deny;
}

if (require.main === module) main(gate);

module.exports = { gate, line, rank };
