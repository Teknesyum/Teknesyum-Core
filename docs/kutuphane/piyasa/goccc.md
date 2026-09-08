# backstabslash/goccc

- MIT · CLI (tek Go binary, sıfır bağımlılık) · ★34
- mekanizma: kanca 1 (`SessionEnd` → `goccc -session-end`, elle settings.json'a yazılıyor); komut/ajan/skill/MCP 0. Statusline sağlayıcısı olarak da çalışıyor; `mcp.go` ~/.claude/settings.json'dan aktif MCP adlarını okuyup statusline'da gösteriyor.
- sıradan turda bağlama: 0 token. Depodaki `CLAUDE.md` 4,8 KB ama o kendi geliştirmesi için; kurulumda bağlama hiçbir şey girmiyor, çıktı yalnız statusline ve oturum sonu satırı.
- premium: yok.

## Ne yapar

`~/.claude/projects/` altındaki JSONL kayıtlarını ayrıştırıp modele, güne, projeye ve dala göre maliyet döküyor. Statusline olarak canlı maliyet/bağlam/kota satırı basıyor; `-tools` ile araç ve skill kullanım istatistiği veriyor. Oturum sonunda tek satırlık özet basan kanca 1,5 sn zaman aşımına uyuyor ve hata durumunda sessizce çıkıyor.

## Core'a alınacak

1. **Kanca** — `SessionEnd`'de tek satır maliyet özeti. Core'un "eşikte tek satır" ilkesiyle aynı biçim; şu an Core oturum sonunda hiçbir şey söylemiyor.
2. **Fikir** — kancanın hata halinde sessiz çıkması ve 1,5 sn bütçesine uyması; Core kancaları için yazılı kural haline getirilebilir.
3. **Fikir** — `-tools` gibi araç/skill kullanım dökümü; bench raporunu JSONL'den üretmek için hazır desen.

## Karar

Fikir notu — maliyet statusline'ı Core'da zaten var, alınacak olan tek satırlık oturum sonu kancası ve sessiz-çıkış kuralı.
