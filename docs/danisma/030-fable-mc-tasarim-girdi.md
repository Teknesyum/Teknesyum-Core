# Danışma 030 girdi: `mc` bellek taramasının tasarımı

Fable'a gönderilen metin olduğu gibi:

---

Sen Teknesyum Core'un karar ortağısın. Cevabın Türkçe, en çok 700 kelime. Depoyu okuyabilirsin:
`C:\Users\Administrator\Desktop\Projeler\Teknesyum-Core`. Kod yazma; tasarım ver.

## Kullanıcının sözleri

"uzun bir istek var ve yapılmamış iş var gözden mi kaçacak fable dizayn etsin mc yi"

Önceki turlarda: "3 konuşma kaydı ile sınırlamayacağız ne kadar gerekiyorsa o kadar okusun
sonuna kadar gitmesine gerek yok ancak burda t0 karar versin" ve "mc kalıntı bir tüketim
yapmıyor değil mi sonraki mesajlara".

## `mc` bugün nasıl çalışıyor (v0.36.1)

- `core/hooks/mod.js`: istemin başında ya da sonunda `mc` görülünce bağlama bir tarif koyar
  (`core/strings.json` → `mod.memory`).
- `core/scripts/hatirla.js topla [--sayfa N]`: `~/.claude/projects/<slug>/*.jsonl` kayıtlarını
  yeniden eskiye tarar, `type:user` ve `isMeta` olmayan, `<system-reminder>` vb. taşımayan
  metinleri alır, **her isteği 1200 karakterde keser**, tekrarları atar, 60'lık sayfalar
  hâlinde `tmp/gecmis-N.md` yazar. İlk sayfaya `trash/jobs-*.md` son beş dosyanın açık
  `- [ ]` satırları eklenir.
- Ana model sayfayı okur, daha geriye gidip gitmeyeceğine karar verir, sayfaları sonnet alt
  ajanına verir; dönen `- [ ] iş — neden açık` listesi `record --reply` ile
  `tmp/hatirlatici.md` olur.

## Bilinen zaaflar

1. Uzun istek 1200 karakterde kesiliyor: kesilen kısımdaki iş hiç görülmüyor.
2. Sayfaları ana model okuyor: 60 istek 5–20 bin token, konuşma geçmişine girip sonraki her
   turda yeniden gönderiliyor (compact'a kadar kalıntı).
3. Yalnız kullanıcının istekleri okunuyor; asistanın "yaptım" dediği, commit'ler,
   `.claude/jobs.md` işaretleri, `docs/plan.md` onay kutuları karşılaştırılmıyor. "Bitmemiş"
   kararı yalnız istek metninden veriliyor, yani alt ajan tahmin ediyor.
4. İstemin başındaki `mc` kelimesi soru cümlesinde de tetikliyor ("mc nasıl çalışıyor").
5. Aynı istek birden çok oturumda tekrar edilince tek sayılıyor ama hangisinin son hâli olduğu
   belli değil.

## Kısıtlar

- Maliyet altın kural: işaretsiz turda 0 token. Çağrılınca harcamak serbest, ama ana bağlama
  kalıntı en aza insin.
- Kullanıcıya görünen metin ekran kanalıyla (`lib.say`/`sayBlock` → `bant.js`) gider,
  `additionalContext` yalnız modelin iş tarifi içindir.
- Alt ajan kendi bağlamında çalışır, ana bağlama yalnız cevabı döner.
- Geçici dosyalar `tmp/` altında, git'e girmez.
- Ne kadar geriye okunacağına "t0" karar verir — kullanıcının deyişi; oturumun kendi modeli
  diye anlıyorum, sen başka okursan söyle.

## Senden istenen

1. Uzun isteklerde iş kaçırmayacak okuma yöntemi (kesmek yerine ne?).
2. Kim neyi okusun: ana model mi, alt ajan mı, kaç alt ajan, hangi model; "ne kadar geriye"
   kararı nerede verilsin ki ana bağlama kalıntı birkaç satır olsun.
3. "Bitmemiş" kararı neye dayansın (istek ↔ cevap ↔ commit ↔ jobs/plan eşlemesi), yanlış
   pozitif ve yanlış negatif nasıl azalır.
4. Çıktı dosyasının biçimi ve kullanıcıya ekranda ne gösterileceği.
5. Tetik kuralı (madde 4).
6. Uygulama adımları, test edilecek davranışlar, en büyük risk.
