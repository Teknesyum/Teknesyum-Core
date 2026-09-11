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

## Kanal: `systemMessage` (2026-09-11 düzeltmesi)

Eski tablo her satıra ✓ vermişti ama yanlıştı: eşik, işaret, kanıt kapısı ve denylist
satırları `additionalContext` / `reason` ile yalnız **modele** gidiyordu. Kullanıcı bunları hiç
görmedi; ekranda "Teknesyum Core > …" yoktu. Kullanıcıya giden tek kanal kancanın
`systemMessage` alanı. Sohbette `hook_system_message` diye görünür, modelin bağlamına girmez.
v0.29.0'dan beri her kanca olayı, modele söylediğinin yanında kullanıcıya da tek satır basıyor.
Her satır `lib.banner()` ile `Teknesyum Core > ` önekini alıyor.

| Olay | Kullanıcının gördüğü satır |
| --- | --- |
| Oturum açılışı (`count.js`) | `Teknesyum Core > v0.29.0 Çalışıyor · Devir Notu Bekliyor · Plan 14/23: …` |
| `??` `++` (`mod.js`) | `Kütüphane Döndü · N Kitap Uydu · En Çok Üçü Okunacak` |
| `aa` | `Ajans · N Koltuk Uydu · Cevap docs/danisma/ Altına Yazılacak` |
| `pp` | `Özel Raf Açıldı · N Kitap · K KB` (modelin "◆" yankısı kalktı) |
| `ff` `hh` | `Fable Danışması · …` / `İşaret Listesi Geliyor` |
| sonra.md | `Sonraya Bırakılan N İş Geri Geldi · Dosya trash/'e Taşındı` |
| Eşik (`count.js`) | `Eşik · N dosyaya dokunuldu · Sırada Plan Var Ya Da Atla De` |
| Bağlam eşiği | `Bağlam %N · Devir Notu Hazırlandı` |
| Kanıt kapısı (`dur.js`) | `Kanıt Kapısı · N Kod Dosyası Değişti, Hiçbir Şey Koşmadı · Sırada Kanıt Var` |
| Denylist / döngü | `Yasak Liste Bir Komutu Durdurdu · <neden>` / `Sınırsız Bekleme Durduruldu · …` |
| Koltuk (Stop) | `Koltuk Okundu · slug · K KB` |

Ölçü 1: sıradan tur hâlâ 0 bayt, satır yalnız olay olunca basılır ve bağlama girmez.

## Kapanan yol

Sohbet adını rename ile canlı güncellemek **iptal edildi**: her turda token harcar, 1. ölçüyü
düşürür. Kancanın oturum başlığına erişimi de doğrulanmış değil; erişim saptaması da bu
kararla birlikte düştü. (Netleştirme: `docs/netlestirme/002-...md`)
