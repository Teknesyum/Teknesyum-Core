const fs = require('fs');
const path = require('path');
const lib = require('../hooks/lib.js');

const DIR = 'docs/danisma';
const ASK_DIR = 'docs/netlestirme';
const MARK = '[[netlestirme:';
const PROMPT_MAX = 12000;
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

function nextNumber(at) {
  let top = 0;
  let names = [];
  try {
    names = fs.readdirSync(at);
  } catch {
    return 1;
  }
  for (const n of names) {
    const m = /^(\d{3})-/.exec(n);
    if (m) top = Math.max(top, Number(m[1]));
  }
  return top + 1;
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

function ascii(text) {
  return String(text || '').replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u');
}

function askText(id, question, facts) {
  return [
    MARK + id + ']]',
    '',
    '# Netleştirme: ' + question.split('\n')[0].slice(0, 80),
    '',
    'İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.',
    'Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.',
    '',
    '## Soru',
    '',
    question,
    '',
    '## Elde olan olgular',
    '',
    facts || '- yok',
    '',
  ].join('\n');
}

function ask(root, question, facts) {
  if (!question) throw new Error('question is empty');
  const at = path.join(root, ASK_DIR);
  fs.mkdirSync(at, { recursive: true });
  const id = String(nextNumber(at)).padStart(3, '0');
  const slug = slugOf(ascii(question));
  const file = path.join(at, id + '-' + slug + '-girdi.md');
  fs.writeFileSync(file, askText(id, question, facts));
  lib.write(lib.stateFile('advice'), { id, slug, question, at: new Date().toISOString(), spent: false, session: lib.sessionId() });
  return { id, file: path.relative(root, file).split(path.sep).join('/') };
}

const gate = lib.makeGate({ mark: MARK, state: 'advice', model: '', max: PROMPT_MAX });

function record(root, o) {
  const st = lib.read(lib.stateFile('advice')) || {};
  const id = o.id || st.id;
  if (!id) throw new Error('no question to record against');
  const at = path.join(root, ASK_DIR);
  const input = fs.readdirSync(at).find((n) => n.startsWith(id + '-') && n.endsWith('-girdi.md'));
  if (!input) throw new Error('no question ' + id + ' under ' + ASK_DIR);
  let reply = o.reply ? fs.readFileSync(o.reply, 'utf8').trim() : '';
  const cut = reply.length > REPLY_MAX;
  if (cut) reply = reply.slice(0, REPLY_MAX) + '\n\n[' + (reply.length - REPLY_MAX) + ' karakter kesildi]';
  const file = path.join(at, input.replace(/-girdi\.md$/, '.md'));
  fs.writeFileSync(file, ['# Netleştirme: ' + (st.question || id).split('\n')[0].slice(0, 80), '', '- tarih: ' + new Date().toISOString().slice(0, 10), '- girdi: ' + input, '- maliyet: ' + (o.cost || '-'), '', '## Dönen', '', reply, ''].join('\n'));
  return { file: path.relative(root, file).split(path.sep).join('/'), cut };
}

function arg(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 || i === argv.length - 1 ? '' : argv[i + 1];
}

function main(argv) {
  const cmd = argv[0];
  const root = process.cwd();
  if (cmd === 'list') {
    const rows = list(root);
    process.stdout.write(rows.length ? rows.join('\n') + '\n' : 'nothing recorded\n');
    return 0;
  }
  if (cmd === 'ask') {
    const facts = arg(argv, '--facts');
    const r = ask(root, argv.slice(1).filter((x, i, all) => !x.startsWith('--') && all[i - 1] !== '--facts').join(' ').trim(), facts ? fs.readFileSync(facts, 'utf8').trim() : '');
    process.stdout.write(r.file + '\n\nGive the Agent tool the file above as the prompt, verbatim. The gate lets it through once; a second call on the same question or a longer prompt is refused.\nThen: advice.js record --reply <file with the answer> --cost "<tokens, seconds>"\n');
    return 0;
  }
  if (cmd === 'record') {
    const r = record(root, { id: arg(argv, '--id'), reply: arg(argv, '--reply'), cost: arg(argv, '--cost') });
    process.stdout.write(r.file + (r.cut ? ' (reply cut at ' + REPLY_MAX + ' characters)' : '') + '\n');
    return 0;
  }
  process.stdout.write([
    'advice.js list                                   the consultation records under ' + DIR + '/',
    'advice.js ask <question> [--facts <file>]        write a ?? question under ' + ASK_DIR + '/, arm the gate for one call',
    'advice.js record --reply <file> [--cost <s>]     file the answer next to the question, cut at ' + REPLY_MAX + ' characters',
    '',
    'The PreToolUse gate in hooks/scout.js lets each question out once; the model is yours to pick.',
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

module.exports = { ask, askText, gate, record, list, slugOf, DIR, ASK_DIR, MARK, REPLY_MAX };
