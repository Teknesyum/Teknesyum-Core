const ID = /^[A-Z]{1,4}\d{1,4}[A-Z]{0,3}\.md$/i;
const RANK = { open: 0, active: 1, submitted: 2, accepted: 3, done: 3, sealed: 3 };
const STATES = new Set([...Object.keys(RANK), 'blocked']);
const FIELDS = ['id', 'owns', 'verify', 'accept', 'round', 'status'];

function metadata(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const framed = lines[0].trim() === '---', rows = [];
  let fence = '', closed = !framed;
  for (let i = framed ? 1 : 0; i < lines.length; i++) {
    const line = lines[i], mark = /^\s*(\x60{3,}|~{3,})/.exec(line);
    if (mark) { fence = !fence ? mark[1][0] : mark[1][0] === fence ? '' : fence; continue; }
    if (fence) continue;
    if (framed && line.trim() === '---') { closed = true; break; }
    if (/^#{2,6}\s/.test(line)) break;
    rows.push({ text: line, index: i });
  }
  return { rows, closed };
}
function definitions(name, text) {
  return metadata(text).rows.filter((r) => {
    const m = /^([A-Za-z][A-Za-z0-9_-]*):/.exec(r.text);
    return m && m[1].toLowerCase() === String(name).toLowerCase();
  });
}
function isContractName(name) { return ID.test(String(name)); }
function field(name, text) {
  const row = definitions(name, text)[0];
  return row ? row.text.slice(row.text.indexOf(':') + 1).trim() : '';
}
function status(text) { return field('status', text).toLowerCase() || null; }
function isKnownStatus(s) { return s !== null && STATES.has(s); }
function inlineValues(raw) {
  if (!raw.startsWith('[') || !raw.endsWith(']')) return null;
  const body = raw.slice(1, -1), parts = [];
  let quote = '', escaped = false, depth = 0, start = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && quote) { escaped = true; continue; }
    if (quote) { if (ch === quote) quote = ''; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if ('[({'.includes(ch)) depth++;
    if ('])}'.includes(ch) && --depth < 0) return null;
    if (ch === ',' && depth === 0) { parts.push(body.slice(start, i)); start = i + 1; }
  }
  if (quote || depth) return null;
  parts.push(body.slice(start));
  return parts.map((v) => {
    const s = v.trim();
    return s.length >= 2 && (s[0] === '"' || s[0] === "'") && s.at(-1) === s[0] ? s.slice(1, -1) : s;
  }).filter(Boolean);
}
function list(name, text) { return inlineValues(field(name, text)) || []; }
function block(name, text) {
  const rows = metadata(text).rows, def = definitions(name, text)[0];
  if (!def || field(name, text)) return [];
  const out = [];
  for (const row of rows.filter((r) => r.index > def.index)) {
    const m = /^[ \t]+-[ \t]*(.+)$/.exec(row.text);
    if (!m) break;
    out.push(m[1].trim());
  }
  return out;
}
function section(name, text) {
  const out = [];
  let active = false, fence = '';
  for (const line of String(text || '').replace(/\r\n/g, '\n').split('\n')) {
    const mark = /^\s*(\x60{3,}|~{3,})/.exec(line);
    if (mark) { fence = !fence ? mark[1][0] : mark[1][0] === fence ? '' : fence; continue; }
    if (fence) continue;
    const head = /^#{1,6}[ \t]+(.+?)\s*$/.exec(line);
    if (head) {
      if (active) break;
      active = head[1].toLowerCase() === String(name).toLowerCase();
    } else if (active) {
      const value = line.replace(/^[ \t]*[-*][ \t]*/, '').trim();
      if (value) out.push(value);
    }
  }
  return out;
}
function entries(name, text) {
  if (definitions(name, text).length) return field(name, text) ? list(name, text) : block(name, text);
  return section(name, text);
}
function scalar(name, text) {
  const raw = field(name, text);
  return raw && !raw.startsWith('[') ? raw : '';
}
function owned(text) { return entries('owns', text); }
function verifySteps(text) { return entries('verify', text); }
function raiseOf(text) {
  const m = /^([A-Za-z]+)[ \t]*(?:[-–—]{1,2}[ \t]*why:[ \t]*(\S.*?))?[ \t]*$/.exec(field('raise', text));
  return m ? { raise: m[1].toLowerCase(), why: String(m[2] || '').trim() } : null;
}
function replaceField(text, name, value) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n'), row = definitions(name, text)[0];
  if (row) lines[row.index] = name + ': ' + value;
  else lines.splice(lines[0].trim() === '---' || /^# /.test(lines[0]) ? 1 : 0, 0, name + ': ' + value);
  return lines.join('\n');
}
function fault(text) {
  const meta = metadata(text), seen = new Set();
  if (!meta.closed) return 'unclosed contract metadata';
  for (const row of meta.rows) {
    const m = /^([A-Za-z][A-Za-z0-9_-]*):/.exec(row.text);
    if (!m) continue;
    const key = m[1].toLowerCase();
    if (seen.has(key)) return 'duplicate contract field: ' + key;
    seen.add(key);
  }
  if (status(text) && !isKnownStatus(status(text))) return 'unknown status: ' + status(text);
  if (field('round', text) && !/^[1-9]\d*$/.test(field('round', text))) return 'round must be a positive integer';
  if (field('schema-version', text) && field('schema-version', text) !== '1') return 'unsupported schema-version';
  if (field('id', text) && !isContractName(field('id', text) + '.md')) return 'malformed contract id';
  for (const key of ['owns', 'verify', 'depends', 'blocked-by']) {
    const value = field(key, text);
    if (value && inlineValues(value) === null) return key + ' must be a list, not one plain line';
  }
  return '';
}
module.exports = {
  ID, RANK, STATES, FIELDS, isContractName, status, isKnownStatus, field, list,
  block, section, entries, scalar, owned, verifySteps, raiseOf,
  metadata, definitions, fault, replaceField,
};
