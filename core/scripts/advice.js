const fs = require('fs');
const path = require('path');
const lib = require('../hooks/lib.js');

const DIR = 'docs/danisma';
const REPLY_MAX = 12000;

function dir(root) {
  return path.join(root, DIR);
}

function slugOf(text) {
  const s = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return s || 'danisma';
}

function list(relay) {
  let names = [];
  try {
    names = fs.readdirSync(dir(relay)).filter((n) => /^\d{3}-.*\.md$/.test(n));
  } catch {
    return [];
  }
  return names.sort();
}

const GORUS_MARK = '[[danisma:';
const GORUS_MAX = 600;

function gorusAsk(root, konu, girdi) {
  const body = String(girdi || '').trim();
  if (!body) throw new Error('girdi is empty');
  const at = dir(root);
  fs.mkdirSync(at, { recursive: true });
  const id = String(lib.nextNumber(at)).padStart(3, '0');
  const slug = slugOf(lib.fold(konu || body.split('\n')[0]));
  const first = body.split('\n').find((l) => l.startsWith('# '));
  const title = (first ? first.slice(2) : konu || slug).trim().slice(0, 90);
  const file = path.join(at, id + '-fable-' + slug + '-girdi.md');
  fs.writeFileSync(file, ['# Danışma ' + id + ' girdi: ' + title, '', 'Ajana giden metin:', '', '---', '', GORUS_MARK + id + ']]', '', body, ''].join('\n'));
  lib.write(lib.stateFile(lib.slot('gorus', root)), { id, slug, title, at: new Date().toISOString(), spent: false, session: lib.sessionId() });
  const prompt = GORUS_MARK + id + ']] Şu dosyayı oku ve içindeki soruyu cevapla, cevabın Türkçe: ' + file;
  return { id, file, prompt };
}

function agentFile(root, agent) {
  const name = 'agent-' + agent + '.jsonl';
  const projects = path.join(lib.configRoot(), 'projects');
  let dirs = [];
  try { dirs = fs.readdirSync(projects); } catch { return ''; }
  const own = path.resolve(root).split(/[\\/:]/).join('-');
  dirs.sort((a, b) => (b === own) - (a === own));
  for (const d of dirs) {
    let sessions = [];
    try { sessions = fs.readdirSync(path.join(projects, d)); } catch { continue; }
    for (const s of sessions) {
      const f = path.join(projects, d, s, 'subagents', name);
      if (fs.existsSync(f)) return f;
    }
  }
  return '';
}

function agentReply(file) {
  const out = { text: '', model: '', tokens: 0, seconds: 0 };
  let raw = '';
  try { raw = fs.readFileSync(file, 'utf8'); } catch { return out; }
  let asked = 0;
  let last = 0;
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    let j;
    try { j = JSON.parse(line); } catch { continue; }
    const at = Date.parse(j.timestamp || '') || 0;
    const content = (j.message && j.message.content) || [];
    if (j.type === 'user' && (typeof content === 'string' || (Array.isArray(content) && content.some((b) => b && b.type === 'text')))) { asked = at; out.tokens = 0; continue; }
    if (j.type !== 'assistant') continue;
    out.model = j.message.model || out.model;
    out.tokens += Number((j.message.usage || {}).output_tokens || 0);
    last = at;
    const text = Array.isArray(content) ? content.filter((b) => b && b.type === 'text').map((b) => b.text).join('\n').trim() : '';
    if (text) out.text = text;
  }
  if (asked && last > asked) out.seconds = Math.round((last - asked) / 1000);
  return out;
}

