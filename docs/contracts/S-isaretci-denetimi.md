# S — İşaretçi denetimi

**Durum:** açık · **Rol:** T0 + advisor (fable) · **Profil:** premium

## Bağlam

Geçen oturumda `cue.js` eklendi: `SessionStart`, `PostCompact` ve `UserPromptSubmit`
olaylarına cevap veren tek kanca. İddiası — bağlama durum enjekte etmek yerine yalnız
işaretçi (sözleşme kimlikleri + yol) basar, 200 karakter tavanı vardır, sıradan turda
hiçbir şey yazmaz. Karar `docs/DECISIONS.md` D10, bedel tablosu `docs/COST-MODEL.md`.

Bu sözleşmenin işi o iddiayı sınamak.

## Okunacaklar

- `core/hooks/cue.js`, `core/hooks/hooks.json`, `core/scripts/log.js`
- `docs/COST-MODEL.md`, `docs/DECISIONS.md` (D10)
- `test/all.js` → `testNoContextWrites`
- Karşılaştırma: `../Teknesyum-UI/Teknesyum-Base/teknesyum/hooks/relay-watch.js`
  (`sikismaSonrasi` ve `SessionStart` dalları)

## Fable'a sorulacaklar

1. **İşaretçi yetiyor mu?** Sıkışma sonrası model şu 78 karakteri görünce doğru davranır
   mı, yoksa gövdeyi okumadan devam edip yine uydurur mu?
   `Open relay: T7, UI3 | live: builder | read .claude/relay/ before writing code.`
   Enjektörün taşıdığı hangi bilgi gerçekten kayıp?
2. **Sessiz kalma koşulu doğru mu?** Kanca yalnız `contracts/*.md` ve `ended` alanı
   olmayan `live/*.json`'a bakıyor. Yanlış negatif (iş açık ama susuyor) ve yanlış pozitif
   (iş bitmiş ama konuşuyor) senaryoları var mı?
3. **`UserPromptSubmit` her turda çalışıyor.** Regex `(log|günlük)\s*(yaz|tut)`. Süreç
   maliyeti (Node açılışı, ~30–60 ms/tur) token maliyeti olmasa da bir bedel — kabul
   edilebilir mi, yoksa kalıp başka bir olaya mı taşınmalı?
4. **200 karakter doğru tavan mı?** Sekiz sözleşme + altı rol dolduğunda satır kesilir.
   Kesilme hangi bilgiyi kaybeder, önemli mi?
5. **D10'un açık sorusu.** `SessionStart` gerçekten kâr ediyor mu, yoksa oturum başına
   ~55 token saf kira mı? Ölçmenin somut yolu ne?

## Kabul

- Fable'ın beş soruya da ayrı ayrı cevabı alınmış olacak.
- Kullanıcıya ayrıntılı bir tablo basılacak. Her satır bir olay ya da senaryo; sütunlar:
  ne zaman tetiklenir · ne yazar · kaç karakter/token · bedel sınıfı · Base'de aynısı
  kaça mal oluyordu · Fable'ın notu (yeterli / eksik / gereksiz).
- Tablonun altında 40 turluk, iki kez sıkışan bir oturum için Base ile Core'un toplam
  maliyeti yan yana konacak.
- Fable'ın "eksik" dediği her madde ya düzeltilecek ya da neden düzeltilmediği D10'a
  yazılacak.
- `node test/all.js` sıfır hata ile geçecek.
- Değişiklikler puşlanacak.
