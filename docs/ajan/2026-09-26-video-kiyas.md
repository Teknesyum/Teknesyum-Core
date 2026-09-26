# Video Kıyası — "Şirketimde 13 Ajan Var" (Selma Kocabıyık)

Kaynak: https://www.youtube.com/watch?v=7XhX8P0ebEU, Türkçe altyazı, ~4300 kelime.

## Videonun Söyledikleri

- Ajana dört şey verilir: hafıza ("masa"), iş tarifi (CLAUDE.md, skill), anahtarlar (MCP, API key), vardiya (zamanlayıcıyla döngü).
- 13 ajanlık bir "şirket" var: Telegram'a bağlı, her ajanın takımı, modeli (sonnet/opus), çalışma saati ve bütçesi ayrı.
- Döngü ikiye ayrılıyor. Dış döngü: saat gelince ajan kendiliğinden kalkar (09:00 iş, 22:00 denetim). İç döngü: tek koşudaki araç çağır, oku, yaz.
- Her koşudan sonra ajan deftere ders yazar. Haftalık denetimle kalıplaşan ders kurala taşınır, defter silinir.
- Her koşu önce anayasayı, sonra kimliği ve takım kurallarını okur. Ajan kurallara dokunamaz.
- Ajanlar birbirine mesaj atmaz, birbirinin durum dosyasını okur.
- "Token problemi olmasın": model göreve göre seçilir, kimse 50 dosya okumaz, işi olmayan ajan çalışmaz.
- Demo: Telegram'a atılan X linkini ajan işledi ve "yazılmaya değmez" dedi. Dinleyici 1 saatliğine açıldı.

## Bizdeki Karşılığı

| Video | Teknesyum | Sınıf |
|---|---|---|
| Masa / hafıza | memory, raf (`??` `pp`), `.claude/acik.md` | Geçmiş tecrübe |
| İş tarifi | CLAUDE.md, AGENTS.md, RULES.md, skill'ler | Geçmiş tecrübe |
| Model seçimi ajan başına | `aa` koltukları: sonnet, opus, fable | Geçmiş tecrübe |
| Defter → haftalık → kural, defter silinir | logs/openlogs → closed, RULES 30 satır tavanı, `/rule` | Geçmiş tecrübe |
| Anayasaya ajan dokunamaz | RULES.md sahibin, `/rule` ile eklenir | Geçmiş tecrübe |
| Ajanlar dosya üzerinden konuşur | relay 0.16'da çıkarıldı, dosya + brif düzeni kaldı | Geçmiş tecrübe |
| "Token problemi olmasın" | Maliyet altın kural, ek-maliyet uyarısı | Geçmiş tecrübe |
| Her koşuda anayasa + kimlik + kural okuma | Yok; yordam.md ancak gerektiğinde okunur | Tüketimi arttırır |
| Her koşu sonrası derse yazma | Yok; yalnız hata/log olunca | Tüketimi arttırır |
| 13 ajan, sürekli dinleyici (Telegram) | Yok | Tüketimi arttırır |
| Vardiya: saatli dış döngü | **Yok** | Elde edilebilir |

## Elde Edilebilecek Tek Şey: Vardiya

Bizde her şey sahip yazınca çalışıyor; saatli koşu yok. Ucuz kurulum:

- Önce model yok: `doctor.js`, `map.js`, testler, log sayımı zamanlanır. Maliyeti 0.
- Model yalnız bulgu varsa kalkar: sabah tek satırlık brif (`docs/sabah.md`), "8/8 geçti, 2 açık log".
- Model koşusu olursa her biri tam bir oturum: günde 1 sonnet koşusu, kabaca bir sıradan turun birkaç katı.
