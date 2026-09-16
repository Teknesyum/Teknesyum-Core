# Danışma 033 girdi: Core'un Tamamında Hantallık Taraması

Ajana giden metin:

---

[[danisma:033]]

# Core'un Tamamında Hantallık Taraması

032'de yalnız kanca boyutları, hooks.json, dur/ust/scout.js, count.js ve mod.js'in parçaları, kütüphane refresh ve makine durumu ölçüldü. core/scripts altındaki betikler, strings.json, testler ve dokümanlar okunmadı. 032'nin cevabı: docs/danisma/032-fable-sistem-hantalligi.md. Onu tekrar etme, üstüne kur.

Bu sefer kapsam tam: C:\Users\Administrator\Desktop\Projeler\Teknesyum-Core içinde core/hooks/*.js, core/scripts/*.js, core/strings.json, core/hooks/hooks.json, test/all.js, README.md, AGENTS.md dosyalarının her biri. Her dosyayı gerçekten aç; okumadığın dosya hakkında yazma, sonda okuduğun dosyaların listesini ver.

Aranan hantallık:
- Ölü ya da hiçbir yerden çağrılmayan kod, fonksiyon, CLI alt komutu, string anahtarı.
- Aynı işi yapan iki kod (tekrar eden yardımcılar, iki ayrı kapı mantığı, kopya ayrıştırıcılar).
- Gereğinden karmaşık akış: tek iş için birden çok dosya, gereksiz durum dosyası, gereksiz süreç.
- Modelin her çağrıda okumak zorunda kaldığı uzun tarifler (strings.json'daki mod.* metinleri): kısalabilir mi?
- Testte yavaş ya da kırılgan kısımlar (npm test süresi, gereksiz fixture tekrarları).
- Kullanılmayan özellikler: ekleyip unuttuğumuz şeyler.

Her madde: ne, nerede (dosya:satır), bedeli (token / ms / satır / bakım), karşılığı, öneri, kazanç. Ölçemediğin sayıya "tahmin" yaz.

Üçe ayır: kaldır / sadeleştir / kalsın. En sonda uygulama sırasıyla ilk beş iş. En fazla 1200 kelime.
