# zihenghe04/CCDash

- MIT · CLI + yerel web sunucusu (Python, sıfır bağımlılık) · ★72
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; `server.py` + `agent.py` +
  `ccdash-cli.py`, `plugins/` altında iki dosyalık kendi eklenti arayüzü (`_base.py`,
  `example_plugin.py`)
- sıradan turda bağlama: 0 KB / ~0 token — Claude Code'a hiçbir şey kurmuyor; dışarıda
  duran panel. Ölçüm: kök listede `CLAUDE.md`, `.claude-plugin/`, kanca yok
- premium: yok

## Ne yapar
`~/.claude` altındaki oturum ve kullanım kayıtlarını okuyup token/maliyet/kota panosu
çıkarır; API anahtarı, kayıt, derleme adımı istemez. Uzaktaki makineleri SSH tüneliyle
toplayabilir, `~/.claude/settings.json` ve ortam değişkenlerinden API/proxy uç noktasını
maskeleyerek tespit eder.

## Core'a alınacak
- fikir — API uç noktası tespiti: resmî API mi proxy mi, kimlik bilgisi maskelenerek.
  Core'un `setup.js`'i makine ayarını yazıyor ama nereye bağlanıldığını hiç söylemiyor.
- hiç (gerisi) — pano, uzak izleme ve eklenti arayüzü Core'un kapsamı dışında.

## Karar
fikir notu — tek satırlık uç nokta tespiti dışında alınacak mekanizma yok; ccusage/cctop
ile aynı işi yapan üçüncü panel.
