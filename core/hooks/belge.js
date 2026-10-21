#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { main, settings } = require('./lib.js');

const EXT = /\.(pdf|docx|pptx|xlsx)$/i;

function tool(name) {
  const p = (settings().tools || {})[name];
  if (p && fs.existsSync(p)) return p;
  const w = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], { encoding: 'utf8', windowsHide: true });
  return w.status === 0 ? String(w.stdout).split(/\r?\n/)[0].trim() : null;
}

function inside(file, root) {
  const r = path.relative(path.resolve(root), path.resolve(file));
  return r && !r.startsWith('..') && !path.isAbsolute(r);
}

function belge(j, bin) {
  const input = j.tool_input || {};
  const file = input.file_path;
  const cwd = j.cwd || process.cwd();
  if (j.tool_name !== 'Read' || !file || !EXT.test(file) || input.pages || !inside(file, cwd)) return '';
  let st;
  try { st = fs.statSync(file); } catch { return ''; }
  const exe = bin === undefined ? tool('markitdown') : bin;
  if (!exe) return '';
  const id = crypto.createHash('sha1').update(path.resolve(file) + ':' + st.size + ':' + st.mtimeMs).digest('hex').slice(0, 10);
  const out = path.join(cwd, 'tmp', 'belge', path.basename(file).replace(/\.[^.]+$/, '') + '-' + id + '.md');
  if (!fs.existsSync(out)) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const r = spawnSync(exe, [file, '-o', out], { encoding: 'utf8', windowsHide: true, timeout: 90000, shell: /\.(cmd|bat)$/i.test(exe) });
    if (r.status !== 0 || !fs.existsSync(out) || !fs.statSync(out).size) {
      try { fs.rmSync(out, { force: true }); } catch {}
      return '';
    }
  }
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
      updatedInput: { ...input, file_path: out },
    },
  };
}

if (require.main === module) main((j) => belge(j));

module.exports = { belge, inside, EXT };
