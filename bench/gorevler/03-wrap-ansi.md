---
repo: https://github.com/chalk/wrap-ansi.git
sha: c6b6259a58843e491e8703c5010a2a517b5f5738
---

Çalışma dizininde `chalk/wrap-ansi` Node.js paketinin (ESM, `"type": "module"`) bu commit'e
pinlenmiş bir kopyası var. Paket, ANSI renk/stil kodları içeren metinleri belirli bir sütun
genişliğine göre satırlara bölüyor (`index.js` dosyasındaki `wrapAnsi` fonksiyonu). Test
takımı (`test.js`) `node:test` kullanıyor.

Görev: yalnızca `index.js` dosyası içinde, davranışı **hiç değiştirmeden** küçük ve dar
kapsamlı bir refactor yap.

Hedef: `index.js` içindeki `applySgrResetCode` fonksiyonuna bak. Bu fonksiyon, "SGR sıfırlama
kodu aktif stillerden hangi aileyi (foreground/background/underlineColor) temizler"
kararını üç ayrı, neredeyse birebir aynı `if` bloğuyla veriyor:

```js
if (code === ANSI_SGR_RESET_FOREGROUND) {
	removeActiveStyle(activeStyles, 'foreground');
	return true;
}

if (code === ANSI_SGR_RESET_BACKGROUND) {
	removeActiveStyle(activeStyles, 'background');
	return true;
}

if (code === ANSI_SGR_RESET_UNDERLINE_COLOR) {
	removeActiveStyle(activeStyles, 'underlineColor');
	return true;
}
```

Bu üç bloğu, kod → aile adı eşlemesini tutan tek bir yapı (örneğin bir `Map`) ve o yapıyı
kullanan tek bir arama+çağrıya indirger şekilde birleştir. Tam sıfırlama (`ANSI_SGR_RESET`,
kod `0`, tüm aktif stilleri temizliyor) ve modifier (bold/underline gibi) sıfırlamaları
(`ANSI_SGR_MODIFIER_CLOSE_CODES` ile eşleşenler, `removeModifierStylesByClose` çağıran)
farklı davrandığı için ayrı kalmalı — onlara dokunma, yalnızca birbirine çok benzeyen o üç
tekil-aile bloğunu birleştir.

Kısıtlar:

- Yalnızca `index.js` dosyasını değiştir; başka hiçbir dosyaya dokunma.
- Fonksiyonun dışarıya davranışı (`wrapAnsi` çağrılarının ürettiği çıktı) birebir aynı
  kalmalı — hangi SGR kodunun hangi aileyi temizlediği, hangi kodların "tanınmadığı"
  (fonksiyon `false` döndürdüğü) hiç değişmemeli.
- Yeni bağımlılık ekleme, `package.json`'a dokunma.
- İş 30 dakikayı geçecek bir refactor değil; kapsamı bu tek fonksiyonla sınırlı tut, kod
  tabanının başka yerlerini yeniden düzenlemeye çalışma.

Bitirdiğinde bu dizinde `npm install` (bağımlılıklar `ansi-styles`, `string-width`; dev
bağımlılıklar `chalk`, `has-ansi`, `strip-ansi` zaten `package.json`'da tanımlı) ve ardından
`node --test test.js` komutu çalıştığında depodaki mevcut test takımının tamamı (80 test)
hatasız, kırmızı test olmadan geçmeli.
