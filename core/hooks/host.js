#!/usr/bin/env node
const fs = require('fs');
const { stateFile, drain } = require('./lib.js');

const SHELL = /^run_shell_command$/;
const WRITE = /^(write_file|replace)$/;

function load(name) {
  return require('./' + name + '.js');
}

function context(out) {
  try { return JSON.parse(out).hookSpecificOutput.additionalContext || ''; } catch { return ''; }
}

function why(d) {
  return (d && d.hookSpecificOutput && d.hookSpecificOutput.permissionDecisionReason) || '';
}

function guard(j) {
  const p = { ...j, hook_event_name: 'PreToolUse', tool_name: 'Bash' };
  return load('yasak').decide(p) || load('loop').decide(p);
}

function text(res) {
  if (res == null) return '';
  if (typeof res === 'string') return res;
  return String(res.stdout || res.output || res.llmContent || res.returnDisplay || '');
}

function cursor(ev, raw) {
  const session = String(raw.conversation_id || raw.session_id || 'none');
  const cwd = (Array.isArray(raw.workspace_roots) && raw.workspace_roots[0]) || process.env.CURSOR_PROJECT_DIR || process.cwd();
  const base = { session_id: session, cwd, transcript_path: raw.transcript_path || '' };
  drain(session);
  if (ev === 'sessionStart') {
    const ctx = context(load('count').handle({ ...base, hook_event_name: 'SessionStart', source: 'startup' }));
    return ctx ? { additional_context: ctx } : null;
  }
  if (ev === 'beforeSubmitPrompt') {
    const mod = load('mod');
    const prompt = String(raw.prompt || '');
    const m = mod.mark(prompt);
    mod.expect(session, m ? m.rest : prompt);
    return { continue: true };
  }
  if (ev === 'beforeShellExecution') {
    const d = guard({ ...base, cwd: raw.cwd || cwd, tool_input: { command: raw.command } });
    if (!d) return null;
    return { permission: 'deny', user_message: drain(session).join('\n') || why(d), agent_message: why(d) };
  }
  if (ev === 'afterShellExecution') {
    load('count').handle({ ...base, hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: raw.command }, tool_response: { stdout: text(raw.output) } });
    return null;
  }
  if (ev === 'afterFileEdit') {
    load('count').handle({ ...base, hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: raw.file_path } });
    return null;
  }
  if (ev === 'stop') {
    load('count').handle({ ...base, hook_event_name: 'Stop' });
    if (raw.status && raw.status !== 'completed') return null;
    const d = load('dur').decide({ ...base, hook_event_name: 'Stop', stop_hook_active: Number(raw.loop_count) > 0 });
    return d ? { followup_message: d.reason } : null;
  }
  if (ev === 'sessionEnd') load('handoff').handle({ ...base, hook_event_name: 'SessionEnd' });
  return null;
}

function gemini(ev, raw) {
  const session = String(raw.session_id || process.env.GEMINI_SESSION_ID || 'none');
  const cwd = raw.cwd || process.env.GEMINI_CWD || process.env.GEMINI_PROJECT_DIR || process.cwd();
  const base = { session_id: session, cwd, transcript_path: raw.transcript_path || '' };
  const input = raw.tool_input || {};
  const add = (name, ctx) => (ctx ? { hookSpecificOutput: { hookEventName: name, additionalContext: ctx } } : null);
  let out = null;
  if (ev === 'SessionStart') {
    out = add(ev, context(load('count').handle({ ...base, hook_event_name: 'SessionStart', source: raw.source || 'startup' })));
  } else if (ev === 'BeforeAgent') {
    out = add(ev, context(load('mod').handle({ ...base, hook_event_name: 'UserPromptSubmit', prompt: raw.prompt })));
  } else if (ev === 'BeforeTool' && SHELL.test(raw.tool_name || '')) {
    const d = guard({ ...base, tool_input: { command: input.command } });
    if (d) out = { decision: 'deny', reason: why(d) };
  } else if (ev === 'AfterTool' && WRITE.test(raw.tool_name || '')) {
    out = add(ev, context(load('count').handle({ ...base, hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: input.file_path } })));
  } else if (ev === 'AfterTool' && SHELL.test(raw.tool_name || '')) {
    const res = raw.tool_response || {};
    const failed = !!(res && res.error);
    out = add(ev, context(load('count').handle({ ...base, hook_event_name: failed ? 'PostToolUseFailure' : 'PostToolUse', tool_name: 'Bash', tool_input: { command: input.command }, tool_response: { stdout: text(res) } })));
  } else if (ev === 'AfterAgent') {
    load('count').handle({ ...base, hook_event_name: 'Stop' });
    const d = load('dur').decide({ ...base, hook_event_name: 'Stop', stop_hook_active: !!raw.stop_hook_active });
    if (d) out = { decision: 'deny', reason: d.reason };
  } else if (ev === 'SessionEnd') {
    load('handoff').handle({ ...base, hook_event_name: 'SessionEnd' });
  }
  const lines = drain(session);
  return lines.length ? { ...(out || {}), systemMessage: lines.join('\n') } : out;
}

const HOSTS = { cursor, gemini };

function run(host, ev, raw) {
  const fn = HOSTS[host];
  if (!fn || !raw || typeof raw !== 'object') return null;
  return fn(ev, raw);
}

if (require.main === module) {
  const [host, ev] = process.argv.slice(2);
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = null;
    try { out = run(host, ev, JSON.parse(raw || '{}')); } catch (e) {
      try { fs.appendFileSync(stateFile('hook-errors').replace(/\.json$/, '.log'), new Date().toISOString() + ' host.js ' + host + ' ' + ev + ' ' + String((e && e.stack) || e) + '\n'); } catch {}
    }
    if (out) process.stdout.write(JSON.stringify(out));
    process.exit(0);
  });
  process.stdin.on('error', () => process.exit(0));
}

module.exports = { run, cursor, gemini, HOSTS };
