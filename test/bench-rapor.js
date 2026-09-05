'use strict';

const assert = require('assert');
const {
  median,
  minMaxMedianCell,
  checkConsistency,
  evaluateStopRule,
  buildReport,
} = require('../bench/rapor.js');

function mkRow(overrides) {
  return {
    batchId: 'b1',
    taskId: 't1',
    repoPin: 'x',
    arm: 'eco',
    seat: 'sonnet/low',
    modelId: 'sonnet-x',
    ccVersion: '0.15.0',
    repeat: 1,
    startedAt: '2026-09-05T00:00:00Z',
    wallMs: 60000,
    pass: true,
    dropped: false,
    dropReason: null,
    tokens: { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    usd: 1,
    usdSource: 'transcript',
    ...overrides,
  };
}

// 1. medyan ve min-max doğru hesaplanıyor.
{
  assert.strictEqual(median([1, 2, 3]), 2);
  assert.strictEqual(median([1, 2, 3, 4]), 2.5);

  const cell = minMaxMedianCell([1, 2, 3], (v) => v.toFixed(2));
  assert.strictEqual(cell, '2.00 (1.00–3.00)');

  const tekKosu = minMaxMedianCell([5], (v) => v.toFixed(2));
  assert.strictEqual(tekKosu, 'tek koşu — raporlanmaz');
}

// 2. Karışık modelId tabloyu reddediyor.
{
  const rows = [
    mkRow({ repeat: 1, modelId: 'sonnet-x' }),
    mkRow({ repeat: 2, modelId: 'sonnet-y' }),
  ];
  const conflict = checkConsistency(rows);
  assert.ok(conflict, 'çakışma tespit edilmeliydi');
  assert.strictEqual(conflict.arm, 'eco');
  assert.strictEqual(conflict.field, 'modelId');

  const report = buildReport(rows);
  assert.strictEqual(report.ok, false);
  assert.ok(report.message.includes('eco'));
  assert.ok(report.message.includes('sonnet-x'));
  assert.ok(report.message.includes('sonnet-y'));
}

// 3. Durma bayrağı tek görevde tutan veri kümesinde kalkmıyor.
{
  const rows = [];
  // t1: core'un medyan $'ı native'in medyan $'ını %50 aşıyor -> t1 tutar.
  for (let r = 1; r <= 3; r++) {
    rows.push(mkRow({ arm: 'native-eco', taskId: 't1', repeat: r, usd: 1 }));
    rows.push(mkRow({ arm: 'eco', taskId: 't1', repeat: r, usd: 1.5 }));
  }
  // t2: core hep native'e yakın -> t2 tutmaz.
  for (let r = 1; r <= 3; r++) {
    rows.push(mkRow({ arm: 'native-eco', taskId: 't2', repeat: r, usd: 1 }));
    rows.push(mkRow({ arm: 'eco', taskId: 't2', repeat: r, usd: 1.05 }));
  }

  const result = evaluateStopRule(rows);
  assert.strictEqual(result.perPair.eco.taskHolds.t1, true);
  assert.strictEqual(result.perPair.eco.taskHolds.t2, false);
  assert.strictEqual(result.perPair.eco.flagged, false);
  assert.strictEqual(result.anyFlag, false);
}

// 4. Durma bayrağı iki görevde de tutunca kalkıyor (pilot: iki görevin ikisi).
{
  const rows = [];
  for (const taskId of ['t1', 't2']) {
    for (let r = 1; r <= 3; r++) {
      rows.push(mkRow({ arm: 'native-eco', taskId, repeat: r, usd: 1 }));
      rows.push(mkRow({ arm: 'eco', taskId, repeat: r, usd: 1.5 }));
    }
  }

  const result = evaluateStopRule(rows);
  assert.strictEqual(result.perPair.eco.taskHolds.t1, true);
  assert.strictEqual(result.perPair.eco.taskHolds.t2, true);
  assert.strictEqual(result.perPair.eco.flagged, true);
  assert.strictEqual(result.anyFlag, true);

  const report = buildReport(rows);
  assert.strictEqual(report.ok, true);
  assert.ok(report.markdown.startsWith('Durma kuralı: TETİKLENDİ'));
  assert.ok(report.markdown.includes('eco'));
}

// 5. Beş görevin ikisinde tutan bir kümede de bayrak kalkıyor (every değil,
//    en az iki yeter — tam kapsamdaki beş görevi simüle eder).
{
  const rows = [];
  const taskHoldSpec = { t1: true, t2: true, t3: false, t4: false, t5: false };
  for (const [taskId, holds] of Object.entries(taskHoldSpec)) {
    for (let r = 1; r <= 3; r++) {
      rows.push(mkRow({ arm: 'native-eco', taskId, repeat: r, usd: 1 }));
      rows.push(
        mkRow({ arm: 'eco', taskId, repeat: r, usd: holds ? 1.5 : 1.05 })
      );
    }
  }

  const result = evaluateStopRule(rows);
  assert.strictEqual(result.perPair.eco.taskHolds.t1, true);
  assert.strictEqual(result.perPair.eco.taskHolds.t2, true);
  assert.strictEqual(result.perPair.eco.taskHolds.t3, false);
  assert.strictEqual(result.perPair.eco.taskHolds.t4, false);
  assert.strictEqual(result.perPair.eco.taskHolds.t5, false);
  assert.strictEqual(result.perPair.eco.flagged, true);
  assert.strictEqual(result.anyFlag, true);
}

// 6. Core kolunda tek bir aykırı pahalı koşu varken medyan sağlam kalır,
//    bayrak kalkmaz.
{
  const rows = [];
  for (let r = 1; r <= 3; r++) {
    rows.push(mkRow({ arm: 'native-eco', taskId: 't1', repeat: r, usd: 1 }));
  }
  // Core: 1, 1.1, 10 (bir aykırı koşu) -> medyan 1.1, native medyanı 1 ->
  // %40'ı aşmıyor, tutmamalı.
  rows.push(mkRow({ arm: 'eco', taskId: 't1', repeat: 1, usd: 1 }));
  rows.push(mkRow({ arm: 'eco', taskId: 't1', repeat: 2, usd: 1.1 }));
  rows.push(mkRow({ arm: 'eco', taskId: 't1', repeat: 3, usd: 10 }));

  const result = evaluateStopRule(rows);
  assert.strictEqual(result.perPair.eco.taskHolds.t1, false);
  assert.strictEqual(result.perPair.eco.flagged, false);
  assert.strictEqual(result.anyFlag, false);
}

// 7. Core kolunda o görevde tek koşu varken, native medyanının iki katı bile
//    olsa görev tutmuyor (tek koşu asla raporlanmaz / bayrağı kaldırmaz).
{
  const rows = [];
  for (let r = 1; r <= 3; r++) {
    rows.push(mkRow({ arm: 'native-eco', taskId: 't1', repeat: r, usd: 1 }));
  }
  rows.push(mkRow({ arm: 'eco', taskId: 't1', repeat: 1, usd: 2 }));

  const result = evaluateStopRule(rows);
  assert.strictEqual(result.perPair.eco.taskUnresolved.t1, true);
  assert.strictEqual(result.perPair.eco.taskHolds.t1, false);
  assert.strictEqual(result.perPair.eco.flagged, false);
}

// 8. Native kolunda o görevde tek koşu varken de görev tutmuyor.
{
  const rows = [];
  rows.push(mkRow({ arm: 'native-eco', taskId: 't1', repeat: 1, usd: 1 }));
  for (let r = 1; r <= 3; r++) {
    rows.push(mkRow({ arm: 'eco', taskId: 't1', repeat: r, usd: 2 }));
  }

  const result = evaluateStopRule(rows);
  assert.strictEqual(result.perPair.eco.taskUnresolved.t1, true);
  assert.strictEqual(result.perPair.eco.taskHolds.t1, false);
  assert.strictEqual(result.perPair.eco.flagged, false);
}

console.log('bench-rapor.js: tüm testler geçti.');
