# Netleştirme: yani ayrı bir plugin ile ui ın yapılmasının gerekli olmadığını düşünmeye başladı

- tarih: 2026-09-13
- girdi: 001-yani-ayri-bir-plugin-ile-ui-in-yapilmasi-girdi.md
- maliyet: 54.246 token, 14 sn

## Dönen

1. "Denetim" ile kastedilen nedir: kural ihlali yakalayıp turu durdurmak mı (bugünkü guard.js gibi), yoksa yalnız pp'deki tercihleri modelin önüne koymak mı; ikisi de mi isteniyor?

2. "Programlarımda güncelleme arayüzü kullanılıyor mu" denetimi hangi kapsamda: yalnız o an üzerinde çalışılan proje (turda dokunulan dosyalar) mı, yoksa tüm projeler klasörü taranarak toplu bir rapor mu?

3. "Kullanılmıyorsa ilgili formu düzenle" otomasyonu için beklenen tetik ne: kullanıcı `pp` ile istediğinde mi, her turda sessizce mi, yoksa proje açıldığında bir kez mi (her tur seçeneği her tur maliyet demek)?

4. Teknesyum-UI'daki 93 kural, token üreteci, scaffold şablonları: bunlardan hangisi pp'ye taşınacak? Yalnız yazılı tercihler mi, yoksa `scan.js` gibi ölçen/düzelten scriptler de Core'a mı geçecek?

5. Fable'dan istenen çıktı ne: "ayrı plugin mi, pp mi" kararı için tek bir öneri mi, yoksa iki seçeneğin güç/maliyet/geliştirilebilirlik karşılaştırma tablosu mu?
