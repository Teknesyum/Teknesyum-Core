const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { koşuYap, encodeCwd } = require('../bench/run');

let passed = 0, failed = 0;
const bekleyenler = [];
function test(name, fn) {
  const p = fn().then(() => { passed++; console.log('PASS ' + name); })
    .catch((e) => { failed++; console.error('FAIL ' + name + ': ' + e.stack); });
  bekleyenler.push(p);
}

function gecidiHazirla() {
  const gorevKok = fs.mkdtempSync(path.join(os.tmpdir(), 'tkc-gorevler-'));
  fs.writeFileSync(path.join(gorevKok, 'sahte-gorev.md'), [
    '---',
    'repo: https://example.invalid/sahte.git',
    'sha: deadbeef',
    '---',
    '',
    'Sahte görev metni.',
  ].join('\n'));
  fs.writeFileSync(path.join(gorevKok, 'bozuk-gorev.md'), 'Frontmatter yok, düz metin.');
  return gorevKok;
}
const GOREV_KOK = gecidiHazirla();

function basariliGit() {
  return { klonla: () => ({ status: 0 }), checkoutYap: () => ({ status: 0 }) };
}

function mkdtempSahte() {
  const dizinler = [];
  return { mkdtemp: (onEk) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), onEk)); dizinler.push(d); return d; }, dizinler };
}

function sahteOturumYaz(configDizini, calismaDizini, model, usage) {
  const projeDizini = path.join(configDizini, 'projects', encodeCwd(calismaDizini));
  fs.mkdirSync(projeDizini, { recursive: true });
  fs.writeFileSync(path.join(projeDizini, 'oturum-1.jsonl'), JSON.stringify({
    type: 'assistant', message: { id: 'msg_1', model, usage },
  }) + '\n');
}

function configOku(configDizini) {
  return JSON.parse(fs.readFileSync(path.join(configDizini, 'teknesyum', 'config.json'), 'utf8'));
}

test('her kol için model, effort ve CLAUDE_CONFIG_DIR argümanlara doğru geçer', async () => {
  const { mkdtemp, dizinler } = mkdtempSahte();
  const yakalanan = [];
  const calistirici = async (komut, argumanlar, secenekler) => {
    yakalanan.push({ komut, argumanlar, env: secenekler.env });
    sahteOturumYaz(secenekler.env.CLAUDE_CONFIG_DIR, secenekler.cwd, 'claude-sonnet-5', {
      input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 1, cache_read_input_tokens: 1,
    });
    return { kod: 0, zamanAsimi: false };
  };
  const kosu = { taskId: 'sahte-gorev', arm: 'premium', seat: 'sonnet/high', repeat: 1 };
  await koşuYap(kosu, 'batch1', 'cc-test', { git: basariliGit(), calistirici, mkdtemp, gorevKok: GOREV_KOK });
  assert.equal(yakalanan.length, 1);
  assert.equal(yakalanan[0].komut, 'claude');
  assert.deepEqual(yakalanan[0].argumanlar.slice(-4), ['--model', 'sonnet', '--effort', 'high']);
  assert.equal(yakalanan[0].env.CLAUDE_CONFIG_DIR, dizinler[0]);
});

test('core kolunda config.json doğru profille yazılır', async () => {
  const { mkdtemp } = mkdtempSahte();
  let cfg;
  const calistirici = async (komut, argumanlar, secenekler) => {
    cfg = configOku(secenekler.env.CLAUDE_CONFIG_DIR);
    sahteOturumYaz(secenekler.env.CLAUDE_CONFIG_DIR, secenekler.cwd, 'claude-sonnet-5', {
      input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 1, cache_read_input_tokens: 1,
    });
    return { kod: 0, zamanAsimi: false };
  };
  const kosu = { taskId: 'sahte-gorev', arm: 'normal', seat: 'sonnet/medium', repeat: 1 };
  await koşuYap(kosu, 'batch1', 'cc-test', { git: basariliGit(), calistirici, mkdtemp, gorevKok: GOREV_KOK });
  assert.equal(cfg.profile, 'normal');
  assert.equal(typeof cfg.lang, 'string');
  assert.equal(typeof cfg.contractLang, 'string');
});

test('native kolunda config.json hiç yazılmaz', async () => {
  const { mkdtemp } = mkdtempSahte();
  let varMi;
  const calistirici = async (komut, argumanlar, secenekler) => {
    varMi = fs.existsSync(path.join(secenekler.env.CLAUDE_CONFIG_DIR, 'teknesyum', 'config.json'));
    sahteOturumYaz(secenekler.env.CLAUDE_CONFIG_DIR, secenekler.cwd, 'claude-sonnet-5', {
      input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 1, cache_read_input_tokens: 1,
    });
    return { kod: 0, zamanAsimi: false };
  };
  const kosu = { taskId: 'sahte-gorev', arm: 'native-normal', seat: 'sonnet/medium', repeat: 1 };
  await koşuYap(kosu, 'batch1', 'cc-test', { git: basariliGit(), calistirici, mkdtemp, gorevKok: GOREV_KOK });
  assert.equal(varMi, false);
});

