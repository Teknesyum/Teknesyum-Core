# Plan: eklenti incelemesi ve özel raf (2026-09-08)

İki iş. İkisi de sıradan turda sıfır token kuralına bağlı; bedel yalnız `??` / `++` / `pp`
yazana. Adımlar kutu; SessionStart ilk açık kutuyu tek satırla söyler.

## A. En çok kullanılan eklentiler, tek tek

- [x] 25 eklenti mekanizma önce okundu, notlar `docs/kutuphane/eklenti/`, özet
  `docs/kutuphane/eklenti-2026-09-08.md` (1,73M token ≈ 7 $).

## B. Özel raf: teknesyum-private

Kullanıcı kendini bir kez anlatır; program bilir. Kitaplar `~/.claude/teknesyum-private/private/`
altında md; depo `Teknesyum/Teknesyum-Private`. Kapı: aynanın uzak deposu sahibinse raf var.

- [x] `kutuphane.js`: sabit `private` rafı, sahip kapısı, `push private`, Türkçe eşanlam ve tam
  kelime `find`.
- [x] `hooks/mod.js`: `??` / `++` kütüphane, `pp` özel raf; sıradan turda boş. `count.js`
  bandı `◆ Teknesyum · özel raf`, plan adımı satırı.
- [x] Tohum kitaplar: `kimlik.md`, `tercihler/{yazim,ui,araclar,calisma}.md` (3,2 KB), itildi.
- [x] Testler (252), README ×2, COST-MODEL, home CLAUDE.md.
- [x] 0.22.0 kes, yayınla, laptop eklentisini güncelle.

## C. Raflar güncel kalsın

- [x] `kutuphane.js stale`, `fetch --stale <gün>`, SessionStart günde bir arka plan çekme (0 token).
- [x] 0.23.0 kes, laptop eklentisini güncelle.

Bedel ölçüldü: sıradan tur 0 B; `??` 1726 B; `pp` 3738 B; kanca ~170 ms.

## D. Kapsamlı araştırma: projeye ne eklenebilir

- [x] Kademe 0+3 (2026-09-08): tarama 1000 depo, 45 opus ajanı, 963 depo okundu, 93 Al / 165 fikir / 705 hayır;
      rapor `docs/kutuphane/piyasa-2026-09-08.md`, notlar `docs/kutuphane/piyasa/`. Yapım sırası yol haritasında.

Eski fiyat tablosu (kayıt için):

Havuz: 400 depo tarandı (`tarama.jsonl`), 58'i derin okundu, 342 okunmadı; awesome listesinden
15 aday ayrıca. Okuma birimi: sonnet ajanı, depo başına ~65K token, aynı şablon, ≤300 kelime not.

| Kademe | Ne | Token | Bedel | Süre |
|---|---|---|---|---|
| 0 | `scan.js`i 1000 depoya genişlet, model yok | 0 | API kotası | ~5 dk |
| 1 | okunmamış en iyi 60 (awesome 15 + yıldıza göre 45) | ~3,9M | ~17 $ | ~3 dk |
| 2 | okunmamış en iyi 150 | ~9,8M | ~42 $ | ~8 dk |
| 3 | 342'nin hepsi + kademe 0'dan gelenler | ~22M+ | ~95 $+ | ~20 dk |

Öneri: 0 sonra 1. Çıktı `docs/kutuphane/derin/` notları, özet tablo, yol haritasına "Al" satırları.
Kendi depolarımız (Desktop/Projeler: VidShrink, QuizLoop, Usb-Guard…) için güncellik: hangi
klasör, ne yapılsın (fetch mi, geride kaldı bildirimi mi) — karar.

## E. Piyasa sonrası yapım sırası (2026-09-08, sıra benim)

Kaynak: `docs/kutuphane/piyasa-2026-09-08.md` Öncelik bölümü. Ölçü: önce sıfır bedelli, sonra Core'un boşluğunu kapatan kanca, sonra ölçüm.

