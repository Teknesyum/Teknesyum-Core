# hesamsheikh/octogent

- MIT · kurulum biçimi: CLI + yerel API + web panosu (`bin/octogent`, pnpm monorepo) · ★1413
- mekanizma: 11 hazır prompt dosyası (`prompts/`, toplam ~38 KB), PTY ile sarılmış Claude Code oturumları, Claude kancaları API'ye geri rapor veriyor; 0 skill, 0 MCP
- sıradan turda bağlama: Core'a kurulacak bir parçası yok; kendi `CLAUDE.md`'si depo geliştirmesi için. Panonun asıl maliyeti her "tentacle" için okunan `CONTEXT.md` + `todo.md`
- premium: yok

## Ne yapar
Aynı anda açık on Claude Code terminalini tek panoya topluyor. Her iş dalı bir "tentacle": `.octogent/tentacles/<id>/` altında `CONTEXT.md` ve `todo.md` tutan bir klasör. Claude Code'un başka Claude Code ajanları doğurup onlara iş vermesini sağlıyor.

## Core'a alınacak
- **fikir**: durumun **ayrı veritabanı yok, dosyadan türetiliyor** — klasör ancak `CONTEXT.md` varsa tentacle sayılıyor, ilk `# başlık` ad, ilk paragraf açıklama, `todo.md`'deki kutucuklar ilerleme. Core'un `.claude/handoff.md`'si de aynı sözleşmeyi alabilir: makine sadece dosyayı okur, ayrı durum tutmaz.
- **fikir**: UI'ye ait renk/durum/etiket bilgisi ajanın gördüğü markdown'a hiç girmiyor, ayrı runtime state'te duruyor. Core'un statusline'ı ile handoff'u arasındaki sınır için birebir aynı kural.
- **fikir**: `<!-- octogent:suggested-skills:start -->` yönetilen blok — üretilen metni elle yazılanın içine sınırlı biçimde iliştirme deseni; `scaffold.js`'in sabit metinleri için kullanılabilir.

## Karar
Fikir notu — ürünün kendisi pano/orkestrasyon, Core'un alanı değil; ama "durum dosyadan türer, UI verisi ajanın metnine karışmaz" kuralı handoff'a yazılmalı.
