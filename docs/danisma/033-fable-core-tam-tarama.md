# Danışma 033: Core'un Tamamında Hantallık Taraması

claude-fable-5-1, 11.942 çıktı token, 210 sn. Girdi: [033-fable-core-tam-tarama-girdi.md](033-fable-core-tam-tarama-girdi.md). Cevap olduğu gibi:

---

# Danışma 033 — Core'un Tamamında Hantallık Taraması

Ölçümler: `npm test` 29,9 s (486 test); `all.js` süit başına süre aşağıda. Kod içi çağrı sayıları `rg` ile doğrulandı. 032'deki state süpürücü, önbellek sürümleri, host.js tek giriş burada tekrar edilmedi; 032-C'nin devamı 3. işte.

## KALDIR

**1. lib.js ölü dışa aktarımlar.** `norm` (109), `exists` (119), `gitInfo`/`askGit`/`_gitCache` (127–155), `pluginRoot` (157–171), `rewire` (249–269), `envPinned`/`pinnedInShell`/`PINNED`/`RC` (302–339). core/ ve test/ altında hiçbir çağrı yok. Bedel: ~125 satır, her kanca sürecinde parse edilir (tahmin <1 ms), bakım yükü; `rewire` settings.json'a yazan tehlikeli ölü yol. Karşılığı sıfır. Kazanç: lib.js 397→~270 satır.

**2. notify.js ölü sesler.** `playedRecently` (213) çağrılmıyor. `tooQuick`/`MIN_MS` (176, 219–224): `slot(cwd).prompt` hiçbir yerde yazılmıyor, her zaman `false`; test 449–450 bu ölü alanı sınıyor. `HOOK_EVENT` Stop/StopFailure yolları: hooks.json yalnız Notification'ı bağlıyor (hooks.json:97–107), done/error sesi kanca yoluyla asla çalmaz. `MEASURED_LENGTH` (18) yalnız `--event` CLI'sinde. Tahmin ~70 satır. Öneri: yalnız `waiting` kalsın; done/error ya hooks.json'a bağlanır ya da silinir.

**3. Öncül kapısı (scout).** `docs/oncul/` bu depoda boş; `scripts/scout.js` (154 satır), `hooks/scout.js` gate yarısı, `strings.json` `scout.*` (6 anahtar), test 1264–1281. Her Agent çağrısında `scout.js` süreci koşuyor (hooks.json PreToolUse Agent). Tahmin: özellik hiç kullanılmadı. Öneri: `trash/`'e; makeGate yalnız `gorus` için kalır.

**4. Netleştirme modu (advice.js).** `ask/askText/record/netGate` (advice.js:6–7, 53–87, 172–175), `advice.*`/`ask.*` anahtarları, test 1283–1296, 1321–1328. `docs/netlestirme` son kayıt 006, sonrası `gorus` moduna geçilmiş; `mod.js` PREFIX'te `netleştir` tetikleyicisi yok, README:265–267 hâlâ anlatıyor. Tahmin ~90 satır + 5 anahtar. Öneri: kaldır ya da `gorus`'un `--konu` ile aynı yola katla.

**5. Küçük ölüler.** `dur.js:7–9 setting()` = `lib.settings()` kopyası. `mod.js:205–206` `mark(prompt)` üç kez. `doctor.js:57–58` yorum satırı (kural ihlali). `test/all.js:298–303` relay dosyalarının yokluğunu sınayan koruma: 0.16'da gitti, 20 sürümdür ölü; 305, 313 aynı.

## SADELEŞTİR

**6. agency.js ↔ kutuphane.js.** `front`, `lean` (aynı DROP regex), `seatFile`, `record`, `row`, `nextNumber`, `arg`, `git`, `home`, `fetch`, eski yol taşıması: agency.js 216 satırın ~150'si kopya. Bedel: iki yerde düzeltme, iki davranış sapması riski (test 1018 ve 1076 aynı şeyi iki kez sınıyor). Öneri: agency.js = `kutuphane.find(words, {shelf:'agency'})` + `show` sarmalayıcı, ~40 satır. Kazanç: ~170 satır.

**7. Kopya yardımcılar.** `nextNumber` 4 kopya (advice:24, agency:138, kutuphane:420, scout:21); argv ayrıştırıcı `arg/flag` 8+ kopya (advice, agency, kutuphane, scout, setup, release, scaffold, log, hatirla); Türkçe harf katlama 5 kopya (advice `ascii`, kutuphane `ascii`, mod `fold`, log `slug`, scout inline). Öneri: `lib.js`'e `argv()`, `fold()`, `nextNumber(dir)`. Kazanç tahmin ~120 satır.

**8. Kanca main şablonu.** count, mod, handoff, dur, loop, yasak, scout, ust, bant, notify: aynı stdin-oku/JSON-parse/hata-günlüğü/exit 0 bloğu, 10 kopya × ~10 satır; `errorLog` üç kopya (count, mod, handoff). Öneri: `lib.main(name, handle)`. Kazanç ~90 satır, hata günlüğü tek biçim.

