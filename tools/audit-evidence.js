#!/usr/bin/env node
// Read-only evidence extraction. No prompts, replies, credentials or raw logs in output.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const argv = process.argv.slice(2);
const arg = (key) => argv[argv.indexOf(key) + 1];
const source = arg('--transcript');
if (!argv.includes('--transcript') || !source) throw new Error('--transcript <jsonl> required');
const calls = new Map();
const results = new Map();
const seenRequests = new Set();
let duplicateRequestsAcrossFiles = 0;
function usage(file) {
  const data = fs.readFileSync(file);
  const rows = data.toString('utf8').split('\n');
  const requests = new Map();
  let invalid = 0;
  for (const line of rows) {
    if (!line.trim()) continue;
    let row; try { row = JSON.parse(line); } catch { invalid++; continue; }
    const m = row.message || {};
    if (row.type === 'assistant' && m.usage) {
      const key = row.requestId || m.id;
      if (key) {
        const next = { model: m.model, ...m.usage };
        const old = requests.get(key);
        // Transcript fragments may repeat a request with partial usage; retain
        // the largest reported counter rather than summing fragments.
        if (old) for (const [k, v] of Object.entries(old)) {
          if (typeof v === 'number') next[k] = Math.max(v, Number(next[k]) || 0);
          if (k === 'cache_creation') next[k] = Object.fromEntries(
            [...new Set([...Object.keys(v || {}), ...Object.keys(next[k] || {})])]
              .map((sub) => [sub, Math.max(v?.[sub] || 0, next[k]?.[sub] || 0)]));
        }
        requests.set(key, next);
      }
    }
    if (file === source && Array.isArray(m.content)) {
      for (const b of m.content) {
        if (b.type === 'tool_use' && /^(Agent|Task)$/.test(b.name))
          calls.set(b.id, { model: b.input.model || '(omitted)', type: b.input.subagent_type || '',
            legacyRole: /agents[\\/](builder|auditor|advisor)\.md/i.test(b.input.prompt || '') });
        if (b.type === 'tool_result' && row.toolUseResult) results.set(b.tool_use_id, row.toolUseResult);
      }
    }
  }
  const models = {};
  for (const [key, u] of requests) {
    if (seenRequests.has(key)) { duplicateRequestsAcrossFiles++; continue; }
    seenRequests.add(key);
    const r = models[u.model] ||= { requests: 0, input: 0, cacheCreate: 0, cacheRead: 0, output: 0, write5m: 0, write1h: 0 };
    r.requests++;
    r.input += u.input_tokens || 0; r.cacheCreate += u.cache_creation_input_tokens || 0;
    r.cacheRead += u.cache_read_input_tokens || 0; r.output += u.output_tokens || 0;
    r.write5m += u.cache_creation?.ephemeral_5m_input_tokens || 0;
    r.write1h += u.cache_creation?.ephemeral_1h_input_tokens || 0;
  }
  return { file: path.basename(file), bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex'), invalid, models };
}
const parent = usage(source);
const childDir = source.replace(/\.jsonl$/, '') + '/subagents';
const children = [];
if (argv.includes('--children') && fs.existsSync(childDir)) {
  for (const f of fs.readdirSync(childDir).filter((f) => f.endsWith('.jsonl'))) children.push(usage(path.join(childDir, f)));
}
const launches = {};
const responseKeys = new Set();
for (const [id, c] of calls) {
  const r = results.get(id);
  if (r && typeof r === 'object') Object.keys(r).forEach((k) => responseKeys.add(k));
  const resolved = r?.model || r?.resolvedModel || r?.resolved_model || '(unknown)';
  const k = c.model + ' -> ' + resolved;
  launches[k] = (launches[k] || 0) + 1;
}
let contracts;
if (argv.includes('--relay')) {
  const relay = arg('--relay');
  const rows = [];
  for (const folder of ['', 'done', 'beklemede']) {
    const dir = path.join(relay, 'contracts', folder);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).filter((f) => /^[A-Za-z]+\d+[a-z]?\.md$/.test(f))) {
      const body = fs.readFileSync(path.join(dir, name), 'utf8');
      const field = (k) => (body.match(new RegExp('^' + k + ':[ \\t]*(.*)$', 'im')) || [])[1]?.trim() || '';
      rows.push({ id: name.slice(0, -3), folder: folder || 'open', model: field('model'), role: field('role'), round: field('round'), risk: field('risk'), status: field('status') });
    }
  }
  const counts = {};
  for (const r of rows) { const k = r.folder + '/' + r.model; counts[k] = (counts[k] || 0) + 1; }
  contracts = { counts, total: rows.length, cheapFirstCandidates: rows.filter((r) => r.folder === 'done' && r.model === 'opus' && Number(r.round) <= 1 && !r.risk).map((r) => r.id), rows };
}
const childModels = {};
for (const child of children) for (const [model, u] of Object.entries(child.models)) {
  const r = childModels[model] ||= {};
  for (const [k, n] of Object.entries(u)) r[k] = (r[k] || 0) + n;
}
console.log(JSON.stringify({ capturedAt: new Date().toISOString(), parent, childFiles: children.length, childModels, duplicateRequestsAcrossFiles,
  launches, uniqueLaunchCalls: calls.size, legacyRoleLaunches: [...calls.values()].filter((c) => c.legacyRole).length,
  responseKeys: [...responseKeys], contracts }, null, 2));
