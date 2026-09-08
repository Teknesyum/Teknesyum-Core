# Plan: eklenti incelemesi ve özel raf (2026-09-08)

İki iş. İkisi de sıradan turda sıfır token kuralına bağlı; bedel yalnız `??` / `++` yazana.

## A. En çok kullanılan eklentiler, tek tek

Kütüphane taraması metin paketlerine baktı. Bu tur mekanizmaya bakar: eklenti ne kurar (kanca,
komut, MCP, ajan, CLAUDE.md), sıradan turda bağlama kaç KB ekler, kullanıcıya nasıl hissettirir,
ne satar. Her biri için tek soru: Core'a ne alınır — kitap, pasif betik, kanca, hiç.

- Aday: tarama.jsonl'de yıldıza göre ilk 70'ten eklenti/araç olanlar, 24 depo. Liste bu turun
  ajanlarında; awesome-claude-code listesinden "en çok anılan 15" ayrıca çıkarılır.
- Çıktı: `docs/kutuphane/eklenti/<slug>.md`, ≤300 kelime, aynı şablon. Özet ve ölçü tablosu
  `docs/kutuphane/eklenti-2026-09-08.md`.
- Bedel: 24 sonnet ajanı × ~65K ≈ 1,6M token ≈ 7 $. Süre ~2 dk.

## B. Özel raf: TeknesyumPrivate

Kullanıcı kendini bir kez anlatır; program bilir. Kimlik, tercihler (yazım, UI düzeni, araç
alışkanlıkları), proje notları `~/.claude/teknesyum-ozel/ozel/` altında md kitaplar olur. Depo zaten
var (`Teknesyum/Teknesyum-Private`), CLAUDE.md aynası orada.

- Raf: `kutuphane.json`'a girmez; `raflar.json` (kullanıcı dosyası) ile değil, `kutuphane.js` içinde
  sabit `ozel` rafı. Dizin `~/.claude/teknesyum-ozel/ozel`. Kind `docs`.
- Kapı: raf yalnız sahibi açıkken kataloğa girer. Ölçü: `git config user.email` == depo
  `ozel.json`'daki e-posta (0 ms, süreçsiz) ve klon var. `gh auth status` yok: 300 ms ve ağ.
- Eşitleme: `kutuphane.js fetch ozel` = `git pull --ff-only`; `kutuphane.js push ozel` = add,
  commit, push. Otomatik: SessionStart kancası arka planda pull (0 token, ~1 s ağ), Stop kancası
  dizin kirliyse push. İkisi de yalnız sahibi açıkken; başkasının makinesinde hiç çalışmaz.
- `++` = özel mod: önce `ozel` rafı, sonra kütüphane. `??` = yalnız kütüphane. Kural home
  CLAUDE.md'ye 3 satır.
- Banner: iki katman. (1) Stop kancası `Seat:` satırını `Teknesyum · özel: kimlik, ui — 3 KB`
  olarak basar (systemMessage, D13, bağlama girmez). (2) Cevabın ilk satırı `◆ Teknesyum` ve son
  satırı kaynak; modele 3 satır kural, turda ~15 token. Sıradan turda ikisi de yok.
- Tohum kitaplar: `kimlik.md`, `tercihler/yazim.md`, `tercihler/ui.md`, `tercihler/araclar.md`.
  Bellek dosyalarından ve RULES.md'den çıkarılır, kullanıcı düzeltir. Toplam ≤8 KB ≈ 2K token/`++`.
- Dosyalar: kutuphane.js, hooks/count.js, hooks/notify.js ya da yeni SessionStart satırı,
  settings hook kaydı, test/all.js, README ×2, home CLAUDE.md, ozel/ tohumlar. ~10 dosya.
- Bedel: yazım tek oturum, ~4 $ model. Çalışma: sıradan tur 0 token; `++` turu ≤2K token + banner
  15 token; kancalar ~1 s ağ, sahibi değilse 0.

Sıra: A şimdi başlar (ucuz, istendi). B, "Senden istediklerim" altındaki iki karar gelince.