**9. hooks.json süreç sayısı.** PreToolUse Bash: `yasak`+`loop` 2 süreç; Agent: `scout`+`ust` 2 süreç; Stop: `count`+`dur` 2 süreç. `host.js:guard()` yasak+loop'u zaten tek süreçte koşuyor. Bedel: 032'ye göre ~65 ms/süreç; Bash başına 3→2, Stop 2→1, Agent 2→1 (madde 3 ile 2→1 zaten). Öneri: `dur.js` içinden `count.handle` çağır; `yasak.js` içinden `loop.decide`. Kazanç tahmin ~65 ms/Bash, ~65 ms/Stop.

**10. doctor.js ↔ scan.js.** İki ayrı `check(name, fn)` koşucusu, iki `mapOk`. Öneri: ortak koşucu, doctor "makine", scan "proje" kontrol listesi. Kazanç ~50 satır.

**11. statusline her çizimde git.** `statusline.js` her çizimde `count.tree()` → 2 git süreci; `bridge.js` her çizimde önbellek sürüm taraması. count.js PostToolUse'ta tree hash'i zaten state'e yazıyor. Öneri: statusline state'ten okusun, git yalnız state yoksa; bridge sonucu `config.pluginDir`'e önbellek (rewire kalkınca bu alan boşta). Kazanç tahmin 2 git süreci/çizim.

**12. strings.json.** 100 anahtar, 17.860 B; test tavanı 18.000 (all.js:323) — sınırda. `mod.memory` 850 karakter (~250 token, yalnız `mc`'de) ve `mod.fable` 398: iki dilde tarif; komut satırları `%C/%R` ile zaten geliyor, açıklama yarıya inebilir. `mod.help` 1197 karakter ekrana gidiyor (sayBlock), 0 token — kalsın. `mod.agency`/`mod.private` yalnız çağrıldığında. Kazanç: ~700 B, tavan rahatlar.

**13. Test süresi (ölçüldü).** Süitler: evidence gate 6,9 s, count threshold 3,6 s, library 2,2 s, count tests 2,0 s, context cue 2,0 s; toplam ~30 s.
- `ok(stop().stdout === '', stop().stdout)` kalıbı iki kez süreç açıyor: all.js:522, 550, 551, 554, 557 (5 fazla spawn); aynı kalıp `line()` ile 194, 196, 268–270, 278, 281 (~8 fazla). Deterministik: sonucu değişkene al. Kazanç tahmin 2 s.
- `fixture()` 25+ kez git init + 4 git komutu (~150 ms/çağrı). Öneri: bir kez kur, `fs.cpSync` ile kopyala. Tahmin 3 s.
- `test/run.js:10–11` depoyu tmp'ye kopyalıyor: bench 8,9 MB + docs 5,6 MB, ~2.400 dosya, her koşuda. Yalnız `core/`, `test/`, `package.json`, `.claude-plugin/` yeter. Tahmin 1 s.
- `testDoctor` (1181) gerçek depoda ve gerçek `~/.claude` yakınında koşuyor: makine durumuna bağlı, kırılgan.
- `testWiring:298–313` ve `testLanguage:324` tarihi koruma testleri (madde 5).
Hedef: 30 s → ~20 s (tahmin).

## KALSIN

`yasak.js`, `loop.js`, `dur.js` kanıt+iş kapısı (tek dosya, tek kapı), `bant.js` kuyruğu (0 token kanıtlı), `handoff.js`, `cop.js` (günde bir), `procs.js` (60 sn arka plan), `host.js`, `kutuphane.js` çekirdeği, `hatirla.js`, `ust.js` (aynı süreçte kalmalı, madde 9), `map/manset/log/release/scaffold` (yalnız çağrıldığında, README'de tarifli), `mod.help` metni.

## Uygulama sırası — ilk beş iş

1. **Ölü kod:** lib.js (1), notify.js (2), dur.setting/mod.mark/doctor yorum/tarihi testler (5). Risk sıfır, 486 test korur. Kazanç ~230 satır.
2. **Kanca şablonu:** `lib.main` + tek `errorLog` (8); `lib.argv/fold/nextNumber` (7). Kazanç ~210 satır.
3. **Süreç birleştirme:** hooks.json'da Bash 2→1, Agent 2→1, Stop 2→1 (9); scout gate `trash/`'e (3). 032-C ile birlikte Bash başına 3→1 süreç: tahmin ~130 ms/Bash.
4. **agency → kutuphane sarmalayıcı** (6) ve netleştirme modunu gorus'a katla (4). Kazanç ~260 satır, README:265–267 güncellenir.
5. **Test:** çift spawn, fixture şablon, run.js dar kopya, doctor testini sandbox'a al (13). Hedef 30→20 s.

Toplam kazanç tahmini: ~700 satır (8.158'in %9'u), Bash başına ~130 ms, Stop başına ~65 ms, test 10 s.

## Okunan dosyalar

core/hooks: lib.js, count.js, mod.js, dur.js, handoff.js, host.js, loop.js, yasak.js, scout.js, ust.js, bant.js, notify.js, hooks.json. core/scripts: advice.js, agency.js, kutuphane.js, doctor.js, scan.js, statusline.js, bridge.js, hatirla.js, map.js, manset.js, release.js, scaffold.js, log.js, cop.js, procs.js, setup.js, scout.js. core/strings.json. test/all.js (tamamı), test/run.js. README.md, AGENTS.md. docs/danisma/032-fable-sistem-hantalligi.md, docs/danisma/033-fable-core-tam-tarama-girdi.md.
