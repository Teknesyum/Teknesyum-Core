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
- [ ] K1 Stop kapısı: kanıt yoksa `decision:block`, `stop_hook_active` ile tek ısrar; `doubt` öneki.
- [ ] K2 Tehlikeli komut denylist (PreToolUse) + vakalı test.
- [ ] K3 Kanca hijyeni: aynı metni ikinci kez basma, bayt bütçesi testi, Windows `python3` stub, stdin boşaltma.
- [ ] B1 `npm test` içinde kanca şema denetimi + kuru çalıştırıcı.
- [ ] K4 SessionStart `startup|clear|compact` + PreCompact özet yaması.
- [ ] B5 Kütüphane: tek katalog, kaynak SHA ile tazeleme, `last_verified`, BM25 `ara`.
- [ ] K5 Commit anı kancası + oturum manifesti.
- [ ] B3 Yerel özet (handoff'u betik yazsın).
- [ ] B4 Düzeltme yakalayıcı.
- [ ] B6 Statusline widget'ları.
- [ ] B2 AGENTS.md lint, B7 README ikizleri pre-commit.
- [ ] Bench: baseline × skilled, yargıçsız A/B.
