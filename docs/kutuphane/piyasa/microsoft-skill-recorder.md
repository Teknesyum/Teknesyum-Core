# microsoft/skill-recorder

- MIT · Electron masaustu uygulamasi (kaynaktan kurulum) · ★3887
- mekanizma: 0 kanca, 0 komut, 0 skill kurar; uretir. GitHub Copilot CLI'yi cagirip kaydi niyet + sirali adimlara ceviriyor, sonucu SKILL.md ya da zamanlanmis otomasyon olarak yaziyor
- sıradan turda bağlama: 0 — ajan baglamina hicbir sey koymuyor, kendisi ayri bir uygulama; urettigi SKILL.md'nin maliyeti kullaniciya kalir
- premium: yok (Copilot aboneligi gerekiyor)

## Ne yapar
Ekran oturumunu kaydediyor: tiklamalar, pencere gecisleri, ziyaret edilen sayfalar, istege bagli sesli anlatim. Sonra "ne yaptin" sorusunu niyet + adim listesine cevirip ajanin yeniden kullanabilecegi bir yordama donusturuyor. UI tiklamalarini tekrar oynatmak yerine ajanin kendi araclarini (`gh`, web_fetch) tercih ediyor ve tek ornekten genelliyor.

## Core'a alınacak
- fikir: "tek ornekten yordam cikar" — Core'da ekran kaydi degil ama oturum gunlugu/handoff'tan ayni sey uretilebilir; `log.js`'in yaninda "bu isi bir daha yaparken" notu.
- fikir: uretilen yordamin UI tekrari yerine deterministik araci tercih etmesi kurali; Core'un "model gerekmiyorsa model kullanma" kuralinin yazili karsiligi.
- hiç: kod ya da metin olarak alinacak parca yok, Electron + Copilot'a bagli.

## Karar
fikir notu — ayri bir masaustu urunu ve Copilot'a bagli; yalniz "kayittan yordam uret, deterministik araci sec" fikri not edilir.
