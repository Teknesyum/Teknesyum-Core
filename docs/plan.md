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
- [ ] 0.22.0 kes, yayınla, laptop eklentisini güncelle.

Bedel ölçüldü: sıradan tur 0 B; `??` 1726 B; `pp` 3738 B; kanca ~170 ms.
