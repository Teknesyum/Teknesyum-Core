#!/usr/bin/env node
const { main } = require('./lib.js');
const scout = require('../scripts/scout.js');
const advice = require('../scripts/advice.js');

function gate(j) {
  return scout.gate(j) || advice.gate(j);
}

if (require.main === module) main(gate);

module.exports = { gate };
