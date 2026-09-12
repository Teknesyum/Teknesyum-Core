# Banner ölçütü

Kullanıcının 2026-09-09'da koyduğu altı ölçü. Eklentinin bastığı her satır bunlarla yargılanır.

1. **Sıfır maliyet.** Banner modelin bağlamına yazıyorsa banner değildir, gider kalemidir.
   Sıradan turda hiçbir şey basılmaz; basılan yalnız eşikte, bir kez basılır.
2. **İyi görünmeli.** Tek satır, başlığı Baş Harfleri Büyük, sütun taşırmaz.
3. **İyi bilgi vermeli.** Kullanıcının o an bilmediği ve işine yarayan şeyi söyler.
4. **Lüzumsuz bilgi içermemeli.** Sayılabilen ve statusline'da zaten duran şey banner'a
   girmez.
5. **Durum hakkında bilgilendirmeli.** Nerede olduğumuzu söyler.
6. **Sistemin çalıştığını söylemeli ve sonuçlarına hazırlamalı.** `??` yazınca kütüphanenin
   döndüğünü görmek gibi: banner hem "makine çalıştı" der, hem birazdan ne olacağını
   söyler. Sonucu haber vermeyen banner yarım banner'dır.

## Kanal: `MessageDisplay` (v0.30.0)

v0.29.0 satırları `systemMessage` ile bastı ve yanlıştı. Masaüstünde katlanmış bir "Claude
Code notice" çipine düşüyor, başına `UserPromptSubmit says:` ekleniyor, açılamıyor. Üstelik
`SessionStart` ve `UserPromptSubmit`'te harness bu alanı modelin bağlamına da ekliyor
(DECISIONS D11, D15, Standing law). Base'in "modele ters tırnakla bastır" yolu da Standing
law'a göre kapalı: modele banner bastırmak C sınıfı.

v0.30.0 D15'e döndü. Kanca satırı modele değil diskteki kuyruğa yazar:
`lib.say(oturum, satır)` → `~/.claude/teknesyum/banner-<oturum>.json`. `hooks/bant.js`
`MessageDisplay`'in ilk akışında (`index 0`) kuyruğu boşaltır ve satırı mesajın üstüne ters
tırnaklı blok olarak çizer; kuyruk mesajın ortasında dolduysa son akışın altına çizer.
`displayContent` yalnız ekranı değiştirir: saklanan mesaj ve modelin gördüğü aynı kalır.
Maliyet 0 token, mesaj başına bir node koşusu. Kanal CC 2.1.251 masaüstünde sondayla
doğrulandı (2026-09-11, `index`, `final`, `delta` alanları geliyor).

| Olay | Kullanıcının gördüğü satır |
| --- | --- |
| Oturum açılışı (`count.js`) | `Teknesyum Core > v0.29.0 Çalışıyor · Devir Notu Bekliyor · Plan 14/23: …` |
| `??` `++` (`mod.js`) | `Kütüphane Döndü · N Kitap Uydu · En Çok Üçü Okunacak` |
| `aa` | `Ajans · N Koltuk Uydu · Cevap docs/danisma/ Altına Yazılacak` |
| `pp` | `Özel Raf Açıldı · N Kitap · K KB` (modelin "◆" yankısı kalktı) |
| `ff` `hh` | `Fable'a Danışılıyor · Soru Gidiyor, Cevap Kaydedilecek` / `İşaret Listesi Geliyor` |
| jobs.md (`mod.js`) | `N Açık İş Geri Geldi · Dosya trash/'te` |
| İş kapısı (`dur.js`) | `İş Kapısı · N Açık, Gerekçesiz` / `İş Kapısı · N Madde, Liste Yok` |
| Eşik (`count.js`) | `Eşik · N dosyaya dokunuldu · Sırada Plan Var Ya Da Atla De` |
| Bağlam eşiği | `Bağlam %N · Devir Notu Hazırlandı` |
| Kanıt kapısı (`dur.js`) | `Kanıt Kapısı · N Kod Dosyası Değişti, Hiçbir Şey Koşmadı · Sırada Kanıt Var` |
| Denylist / döngü | `Yasak Liste Bir Komutu Durdurdu · <neden>` / `Sınırsız Bekleme Durduruldu · …` |
| Koltuk (`show` sonrası ya da Stop) | `Koltuk Okundu · slug · K KB` |

Ölçü 1: sıradan tur 0 bayt; satır yalnız olay olunca kuyruğa girer, bağlama hiç girmez.
Test takımı hiçbir kancanın `systemMessage` yazmadığını denetler.

## Ne zaman görünür

Satır kuyruğa istem anında girer, ekrana **modelin ilk metin parçası aktığında** çizilir.
Arada yalnız araç çağrısı varsa `MessageDisplay` tetiklenmez; 2026-09-12'de ölçüldü, `ff`
turunda kuyruk dosyası sekiz araç çağrısı boyunca dolu bekledi ve ilk metinle boşaldı.

Enter'a basıldığı anda çizmenin yolu yok: `UserPromptSubmit` yalnız bağlama yazabilir,
`systemMessage` masaüstünde katlanmış çipe düşer (D15), statusline'ı masaüstü hiç çizmez.
Modelden banner bastırmak Standing law'a aykırı. Erken görünmesinin tek yolu, işaretli turda
modelin ilk araçtan önce bir satır yazması — o satır modelin kendi işi, kancanın değil.

`ff` yordamı (v0.33.2) bunu istiyor: "İlk araç çağrısından önce tek satırla söyle." Satırın
içeriği modele bırakılır, banner'ı model basmaz; yalnız çizimin tetikleneceği bir metin olur.
Bedel yalnız `ff` turunda ve yalnız yordamın içinde: TR tarafında 54 bayt. Metin tablosu
14.078 bayta çıktı, testteki tavan 14.000'den 14.200'e alındı.

## Kapanan yol

Sohbet adını rename ile canlı güncellemek **iptal edildi**: her turda token harcar, 1. ölçüyü
düşürür. Kancanın oturum başlığına erişimi de doğrulanmış değil; erişim saptaması da bu
kararla birlikte düştü. (Netleştirme: `docs/netlestirme/002-...md`)
