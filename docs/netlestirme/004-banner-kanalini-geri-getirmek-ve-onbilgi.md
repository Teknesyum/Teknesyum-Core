# Netleştirme: Banner kanalını geri getirmek ve iki başlığı ayrı biçimde çizmek

- tarih: 2026-09-09
- girdi: 004-banner-kanalini-geri-getirmek-ve-onbilgi-girdi.md
- maliyet: 49.333 token, 64 sn

## Dönen

# Değerlendirme

## 1. Banner kanalı: `MessageDisplay` + `displayContent`

**Tavsiye: Geri getir, ama önce 10 dakikalık bir doğrulama kancasıyla.** Kanal seçeneklerinden tek uygun olan bu; alternatif yok.

**Gerekçe.** Olgular kanalları tek tek eliyor: `additionalContext` yasak, `systemMessage` katlanmış çip (kullanıcı "hiç göremiyorum" diyor — büyük ihtimalle bu çipin içindedir), statusline masaüstünde çizilmiyor, `terminalSequence` masaüstünde yok. `MessageDisplay` ise D15'te ölçülmüş: sıfır token, mesaj başına bir koşu, ~43 ms. Kullanıcı 43 ms'yi kabul etti. Altın kural ihlal edilmiyor çünkü "stored message and what the model sees are untouched" — bu olgularda var, uydurma değil.

**Doğrulanmamış olan ve ilk adım olması gereken.** `MessageDisplay`'in CC 2.1.251 masaüstünde hâlâ tetiklendiği doğrulanmadı. Yazılacak ilk şey banner değil, `hookSpecificOutput` döndürmeyen ve yalnız `%TEMP%`'e bir satır yazan boş bir `MessageDisplay` kancası. Bir tur sonra dosya varsa kanal açık, `delta/final` alanlarının adı da oradan okunur. Dosya yoksa bu iş biter, "kanal kapandı" diye DECISIONS'a düşer. Bu doğrulama olmadan `notice.js`'i geri yazmak kör atış.

**Ne basmalı.** Yalnız işaret olayları: `??`/`++`/`pp`/`aa`/`ff`/`hh` işaretinin okunduğu tur. Metin bir olay bildirir: `Fable'a Danışılıyor`, `Kütüphaneye Yazıldı: <ad>`, `Koltuk Okundu: <slug>`. Sayı yok, skor yok (D15 dersi). Seat banner'ı zaten var olan `systemMessage`'dan buraya taşınabilir; ikisi bir arada olmasın.

**Ne basmamalı.** Sıradan tur: kanca koşar ama sessiz döner (D15'teki gibi). Statusline'da duran sayaçlar girmez (ölçüt 4). Her turda "sistem çalışıyor" demek yok; ölçüt 6 "sonuçlarına hazırlamak" demek, varlığını hatırlatmak değil.

**Hangi anda.** İlk `delta` ve `final`'da; üst+alt (Base'deki yerleşim). Yalnız alt ekrandan kayar, yalnız üst uzun cevapta kaybolur — bu ölçüldü. Kanca işareti nereden bilecek: `UserPromptSubmit`'te işaret zaten okunuyor (`mod.js`); orada `additionalContext` yerine `%TEMP%`'e bir durum dosyası da yazılsın, `MessageDisplay` onu okuyup silsin. Model bağlamına ek bayt yok.

**Riskler / başarısızlık biçimleri.**
- Kanal kaldırılmışsa ya da olay adı değişmişse sessiz başarısızlık: banner yok, hata yok. Doğrulama kancası bunu yakalar.
- `displayContent` **tüm** çizilen metni değiştiriyor; `delta` birleştirme yanlış yapılırsa mesaj çift basılır ya da kırpılır. Base'in "aradaki akışta sessiz" kuralı korunmalı.
- Alt-agent turlarında da tetiklenirse (SubagentStop'ta systemMessage atılıyor ama MessageDisplay için bilgi yok) banner gereksiz yere tekrarlar; durum dosyasını tek tüketimlik yapmak bunu keser.
- 43 ms her mesajda; uzun oturumda hissedilmez ama `npm test`'e bir "sessiz turda çıktı yok" testi eklenmeli.

**Yapılmaması gereken koşul.** Doğrulama kancası dosya yazmıyorsa; ya da `displayContent`'in mevcut sürümde metni değil de yalnız ek alan kabul ettiği görülürse (o zaman üst/alt banner yerleşimi çöker).

**Altı ölçüt.** 1 sıfır token (ölçüldü). 2 tek satır Başlığı Büyük — kancada sabit şablon. 3-5 işaret olayı = kullanıcının o an bilmediği durum. 4 sayaç yok. 6 "Fable'a Danışılıyor" tam olarak sonuca hazırlıyor.

---

## 2. Başlık rengi aynı kanalla

**Tavsiye: Yapma.** Renk için model çıktısını çizim aşamasında yeniden yazmak, birinci işin bedava kanalını riskli bir düzenleme motoruna çevirir.

**Gerekçe.**
- `displayContent`'in markdown mı ANSI mi kabul ettiği doğrulanmadı; masaüstü uygulamasında ANSI büyük ihtimalle düz metin olarak görünür, markdown'da ise renk yok. Yani teknik kapı bile belirsiz.
- Yeniden yazma iki başlığı bulmak için `delta`'lar içinde eşleşme yapmak zorunda. Başlık bir delta sınırında bölünürse ("Önbilgi" + "lendirme") eşleşme kaçar; model başlığı hafif farklı yazarsa ("Senden İstediklerim") kaçar; kullanıcının kopyalayacağı fenced tetik bloğunun içine düşen bir eşleşme bloğu bozar. Kopyalanabilirlik kullanıcının ayrı bir kuralı — bunu tehlikeye atan her şey net kayıp.
- En ağırı: kullanıcı gerçek metni görmez. Modelin yazdığıyla ekrandaki ayrışır; "sen şunu dedin" tartışmalarında transkript ile ekran uyuşmaz. Kullanıcının "kanıtı göster, özetleme" kuralı bununla çelişir.

**Ucuz alternatif.** Renk yerine markdown'ın zaten çizdiği ayrımı kullan: "Önbilgilendirme" `###`, "Senden istediklerim" `##` ya da tersi; tetikler zaten fenced blokta. Bu sıfır maliyet, sıfır risk ve RULES.md'ye tek satır. Kullanıcının asıl şikâyeti ("ön bilgilendirme kısa kesiliyor") renk değil yazım sorunu — o RULES.md'deki "bir-iki satır" kısıtını "kullanıcının anlayacağı dilde, gerekirse üç-dört satır" yapmakla çözülür.

**Yapılmasını haklı çıkaracak tek koşul.** `displayContent`'in masaüstünde markdown kabul ettiği kanıtlanır **ve** yeniden yazma yalnız `final`'da, yalnız satır başında tam eşleşen iki başlığa, fenced bloklara dokunmadan uygulanırsa. O zaman bile birinci iş oturduktan sonra, ayrı bir karar olarak.

---

## Yan bulgu (3) — asıl acil olan bu

Başlıkların altına metin düşmesi banner sorunu değil, `count.js`'in `.md` yazımını düzenleme sayması. Bu düzeltilmeden kapanış başlıkları hiçbir kanalla en altta kalmaz; ve kullanıcının "banner görünmüyor" hissinin bir kısmı bu gürültüden geliyor olabilir. Sıra: önce `count.js` uzantı filtresi (tek dosya, bilinen iş), sonra doğrulama kancası, sonra banner. Başlık rengi sıraya girmez.
