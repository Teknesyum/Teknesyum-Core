const fs = require('fs');
const path = require('path');

const root =
  process.env.CLAUDE_CONFIG_DIR ||
  path.join(process.env.USERPROFILE || process.env.HOME || '.', '.claude');

const bases = [
  path.join(root, 'plugins', 'cache', 'teknesyum', 'teknesyum-core'),
  path.join(root, 'plugins', 'teknesyum', 'teknesyum-core'),
];

function compare(a, b) {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  return y[0] - x[0] || y[1] - x[1] || y[2] - x[2];
}

function newest() {
  for (const d of bases) {
    let versions = [];
    try {
      versions = fs.readdirSync(d).filter((x) => /^\d+\.\d+\.\d+$/.test(x));
    } catch {
      continue;
    }
    versions.sort(compare);
    for (const v of versions) {
      const p = path.join(d, v, 'scripts', 'statusline.js');
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

const target = newest();
if (!target) {
  process.stdout.write('teknesyum-core: plugin not found');
  process.exit(0);
}
const mod = require(target);
if (require.main !== mod && typeof mod.main === 'function') mod.main();
