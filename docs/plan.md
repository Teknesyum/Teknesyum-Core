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
- [x] I4 Süreç birleştirme: Bash tek süreç (yasak içinden loop), Agent tek süreç, Stop tek süreç (dur içinden count) (032-C, 033-9).
- [x] I5 agency.js kutuphane sarmalayıcısı (033-6); doctor/scan ortak koşucu (033-10).
- [x] I6 statusline git yerine state; bridge önbelleği (033-11); strings kısaltma (033-12).
- [x] I7 Test hızı: çift spawn, fixture şablonu, run.js dar kopya, doctor testi sandbox'ta (033-13).
- [x] I8 Makine: SessionStart'ta 7 günden eski state/banner/advice süpürme, eklenti önbelleğinde son iki sürüm, kütüphane sığ klon + gc (032-D, E, F).
- [x] I9 RULES.md / CLAUDE.md tekrarları (032-G).
- [x] I10 İki README, AGENTS.md, CHANGELOG, sürüm, push, eklenti güncelle.

## J. `uc` — UI Denetimi ve Okunurluk Kampanyası (2026-09-24, sıra benim)

Kaynak: [ui-tarama](ajan/ui-tarama/) beş rapor. Kök neden: tarayıcının `contrast` kuralı yazıyı yalnız siyaha karşı ölçer, paletteki ve kaynak anahtarıyla gelen rengi hiç ölçmez; dolgu–yazı çifti hiç ölçülmez. Runly 0 hata verir ama okunmaz düğme taşır.

- [x] J1 Raf: tarama adayları `ui-duzeni.md`'ye (Okunurluk bölümü, masaüstü, davranış), yeni kitap `ui-denetim.md` (`uc` yordamı, denetim listesi, rapor biçimi).
- [x] J2 Token: her dolgu token'ının `on` eşi; üretici saydam dolguyu zemine bindirip her dolgu×yazı çiftini ölçer, eşik altı çiftte tema üretmez.
- [x] J3 Tarayıcı: `pair-contrast` — aynı öğedeki dolgu ve yazı rengini (hex, token, fırça anahtarı, Tailwind) çözer, saydamlığı bindirir, ölçer.
- [x] J4 Canlı denetim: web için axe `color-contrast` + `target-size` betiği; Avalonia/WPF için görsel ağaçta yazı–zemin ölçen headless test şablonu.
- [x] J5 Core `uc` işareti: rafı ve denetim yordamını tetikler, sıradan turda 0 token.
- [x] J6 İki sürüm, iki README, eklenti güncelle.
- [x] J7 Kampanya: VidShrink, Runly, AbxPilot, CodeXray, VideoEdit, Quizloop — her birinde `uc`: rapor, düzeltme, gerçek pencere görüntüsü, commit.

## K. Araya Soru Haiku Okuyucuya (danışma 035, 2026-10-02, sahip "kur" dedi)

Sıradan turda 0 token; yalnız Claude çalışırken gelen istemde devreye girer.

- [x] `core/agents/okuyucu.md`: model haiku, araç Read/Grep/Glob; "bulamadıysan uydurma",
  "gönderme çözülemiyorsa söyle", kısa cevap, dosyayı bir kez oku.
- [x] `mod.js` `soru()`: soru işareti / soru eki / soru kelimesi → soru; "bu, şu, az önce,
  demin, neden, niye, yaptın" gibi konuşma göndermesi → Opus'ta kalır (bugünkü sıra).
- [x] Soru: defterde `Devredildi:` satırı (sira durumuna girmez, Stop kapısı sormaz),
  banner "Okuyucuya Verildi", metin `mod.devir`: arka planda okuyucuya ver, cevabı
  "okuyucu (Haiku), denetlenmedi" etiketiyle aynen aktar, satırı [x] yap; aynı anda tek okuyucu.
- [x] Ayar `araya: false` kapatır. Testler, iki README, sürüm (minor).

## L. Oturum Başına İş Listesi (log BUG Quizloop 2026-10-05)

Aynı klasörde birden çok oturum tek `.claude/jobs.md` paylaşınca Stop kapısı ötekinin
satırlarını sayıyor, her istemdeki taşıma ötekinin listesini çöpe atıyor. Sıradan turda 0 token.

