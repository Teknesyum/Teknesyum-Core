const fs = require('fs');
const path = require('path');

const WORDS = {
  iki: 2, üç: 3, uc: 3, dört: 4, dort: 4, beş: 5, bes: 5, altı: 6, alti: 6,
  yedi: 7, sekiz: 8, dokuz: 9, on: 10, oniki: 12,
  two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12,
};

const TAIL = '(?![A-Za-zÇĞİÖŞÜçğıöşü])';

const COUNTED = new RegExp(
  '^(madde|öğe|oge|sav|satır|satir|dosya|ölçü|olcu|test|testi|kusur|adım|adim|bulgu|item|items' +
    '|file|files|line|lines|check|checks|assertion|assertions|step|steps|finding|findings|row|rows)' +
    TAIL,
  'i'
);

const UNIT = new RegExp('^(ms|sn|s|dk|kat|x|×|%|mb|kb|gb|px|token|tokens)' + TAIL, 'i');

const NEAR = 2;

function canon(raw) {
  const s = String(raw).replace(/\s/g, '');
  // This checker accepts decimal comma or decimal point, not ambiguous
  // thousands grouping. Dropping punctuation made 1.2 equal to 12.
  if (/^-?\d+(?:[.,]\d+)?$/.test(s)) return new Set([String(Number(s.replace(',', '.')))]);
  return new Set([s]);
}

function numbersIn(text) {
  const out = [];
  const re = /(?<![\w,.])-?\d+(?:[.,]\d+)*/g;
  let m;
  while ((m = re.exec(String(text)))) out.push({ raw: m[0], at: m.index });
  return out;
}

function sections(body) {
  const lines = String(body).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let cur = { title: '', line: 1, prose: [], support: [], bullets: 0 };
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) {
      fence = !fence;
      continue;
    }
    if (fence) {
      cur.support.push(line);
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      out.push(cur);
      cur = { title: line.replace(/^#+\s*/, ''), line: i + 1, prose: [], support: [line], bullets: 0 };
      continue;
    }
    if (/^\|/.test(line)) {
      if (!cur.tableFirst) cur.tableFirst = i + 1;
      cur.tableLast = i + 1;
      cur.support.push(line);
      continue;
    }
    if (/^[-*+]\s|^\d+[.)]\s/.test(line)) {
      cur.bullets += 1;
      if (!cur.first) cur.first = i + 1;
      cur.last = i + 1;
      cur.support.push(line);
      continue;
    }
    if (line) cur.prose.push({ text: line, line: i + 1 });
  }
  out.push(cur);
  return out.filter((s) => s.prose.length);
}

function supportSet(section, extra) {
  const set = new Set(extra);
  for (const line of section.support)
    for (const n of numbersIn(line)) for (const c of canon(n.raw)) set.add(c);
  return set;
}

function hasTable(section) {
  return section.support.some((l) => /^\|/.test(l));
}

function claimShape(text, hit) {
  const after = text.slice(hit.at + hit.raw.length);
  const tail = after.replace(/^[\s'"`)\-–—]*/, '');
  if (UNIT.test(tail)) return 'unit';
  if (/[.,]/.test(hit.raw)) return 'value';
  return '';
}

function columnSums(section) {
  const cols = [];
  for (const line of section.support) {
    if (!/^\|/.test(line)) continue;
    const cells = line.split('|').slice(1, -1);
    if (/^\s*\**\s*(total|toplam|sum)\b/i.test(cells[0] || '')) continue;
    for (let i = 0; i < cells.length; i++) {
      const n = numbersIn(cells[i]);
      if (!n.length) continue;
      cols[i] = (cols[i] || 0) + Number(String(n[0].raw).replace(',', '.'));
    }
  }
  return cols.filter((x) => Number.isFinite(x) && x);
}

function rounded(value, sums) {
  const n = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n) || !n) return false;
  return sums.some((s) => Math.abs(s - n) <= 1e-9 * Math.max(1, Math.abs(s), Math.abs(n)));
}

