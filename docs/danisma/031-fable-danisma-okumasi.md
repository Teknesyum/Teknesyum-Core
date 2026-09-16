# Danışma 031: Her danışmada `advice.js` okumak

Fable, 030 ajanına devam, depo okuması, 68.475 token, 30 sn. Girdi:
[031-fable-danisma-okumasi-girdi.md](031-fable-danisma-okumasi-girdi.md). Cevap olduğu gibi:

---

## Danışma 031: Her Danışmada `advice.js` Okumak

### 1. Mantıklı mı?

Hayır. Okunan şey her seferinde aynı: betik değişmiyor, dosya biçimi değişmiyor. Bu tur ~3.700 token hazırlık girdi (betik 1.500 + eski dosyalar 1.000 + girdi metni iki kez 2.400'ün fazlası). Hepsi ana geçmişte kalıyor; compact'a kadar her turda önbellekten yeniden gönderiliyor, yani bir kez ödenen değil, kalıntı. Karşılığında alınan tek şey "biçimi doğru taklit etmek" ve "ask'in tasarıma uymadığını görmek"; ikisi de bir kez öğrenilip betiğe gömülecek bilgi.

Asıl israf okuma değil, **ikilenen girdi**: ana model metni önce dosyaya yazıyor, sonra aynı metni Agent prompt'una yapıştırıyor. Dosyaya yazılan zaten ana geçmişte; Agent'a yol verilse ikinci kopya hiç oluşmaz.

### 2. Ucuz yol

`advice.js`'e iki mod, şablon betikte, model biçim öğrenmez:

- `advice.js ask --mod netlestir` — bugünkü davranış.
- `advice.js ask --mod gorus --konu <slug> --girdi <dosya>` — girdi dosyasını `docs/danisma/NNN-fable-<konu>-girdi.md` olarak numaralandırıp yazar, başlığı ve "Fable'a gönderilen metin olduğu gibi" satırını kendisi koyar, stdout'a **yalnız yolu ve Agent tarifini** basar (3–4 satır: "şu yolu oku, cevabı Türkçe, en çok N kelime").
- Agent prompt'u: yol + ölçü. Alt ajan dosyayı kendi `Read` eder.
- `advice.js record --konu <slug> --cevap <dosya> --model --token --sure` — cevap dosyasını, girdi linkini ve ölçüleri `NNN-fable-<konu>.md`'ye yazar. Token/süre Agent dönüşünde zaten görünüyor; ana model üç sayıyı bayrağa koyar.

`yordam.md`'deki ff bölümü iki modu ve yolları anlatır; ana model o bölümü yalnız `ff` turunda okur, betiği hiç okumaz.

### 3. Tüketim farkı

Bugün bir görüş danışması ana bağlama kabaca: hazırlık 2.500 + girdi ×2 2.400 + cevap 1.000 ≈ **6 bin token kalıntı**, sonraki her turda taşınır.

Önerilen: `ask` çıktısı ~100 + girdi ×1 1.200 (Write ile yazılır, o kaçınılmaz) + Agent çağrısı ~50 + cevap 1.000 ≈ **2,4 bin**. Kalıntı %60 iner; alt ajanın kendi okuması onun bağlamında, faturaya girer, pencereye girmez. Girdiyi ana modelin yazması yerine kullanıcı sözlerini betiğe `--sozler` ile vermek daha da kısaltır ama olgu listesini model kuruyor, orası kalır.

Kayıp: betiğe bir mod ve yordam'a on satır; işaretsiz turda maliyet sıfır, kalıcı bedel yok. Kazanç: danışma başına ~3,5 bin kalıntı ve elle yazılan biçim hatalarının bitmesi.

**Öneri:** iki modlu `ask`, yol veren Agent tarifi, ölçü alan `record`. 029/030/031 elle kaldığıyla kalsın, 032'den itibaren betik yazsın.

Yok
