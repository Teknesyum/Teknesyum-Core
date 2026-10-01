# Danışma 036: Danışma: Rutin 350+ Satır Okumada Haiku Okuyucu

claude-fable-5-1, 2.425 çıktı token, 45 sn. Girdi: [036-fable-rutin-haiku-okuma-girdi.md](036-fable-rutin-haiku-okuma-girdi.md). Cevap olduğu gibi:

---

## Danışma 036 — Fable'ın cevabı

**1. Denemeye değer mi?**
Değer, ama şartlı. §16'daki kaçak modelin fiyatı değil, deseniydi: 700'lük parçalar, her adımda öncekileri yeniden okuma, önbellek birikmesi. Haiku aynı araç döngüsüyle çalışırsa aynı deseni üretir; yalnız birim fiyat düşer, tasarruf %20–35'ten çok daha az kalır. Okuyucu sınırı olmadan bench koşmanın anlamı yok. Sınır somut olsun: dosyayı **tek Read** ile bütün oku (offset/limit yok), daraltma yalnız Grep, toplam **en fazla 3 araç çağrısı**, cevap üst sınırı belli (örn. 30 satır). Bu sınırla Haiku'nun yeniden-okuma kaçağı mekanik olarak kapanır.

**2. Bench'e katılıyorum, şunları değiştirirdim**
- **Düzelt görevini at.** Opus'un reddi doğruydu, ölçmeye değmez. Yerine iki *soru* görevi: büyük dosya (test/all.js, 2106 satır) ve orta dosya (400–700 satır). Orta dosya eşik tayini için şart; büyük dosyada çıkan tasarruf orta dosyada çıkmazsa 350/400 tartışması biter, eşik yukarı kayar.
- **Kollar:** Haiku okuyucu *sınırlı* (3 tekrar), Haiku okuyucu *sınırsız* (1 tekrar, yalnız kaçağın tekrar edip etmediğini görmek için). Opus-yalnız ve Sonnet kollarını yeniden koşma; 5. ve 6. tur verisi referans olur. Kol başına 3 tekrar tavanı zaten kural.
- **Eşik:** şimdilik 400 kalsın; bench'ten sonra orta dosya sonucuna göre oturur. Satır değil token olmalı ama satır pratikte yeter.
- **Tavan:** koşu başına 1,2 $ kalsın, toplam 6 $ altı (onay gerekmez). Puan: Opus-yalnız cevabı referans, aynı rubrik.

**3. Kapı nasıl olmalı**
Öneri, zorunlu değil. §16 zorunlu yönlendirmeyi reddetti ve haklıydı: hangi okumanın "anla/özetle/bul" olduğuna model karar verir. Kapı Opus'a tek satırlık sistem notu olsun: *"Soru, özet veya bul türü işte 350+ satırlık dosyaya ilk dokunuşta Haiku okuyucuyu çağır; düzenleme ve değiştirme işinde ilgili yeri kendin oku."* Kapsam dışı: düzenleme (Opus yeri zaten görmeli), çok dosyalı çapraz eşleştirme (Haiku 0,81–0,88, zayıf). Bench olumsuz çıkarsa şant kesin kapanır, bir daha açılmaz.

Kısa karar: **bench koş, iki soru görevi, Haiku sınırlı + sınırsız kol, 6 $ altı, kapı öneri niteliğinde ve yalnız soru/özet/bul işlerinde.**
