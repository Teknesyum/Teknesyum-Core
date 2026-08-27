const ID = /^[A-Z]{1,4}\d{1,4}\.md$/i;

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
  const m = String(text).match(re);
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.replace(/^[ \t]*-[ \t]*/, '').trim())
    .filter(Boolean);
}

function verifySteps(text) {
  const inline = list('verify', text);
  return inline.length ? inline : block('verify', text);
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
  verifySteps,
};
