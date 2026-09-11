#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');

function file() {
  return path.join(os.tmpdir(), 'teknesyum-sonda.log');
}

function line(j) {
  const keys = Object.keys(j || {}).sort().join(',');
  return [new Date().toISOString(), j && j.hook_event_name, keys].join(' ') + '\n';
}

function probe(j) {
  try { fs.appendFileSync(file(), line(j)); } catch {}
  return '';
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try { probe(JSON.parse(raw)); } catch { probe(null); }
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { probe, line, file };
