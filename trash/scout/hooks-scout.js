#!/usr/bin/env node
const { main } = require('./lib.js');
const { gate } = require('../scripts/advice.js');

if (require.main === module) main(gate);

module.exports = { gate };
