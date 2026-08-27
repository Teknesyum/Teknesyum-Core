#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { configRoot } = require('../hooks/lib.js');

const argv = process.argv.slice(2);

function arg(name) {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
}

function out(lines, code) {
  process.stdout.write(lines.join('\n') + '\n');
  process.exitCode = code || 0;
}

function stop(lines) {
  return out(lines, 2);
}

function prefsDir() {
  return path.join(configRoot(), 'teknesyum', 'prefs');
}

function licenseDir() {
  return path.resolve(__dirname, '..', 'assets', 'licenses');
}

function root() {
  return path.resolve(arg('root') || process.cwd());
}

function licenses() {
  try {
    return fs.readdirSync(licenseDir()).filter((f) => f.endsWith('.txt')).map((f) => f.replace(/\.txt$/, ''));
  } catch {
    return [];
  }
}

function writeLicense() {
  const spdx = arg('spdx') || 'AGPL-3.0-or-later';
  const src = path.join(licenseDir(), spdx + '.txt');
  if (!fs.existsSync(src))
    return stop(['Unknown license: ' + spdx, 'Available: ' + licenses().join(', ')]);

  const dst = path.join(root(), 'LICENSE');
  if (fs.existsSync(dst) && !argv.includes('--force'))
    return stop(['LICENSE already exists. Pass --force to replace it.']);

  fs.copyFileSync(src, dst);
  const touched = ['LICENSE'];

  for (const f of ['package.json', path.join('core', '.claude-plugin', 'plugin.json'), path.join('.claude-plugin', 'plugin.json')]) {
    const p = path.join(root(), f);
    if (!fs.existsSync(p)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (j.license === spdx) continue;
      j.license = spdx;
      fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
      touched.push(f);
    } catch {}
  }

  return out(['Wrote ' + spdx + ': ' + touched.join(', '), 'The license text was copied, not written by a model.']);
}

function readBlock(name) {
  try {
    return fs.readFileSync(path.join(prefsDir(), name), 'utf8').replace(/\s*$/, '');
  } catch {
    return null;
  }
}

function writeSignature() {
  const block = readBlock('signature.html');
  if (block === null)
    return stop([
      'No signature block: ' + path.join(prefsDir(), 'signature.html'),
      'This is personal and ships with no plugin. Nothing to do.',
    ]);

  const target = path.join(root(), arg('file') || 'README.md');
  if (!fs.existsSync(target)) return stop(['No such file: ' + target]);

  let body = fs.readFileSync(target, 'utf8');
  const mark = '<!-- signature -->';
  const payload = mark + '\n' + block + '\n';

  if (body.includes(mark)) {
    body = body.replace(new RegExp(mark + '[\\s\\S]*$'), payload);
  } else {
    body = body.replace(/\s*$/, '\n\n') + payload;
  }
  fs.writeFileSync(target, body, 'utf8');

  const copied = [];
  const assets = path.join(prefsDir(), 'assets');
  if (fs.existsSync(assets)) {
    const dst = path.join(root(), 'assets');
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(assets)) {
      fs.copyFileSync(path.join(assets, f), path.join(dst, f));
      copied.push('assets/' + f);
    }
  }
  return out(
    ['Signature written into ' + path.relative(root(), target)].concat(
      copied.length ? ['Assets copied: ' + copied.join(', ')] : []
    )
  );
}

function writeLangLink() {
  const pairs = [
    ['README.md', 'README.tr.md'],
    ['README.tr.md', 'README.md'],
  ];
  const labels = { 'README.md': 'English', 'README.tr.md': 'Türkçe' };
  const mark = '<!-- lang -->';
  const done = [];

  for (const [self, other] of pairs) {
    const p = path.join(root(), self);
    if (!fs.existsSync(p)) continue;
    const line =
      mark +
      '\n\n**' +
      labels[self] +
      '** · [' +
      labels[other] +
      '](' +
      other +
      ')\n';
    let body = fs.readFileSync(p, 'utf8');
    body = body.includes(mark)
      ? body.replace(new RegExp(mark + '\\n\\n[^\\n]*\\n'), line)
      : line + '\n' + body;
    fs.writeFileSync(p, body, 'utf8');
    done.push(self);
  }
  if (!done.length) return stop(['Neither README.md nor README.tr.md exists here.']);
  return out(['Language link written into ' + done.join(', ')]);
}

function help() {
  return out([
    'scaffold.js - writes the parts of a repository that never vary',
    '',
    '  license [--spdx <id>] [--force]   copy the license text, set the license field',
    '  signature [--file README.md]      append the author signature block, copy its assets',
    '  langlink                          link README.md and README.tr.md to each other',
    '',
    'Everything here is a copy or a substitution. No model writes this text,',
    'so none of it costs output tokens or sits in a transcript.',
    '',
    'Licenses available: ' + (licenses().join(', ') || 'none'),
  ]);
}

function main() {
  const cmd = argv[0];
  if (cmd === 'license') return writeLicense();
  if (cmd === 'signature') return writeSignature();
  if (cmd === 'langlink') return writeLangLink();
  return help();
}

if (require.main === module) main();
module.exports = { writeLicense, writeSignature, writeLangLink, licenses };