function gorusRecord(root, o) {
  const st = lib.read(lib.stateFile(lib.slot('gorus', root))) || {};
  const id = o.id || st.id;
  if (!id) throw new Error('no consult to record against');
  const at = dir(root);
  const input = fs.readdirSync(at).find((n) => n.startsWith(id + '-') && n.endsWith('-girdi.md'));
  if (!input) throw new Error('no consult ' + id + ' under ' + DIR);
  let got = { text: '', model: '', tokens: 0, seconds: 0 };
  if (o.agent) {
    const f = agentFile(root, o.agent);
    if (!f) throw new Error('no transcript for agent ' + o.agent);
    got = agentReply(f);
  }
  if (o.reply) got.text = fs.readFileSync(o.reply, 'utf8').trim();
  if (!got.text) throw new Error('the reply is empty');
  const model = o.model || got.model || '-';
  const olcu = [model, got.tokens ? got.tokens.toLocaleString('tr-TR') + ' çıktı token' : '', got.seconds ? got.seconds + ' sn' : '', o.cost || ''].filter(Boolean).join(', ');
  let reply = got.text;
  const cut = reply.length > REPLY_MAX;
  if (cut) reply = reply.slice(0, REPLY_MAX) + '\n\n[' + (reply.length - REPLY_MAX) + ' karakter kesildi]';
  const file = path.join(at, input.replace(/-girdi[.]md$/, '.md'));
  fs.writeFileSync(file, ['# Danışma ' + id + ': ' + (st.id === id && st.title ? st.title : id), '', olcu + '. Girdi: [' + input + '](' + input + '). Cevap olduğu gibi:', '', '---', '', reply, ''].join('\n'));
  return { file: path.relative(root, file).split(path.sep).join('/'), cut, olcu };
}

const gate = lib.makeGate({ mark: GORUS_MARK, state: 'gorus', max: GORUS_MAX });

function main(argv) {
  const cmd = argv[0];
  const root = process.cwd();
  if (cmd === 'list') {
    const rows = list(root);
    process.stdout.write(rows.length ? rows.join('\n') + '\n' : 'nothing recorded\n');
    return 0;
  }
  if (cmd === 'ask' && lib.arg(argv, '--mod') === 'gorus') {
    const girdi = lib.arg(argv, '--girdi');
    if (!girdi) throw new Error('ask --mod gorus needs --girdi <file>');
    const r = gorusAsk(root, lib.arg(argv, '--konu'), fs.readFileSync(girdi, 'utf8'));
    try { fs.unlinkSync(girdi); } catch {}
    process.stdout.write(r.file + '\nAgent istemi, olduğu gibi:\n' + r.prompt + '\nSonra: advice.js record --mod gorus --ajan <agentId>\n');
    return 0;
  }
  if (cmd === 'record' && (lib.arg(argv, '--mod') === 'gorus' || lib.arg(argv, '--ajan'))) {
    const r = gorusRecord(root, { id: lib.arg(argv, '--id'), agent: lib.arg(argv, '--ajan'), reply: lib.arg(argv, '--reply'), model: lib.arg(argv, '--model'), cost: lib.arg(argv, '--cost') });
    process.stdout.write(r.file + ' · ' + r.olcu + (r.cut ? ' (reply cut at ' + REPLY_MAX + ' characters)' : '') + '\n');
    return 0;
  }
  process.stdout.write([
    'advice.js list                                   the consultation records under ' + DIR + '/',
    'advice.js ask --mod gorus --konu <slug> --girdi <file>   number an opinion consult under ' + DIR + '/, print the short Agent prompt that points at it',
    'advice.js record --mod gorus --ajan <agentId>            read the reply, model, tokens and time from the agent transcript and file them',
    '',
    'The PreToolUse gate in hooks/ust.js lets each consult out once; the model is yours to pick.',
    'Nothing runs unless you ask, and nothing here enters the context on an ordinary turn.',
  ].join('\n') + '\n');
  return 1;
}

if (require.main === module) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(String((e && e.message) || e) + '\n');
    process.exit(1);
  }
}

module.exports = { gate, gorusAsk, gorusRecord, agentReply, agentFile, GORUS_MARK, GORUS_MAX, list, slugOf, DIR, REPLY_MAX };