function nearTable(section, line) {
  if (!section.tableFirst) return false;
  return line >= section.tableFirst - NEAR && line <= section.tableLast + 1;
}

function adjacent(section, line) {
  if (!section.first) return false;
  return line === section.first - 1 || line === section.first - 2;
}

const ARITHMETIC = /\d+\s*[x×*\/+]\s*\d/;

function counting(text) {
  const out = [];
  if (ARITHMETIC.test(text)) return out;
  const re = /(?<![\w,.\-])(-?\d+|[A-Za-zÇĞİÖŞÜçğıöşü]+)[\s'"`]*([A-Za-zÇĞİÖŞÜçğıöşü]+)/g;
  let m;
  while ((m = re.exec(text))) {
    if (!COUNTED.test(m[2])) continue;
    const head = m[1];
    const n = /^-?\d+$/.test(head) ? Number(head) : WORDS[head.toLowerCase()];
    if (n === undefined || !Number.isFinite(n)) continue;
    out.push({ n, phrase: m[0].trim() });
  }
  return out;
}

function inspect(file, extra) {
  let body = '';
  try {
    body = fs.readFileSync(file, 'utf8');
  } catch {
    return [{ file, line: 0, why: 'cannot be read' }];
  }
  const found = [];
  for (const s of sections(body)) {
    const support = supportSet(s, extra);
    const table = hasTable(s);
    const sums = table ? columnSums(s) : [];
    for (const p of s.prose) {
      if (/^<!--/.test(p.text)) continue;
      const plain = p.text.replace(/`[^`]*`/g, ' ');
      if (table && nearTable(s, p.line))
        for (const hit of numbersIn(plain)) {
          if (!claimShape(plain, hit)) continue;
          if ([...canon(hit.raw)].some((c) => support.has(c))) continue;
          if (rounded(hit.raw, sums)) continue;
          found.push({
            file,
            line: p.line,
            why: hit.raw + ' is claimed in prose but is in no cell of this section',
            text: p.text,
          });
        }
      if (!table && s.bullets && adjacent(s, p.line))
        for (const c of counting(plain))
          if (c.n !== s.bullets)
            found.push({
              file,
              line: p.line,
              why: '"' + c.phrase + '" but this section lists ' + s.bullets,
              text: p.text,
            });
    }
  }
  return found;
}

function main() {
  const argv = process.argv.slice(2);
  const files = [];
  const sources = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source') sources.push(argv[++i]);
    else if (!argv[i].startsWith('-')) files.push(argv[i]);
  }
  if (!files.length) {
    process.stdout.write('usage: manset.js <file.md> [more.md] [--source data.json]\n');
    return 0;
  }
  const extra = new Set();
  for (const s of sources) {
    let raw = '';
    try {
      raw = fs.readFileSync(s, 'utf8');
    } catch {
      continue;
    }
    for (const n of numbersIn(raw)) for (const c of canon(n.raw)) extra.add(c);
  }
  const findings = [];
  for (const f of files) findings.push(...inspect(f, extra));
  if (!findings.length) {
    process.stdout.write('manset: ' + files.length + ' file(s), no unsupported number\n');
    return 0;
  }
  const out = [];
  for (const f of findings) {
    out.push(path.relative(process.cwd(), f.file).replace(/\\/g, '/') + ':' + f.line + '  ' + f.why);
    if (f.text) out.push('    ' + f.text.slice(0, 100));
  }
  out.push('');
  out.push(findings.length + ' number(s) in prose that the section itself does not produce.');
  out.push('Either quote the figure the table gives, or put the figure in the table.');
  process.stdout.write(out.join('\n') + '\n');
  return Math.min(findings.length, 100);
}

if (require.main === module) process.exit(main());

module.exports = { inspect, sections, canon };
