const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const EXT = { '.js': 1, '.cjs': 1, '.mjs': 1, '.json': 1 };
const ESM = /Cannot use import statement|Unexpected token 'export'|await is only valid/;

function check(j) {
  if (!/^(Write|Edit|NotebookEdit)$/.test(j.tool_name || '')) return '';
  const f = String((j.tool_input || {}).file_path || '');
  const ext = path.extname(f).toLowerCase();
  if (!EXT[ext]) return '';
  if (ext === '.json' && /tsconfig|[/\\]\.vscode[/\\]/i.test(f)) return '';
  let body = '';
  try {
    body = fs.readFileSync(f, 'utf8');
  } catch {
    return '';
  }
  if (ext === '.json') {
    try {
      JSON.parse(body);
      return '';
    } catch (e) {
      return msg(f, e.message);
    }
  }
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: ['ignore', 'ignore', 'pipe'], timeout: 5000 });
    return '';
  } catch (e) {
    const h = String((e.stderr && e.stderr.toString()) || e.message || '');
    if (ESM.test(h)) return '';
    return msg(f, h);
  }
}

function msg(f, h) {
  const line = h.split(/\r?\n/).filter((l) => /SyntaxError|Unexpected|position|line/.test(l)).slice(0, 2).join(' ').slice(0, 300);
  return JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: path.basename(f) + ' does not parse: ' + line },
  });
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', (d) => (raw += d));
  process.stdin.on('end', () => {
    let out = '';
    try {
      out = check(JSON.parse(raw));
    } catch {}
    if (out) process.stdout.write(out);
    process.exit(0);
  });
}

module.exports = { check };
