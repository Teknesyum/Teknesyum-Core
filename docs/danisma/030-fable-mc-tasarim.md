# Danışma 030: `mc` bellek taramasının tasarımı

Fable, depo okuması, 65.547 token, 90 sn. Girdi:
[030-fable-mc-tasarim-girdi.md](030-fable-mc-tasarim-girdi.md). Cevap olduğu gibi:

---

## `mc` Tasarımı

**"t0"** okuması: oturumun kendi modeli. Ama karar için sayfaları okuması gerekmez; script bir dizin verir, karar dizinden verilir. Aşağıda buna göre.

### 1. Uzun istek: kesme, birim değiştir

`MAX_CHARS` kalkar. Sayfa ölçüsü "60 istek" değil, **karakter bütçesi** (~40 bin) olur; uzun bir istek tek başına sayfa doldurabilir, sorun değil, sayfayı ana model değil sonnet okur. İstekler zaten `- ` ya da numaralı satırlarla geliyor; script bunları bölmez, olduğu gibi yazar; ayırmayı sonnet yapar.

### 2. Kim ne okur

- **Script** (`hatirla.js topla`): tüm kayıtları tarar, sayfaları `tmp/gecmis-N.md` yazar, stdout'a yalnız **dizin** basar: sayfa no, tarih aralığı, istek sayısı, kaba "açık iz" sayısı (cevapsız istek + `[ ]` satırı). 5–10 satır.
- **Ana model**: dizine bakıp derinliği seçer ("son 3 sayfa" / "kararını bekliyor iz görülen sayfaya kadar"). Bağlama giren şey bu dizin + tek Agent çağrısı + dönen liste. Bugünkü tarifteki "sayfaları olduğu gibi Agent'a ver" ifadesi asıl kalıntı kaynağı: sayfa metni prompt'a yapıştırılınca ana geçmişe giriyor. **Yol verilir, sonnet kendi `Read` eder.**
- **Alt ajan**: tek sonnet, 8 sayfaya kadar sırayla okur. Daha fazlaysa sayfalar 4'erli gruplara bölünüp paralel sonnet'ler, üstüne tek birleştirici sonnet. Sonnet cevabında "en eski sayfada hâlâ açık iz var, daha geriye bakmadım" diyebilir; ana model isterse bir tur daha çalıştırır.

Kalıntı: ~20 satır dizin + ~30 satır liste. Compact'a kadar taşınan bu.

### 3. "Bitmemiş" kararı: kanıt üçlüsü

Script her isteğe **kayıt** iliştirir, sonnet tahmin etmez, eşleştirir:

- **İstek** (tam metin, zaman, oturum kısa-id).
- **Kapanış cevabı**: aynı turda asistanın son metin bloğu (sonrasında tool_use olmayan), ilk 800 karakter. Kapanış mesajları zaten kısa.
- **Commit'ler**: istek ile bir sonraki istek arasındaki `git log --since --until` başlıkları.
- **İş satırları**: `trash/jobs-*.md` ve `.claude/jobs.md` içinde o tur değişen `[ ]`/`[x]`; `docs/plan.md` onay kutuları.

Sonnet kuralı, üç sınıf:
- **açık**: istek somut eylem içeriyor, kapanışta "yapıldı" yok, commit yok, iş satırı `[ ]`.
- **kararını bekliyor**: iş satırında `— neden` var ya da kapanışta "Senden istediklerim" var.
- **belirsiz**: kapanış yok (oturum kesilmiş) ama commit var. Bu sınıf yanlış pozitifi düşürür: kanıt yoksa "açık" demez.

Yanlış negatif için: kapanış "yaptım" diyorsa güvenilir, ama isteğin madde sayısı ile kapanışın kapsadığı madde sayısı uyuşmuyorsa ("üç şey istendi, ikisi anlatılmış") açık sayılır.

Zaaf 5: tekrarlar zaman sırasına göre; **en yeni sürüm** esas, eski olanlar "yenilendi → #N" diye düşülür, ayrıca sayılmaz.

### 4. Çıktı ve ekran

`tmp/hatirlatici.md`:

```
# Hatırlatıcı · 2026-09-16 · 4 sayfa, 212 istek
## Açık
- [ ] iş — kanıt: istek 09-12 14:03 (a1b2), kapanış yok, commit yok
## Kararını bekliyor
- [ ] iş — jobs-0912: "reason"
## Belirsiz
- [ ] iş — commit var (7cb471e), kapanış yok
```

Ekran (`sayBlock`): banner + tek bant: `4 sayfa · 212 istek · 3 açık · 2 karar · 1 belirsiz · tmp/hatirlatici.md`. Ana model ayrıca konuşmaz; liste dosyada.

### 5. Tetik

`mc` yalnız şu hâllerde: istemin tamamı `mc`; istemin **sonunda**; ya da başta olup ardından yalnız kapsam sözcüğü (`mc 2 hafta`, `mc 3 sayfa`). Başta olup ardından cümle geliyorsa ("mc nasıl çalışıyor") tetiklenmez. Kapsam verilmişse ana modelin derinlik kararı atlanır. Aynı regex `hh` için de mantıklı; diğer işaretler kelime olmadığı için sorun yok.

### 6. Uygulama, test, risk

Adımlar: (a) `hatirla.js`'ye tur eşleme + karakter sayfası + dizin; (b) `git log` ve jobs/plan bağlama; (c) `mod.memory` tarifini kısalt: dizin oku, derinlik seç, yol ver; (d) `record` üç bölümlü biçim; (e) tetik regex; (f) bant metni `strings.json`.

Testler: 5 bin karakterlik istek kaybolmuyor; kapanışı olmayan istek "belirsiz/açık"a düşüyor, "yaptım" kapanışı olan düşmüyor; aynı istek iki oturumda → tek satır, yeni olan; `mc nasıl` tetiklemiyor, `... mc` tetikliyor; ana bağlama sayfa metni girmiyor (transcript'te `gecmis-` içeriği aranır, bulunmamalı); compact özeti içeren jsonl'de eşleme kırılmıyor.

En büyük risk: **tur eşleme**. jsonl'de alt ajan mesajları, tool sonuçları ve compact özetleri araya giriyor; yanlış eşleme "kapanış var" deyip gerçek açık işi kapatır. Önlem: kapanış yalnız ana oturumun `type:assistant`, tool_use'suz son metni; eşleme şüpheliyse "belirsiz". İkinci risk: script büyük depolarda `git log`u tur başına çağırırsa yavaşlar; tek `git log --format` çekilip bellekte bölünür.

Yok