- [x] `defter.js` `jobsFile(cwd, oturum)`: klasörün ilk oturumu `jobs.md`'nin sahibi olur
  (durum dosyası, 6 saat taze); sonraki oturum `.claude/jobs-<oturum8>.md` kullanır.
- [x] Taşıma yalnız oturumun kendi dosyasını deftere geçirir; 6 saatten eski oturum
  dosyaları süpürülür.
- [x] `dur.js` ve `mod.js` aynı yolu okur, uyarı metni dosyanın adını söyler.
- [x] Testler, iki README, yordam, sürüm (patch).
- [ ] `acik.md` paylaşımı — denenmedi, defter proje çapında ortak tasarlandı
- [ ] Süren işle ilgili kısa sorunun iş sayılması — bağlam sorusu bilerek sırada kalıyor (035)

## N. "X'e Raporla" Üç Hedef, Hep Yerel Dosya (sahip, 2026-10-10)

UI deposuna 2026-09-27'de üç GitHub issue açılmış (#1–#3); yönerge "issue açma" demiyordu,
"base'e raporla" hiç tanınmıyordu. Yönerge yalnız söz geçince gider, sıradan turda 0 token.

- [x] `mod.js`: `base` hedefi; sözü yalnız anan tümce ("... dediğimde", "... diye") rapor sayılmaz.
- [x] `log.js` ve `lib.js`: `--to base`, `baseRepo()` (Core'un yanındaki Teknesyum-Base ya da ayar).
- [x] Yönerge metni: "yerel dosyadır, GitHub issue açma".
- [x] Testler, iki README, yordam, sürüm (minor).
- [ ] Base'in AGENTS.md'sine log notu — Base'te başka oturum çalışıyor, ağacı kirli; o oturuma bırakıldı

## O. Base Kurulum Şartları: Tek Komut Ve Sürüm Kapısı (log BUG RepoWarden 2026-10-10)

RepoWarden "Base'e kurulabilir" yapılırken yalnız kökteki `teknesyum.json` yazıldı; Base `.teknesyum/`
klasörünü okur (tarif, `icon.png`, `shot.jpg`, `full.jpg`). Resim çıkmadı, `run` iki kopyada ayrıştı.
Kapı var olan `yasak.js` içinde koşar, yönerge yalnız söz geçince gider: sıradan turda 0 token.

- [x] `core/scripts/base.js`: `init` klasörü kurar (tarif, simge kopyası, eksik görüntü deftere), `check` dört dosyaya, iki tarifin uyumuna ve `run`'ın zip içinde olmasına bakar.
- [x] `yasak.js`: kurulabilir depoda `gh release create|upload` önce `check` koşar, tutmazsa durur.
- [x] `mod.js`: "Base'e kurulabilir/eklenebilir yap" sözü `init` yönergesini getirir.
- [x] Testler, iki README, yordam, sürüm (minor).
- [x] Sahip (2026-10-10): yeni depo açmak onaya bağlı — `yasak.new`, `gh repo create|fork` ve depo açan `gh api` çağrısı bir kez sorulur.

## P. Bize Ulaşın Tek Yerde: Teknesyum-Private Issue'ları (log TEKLIF RepoWarden 2026-10-10)

Sahibin kararı: bütün projelerin "Bize ulaşın" bildirimi `Teknesyum/Teknesyum-Private` issue'larına düşer; yeni depo yok, aktarıcı yok, anahtar programa gömülür. Tam metin: `logs/openlogs/closed/TEKLIF-butun-projelerin-bize-ulasin-bildirimleri-teknesyum-private-issue-lari.md`.

- [x] Görüntü kararı — sahip (2026-10-12): gövdeye gömülü. Ölçüldü: GitHub `data:` adresini sayfada siler, ham metinde saklar. Yeni issue gövdesi 65.536, yorum 262.144 harf alır; görüntü ilk yoruma gömülür, RepoWarden çözer. Gidiş-dönüş sınandı (issue 6, bayt bayt aynı).
- [x] Sözleşme: özel rafta `private/tercihler/bildirim.md` (adres, başlık, etiket, gövde, görüntü kalıbı, anahtar kuralı); bildirim dosyası olan projede kendiliğinden uyar.
- [x] Anahtar rafta (2026-10-12): `private/anahtarlar/bildirim.key`; Issues okur-yazar, dosya okuyamaz (403)
- [ ] Ortak parça — UI'da: log `--to ui` yazıldı; parça sözleşmeyi uygular
- [ ] RepoWarden gelen kutusu: `bildirim` etiketli issue'ları listeler, `teknesyum-goruntu` bloğunu çözüp gösterir
- [ ] Tarayıcı kapısı: herkese açık `issues/new` bağlantısı bulgu — parça çıkınca
- [ ] Quizloop 0028 ve 0031 geçersiz, `tools/bildirim` kalkar — parça çıkınca

## M. Raf: Bilerek Ertelenen İşler (log TEKLIF Quizloop 2026-10-08)

Sahip "rafta dursun" dediği işin unutulmamasını, bağlantısının her yanıtın sonunda durmasını
istedi. Bağlantı banttan basılır (ekran kanalı), modele gitmez: sıradan turda 0 token.

- [x] `defter.js` `shelf(cwd)`: `docs/later.md` (yoksa `.claude/later.md`) içindeki `## ` başlıklarını sayar.
- [x] `bant.js`: son mesajın sonuna `[later.md](docs/later.md) · N`.
- [x] `statusline.js`: `raf N`.
- [x] `mod.js`: "rafta dursun / kalsın / beklesin", "rafa kaldır" sözünde tek seferlik yönerge.
- [x] Testler, iki README, yordam, sürüm (minor). Dize tablosu tavanı 25500 → 26100.
- [x] 0.63.1 (log TEKLIF Quizloop 2026-10-10): tek mesajlık yanıtta bağlantı başa düşüyordu, artık her
  zaman sonda; model bastıysa ikincisi eklenmez; istem raf başlığına değince tek satır hatırlatma.
- [ ] Stop'ta "konunun dosyaları değişti, başlık duruyor" uyarısı — başlıktan dosyaya güvenilir eşleme yok
- [ ] `rr` işareti — teklifte isteğe bağlıydı, söz tetiği yetiyor; sahip isterse eklenir
- [ ] "rafa koy" tetiği — özel rafla ("rafa yaz") karışıyor, bilerek alınmadı

## Q. Gereksiz Ret Ve İnat: Temiz Göz (danışma 037, sahip 2026-10-13: "d a c kur, b kurma")

Olgu: aynı kamu malı şiir parazitli uzun oturumda 30 dakika reddedildi, temiz oturumda tek istemle yazıldı. B (her tura binen kalıcı kural) sahibin kararıyla kurulmadı.

- [x] D: parazit notuna "eski reddini savunma, baştan değerlendir" tümcesi; yalnız parazit varken
- [x] A: `yy` işareti, temiz göz yordamı; olguları model doğrular, taze ajana yalın istek gider
- [x] C: son yanıt ret kalıbına (`RET`) uyarsa tek satır not ve `Ret Görüldü` bandı; kalıp yoksa çıktı yok
- [x] C kırılma uyarısı: `RET` yakalamadığı yanıttan sonra yalın `yy` gelirse söz Core'da `logs/openlogs/BUG-ret-kalibi-kacirdi.md` dosyasına düşer
- [ ] Ölçüm: dört kol, kol başına 3 tekrar, telifli kontrol metni dahil (037 madde 5)

## R. İlerleme Çubuğunu Core Çizer (log TEKLIF VidShrink 2026-10-15 ve 2026-10-17)

Olgu: çubuğu model her notta elle yazıyordu, 10 hücre, %10 adım, yüzde ve kalan süre tahmindi. İki teklif birleşti.

- [x] statusline `.claude/jobs.md` okur; satırda `(n/m)` alt adımı varsa kesirli sayılır
- [x] 13 hücre, kesirli bloklar (▏▎▍▌▋▊▉█): yaklaşık %1 çözünürlük
- [x] kalan süre ölçülen hızdan: ilk görülme anından bu yana geçen süre / yüzde; yüzde 0 iken yazılmaz
- [ ] later dağıtımı için `.claude/later-run.json` (ajan, başladı, birleşti) ve CI kırılımı — sahip isterse; jobs.md satırı şimdilik yeter
- [ ] telefonda görünüm: statusline telefonda yok; her nota çubuk yazdırmak model tokenı demek, kurulmadı

## S. Ölçmeden Giriş Yok: Balon Raporu (sahip 2026-10-21)

Olgu: graphify 130 bin yıldızlı, "71.5x" tasarruf iddiası tüm depoyu okumakla kıyaslıyor; Grep'li ajana karşı ölçülmemiş. Dışarıdan hiçbir araç ya da fikir ölçülmeden Core'a ya da kurallara girmez.

- [ ] İddia tablosu: Yüksek adayların (piyasa-20 ilk 5, on-tarama a-h Yüksek'ler, graphify) README'deki sayısal iddiası, kıyas tabanı, bağımsız ölçüm var mı — sonnet, kod okumadan
- [ ] Ölçüm düzeneği: `bench/run.js` kolu olarak A/B; aynı görev seti, kol başına en fazla 3 tekrar; metrik toplam token (girdi, çıktı, önbellek), süre, görev geçti mi, her turda bağlama giren sabit bayt
- [ ] Sıra: graphify (VidShrink `src/`, 4-5 gerçek soru, Explore'a karşı), sonra iddia tablosunda en büyük iddiadan küçüğe
- [ ] Her üçüncü taraf indirmesi ad, kaynak, boyutla tek satır onaya sunulur; harcama 50 $ altı sorulmaz
- [ ] Sınıf: Gerçek (iddianın en az yarısı tuttu), Kısmi, Balon (tutmadı ya da tersine döndü)
- [ ] `docs/arastirma/balon-raporu.md`: ne incelendi, ölçümler, iddia ile ölçüm yan yana, o iddiaya verilen yıldız sayısı
- [ ] Gerçek çıkan yalnız çağrılınca çalışan biçimde alınır; her tur yükü varsa önce tek satır pay bildirimi

### S1. Ölçüm Turu (sahip 2026-10-21: "hepsini ölç, gerekli olanları kur, en son net rapor")

Aday: piyasa-20 ilk 5 + graphify + on-tarama a-h Yüksek'ler (~50). Dört kol paralel, her biri kendi ölçüm dosyasına yazar; birleştirme `docs/arastirma/balon-raporu.md`.

- [ ] A Sıkıştırma ve dönüştürme (headroom, toon, distil, context-diff, markitdown, pxpipe, caveman): sabit derlem, `claude -p` usage ile gerçek token, RTK'ya karşı
- [ ] B Kod bağlamı ve arama (graphify, probe, ast-grep, claude-context, code-review-graph, codebase-memory-mcp, qmd, coding_agent_session_search): VidShrink kopyasında 4 soru, Explore'a karşı A/B, kol başına 3 tekrar
- [ ] C Belirleyici araçlar (knip, fallow, betterleaks, ripsecrets, scc, cc-safety-net, destructive_command_guard, claudeignore, skill-scanner, tokencost, ttok, promptfoo, ccusage, unclog, claude-crusts, cc-cache-monitor, claude-pace, mcp-cli, mcporter, playwright-cli, dbhub, communique): kendi depolarımızda işlev, süre, yanlış pozitif, her tur yükü
- [ ] D Orkestrasyon ve diğerleri (bonsai, claude-worktree-hooks, fleetmates, Archon, claude-code-action, reviewd, sloppy, claude-multisession, beads, claude-handoff, hatel, tdd-guard, context-mode, godot-mcp-go, ffmpeg-skill, claude-real-video, fauxnix, v4-pro): her tur yükü baytı, sayısal iddia varsa A/B
- Kurulum: yalnız resmi depo, paket adı deponun kendi README'siyle eşleşir; `C:\Users\Administrator\olcum-dis\<araç>` altında yalıtılmış; kullanıcı ayarlarına, CLAUDE.md'ye, gerçek projelerin git hook'larına yazılmaz; ad, kaynak, boyut rapora
- Bütçe: dört kol toplam 50 $ altı; aşacaksa dur ve bildir

## T. Alınan Araçları Kim Çağırır (sahip 2026-10-21: "ben bilemem ne zaman lazım olur, Opus bilip yapacak mı")

Olgu: altı araç kuruldu ama hiçbir yerde anılmıyor; model varlığını bilmiyor, sahip ne zaman gerektiğini bilemez. Yani bugün kimse çağırmıyor. Kural: çağrıyı model değil betik ya da kanca yapar; yollar `~/.claude/teknesyum/config.json` içindeki `tools` alanında, yoksa PATH, o da yoksa sessizce atlanır.

- [x] T1 betterleaks: `release.js cut` son etiketten bu yana commit'leri tarar, bulgu varsa keser; `--no-secrets` ile geçilir
- [x] T2 markitdown: `hooks/belge.js`, Read kancası `if: Read(*.pdf|docx|pptx|xlsx)`; ilk okuma 3,6 sn, sonra önbellek; bağlama yazmaz
- [x] T3 knip: yeri yok. Ayarlı hâli bile 12 bulgunun 7si yanlış; kendiliğinden çağrılacak yer yok. Alınmadı, silinmesi sahibin onayında
- [x] T4 scc: yeri yok. map.js satırı zaten kendi sayıyor, scc bir şey katmıyor. Alınmadı, silinmesi sahibin onayında
- [x] T5 graphify: kapsam taraması (docs/arastirma/kapsam-taramasi.md) eşiği yalnız VidShrink geçiyor. Sahip kararı: 400+ üretim dosyalı depoda oturum başına tek satır hatırlatma (count.js, ~400 B), kullanmak modelin kararı
- [x] T6 headroom: proxy A/B ölçüldü (`docs/arastirma/headroom-proxy.md`). Proxy'siz temele göre fatura -%26, kabul 15/15, süre +%4. Kazancın çoğu sıkıştırma değil araç şeması ertelemesi. Karar: silinmez; varsayılan yapılmaz, isteğe bağlı başlatıcı ve opus koltuğunda ikinci ölçüm sahibin onayına (U5)
- [x] T7 Tarama öncesi yer kapısı (sahip 2026-10-21: "doğruysa projeye alınmayacak repolar taranmayacak birdaha"): aday daha taramaya girmeden "tutarsa nereye girer, kim çağırır" satırını taşır; satırı boş olan ne taranır ne ölçülür

## U. Gözcü Proxy Ve headroom Ölçümü (sahip 2026-10-22: "gözlemci proxy ve headroom ölçümü başlasın")

Gözcü trafiğe dokunmaz: isteği olduğu gibi iletir, cevabı olduğu gibi döndürür, yalnız sayıları yazar. Başlık ve içerik yazılmaz; anahtar kayda girmez. Yer: `core/scripts/gozcu.js`, çağıran `ANTHROPIC_BASE_URL` (bench kolu ya da sahibin elle açtığı oturum). Her tura yük yok.

- [x] U1 `gozcu.js`: istek başına zaman, model, sistem/araç/mesaj baytı, önek özeti (önbellek kırılması için), usage (girdi, önbellek yazma/okuma, çıktı), ilk bayt ve toplam süre; `--upstream` ile headroom'un önüne zincirlenir
- [x] U2 bench: `BENCH_BASE_URL` koşuya `ANTHROPIC_BASE_URL` olarak geçer
- [x] U3 A/B: 5 görev × 3 kol (gözcü→Anthropic / gözcü→headroom geçir / gözcü→headroom sıkıştır) × 3 tekrar, sonnet/low; tahmin ~10 $
- [x] U4 rapor: `docs/arastirma/headroom-proxy.md`; fatura, önbellek isabeti, gecikme, kabul testi; karar T6'ya yazılır
- [ ] U5 karar sahibin: headroom için isteğe bağlı başlatıcı (proxy + ANTHROPIC_BASE_URL) ve opus/T0 koltuğunda 5 görev × 2 kol × 3 tekrar ikinci ölçüm (~25 $)
