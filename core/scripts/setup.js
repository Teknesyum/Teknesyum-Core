#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { configRoot, stateFile, read, write, t } = require('../hooks/lib.js');

const argv = process.argv.slice(2);

function flag(name) {
  const hit = argv.find((a) => a === '--' + name || a.startsWith('--' + name + '='));
  if (!hit) return null;
  if (hit.includes('=')) return hit.slice(hit.indexOf('=') + 1);
  const i = argv.indexOf(hit);
  return argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
}

function has(name) {
  return argv.some((a) => a === '--' + name || a.startsWith('--' + name + '='));
}

const QUESTIONS = [
  {
    key: 'lang',
    ask: 'ask.lang',
    parse: (v) => (/^(tr|turkce|turkish)$/i.test(String(v).trim()) ? 'tr' : 'en'),
    fallback: 'en',
  },
  {
    key: 'contractLang',
    ask: 'ask.contractLang',
    parse: (v) => (/^(tr|turkce|turkish)$/i.test(String(v).trim()) ? 'tr' : 'en'),
    fallback: 'en',
  },
  {
    key: 'profile',
    ask: 'ask.profile',
    parse: (v) => {
      const p = String(v).trim().toLowerCase();
      return /^(eco|premium)$/.test(p) ? p : 'normal';
    },
    fallback: 'normal',
  },
  {
    key: 'notify',
    ask: 'ask.notify',
    parse: (v) => /^(y|yes|e|evet|true|1)$/i.test(String(v)),
    fallback: true,
  },
  {
    key: 'research',
    ask: 'ask.research',
    parse: (v) => /^(y|yes|e|evet|true|1)$/i.test(String(v)),
    fallback: true,
  },
  {
    key: 'privateRepo',
    ask: 'ask.privateRepo',
    parse: (v) => (String(v).trim() ? String(v).trim() : null),
    fallback: null,
  },
];

function which(cmd) {
  const r = spawnSync(cmd + ' --version', { encoding: 'utf8', windowsHide: true, shell: true });
  return r.error || r.status !== 0 ? null : String(r.stdout || '').split('\n')[0].trim();
}

function settingsPath() {
  return path.join(configRoot(), 'settings.json');
}

function pluginDir() {
  return path.resolve(__dirname, '..');
}

function findCore() {
  const seen = [process.env.TEKNESYUM_CORE];
  let d = process.cwd();
  for (;;) {
    seen.push(d);
    const up = path.dirname(d);
    if (up === d) break;
    d = up;
  }
  for (const c of seen) {
    try {
      if (c && fs.existsSync(path.join(c, 'core', '.claude-plugin', 'plugin.json')))
        return c.replace(/\\/g, '/');
    } catch {}
  }
  return null;
}

function inspect() {
  const cfg = read(stateFile('config')) || {};
  const s = read(settingsPath()) || {};
  const bridge = path.join(pluginDir(), 'scripts', 'bridge.js');
  const wired =
    s.statusLine && typeof s.statusLine.command === 'string' && s.statusLine.command.includes('bridge.js');
  return {
    node: which('node'),
    git: which('git'),
    pluginDir: pluginDir(),
    configFile: stateFile('config'),
    settingsFile: settingsPath(),
    statuslineWired: !!wired,
    bridge,
    answered: QUESTIONS.filter((q) => cfg[q.key] !== undefined).map((q) => q.key),
    missing: QUESTIONS.filter((q) => cfg[q.key] === undefined).map((q) => ({
      flag: '--' + q.key,
      ask: t(q.ask),
    })),
    config: cfg,
  };
}

