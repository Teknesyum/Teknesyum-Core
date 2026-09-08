# jeremylongshore/tons-of-skills-marketplace

- MIT · plugin pazaryeri + `ccpi` CLI · ★2711
- mekanizma: 440 eklenti, depoda 5.926 `SKILL.md`, 21 kategori klasörü; `schemas/canonical/v0` şeması, `packages/plugin-validator` (npx ile çalışan bağımsız doğrulayıcı), analytics-daemon + dashboard
- sıradan turda bağlama: 0 B — depo kurulmuyor, `/plugin marketplace add` sonrası yalnız seçilen paket yükleniyor. Deponun kendi `CLAUDE.md`si 43.916 B (~11k token) ama o yalnız bu depoda çalışan katkıcıya girer (wc -c)
- premium: yok; sponsor/bağış bağlantıları var

## Ne yapar
Model-bağımsız bir "kanonik katman" iddiasıyla skill'leri toplayan büyük pazaryeri: kanonik şema + doğrulanmış harness adaptörleri, `ccpi` CLI ile kurulum, web vitrini. Claude Code tek doğrulanmış yerel harness; diğerleri aday sayılıyor ve kaynak taraması tek başına destek olarak sunulmuyor.

## Core'a alınacak
- pasif betik: `packages/plugin-validator` denetim listesi — README/LICENSE/plugin.json zorunlu, semver, geçerli model kimliği (`sonnet|haiku|opus|claude-*`), en az bir bileşen dizini, skill açıklamasında tetik ifadesi. Core'un `scaffold.js`ine yayın öncesi kontrol olarak eklenir.
- kitap: "kanonik katman harness'sız, adaptör doğrulanana kadar aday" ayrımı — Core'un raf metinlerini araçtan bağımsız tutma kuralı için hazır formülasyon.
- fikir: 43.916 B'lik depo `CLAUDE.md`si, kalabalık deponun kendi bağlam maliyetinin nasıl kontrolden çıktığına dair uyarı örneği.

## Karar
fikir notu — tüketiciye turda 0 B yazıyor ama alınacak tek somut şey doğrulayıcı denetim listesi; 5.926 skill'lik yığın Core'un pasif kütüphane ilkesine değil vitrin mantığına ait.