- [x] Kitaplar: 19 raf `core/kutuphane.json`e eklendi, fetch edildi (0.24.0). `aa` öneki.
- [x] K1 Stop kapısı: `core/hooks/dur.js`, varsayılan açık ve sessiz; yalnız gerçek Stop olayında, düzenleme var ve o ağaçta koşan yoksa `decision:block`, `stop_hook_active` ile tek ısrar, aynı ağaç ikinci kez sorulmaz, `evidence:false` ile kapanır (0.26.0).
- [x] K2 Tehlikeli komut denylist: `core/hooks/yasak.js`, 16 desen, 21 reddedilen ve 13 geçen vaka testli (0.26.0).
- [x] Banner ölçütü ve rename kararı: `docs/banner.md` (2026-09-09). Sohbet adı rename iptal.
- [x] Banner kanalı D15'e döner: kancalar satırı `banner-<oturum>.json` kuyruğuna yazar, `hooks/bant.js` `MessageDisplay` ilk akışında mesajın üstüne blok çizer (0 token). `systemMessage` ve modele bastırma yok (Standing law). `sonda.js` trash'e. Dosyalar: lib, mod, count, dur, yasak, loop, bant, hooks.json, strings, test, banner.md, README×2, CHANGELOG, DECISIONS, yordam (0.30.0).
- [x] İş kapısı (danışma 028, 0.32.0): `.claude/sonra.md` → `.claude/jobs.md` (`- [ ]` / `- [x]` / `- [ ] iş — gerekçe`). `mod.js` istemde ≥2 madde görürse bağlama yazmadan durum işareti bırakır ve gelen dosyadan yalnız açıkları geri verir; `dur.js` Stop'ta gerekçesiz açık iş ya da yazılmamış liste için bir kez blok, kanıt kapısıyla tek reason. Compact köprüsü yok (Standing law), kapı onu karşılar. Dosyalar: mod, dur, handoff, strings, test, README×2, banner.md, DECISIONS, yordam, CLAUDE.md.
- [ ] K3 Kanca hijyeni: aynı metni ikinci kez basma, bayt bütçesi testi, Windows `python3` stub, stdin boşaltma. İş kapısı: koşan arka plan ajanı geçerli gerekçe sayılsın (2026-09-11'de canlıda görüldü). `bant.js` her MessageDisplay parçasında node başlatıyor; akış gecikmesini ölç, gerekirse ilk/son parça dışında erken çık.
- [ ] B1 `npm test` içinde kanca şema denetimi + kuru çalıştırıcı.
- [ ] K4 SessionStart `startup|clear|compact` + PreCompact özet yaması.
- [ ] B5 Kütüphane: tek katalog, kaynak SHA ile tazeleme, `last_verified`, BM25 `ara`.
- [ ] K5 Commit anı kancası + oturum manifesti.
- [ ] B3 Yerel özet (handoff'u betik yazsın).
- [ ] B4 Düzeltme yakalayıcı.
- [ ] B6 Statusline widget'ları.
- [ ] B2 AGENTS.md lint, B7 README ikizleri pre-commit.
- [ ] Bench: baseline × skilled, yargıçsız A/B.

## F. Akraba hostlar: tek çekirdek + adaptör (danışma 029, sıra benim: K3'ten hemen sonra)

Tek depo, tek sürüm. Claude banner'ı ve MessageDisplay yolu değişmez. Adaptör `agent_message`'a
yalnız yasak gerekçesini yazar (Claude'da da modele giden aynı satır); 0 token kuralı korunur.

- [x] F1 `core/hooks/host.js`: Cursor/Gemini JSON'u Claude şemasına, cevap geri. 422 test yeşil.
- [x] F2 Cursor kablolaması `setup.js` `HOSTS.cursor` içinde (ayrı şablon dosyası yok): yasak, loop, count, dur, handoff, mod.expect.
- [x] F3 Cursor `stop`: `dur.decide` → `followup_message`, `loop_limit: 1`; banner yalnız reddedilen kabukta `user_message`. Canlı deneme Serkan'da (Cursor bu makinede yok).
- [x] F4 `setup.js --host cursor|gemini [--remove]`, README ×2.
- [x] F5 Gemini CLI: banner `systemMessage`, yasak `decision:deny`, iş kapısı `AfterAgent`. Canlı: `docs/raporlar/gemini-canli-deneme.md`.
- [x] Codex — hooks Windows'ta yok (v0.114); kural şablonu `adapters/AGENTS.md` (Cursor/Gemini için de).

## G. Yardım listesi ekrana, geçici iş toplayıcı, tmp standardı (2026-09-16, sıra benim)

`hh` bugüne kadar listeyi bağlama yazdı ve basmayı modele bıraktı; model basmayınca satır
kayboldu. Liste ekran kanalına taşınıyor: bedel 0 token, basılması modele bağlı değil.

- [x] G1 `lib.sayBlock` + `bant.js`: kuyruk düz metin bloğu taşıyabilsin, ters tırnaklı satıra
  dönüştürülmesin.
- [x] G2 `mod.js` `hh`: `additionalContext` yazmaz, listeyi bloğa koyar. Test: `hh` turunda
  bağlama tek harf gitmez.
- [x] G3 `mc` işareti + `core/scripts/hatirla.js`: geçmiş istemleri dökümden toplar, bir alt
  ajana verir, dönen listeyi `tmp/hatirlatici.md` altına yazar.
- [x] G4 `tmp/` standardı: pp rafına yazılır, `.gitignore` şablonuna girer, `scan.js` kökte
  başıboş geçici dosya görürse söyler.
- [x] G5 Testler, iki README, `docs/banner.md`, CHANGELOG, sürüm, push.

## H. Danışma yolu ve `mc` yeniden (2026-09-16, sıra benim)

Kaynak: [030](danisma/030-fable-mc-tasarim.md), [031](danisma/031-fable-danisma-okumasi.md).
Sıra: önce 031, çünkü 032 sistem eleştirisi yeni yolla gidecek; eleştiri arka planda koşarken 030.

- [x] H1 `advice.js ask --mod gorus --konu <slug> --girdi <dosya>`: `docs/danisma/NNN-fable-<konu>-girdi.md` yazar, stdout'a yol + tarif. `--mod netlestir` bugünkü davranış.
- [x] H2 `advice.js record --konu --cevap --model --token --sure`: `NNN-fable-<konu>.md`. Kapı yol taşıyan kısa istemi geçirir.
- [x] H3 `yordam.md` ff bölümü ve `mod.fable` tarifi: betiği okuma, yol ver.
- [x] H4 032 sistem eleştirisi yeni yolla, arka planda.
- [x] H5 `hatirla.js`: kesme yok, 40 bin karakterlik sayfa, stdout dizin; her isteğe kapanış (tool_use'suz son asistan metni, 800 kr), commit başlıkları (tek `git log`), jobs/plan satırları.
- [x] H6 `record` üç bölüm (Açık / Kararını bekliyor / Belirsiz), ekrana tek bant `sayBlock`.
- [x] H7 Tetik: `mc` tek başına, sonda ya da `mc <sayı> sayfa|gün|hafta`; başta cümleyle gelirse tetiklemez. `hh` aynı.
- [x] H8 Testler, iki README, CHANGELOG, sürüm, push, eklenti güncelle.

## I. 032 ve 033 temizliği (2026-09-16, sıra benim)

Kaynak: [032](danisma/032-fable-sistem-hantalligi.md), [033](danisma/033-fable-core-tam-tarama.md).
Sıra: önce riski sıfır olan ölü kod, sonra ortak yardımcılar (sonraki dalgalar onları kullanır), sonra süreç birleştirme ve özellik kaldırma, en sonda testler ve makine temizliği. Her dalga yeşil testle commit.

- [x] I1 Ölü kod: lib.js ölü dışa aktarımlar, notify.js ölü sesler, dur.setting, mod.mark tekrarı, doctor yorumu, tarihi koruma testleri (033-1, 2, 5).
- [x] I2 Ortak yardımcılar: `lib.main`, tek `errorLog`, `lib.argv`, `lib.fold`, `lib.nextNumber`; kopyaları kaldır (033-7, 8).
- [x] I3 Özellik kaldırma: scout öncül kapısı ve netleştirme modu `trash/`'e; danışma kapısı tek (033-3, 4).
- [ ] I4 Süreç birleştirme: Bash tek süreç (yasak içinden loop), Agent tek süreç, Stop tek süreç (dur içinden count) (032-C, 033-9).
- [ ] I5 agency.js kutuphane sarmalayıcısı (033-6); doctor/scan ortak koşucu (033-10).
- [ ] I6 statusline git yerine state; bridge önbelleği (033-11); strings kısaltma (033-12).
- [ ] I7 Test hızı: çift spawn, fixture şablonu, run.js dar kopya, doctor testi sandbox'ta (033-13).
- [ ] I8 Makine: SessionStart'ta 7 günden eski state/banner/advice süpürme, eklenti önbelleğinde son iki sürüm, kütüphane sığ klon + gc (032-D, E, F).
- [x] I9 RULES.md / CLAUDE.md tekrarları (032-G).
- [ ] I10 İki README, AGENTS.md, CHANGELOG, sürüm, push, eklenti güncelle.
