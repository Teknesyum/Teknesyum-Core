# VidShrink saha raporlarının tasnifi ve fiyatı

3 Eylül 2026. Kaynak: [vidshrink-core-onerileri.md](vidshrink-core-onerileri.md), 17 bölüm.
Bu belge onları tek tek kurmuyor — **fiyatlıyor.** Kurulacak olanı siz seçiyorsunuz.

Maliyet birimi: **dalga** = kod + sav + iki README + sürüm notu, tek oturumda kapanan iş.
"Yarım dalga" bir dosyaya dokunan, on savdan az getiren düzeltme demek.

## Tek kök: `relayRoot` çalışma ağacını değil dizini soruyor

Beş ayrı rapor aynı yerden geliyor. `relayRoot(cwd)` relay'i cwd'den yukarı tırmanarak
buluyor; `git worktree` altında bu yanlış kökü veriyor.

| Rapor | Görünen yüz |
|---|---|
| Bayat ağaç kusuru beşinci kez | `Stop` mühürlenmiş sözleşmeyi "submitted" sanıyor |
| Kancalar bayat çalışma ağacını okuyor | mühürlü iş "atanmamış" diye geri geliyor |
| `live/` iki yerde | denetim kaydı yazılamıyor, denetçinin "yazmadım" güvencesi doğrulanamıyor |
| Denetçi depo dışında koşunca | `live/` kaydı hiçbir yere yazılmıyor |
| Kanca depo kökünü okuyor | `HANDOFF.md` bayat ağaçtan üretiliyor |

**Çözüm:** `git rev-parse --git-common-dir` ile ana depo kökünü çözmek, relay'i oradan
okumak. Tek fonksiyon, `lib.js` içinde.

**Fiyat: 1 dalga.** Beş rapor birden kapanıyor. Listedeki en yüksek getirili tek madde;
başka hiçbir maddenin oranı buna yaklaşmıyor.

## Kapı komutun metnini okuyor, etkisini değil

Dört rapor. `guard.js` bash satırını düzenli ifadeyle tarıyor.

- Salt okunur `git status`, `git merge-base` engelleniyor (yanlış pozitif).
- Heredoc gövdesindeki metin komut sanılıyor (yanlış pozitif).
- `for` döngüsü içindeki `rm -rf` geçiyor (yanlış negatif).
- Reddedilen çağrı hiçbir yere yazılmıyor, yani sayılamıyor.

**Çözüm sırası ve fiyatı:**

| İş | Fiyat | Not |
|---|---|---|
| Salt okunur `git` alt komutlarını beyaz listeye almak | ~0,3 dalga | `status`, `log`, `diff`, `show`, `merge-base`, `rev-parse` |
| Reddi `live/refused.log`'a yazmak | ~0,3 dalga | ölçüm olmadan kalan maddeleri seçemeyiz |
| Heredoc gövdesini taramadan çıkarmak | ~0,5 dalga | ayrıştırıcı işi, dikkat ister |
| Döngü içindeki yıkıcı komutu görmek | ~1 dalga | doğru yapmak zor, yanlış yapmak yeni yanlış pozitif |

Önce ilk ikisi. Son ikisi ölçüm geldikten sonra.

## Tek başına duran maddeler

| Rapor | Fiyat | Değerlendirme |
|---|---|---|
| `complete` denetim kaydını yalnız yüksek riskte okuyor, denetlenmiş işe "kimse okumadı" diyor | ~0,2 dalga | Kayıt varsa oku. Ucuz ve utandırıcı bir kusur |
| Mühür kapısı `owns` içindeki dizin yolunu yalnız `complete`'te reddediyor | ~0,3 dalga | Açılışta reddet; geç reddetmek bütün turu çöpe atıyor |
| `Stop` kapısı `depends` ve `owns` kesişimini görmüyor, dağıtılamaz işi her turda işaretliyor | ~0,5 dalga | Gürültü, engel değil |
| `orphans()` C# üretim dosyalarını öksüz sayıyor (`PlanCalculator.cs`'i `trash/`e önerdi) | ~0,5 dalga | Yanlış tavsiye vermek, tavsiye vermemekten kötü |
| Ekran kapısı `dotnet test` içinden açılan pencereyi geçiriyor | ~1 dalga | Süreç ağacını izlemek gerekiyor; pahalı |
| `TEKNESYUM_GATE_OPEN` ajanın içinden kurulamıyor | ~0,3 dalga | Belgelenen kaçış deliği çalışmıyor; ya çalışsın ya belgeden çıksın |

## Bu turda zaten kapananlar

Bunlar ağaçta hâlihazırda düzeltilmişti, `4e88510` ile mühürlendi:

- Mühür kapısı denetçiyi ajan tipinden tanıyordu → `teknesyum-core:` öneki artık soyuluyor.
- `risk.js` içindeki `*.csproj` deseni yıldızı harfi harfine arıyordu → dosya adı deseni.
- `npm test` yalnız `all.js` koşuyordu → üç takım (`run.js`).

## Önerilen sıra

1. **`relayRoot` kökü** — 1 dalga, 5 rapor kapanıyor.
2. **Kapı ölçümü + salt okunur git** — 0,6 dalga, geri kalanı ölçmeden seçemeyiz.
3. **`complete` kayıt okuması ve dizin `owns` reddi** — 0,5 dalga, ikisi de tek satırlık
   utanç.
4. Kalanı, 2. maddenin ölçümü geldikten sonra.

Toplam 1–3: **~2 dalga.** Listenin tamamı ~6 dalga eder ve son üçte biri getirisi belirsiz.
