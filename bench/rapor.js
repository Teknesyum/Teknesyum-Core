'use strict';

const fs = require('fs');
const path = require('path');

const SONUC_PATH = path.join(__dirname, 'sonuc.jsonl');
const RAPOR_PATH = path.join(__dirname, 'rapor.md');

const PAIRS = [
  { pair: 'eco', core: 'eco', native: 'native-eco' },
  { pair: 'normal', core: 'normal', native: 'native-normal' },
  { pair: 'premium', core: 'premium', native: 'native-premium' },
];

const TABLE_ROWS = [];
for (const p of PAIRS) {
  TABLE_ROWS.push({ pair: p.pair, kol: p.native });
  TABLE_ROWS.push({ pair: p.pair, kol: p.core });
}

function readJsonl(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => JSON.parse(l));
}

function groupBy(rows, field) {
  const out = {};
  for (const r of rows) {
    const key = r[field];
    if (!out[key]) out[key] = [];
    out[key].push(r);
  }
  return out;
}

function median(values) {
  const s = [...values].sort((a, b) => a - b);
  const n = s.length;
  if (n === 0) return null;
  if (n % 2 === 1) return s[(n - 1) / 2];
  return (s[n / 2 - 1] + s[n / 2]) / 2;
}

function minMaxMedianCell(values, fmt) {
  if (values.length === 0) return '—';
  if (values.length === 1) return 'tek koşu — raporlanmaz';
  const med = median(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return `${fmt(med)} (${fmt(min)}–${fmt(max)})`;
}

function checkConsistency(rows) {
  const byArm = groupBy(rows, 'arm');
  for (const [arm, armRows] of Object.entries(byArm)) {
    for (const field of ['modelId', 'ccVersion']) {
      const values = [...new Set(armRows.map((r) => r[field]))];
      if (values.length > 1) {
        return { arm, field, values };
      }
    }
  }
  return null;
}

function computeArmStats(rows) {
  const total = rows.length;
  const passCount = rows.filter((r) => r.pass).length;
  const droppedCount = rows.filter((r) => r.dropped).length;
  const usdValues = rows.map((r) => r.usd);
  const dkValues = rows.map((r) => r.wallMs / 60000);
  return {
    total,
    pass1Pct: total ? Math.round((passCount / total) * 100) : null,
    droppedPct: total ? Math.round((droppedCount / total) * 100) : null,
    usdCell: minMaxMedianCell(usdValues, (v) => '$' + v.toFixed(2)),
    dkCell: minMaxMedianCell(dkValues, (v) => v.toFixed(1)),
  };
}

// Durma kuralı (docs/BENCH.md bölüm 0), iki basamak, her basamakta medyan:
// 1. Bir görev tutar — o görevde Core kolunun medyan $'ı, eşlendiği native
//    kolunun aynı görevdeki medyan $'ını %40'tan fazla aşıyorsa. Koşu başına
//    eşleştirme yapılmaz (Core'un n. tekrarı ile native'in n. tekrarı bağımsız
//    koşulardır); her iki taraf için o görevdeki tüm tekrarların medyanı alınır.
//    Medyan hesaplanamıyorsa (tek koşu, ya da eşlenmiş native koşusu hiç yok)
//    görev tutmaz sayılır.
// 2. Bayrak kalkar — çift, en az iki görevde tutuyorsa (every değil).
function evaluateStopRule(rows) {
  const perPair = {};
  let anyFlag = false;

  for (const { pair, core, native } of PAIRS) {
    const coreRows = rows.filter((r) => r.arm === core);
    const nativeRows = rows.filter((r) => r.arm === native);
    const taskIds = [
      ...new Set([...coreRows, ...nativeRows].map((r) => r.taskId)),
    ];
    const taskHolds = {};
    const taskUnresolved = {};

    for (const taskId of taskIds) {
      const coreUsd = coreRows
        .filter((r) => r.taskId === taskId)
        .map((r) => r.usd);
      const nativeUsd = nativeRows
        .filter((r) => r.taskId === taskId)
        .map((r) => r.usd);

      if (coreUsd.length < 2 || nativeUsd.length < 2) {
        taskHolds[taskId] = false;
        taskUnresolved[taskId] = true;
        continue;
      }

      const coreMed = median(coreUsd);
      const nativeMed = median(nativeUsd);
      taskUnresolved[taskId] = false;
      taskHolds[taskId] =
        nativeMed > 0 && (coreMed - nativeMed) / nativeMed > 0.4;
    }

    const holdCount = taskIds.filter((t) => taskHolds[t]).length;
    const flagged = holdCount >= 2;
    if (flagged) anyFlag = true;
    perPair[pair] = { taskHolds, taskUnresolved, flagged };
  }

  return { anyFlag, perPair };
}

function stopRuleLine(stopRule) {
  const unresolvedNotes = [];
  for (const [pair, v] of Object.entries(stopRule.perPair)) {
    const unresolvedTasks = Object.entries(v.taskUnresolved)
      .filter(([, u]) => u)
      .map(([taskId]) => taskId);
    if (unresolvedTasks.length) {
      unresolvedNotes.push(
        `${pair}: ${unresolvedTasks.join(', ')} medyansız (tutmaz sayıldı)`
      );
    }
  }
  const suffix = unresolvedNotes.length
    ? ` (${unresolvedNotes.join('; ')})`
    : '';

  if (!stopRule.anyFlag) return `Durma kuralı: tetiklenmedi.${suffix}`;
  const pairs = Object.entries(stopRule.perPair)
    .filter(([, v]) => v.flagged)
    .map(([pair]) => pair);
  return `Durma kuralı: TETİKLENDİ — kol(lar): ${pairs.join(', ')}.${suffix}`;
}

function buildReport(rows) {
  const conflict = checkConsistency(rows);
  if (conflict) {
    return {
      ok: false,
      message: `Çakışma: kol '${conflict.arm}' içinde birden fazla ${conflict.field} görüldü: ${conflict.values.join(' / ')}`,
    };
  }

  const byArm = groupBy(rows, 'arm');
  const stopRule = evaluateStopRule(rows);

  const modelIds = [...new Set(rows.map((r) => r.modelId))].join(', ');
  const ccVersions = [...new Set(rows.map((r) => r.ccVersion))].join(', ');
  const dates = rows
    .map((r) => (r.startedAt ? String(r.startedAt).slice(0, 10) : null))
    .filter(Boolean)
    .sort();
  const date = dates.length ? dates[0] : new Date().toISOString().slice(0, 10);

  const lines = [];
  lines.push(stopRuleLine(stopRule));
  lines.push('');
  lines.push(`Tarih: ${date} · Model: ${modelIds} · Claude Code: ${ccVersions}`);
  lines.push('');
  lines.push('| Çift | Kol | pass@1 | medyan $ | medyan dk | düşen koşu |');
  lines.push('|---|---|---|---|---|---|');

  for (const { pair, kol } of TABLE_ROWS) {
    const armRows = byArm[kol] || [];
    if (armRows.length === 0) {
      lines.push(`| ${pair} | ${kol} | — | — | — | — |`);
      continue;
    }
    const stats = computeArmStats(armRows);
    const pass1 = stats.pass1Pct === null ? '—' : `${stats.pass1Pct}%`;
    const dropped = stats.droppedPct === null ? '—' : `${stats.droppedPct}%`;
    lines.push(
      `| ${pair} | ${kol} | ${pass1} | ${stats.usdCell} | ${stats.dkCell} | ${dropped} |`
    );
  }

  return { ok: true, markdown: lines.join('\n') + '\n' };
}

function main() {
  if (!fs.existsSync(SONUC_PATH)) {
    console.error(`Bulunamadı: ${SONUC_PATH}`);
    return 1;
  }
  const rows = readJsonl(SONUC_PATH);
  const report = buildReport(rows);
  if (!report.ok) {
    console.error(report.message);
    return 1;
  }
  fs.writeFileSync(RAPOR_PATH, report.markdown, 'utf8');
  return 0;
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = {
  median,
  minMaxMedianCell,
  checkConsistency,
  computeArmStats,
  evaluateStopRule,
  buildReport,
  main,
  PAIRS,
  TABLE_ROWS,
};
