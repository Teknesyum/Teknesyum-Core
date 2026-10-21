#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

const HELP = `gozcu.js: a pass-through proxy that writes numbers, never content

  node gozcu.js [--port 8790] [--upstream https://api.anthropic.com] [--log <file>]

Point a session at it with ANTHROPIC_BASE_URL=http://127.0.0.1:<port>.
Each request adds one line to the log: time, model, system/tools/messages bytes,
a hash of the system and tools prefix, usage, time to first byte and total time.
Headers and message text are never written.
Default log: ~/.claude/teknesyum/gozcu/<day>.jsonl`;

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

function size(v) {
  return v === undefined ? 0 : Buffer.byteLength(JSON.stringify(v));
}

function shape(body) {
  let j;
  try { j = JSON.parse(body.toString('utf8')); } catch { return { bytes: body.length }; }
  return {
    bytes: body.length,
    model: j.model || null,
    stream: !!j.stream,
    system: size(j.system),
    tools: Array.isArray(j.tools) ? j.tools.length : 0,
    toolBytes: size(j.tools),
    messages: Array.isArray(j.messages) ? j.messages.length : 0,
    messageBytes: size(j.messages),
    prefix: crypto.createHash('sha1').update(JSON.stringify([j.system || null, j.tools || null])).digest('hex').slice(0, 8),
  };
}

function usage(text, sse) {
  const u = {};
  const take = (x) => {
    if (!x) return;
    for (const k of ['input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'output_tokens']) {
      if (typeof x[k] === 'number') u[k] = x[k];
    }
  };
  if (!sse) {
    try { take(JSON.parse(text).usage); } catch {}
    return u;
  }
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('data:')) continue;
    let e;
    try { e = JSON.parse(line.slice(5)); } catch { continue; }
    if (e.type === 'message_start') take(e.message && e.message.usage);
    if (e.type === 'message_delta') take(e.usage);
  }
  return u;
}

function proxy(opts) {
  const up = new URL(opts.upstream);
  const lib = up.protocol === 'https:' ? https : http;
  const write = (row) => {
    try {
      fs.mkdirSync(path.dirname(opts.log), { recursive: true });
      fs.appendFileSync(opts.log, JSON.stringify(row) + '\n');
    } catch {}
  };
  return http.createServer((req, res) => {
    const start = Date.now();
    const parts = [];
    req.on('data', (c) => parts.push(c));
    req.on('end', () => {
      const body = Buffer.concat(parts);
      const headers = { ...req.headers, host: up.host };
      delete headers['accept-encoding'];
      if (body.length) headers['content-length'] = String(body.length);
      const target = new URL(req.url, up);
      const out = lib.request(target, { method: req.method, headers }, (r) => {
        const first = Date.now() - start;
        res.writeHead(r.statusCode, r.headers);
        const seen = [];
        r.on('data', (c) => { seen.push(c); res.write(c); });
        r.on('end', () => {
          res.end();
          if (!/\/messages(\?|$)/.test(req.url) || req.method !== 'POST') return;
          const sse = /event-stream/.test(r.headers['content-type'] || '');
          write({ at: new Date(start).toISOString(), path: req.url.split('?')[0], status: r.statusCode, ...shape(body), usage: usage(Buffer.concat(seen).toString('utf8'), sse), firstMs: first, ms: Date.now() - start });
        });
      });
      out.on('error', (e) => {
        if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ type: 'error', error: { type: 'gozcu', message: e.message } }));
        write({ at: new Date(start).toISOString(), path: req.url.split('?')[0], status: 502, error: e.message, ms: Date.now() - start });
      });
      out.end(body);
    });
  });
}

function defaultLog() {
  const root = process.env.CLAUDE_CONFIG_DIR || path.join(require('os').homedir(), '.claude');
  return path.join(root, 'teknesyum', 'gozcu', new Date().toISOString().slice(0, 10) + '.jsonl');
}

if (require.main === module) {
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    console.log(HELP);
    process.exit(0);
  }
  const opts = { port: Number(arg('--port', 8790)), upstream: arg('--upstream', 'https://api.anthropic.com'), log: path.resolve(arg('--log', defaultLog())) };
  proxy(opts).listen(opts.port, '127.0.0.1', () => console.log(`gozcu: 127.0.0.1:${opts.port} -> ${opts.upstream}, log ${opts.log}`));
}

module.exports = { proxy, shape, usage };
