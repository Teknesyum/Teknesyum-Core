---
repo: https://github.com/jonschlinkert/gray-matter.git
sha: e948648d45e304f6bdbc0f93857ae74c94073062
---

Çalışma dizininde `jonschlinkert/gray-matter` Node.js paketinin
`e948648d45e304f6bdbc0f93857ae74c94073062` commit'ine (`2.0.2` sürümü) pinlenmiş bir
kopyası var. Pakette bir hata var, onu bul ve düzelt.

Hata: girdi metni Windows satır sonlarıyla (`\r\n`) geldiğinde, front-matter'dan sonraki
içeriğin başında fazladan bir `\r\n` kalıyor. Şu kod hatayı üretiyor:

```js
var matter = require('./index.js');
var fixture = '---\r\nabc: xyz\r\n---\r\ncontent here\r\n';
var res = matter(fixture);
console.log(JSON.stringify(res.content));
```

Şu anki (hatalı) çıktı:

```
"\r\ncontent here\r\n"
```

Beklenen çıktı:

```
"content here\r\n"
```

Aynı girdi `\n` (Unix satır sonu) ile verildiğinde sorun yok — `matter('---\nabc: xyz\n---\ncontent here\n').content` doğru şekilde `"content here\n"` döndürüyor. Yani hata yalnızca CRLF durumunda ortaya çıkıyor.

Görev: paketin kaynak kodunda (`index.js` içinde) hatanın kök nedenini bul ve düzelt.
Düzeltme, yukarıdaki reprodüksiyon kodunu doğru çalıştırmalı: `res.content` tam olarak
`"content here\r\n"` olmalı, baştaki fazladan `\r\n` kalmamalı.

Düzeltmeyi bitirdiğinde depodaki mevcut test takımını (`npm test`, mocha ile) çalıştır.
Tüm mevcut testler yeşil kalmalı (2 tanesi zaten "pending"/atlanmış durumda, onlara
dokunma).