function wireStatusline() {
  const p = settingsPath();
  let s = {};
  let had = false;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    had = true;
    s = JSON.parse(raw);
    if (!s || typeof s !== 'object' || Array.isArray(s)) throw new Error('not an object');
    fs.writeFileSync(p + '.bak', raw, 'utf8');
  } catch (e) {
    if (had)
      throw new Error(
        'refusing to touch ' +
          p +
          ' - it is there but cannot be read as JSON (' +
          String((e && e.message) || e) +
          '). Fix or move it, then run setup again. Nothing was written.'
      );
    s = {};
  }
  const bridge = path.join(pluginDir(), 'scripts', 'bridge.js').replace(/\\/g, '/');
  s.statusLine = { type: 'command', command: 'node "' + bridge + '"', padding: 0 };
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(s, null, 2) + '\n', 'utf8');
  return bridge;
}

function apply(answers) {
  const cfg = read(stateFile('config')) || {};
  for (const q of QUESTIONS) {
    if (answers[q.key] === undefined) continue;
    cfg[q.key] = answers[q.key];
  }
  for (const q of QUESTIONS) if (cfg[q.key] === undefined) cfg[q.key] = q.fallback;
  cfg.installedAt = cfg.installedAt || new Date().toISOString();
  cfg.pluginDir = pluginDir();
  if (!cfg.coreRepo) {
    const core = findCore();
    if (core) cfg.coreRepo = core;
  }
  write(stateFile('config'), cfg);

  const beep = path.join(configRoot(), 'teknesyum-beep.json');
  const current = read(beep) || {};
  current.muted = cfg.notify === false;
  fs.mkdirSync(path.dirname(beep), { recursive: true });
  fs.writeFileSync(beep, JSON.stringify(current, null, 2) + '\n', 'utf8');

  const bridge = wireStatusline();
  const labels = ['setup.config', 'setup.statusline', 'setup.contractLang', 'setup.profile', 'setup.sound', 'setup.research', 'setup.private', 'setup.core'];
  const width = Math.max(...labels.map((k) => t(k).length)) + 2;
  const row = (k, v) => '  ' + t(k).padEnd(width) + v;

  return [
    t('setup.done'),
    '',
    row('setup.config', stateFile('config')),
    row('setup.statusline', bridge),
    row('setup.contractLang', cfg.contractLang || 'en'),
    row('setup.profile', cfg.profile || 'normal'),
    row('setup.sound', t(cfg.notify ? 'setup.on' : 'setup.off')),
    row('setup.research', t(cfg.research ? 'setup.gated' : 'setup.off')),
    row('setup.private', cfg.privateRepo || t('setup.none')),
    row('setup.core', cfg.coreRepo || t('setup.none')),
    '',
    t('setup.applies'),
  ].join('\n');
}

function interactive() {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answers = {};
  const state = inspect();
  process.stdout.write('Teknesyum Core setup\n\n');
  if (!state.git) process.stdout.write('  warning: git not found; contract sealing needs it\n\n');

  let i = 0;
  const next = () => {
    if (i >= QUESTIONS.length) {
      rl.close();
      process.stdout.write('\n' + apply(answers) + '\n');
      return;
    }
    const q = QUESTIONS[i++];
    rl.question('  ' + q.ask + '\n  > ', (v) => {
      answers[q.key] = String(v).trim() ? q.parse(v) : q.fallback;
      process.stdout.write('\n');
      next();
    });
  };
  next();
}

function main() {
  if (has('check')) {
    process.stdout.write(JSON.stringify(inspect(), null, 2) + '\n');
    return;
  }
  if (has('apply') || QUESTIONS.some((q) => has(q.key))) {
    const answers = {};
    for (const q of QUESTIONS) {
      const v = flag(q.key);
      if (v !== null) answers[q.key] = q.parse(v);
    }
    process.stdout.write(apply(answers) + '\n');
    return;
  }
  if (process.stdin.isTTY) return interactive();
  process.stdout.write(
    [
      'No TTY, so nothing was asked.',
      '',
      'Run `node setup.js --check` for the JSON of what is missing, ask the user those',
      'questions, then call `node setup.js --apply` with the flags.',
      '',
      'Flags: ' + QUESTIONS.map((q) => '--' + q.key).join(' '),
    ].join('\n') + '\n'
  );
}

if (require.main === module) main();
module.exports = { inspect, apply, QUESTIONS };
