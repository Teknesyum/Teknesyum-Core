# Danışma 034 girdi: Soru: Core'a "şant" (büyük okuma kapısı) kurulsun mu, nasıl?

Ajana giden metin:

---

[[danisma:034]]

# Soru: Core'a "şant" (büyük okuma kapısı) kurulsun mu, nasıl?

## Sahibin cümlesi (olduğu gibi)
"şant mantıklı mı sence kuralım mı haikuya hiç güvenmiyorum haiku ancak çok basit işlerde ve önemsiz işlerde ama sonneti daha fazla kullanmamız gerektiği noktasına katılıyorum sen fable a da danış bu konuyu netleştirelim"

## Olgular
- Spotify'ın `shunt` eklentisi (Apache-2.0): PreToolUse hook'u 350 satırı aşan, aralıksız Read'i ve büyük `cat`'i engelliyor; okumayı ucuz işçi modele (Gemini Flash) devrettiriyor, işçi özet dönüyor. Hedefli okuma (offset/limit, grep, boru) serbest. Eşik `SHUNT_MIN_LINES`. Yazar 4 Java senaryosunda ~%90 token tasarrufu ölçmüş; bağımsız doğrulama yok, üretim tokenleri ölçüme girmemiş. Ham rapor: docs/arastirma/portal-shunt.md.
- Core: sıradan turda sıfır ek token ilkesi; maliyet yalnız tetiklenince kabul. Hook'lar Node; PreToolUse'da `yasak.js` (Bash) ve `ust.js` (Agent) var. Alt ajanlar: sonnet (angarya), opus (zor karar), fable (danışma). Sahip haiku'ya güvenmiyor.
- Önerim: Read aralıksız ve dosya >350 satırsa deny + gerekçe ("Grep/offset ile hedefli oku ya da sonnet/Explore alt ajanına devret, özet dönsün"); aynı dosyaya ikinci deneme geçer (kilitlenme yok); Bash `cat`/`Get-Content` büyük dosyada aynı; eşik ayarlanabilir.

## Sorular
1. Kurmaya değer mi? Hangi durumda zarar verir (düzenleme öncesi tam okuma gereği, Edit'in Read şartı, küçük depolarda gecikme)?
2. İşçi: sonnet mi, Explore (hangi model) mi, yoksa yalnız "hedefli oku" yönlendirmesi mi? Haiku hiç mi olmasın?
3. Eşik ve istisnalar: 350 satır mı? Hangi dosyalar muaf (Edit edilecek dosya, md belgeler, ilk okuma)?
4. Ölçmeden kurmamak için bench nasıl kurulsun (kol başına en fazla 3 tekrar)?
Kısa, maddeli, net karar ver.
