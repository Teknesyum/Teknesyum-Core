# Danışma 031 girdi: her danışmada `advice.js` okumak

Fable'a gönderilen metin olduğu gibi (030'un ajanına devam mesajı):

---

İkinci soru, aynı bağlamda. Türkçe, en çok 400 kelime.

Kullanıcının sözleri: "her danışmanda advice.js okuman falan mantıklı mı fable bunu da cevaplasın tüketimi ne kadar değiştiriyoruz karşılığında ne alıyoruz vs"

Olgular (bu danışmada ana modelin yaptığı hazırlık):
- `advice.js --help` + `advice.js` tamamı okundu (5.459 bayt ≈ 1.500 token) — `ask` akışının "netleştirme" (görüş verme, yalnız belirsizlik sor) için olduğunu, tasarım danışmasına uymadığını görmek için.
- `docs/danisma/029-...-girdi.md` ve cevabının ilk 30/12 satırı okundu (≈ 1.000 token) — dosya biçimini taklit etmek için.
- Girdi dosyası elle yazıldı, Agent'a aynı metin tekrar yapıştırıldı (girdi ≈ 1.200 token iki kez ana geçmişe girdi).
- Bu okumalar ana bağlamda kalıyor ve compact'a kadar her turda önbellekten yeniden okunuyor.
- `~/.claude/teknesyum/yordam.md` ff akışını `advice.js ask` → Agent → `advice.js record` diye tarif ediyor; ama `ask` metni "netleştirme" şablonu basıyor, tasarım/görüş danışması için ayrı bir yol yok. 029/030 elle yazıldı.
- Danışma dosyası biçimi: `NNN-fable-<konu>-girdi.md` (başlık + "Fable'a gönderilen metin olduğu gibi" + metin) ve `NNN-fable-<konu>.md` (başlık + model, token, süre + girdi linki + cevap olduğu gibi).

Soru:
1. Her danışmada betiği/eski dosyaları okumak mantıklı mı? Kaç token, turda ne kadar kalıntı, karşılığında ne alınıyor?
2. Daha ucuz yol ne: örneğin `advice.js` a görüş (`ff`) ve netleştirme (`netleştir`) iki modu, `ask --facts` girdiyi yazar ve Agent'a dosya yolu verilir (alt ajan kendisi okur, metin ana geçmişe iki kez girmez), `record` token/süreyi alır. Ya da başka bir şey.
3. Tüketim farkı kaba sayıyla, kazanç/kayıp, önerin.
