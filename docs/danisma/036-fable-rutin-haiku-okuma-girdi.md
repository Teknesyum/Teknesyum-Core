# Danışma 036 girdi: Danışma: Rutin 350+ Satır Okumada Haiku Okuyucu

Ajana giden metin:

---

[[danisma:036]]

# Danışma: Rutin 350+ Satır Okumada Haiku Okuyucu

Sahibin cümlesi (aynen): "fable a şunu danış rutin 350satır üstü okumada da haiku kullanılmlalı mı sende fikrini belirt hatta küçük bir bench mi yapalım vb konuşun"

## Olgular (hepsi `bench/rapor.md`)

- §13–16 şant: 400+ satırlık dosyaya ilk dokunuşta Opus'u okuyucu ajana yönlendirme. Okuyucu Sonnet 5.5 idi.
  - Düzelt görevinde (tek satır ekle) Opus okuyucuyu reddetti: "tüm dosya gerekmiyor" + Claude Code'un kendi sistem metnindeki "kullanıcı istemedikçe alt ajan yok". Kendi dar okuması 0,40–0,42 $.
  - Soru görevinde (2106 satırlık test/all.js hakkında soru) okuyucuyu çağırdı; Sonnet 700'lük parçalarla okuyup her adımda öncekileri yeniden okudu (333–467 bin önbellek token'ı), yalnız okuma 1,05–1,22 $, 1,2 $ tavanı aştı, cevap çıkmadı. Opus tek başına 0,86–1,08 $. Şant kapatıldı.
- §17: Haiku 4.5 okuma/özet puanı 0,92 (Sonnet 0,93, Opus 0,99); 24 koşuda toplam Haiku 1,46 $, Sonnet 2,91 $, Opus 4,36 $. Zayıf yan: 13 dosyalı çapraz eşleştirme 0,81–0,88.
- §18: Opus çalışırken araya gelen kod soruları Haiku okuyucuya verildi: puan 0,98–0,99 (Opus 0,99–1,00), para eşit, hız kazancı. Sahip bunu kurdurdu (035).

## Benim (Opus) görüşüm

- Kâğıt üstünde fark var: Haiku okuma Sonnet'in yaklaşık yarısı. 6. turun soru görevinde Sonnet okuma 1,05–1,22 $ ise Haiku ~0,5–0,6 $ + Opus 0,17 $ ≈ 0,7 $; Opus yalnız 0,86–1,08 $. Yani %20–35 tasarruf ihtimali — ama tahmin.
- 6. turdaki asıl kaçak modelin pahalılığı değil, okuyucunun parça parça yeniden okumasıydı. Haiku da aynı deseni yaparsa tasarruf erir. Okuyucuya "dosyayı bir kez oku, Grep ile daralt, en fazla N parça" sınırı şart.
- Düzeltme/değiştirme işinde Opus dosyanın ilgili yerini zaten kendisi görmeli (düzenleyecek); devir yalnız "anla ve özetle / bul ve cevapla" türü okumaya uygun. Düzelt görevinde Opus'un reddi doğruydu.
- Önerim: küçük bench. 6. turun aynı iki görevi (düzelt, soru), okuyucu Haiku, 2 tekrar, okuyucuya yeniden-okuma sınırı; karşılaştırma 5. tur (Opus yalnız) ve 6. tur (Sonnet). Tahmini 5–8 $. Sonuç Opus yalnızdan ucuz ve doğruysa kapı kurulur, değilse şant kesin kapanır.

## Soru

1. Rutin 350+ satır okumada Haiku okuyucu denemeye değer mi, yoksa §16'nın dersi (yeniden okuma kaçağı) Haiku'da da aynı mı çıkar?
2. Bench'e katılıyor musun? Değiştirirdin ne: görevler, kollar, eşik (350/400), okuyucu sınırı, tavan?
3. Bench olumlu çıkarsa kapı nasıl olmalı: zorunlu mu, öneri mi; hangi işlerde (yalnız soru/özet mi)?
Kısa ve kararlı; Türkçe.
