const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const core = path.resolve(__dirname, '../core');
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-host-fixture-'));
const config = path.join(scratch, 'config');
fs.mkdirSync(config);
const env = { ...process.env, CLAUDE_CONFIG_DIR: config, TEKNESYUM_BEEP_SESSIZ: '1', TEKNESYUM_GATE_OPEN: '' };
delete env.CLAUDE_CODE_SESSION_ID;
delete env.CLAUDE_CODE_HOST_SESSION_ID;
function run(root, script, args = [], payload) {
  const r = spawnSync(process.execPath, [path.join(core, script), ...args], {
    cwd: root, env, input: payload ? JSON.stringify({ cwd: root, ...payload }) : undefined,
    encoding: 'utf8', windowsHide: true, timeout: 20000,
  });
  if (r.error) throw r.error;
  return r;
}
function observeAuditor(root, id, runId, options = {}) {
  const toolUseId = 'fixture-' + require('crypto').randomUUID();
  const input = { model: 'opus', subagent_type: 'teknesyum-core:worker', prompt: 'Read roles/auditor.md and contracts/' + id + '.md' };
  const parent = { tool_name: 'Agent', agent_id: 'test-parent-' + id, tool_use_id: toolUseId, tool_input: input };
  let r = run(root, 'hooks/watch.js', [], { ...parent, hook_event_name: 'PreToolUse' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const transcript = path.join(scratch, toolUseId + '.jsonl');
  fs.writeFileSync(transcript, JSON.stringify({ type: 'assistant', message: {
    content: [{ type: 'text', text: options.reply || 'verdict: passed\nfindings: none\nrecord: coordinator records after completion' }],
  } }) + '\n');
  r = run(root, 'hooks/watch.js', [], {
    hook_event_name: 'SubagentStop', agent_id: runId, agent_type: 'auditor', agent_transcript_path: transcript,
  });
  assert.equal(r.status, 0, r.stderr);
  r = run(root, 'hooks/watch.js', [], {
    ...parent, hook_event_name: 'PostToolUse', tool_response: { agentId: runId, resolvedModel: 'claude-opus-5' },
  });
  assert.equal(r.status, 0, r.stderr);
  const relay = require(path.join(core, 'hooks/lib.js')).relayRoot(root).relay;
  return JSON.parse(fs.readFileSync(path.join(relay, 'live', runId + '.json'), 'utf8'));
}
function issueAudit(root, id, runId, options) {
  observeAuditor(root, id, runId, options);
  const r = run(root, 'scripts/contract.js', ['audit', '--id', id, '--run-id', runId, '--verification', 'synthetic fixture verification -> exit 0']);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const relay = require(path.join(core, 'hooks/lib.js')).relayRoot(root).relay;
  const file = require(path.join(core, 'hooks/seal.js')).recordPath(relay, id, '1');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
module.exports = { run, observeAuditor, issueAudit, core, scratch };

