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

## Bugünkü banner'lar bu ölçüde nerede

| Nerede | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| Eşik uyarısı (`count.js`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ ("plan yaz ya da atla de") |
| İşaret bulguları (`mod.js`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (komutu içinde yazar) |
| Kanıt kapısı (`dur.js`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ ("bir kez soruldu; sonraki geçer") |
| Denylist (`yasak.js`) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (ne yapılacağını yazar) |
| Ajans koltuğu (Stop) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## Kapanan yol

Sohbet adını rename ile canlı güncellemek **iptal edildi**: her turda token harcar, 1. ölçüyü
düşürür. Kancanın oturum başlığına erişimi de doğrulanmış değil; erişim saptaması da bu
kararla birlikte düştü. (Netleştirme: `docs/netlestirme/002-...md`)
