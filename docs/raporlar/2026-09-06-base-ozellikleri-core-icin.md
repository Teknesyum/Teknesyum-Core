# Base'in Özellikleri Core'a Yaklaştırılabilir mi — 6 Eylül 2026

Soru: Teknesyum Base (v2.66, "kendimizi en az sınırlayıp istediğimizi yaptığımız proje")
içinde, Core'un maliyet hassasiyetini bozmadan Core'a yaklaştırılabilecek bir özellik var mı?

Yöntem: Base README'sinin 24 bölüm başlığı tek tek okundu, her biri Core'daki karşılığıyla
ve `bench/rapor.md` 8. bölümdeki ölçümlerle eşleştirildi. Model çağrısı yok, bench koşusu
yok; bu belge 0 $.

## Zaten Core'da olanlar (yapılacak iş yok)

| Base | Core'daki hali |
|---|---|
| Statusline, görünür yönlendirme | `statusline.js`, aynı işi tek satırla yapıyor |
| Kesintiden kurtulma (`live/`, handoff) | `handoff.js` — makine yazar, iki satır senin |
| Kod zekâsı (`harita.js`) | `map.js` |
| İkinci görüş (`second_opinion`) | `??` turu, `docs/danisma/` kaydı |
| Üst klasörde açılma uyarısı | `CLAUDE.md` kuralı |
| Kancalar | 6 olay, 5 dosya |

## Ölçüldü ve girmedi (yeniden açma)

Rapor 8: cue sayım satırı (+%38), risk ipucu (+%18), Stop'ta doğrulama (+%51, ret), guard
eşiği (sinyal yok), 0.15 bütünüyle (4-8 kat, ret). Sözleşme makinesi, denetçi, düzeltme
döngüsü, tarife tablosu bu kümeye dahil: hepsi "model yerine seçen makine" ve ölçüm
kabul sütununu hiç oynatmadı.

## Bilerek çıkarılanlar (geri gelmez)

`/save`, `/load`, `/rc` (telefon), `/report`, `/rule`, `/premium`. Kaldırma kararı
0.16'nın gerekçesi; README "What Went Out".

## Adaylar — talep üzerine, kanca yok, sıradan turda 0 bayt

Core'un maliyet modeline sığan tek şekil şu: bir betik ya da CLAUDE.md'de bir cümle, yalnız
istenince koşar, roster ya da rol bağlama girmez. `agency.js` bu şeklin kanıtı. Üç Base
özelliği aynı kalıba oturuyor:

| Aday | Base'de ne | Core'da nasıl | Kurma | Ölçüm |
|---|---|---|---|---|
| **A. Profil taraması** (`/scan`) | Projeyi bir profile karşı okur, eksikleri sayar; yazmaz, model çağırmaz | `scan.js <eco\|normal\|premium>` — salt okunur betik. Sıradan turda 0 $ tanım gereği | ~150 satır, 1 oturum | Gerekmez: model çağrısı yok, kanca yok. Tek sav: sıradan turda bayt yazmıyor (200 tur testi zaten var) |
| **B. Ön çalışma taraması** (`scout`) | İlk plandan önce benzer depolar paralel ajanlarla okunur, `docs/taramalar/RAPOR.md` | "<konu> için ön çalışma yap" cümlesi + `scout.js record` — agency kalıbı | ~80 satır betik + CLAUDE.md'ye 3 satır | 1 ajan × sonnet/low ≈ 0,15-0,30 $ tur başı; n=3 ≈ 1 $ |
| **C. Plan meclisi** (`plan council`) | Aynı brifinge iki planlayıcı (fable+opus), yazma aracı yok | "meclise sor" cümlesi, iki Agent çağrısı, `advice.js record` | Betik yok, CLAUDE.md'ye 4 satır | Pahalı doğası gereği: 2 × ~50k token ≈ 0,5-1 $ tur başı. Yalnız plan gerektiren işte |

Sığmayanlar: **UI checkup** (teknesyum-ui deposu kurulu değil, standart yok — yol haritası
maddesi), **görev paketleri** (`packet.js check` zaten yol haritasında açık madde),
**sertifika/üç profil** A'nın içinde.

## Fiyat

- A: kurulum 1 oturum, ölçüm 0 $. En ucuz aday, tek başına değer.
- B: kurulum yarım oturum, ölçüm sonnet/low n=3 ≈ 1 $.
- C: kurulum 10 dakika, ölçüm gerekmez (tur maliyeti bilinen iki danışma turu).

Üçü birden: bir oturum, bench ≈ 1 $. İkinci kez istenirse yapılır.

## Karar bekliyor

Hangisi, ya da hiçbiri. Yeni iş açılmadı; yol haritasına yazılmadı.
