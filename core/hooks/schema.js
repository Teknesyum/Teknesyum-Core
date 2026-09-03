const ID = /^[A-Z]{1,4}\d{1,4}[A-Z]{0,3}\.md$/i;

const RANK = { open: 0, active: 1, submitted: 2, accepted: 3, done: 3, sealed: 3 };

const STATES = new Set([...Object.keys(RANK), 'blocked']);

const FIELDS = ['id', 'owns', 'verify', 'accept', 'round', 'status'];

function isContractName(name) {
  return ID.test(String(name));
}

function status(text) {
  const m = String(text).match(/^status:[ \t]*([a-z]+)/im);
  return m ? m[1].toLowerCase() : null;
}

function isKnownStatus(s) {
  return s !== null && STATES.has(s);
}

function field(name, text) {
  const m = String(text).match(new RegExp('^' + name + ':[ \\t]*(.+)$', 'im'));
  return m ? m[1].trim() : '';
}

function list(name, text) {
  const raw = (String(text).match(new RegExp('^' + name + ':[ \\t]*\\[([^\\]]*)\\]', 'im')) ||
    [])[1];
  if (raw === undefined) return [];
  return raw
    .split(',')
    .map((v) => v.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function block(name, text) {
  const re = new RegExp('^' + name + ':[ \\t]*\\n((?:[ \\t]+-[ \\t]*.+\\n?)+)', 'im');
  const m = String(text).replace(/\r\n/g, '\n').match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^[ \t]*-[ \t]*/, '').trim())
    .filter(Boolean);
}

function section(name, text) {
  const body = String(text).replace(/\r\n/g, "\n");
  const head = new RegExp("(?:^|\\n)#{1,6}[ \\t]*" + name + "[ \\t]*\\n", "i");
  const m = head.exec(body);
  if (!m) return [];
  const rest = body.slice(m.index + m[0].length);
  const next = /\n#{1,6}[ \t]/.exec(rest);
  const chunk = next ? rest.slice(0, next.index) : rest;
  return chunk
    .split("\n")
    .map((l) => l.replace(/^[ \t]*[-*][ \t]*/, "").trim())
    .filter((l) => l && !l.startsWith("```"));
}

function entries(name, text) {
  const inline = list(name, text);
  if (inline.length) return inline;
  const bl = block(name, text);
  if (bl.length) return bl;
  return section(name, text);
}

function scalar(name, text) {
  const raw = field(name, text);
  if (!raw || raw.startsWith('[')) return '';
  return raw;
}

function owned(text) {
  return entries('owns', text);
}

function verifySteps(text) {
  return entries('verify', text);
}

const RAISE = /^raise:[ 	]*([A-Za-z]+)[ 	]*(?:[-–—]{1,2}[ 	]*why:[ 	]*(\S.*?))?[ 	]*$/im;

function raiseOf(text) {
  const m = RAISE.exec(String(text || ''));
  if (!m) return null;
  return { raise: m[1].toLowerCase(), why: String(m[2] || '').trim() };
}

module.exports = {
  ID,
  RANK,
  STATES,
  FIELDS,
  isContractName,
  status,
  isKnownStatus,
  field,
  list,
  block,
  section,
  entries,
  scalar,
  owned,
  verifySteps,
  raiseOf,
};
