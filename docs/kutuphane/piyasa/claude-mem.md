# thedotmack/claude-mem

- Apache-2.0 · plugin (marketplace + MCP + kanca) · ★93465
- mekanizma: 6 kanca olayı (Setup, SessionStart `startup|clear|compact`, UserPromptSubmit, PostToolUse `*`, PreToolUse `Read`, Stop; üçü `async: true`), 1 daima açık MCP sunucusu (`mcp-search`), 19 skill, 0 ajan
- sıradan turda bağlama: CLAUDE.md 1045 B + 19 SKILL.md `name`+`description` 5435 B ≈ 6,5 KB ≈ ~1600 token; üstüne her turda çalışan UserPromptSubmit kancasının `session-init` çıktısı ve MCP araç şeması biniyor
- premium: yok, açık kaynak; bulut senkron skill'i var

## Ne yapar
Oturum boyunca ne yapıldığını yakalar, sıkıştırır ve sonraki oturuma bağlam olarak geri verir.
SQLite tabanlı bir bilgi grafiği tutar, arama MCP aracıyla yapılır. Kanca komutları tek satıra
gömülmüş bash: eklenti sürüm klasörünü kendi bulur, `CLAUDE_PLUGIN_ROOT` yoksa cache'i tarar.

## Core'a alınacak
- kanca: `SessionStart` matcher'ının `startup|clear|compact` olması — compact sonrası handoff'u
  geri yükleme Core'un devir mekanizmasına birebir oturur.
- kanca: ağır işlerde `"async": true` + `timeout` alanı; PostToolUse gözlemi turu bloklamıyor.
  Core'un sayaç kancası da bloklamadan yazabilir.
- kitap: eklenti kökünü sürüm sıralayarak bulan tek satırlık bash — Core'un `<eklenti>` yolu
  sorununun taşınabilir çözümü, olgu olarak rafa girer.

## Karar
fikir notu — mekanizması öğretici ama her turda UserPromptSubmit + daima açık MCP yükü Core'un sıfır token ilkesiyle taban tabana zıt.