test('üç Core kolu birbirinden farklı effort ve profille çağrılır', async () => {
  const cagrilar = {};
  for (const arm of ['eco', 'normal', 'premium']) {
    const { mkdtemp } = mkdtempSahte();
    let argumanlar, cfg;
    const calistirici = async (komut, a, secenekler) => {
      argumanlar = a;
      cfg = configOku(secenekler.env.CLAUDE_CONFIG_DIR);
      sahteOturumYaz(secenekler.env.CLAUDE_CONFIG_DIR, secenekler.cwd, 'claude-sonnet-5', {
        input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 1, cache_read_input_tokens: 1,
      });
      return { kod: 0, zamanAsimi: false };
    };
    const seat = { eco: 'sonnet/low', normal: 'sonnet/medium', premium: 'sonnet/high' }[arm];
    const kosu = { taskId: 'sahte-gorev', arm, seat, repeat: 1 };
    await koşuYap(kosu, 'batch1', 'cc-test', { git: basariliGit(), calistirici, mkdtemp, gorevKok: GOREV_KOK });
    cagrilar[arm] = { effort: argumanlar[argumanlar.indexOf('--effort') + 1], profile: cfg.profile };
  }
  assert.equal(cagrilar.eco.effort, 'low');
  assert.equal(cagrilar.normal.effort, 'medium');
  assert.equal(cagrilar.premium.effort, 'high');
  assert.equal(cagrilar.eco.profile, 'eco');
  assert.equal(cagrilar.normal.profile, 'normal');
  assert.equal(cagrilar.premium.profile, 'premium');
  assert.equal(new Set(Object.values(cagrilar).map((c) => c.effort)).size, 3);
  assert.equal(new Set(Object.values(cagrilar).map((c) => c.profile)).size, 3);
});

test('git clone/checkout başarısız olursa dropped:true, dropReason:setup, kabul hiç çalışmaz', async () => {
  const { mkdtemp } = mkdtempSahte();
  let calistiriciCagrildi = false;
  const calistirici = async () => { calistiriciCagrildi = true; return { kod: 0, zamanAsimi: false }; };
  const basarisizGit = { klonla: () => ({ status: 1 }), checkoutYap: () => ({ status: 0 }) };
  const kosu = { taskId: 'sahte-gorev', arm: 'eco', seat: 'sonnet/low', repeat: 1 };
  const satir = await koşuYap(kosu, 'batch1', 'cc-test', { git: basarisizGit, calistirici, mkdtemp, gorevKok: GOREV_KOK });
  assert.equal(satir.dropped, true);
  assert.equal(satir.dropReason, 'setup');
  assert.equal(satir.pass, false);
  assert.equal(calistiriciCagrildi, false);
});

test('tavana çarpan koşu dropped:true, dropReason:ceiling olur ve harcanan token/usd kaydedilir', async () => {
  const { mkdtemp } = mkdtempSahte();
  const calistirici = async (komut, argumanlar, secenekler) => {
    sahteOturumYaz(secenekler.env.CLAUDE_CONFIG_DIR, secenekler.cwd, 'claude-sonnet-5', {
      input_tokens: 100, output_tokens: 100, cache_creation_input_tokens: 100, cache_read_input_tokens: 100,
    });
    return { kod: 1, zamanAsimi: true };
  };
  const kosu = { taskId: 'sahte-gorev', arm: 'eco', seat: 'sonnet/low', repeat: 1 };
  const satir = await koşuYap(kosu, 'batch1', 'cc-test', { git: basariliGit(), calistirici, mkdtemp, gorevKok: GOREV_KOK });
  assert.equal(satir.dropped, true);
  assert.equal(satir.dropReason, 'ceiling');
  assert.ok(satir.tokens && satir.tokens['claude-sonnet-5']);
  assert.ok(satir.usd > 0);
});

test('gerçek model kimliği transcriptten okunur, koltuk adı değil', async () => {
  const { mkdtemp } = mkdtempSahte();
  const calistirici = async (komut, argumanlar, secenekler) => {
    sahteOturumYaz(secenekler.env.CLAUDE_CONFIG_DIR, secenekler.cwd, 'claude-sonnet-5', {
      input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 1, cache_read_input_tokens: 1,
    });
    return { kod: 0, zamanAsimi: false };
  };
  const kosu = { taskId: 'sahte-gorev', arm: 'eco', seat: 'sonnet/low', repeat: 1 };
  const satir = await koşuYap(kosu, 'batch1', 'cc-test', { git: basariliGit(), calistirici, mkdtemp, gorevKok: GOREV_KOK });
  assert.equal(satir.modelId, 'claude-sonnet-5');
  assert.notEqual(satir.modelId, 'sonnet');
});

test('görev dosyasında frontmatter yoksa net bir hatayla durur, sessizce başka kaynağa düşmez', async () => {
  const { mkdtemp } = mkdtempSahte();
  const calistirici = async () => { throw new Error('calistirici cagrilmamali'); };
  const kosu = { taskId: 'bozuk-gorev', arm: 'eco', seat: 'sonnet/low', repeat: 1 };
  await assert.rejects(
    koşuYap(kosu, 'batch1', 'cc-test', { git: basariliGit(), calistirici, mkdtemp, gorevKok: GOREV_KOK }),
    /frontmatter/
  );
});

Promise.all(bekleyenler).then(() => {
  fs.rmSync(GOREV_KOK, { recursive: true, force: true });
  console.log(JSON.stringify({ passed, failed }));
  process.exitCode = failed > 0 ? 1 : 0;
});
