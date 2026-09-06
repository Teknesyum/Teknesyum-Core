#!/usr/bin/env node
const { gate } = require('../scripts/scout.js');

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
