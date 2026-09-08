# AgriciDaniel/claude-obsidian

- lisans: MIT
- kurulum biçimi: plugin (+ portable Agent Skills paketi, ayrıca CLI: `claude-obsidian.py`)
- mekanizma: 2 kanca (SessionStart: startup|resume|clear|compact; Stop) — ikisi de python3 script'e delege; 3 ajan (verifier, wiki-ingest, wiki-lint); 15 skill; MCP yok
- sıradan turda bağlama: SessionStart varsayılan kapalı (`CLAUDE_OBSIDIAN_SESSION_CONTEXT=1` yoksa "" döner) → 0 token; Stop de sorun yoksa "" döner. Skill frontmatter'ları her zaman listede: 15 dosyanın `name`+`description` toplamı ~5.7 KB ham metin, ~1400 token (4 char/token varsayımıyla)
- premium: yok

## Ne yapar
Obsidian kasasını "source-cited" bir bilgi tabanına dönüştüren skill paketi: kaynak yutma (ingest), kaydetme, sorgulama (query), lint/sağlık denetimi, retrieval (BM25+rerank), canvas ve metodoloji (PARA/LYT/Zettelkasten) desteği. Tüm mutasyonlar tek bir geri alınabilir transaction (`claude-obsidian.transaction.v1`) üzerinden `claude_obsidian/` Python çekirdeğinden geçer, doğrudan paralel yazma yok. Kasa daima eklenti önbelleğinin dışında, kullanıcının kendi dizininde tutulur.

## Kullanıcıya nasıl hissettirir
Sessiz: SessionStart context injection varsayılan kapalı, ancak sorun varsa (mutation lock takılı kalmış, transaction "rollback-failed") Stop hook'u tek satır uyarı basıyor — Core'daki "eşikte bir kez konuşur" ile birebir aynı desen. Statusline yok, banner yok; iş skill çağrıldığında görünür oluyor.

## Core'a alınacak
- fikir: Stop/SessionStart hook'larının "sorun yoksa boş string" tasarımı — Core'un kanca felsefesiyle zaten örtüşüyor, teyit/örnek olarak referans kütüphaneye eklenebilir.
- fikir: tek-transaction mutasyon protokolü (`prepared → applying → committed/rollback-failed`, SHA-256 beklenen değer kaydı) — Core'da dosya toplu yazımı/handoff gibi riskli akışlar için desen olarak okunabilir, doğrudan kod alınmaz (domain'i vault'a özel).
- hiç: skill/ajan/CLI'ların kendisi Core'un işiyle örtüşmüyor (Obsidian'a özel), alınacak kod yok.

## Ölçülecek
Core'a alınırsa: Stop-hook "yalnız anomalide konuş" deseni ayrı bir kancada mı yoksa mevcut log.js/handoff akışına mı eklendiği; ekleme sonrası sıradan turda token farkının 0 kaldığı doğrulanır (hook stdout diff'i ile).

## Karar
fikir notu — kanca deseni referans değerinde ama kod tabanı Obsidian'a özel, doğrudan alınacak parça yok.
