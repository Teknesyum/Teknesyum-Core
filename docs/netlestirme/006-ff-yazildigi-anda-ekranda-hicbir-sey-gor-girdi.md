[[netlestirme:006]]

# Netleştirme: ff yazıldığı anda ekranda hiçbir şey görünmüyor, banner ancak modelin ilk çıktı 

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

ff yazıldığı anda ekranda hiçbir şey görünmüyor, banner ancak modelin ilk çıktı parçasıyla geliyor. Duran yasa UserPromptSubmit'te systemMessage'ı yasakladığına göre: banner'ı istem anında göstermenin bir yolu var mı, yoksa metni mi düzeltmeliyiz, yoksa statusline'a mı taşımalıyız?

## Elde olan olgular

# Olgular: ff yazıldığı anda ekranda neden bir şey yok

## Şu anki zincir

1. Kullanıcı `ff ...` yazıp Enter'a basar.
2. `UserPromptSubmit` → `core/hooks/mod.js`. `fable()` iki şey yapar:
   - `shown.push(banner('banner.fable'))` → satır `~/.claude/teknesyum/banner-<oturum>.json`
     kuyruğuna yazılır (lib.js `say`, en son 6 satır).
   - Modelin bağlamına `mod.fable` yordamı (advice.js ask/record komutları) girer.
3. Model yanıtı akmaya başlar. İlk `MessageDisplay` parçasında `core/hooks/bant.js` kuyruğu
   boşaltır ve satırları `displayContent` ile cevabın üstüne çizer.

Yani banner, Enter'a basıldığı anda değil, **modelin ilk çıktı parçası aktığında** görünür.
Bu turda kuyruk dosyası ölçüldü: ben cevap yazmaya başlamadan önce hâlâ dolu duruyordu:

```
{"lines":["Teknesyum Core > 1 Açık İş Geri Geldi · Dosya trash/'te",
          "Teknesyum Core > Fable Danışması · Soru Dosyası Gidecek, Cevap Kaydedilecek"]}
```

Metin (`strings.json`): `"Fable Danışması · Soru Dosyası Gidecek, Cevap Kaydedilecek"`.
Yani "danışılıyor" değil, gelecek zamanlı bir bildirim.

## Kısıtlar

- **Duran yasa:** Claude'un `SessionStart` ve `UserPromptSubmit` kancalarında `systemMessage`
  yok. `additionalContext` de yalnız işaret istisnasında var. Bu yüzden istem anında ekrana
  yazacak bir kanal yok; `MessageDisplay` tek yol.
- `MessageDisplay` yalnız model çıktısı akarken tetiklenir. Model ilk aracı çağırmadan önce
  bir şey yazmazsa (araçla başlarsa) banner o ilk metin parçasına kadar gecikir. Bu turda
  önce araçlar koştu, gecikme buradan.
- 0 token kuralı: banner modele girmez, ekranda kalır. `systemMessage` denenip reddedilmişti
  (D15 / banner kararı), çünkü saklanan mesaja giriyordu.
- Kancanın stdout'u kullanıcıya basılmaz; `UserPromptSubmit` yalnız bağlama yazabilir.

## Soruya giren gerçek seçenekler

- A: Olduğu gibi bırak, metni düzelt (ör. "Fable Danışması Başlıyor" yerine daha net bir şey).
- B: Banner'ı istem anında bastırmanın Claude Code'da bir yolu var mı — yoksa yok demek.
- C: `ff` görünürlüğünü statusline'a taşı (statusline istem sonrası hemen tazelenir).
- D: Model yordamı, ilk iş olarak tek satır "Fable'a danışıyorum" yazsın (token maliyeti var,
  çok küçük ama sıfır değil).
