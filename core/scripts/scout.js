#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const lib = require('../hooks/lib.js');
const { slugOf } = require('./advice.js');

const DIR = 'docs/oncul';
const MARK = '[[oncul:';
const SEARCHES = 5;
const PAGES = 3;
const CANDIDATES = 5;
const WORDS = 400;
const REPLY_MAX = 8000;
const MODEL = 'sonnet';

function stateFile() {
  return lib.stateFile('scout');
}

function nextNumber(dir) {
  let top = 0;
  try {
    for (const n of fs.readdirSync(dir)) {
      const m = /^(\d{3})-/.exec(n);
      if (m) top = Math.max(top, Number(m[1]));
    }
  } catch {}
  return top + 1;
}

function idOf(text) {
  const m = new RegExp(MARK.replace(/[[\]]/g, '\\$&') + '(\\d{3})\\]\\]').exec(String(text || ''));
  return m ? m[1] : '';
}

function briefText(id, topic) {
  return [
    MARK + id + ']]',
    '',
    '# Öncül arama: ' + topic,
    '',
    'Aşağıdaki konu için var olan çözümleri, kütüphaneleri ve depoları ara. Kod yazma, dosya yazma, depo klonlama.',
    '',
    '## Sınırlar',
    '',
    '- En fazla ' + SEARCHES + ' arama, en fazla ' + PAGES + ' sayfa açma. Sınır dolunca bulduğunla bitir.',
    '- En fazla ' + CANDIDATES + ' aday. Toplam ' + WORDS + ' kelimeyi geçme.',
    '- Bilmediğini "bilmiyorum" diye yaz; uydurma.',
    '',
    '## Konu',
    '',
    topic,
    '',
    '## Cevap biçimi',
    '',
    'Her aday tek satır: ad · bağlantı · lisans · son commit (ay/yıl) · neden uyar ya da uymaz.',
    'En sonda tek cümle: hangisiyle başlanmalı, ya da "hiçbiri, kendimiz yazmalıyız".',
    '',
  ].join('\n');
}

function brief(root, topic) {
  if (!topic) throw new Error('topic is empty');
  const dir = path.join(root, DIR);
  fs.mkdirSync(dir, { recursive: true });
  const id = String(nextNumber(dir)).padStart(3, '0');
  const slug = slugOf(topic.replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u'));
  const file = path.join(dir, id + '-' + slug + '-girdi.md');
  fs.writeFileSync(file, briefText(id, topic));
  lib.write(stateFile(), { id, slug, topic, at: new Date().toISOString(), spent: false, session: lib.sessionId() });
  return { id, file: path.relative(root, file).split(path.sep).join('/') };
}

const gate = lib.makeGate({ mark: MARK, state: 'scout', model: MODEL, max: 6000 });

function record(root, o) {
  const st = lib.read(stateFile()) || {};
  const id = o.id || st.id;
  if (!id) throw new Error('no brief to record against');
  const dir = path.join(root, DIR);
  const input = fs.readdirSync(dir).find((n) => n.startsWith(id + '-') && n.endsWith('-girdi.md'));
  if (!input) throw new Error('no brief ' + id + ' under ' + DIR);
  let reply = o.reply ? fs.readFileSync(o.reply, 'utf8').trim() : '';
  const cut = reply.length > REPLY_MAX;
  if (cut) reply = reply.slice(0, REPLY_MAX) + '\n\n[' + (reply.length - REPLY_MAX) + ' karakter kesildi]';
  const file = path.join(dir, input.replace(/-girdi\.md$/, '.md'));
  fs.writeFileSync(
    file,
    [
      '# Öncül: ' + (st.topic || id),
      '',
      '- tarih: ' + new Date().toISOString().slice(0, 10),
      '- girdi: ' + input,
      '- ajan: tek, ' + MODEL,
      '- maliyet: ' + (o.cost || '-'),
      '',
      '## Dönen',
      '',
      reply,
      '',
    ].join('\n')
  );
  return { file: path.relative(root, file).split(path.sep).join('/'), cut };
}

function arg(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 || i === argv.length - 1 ? '' : argv[i + 1];
}

function main(argv) {
  const cmd = argv[0];
  const root = process.cwd();
  if (cmd === 'brief') {
    const r = brief(root, argv.slice(1).filter((a) => !a.startsWith('--')).join(' ').trim());
    process.stdout.write(
      [
        r.file,
        '',
        'Give the Agent tool the file above as the prompt, verbatim, with subagent_type general-purpose and model ' + MODEL + '.',
        'The gate lets that call through once; a second call on the same brief, another model, or a longer prompt is refused.',
        'Then: scout.js record --reply <file with the answer> --cost "<tokens, seconds>"',
      ].join('\n') + '\n'
    );
    return;
  }
  if (cmd === 'record') {
    const r = record(root, { id: arg(argv, '--id'), reply: arg(argv, '--reply'), cost: arg(argv, '--cost') });
    process.stdout.write(r.file + (r.cut ? ' (reply cut at ' + REPLY_MAX + ' characters)' : '') + '\n');
    return;
  }
  process.stdout.write(
    [
      'scout.js brief <topic>                       write a bounded brief under ' + DIR + '/, arm the gate for one call',
      'scout.js record --reply <file> [--cost <s>]  file the answer next to the brief, cut at ' + REPLY_MAX + ' characters',
      '',
      'One agent, ' + MODEL + ', ' + SEARCHES + ' searches, ' + PAGES + ' pages, ' + CANDIDATES + ' candidates, ' + WORDS + ' words. The PreToolUse',
      'gate in hooks/scout.js enforces one call per brief and the model; the brief carries the rest.',
      'Nothing runs unless you ask, and nothing here enters the context on an ordinary turn.',
    ].join('\n') + '\n'
  );
}

if (require.main === module) {
  try {
    main(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(String((e && e.message) || e) + '\n');
    process.exit(1);
  }
}

module.exports = { brief, gate, record, idOf, briefText, MARK, MODEL, REPLY_MAX };
