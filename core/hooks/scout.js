#!/usr/bin/env node
const scout = require('../scripts/scout.js');
const advice = require('../scripts/advice.js');

function gate(j) {
  return scout.gate(j) || advice.gate(j);
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    try {
      const out = gate(JSON.parse(raw));
      if (out) process.stdout.write(JSON.stringify(out));
    } catch {}
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { gate };
