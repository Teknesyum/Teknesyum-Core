# AminBlg/SimpleEnglish

- MIT · plugin + taşınabilir skill (metin paketi) · ★3255
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill + 4 referans dosyası; ayrıca output-style ve eval takımı
- sıradan turda bağlama: yalnız skill frontmatter'ı 1097 B (~270 token). Gövde (SKILL.md) ve
  referanslar (rule-catalog 10,3 KB, strict-vocabulary 5,1 KB, use-cases 3,9 KB, word-swaps 2,6 KB)
  istenince okunuyor. Toplam paket 40 KB.
- premium: yok

## Ne yapar
ASD-STE100 Basitleştirilmiş Teknik İngilizce disiplinini bir yazım kitabına çeviriyor: kısa
cümle, etkin çatı, tek kelime tek anlam, koşul önce komut sonra, "AI slop" kelime listesi.
9 Claude modelinde ölçüm yapılmış, sonuçları `evals/` altında duruyor.

## Core'a alınacak
- kitap (raf): SKILL.md gövdesi + `references/word-swaps.md` — Core'un "her README ve depo
  belgesi İngilizce" kuralının nasıl uygulanacağını söyleyen tek pasif kitap; 40 KB, sıradan
  turda sıfır.
- fikir: `references/use-cases.md` deseni — hata mesajı, runbook, commit mesajı gibi her tür
  için ayrı kip; Core'un `scaffold.js` sabit metinlerine ölçü verir.
- fikir: eval klasörü — kitabın işe yaradığını ölçüp sonucu depoda tutmak (bench/rapor.md deseni).

## Karar
Al — kitap olarak birebir Core rafına uyuyor: kancasız, komutsuz, ölçülen sabit yük 0 token.
