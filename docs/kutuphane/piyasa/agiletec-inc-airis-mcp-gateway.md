# agiletec-inc/airis-mcp-gateway

- MIT · MCP (yerel gateway, install script / Docker) · ★172
- mekanizma: 0 kanca, 4 komut, 0 ajan, 0 skill (kendi deposunda); dışarıya tek bir `airis-mcp-gateway` skill'i üzerinden açılan yerel MCP uç noktası, `localhost:9400`
- sıradan turda bağlama: kendi CLAUDE.md'si 1522 B ama o depo içi geliştirici notu, kurulumda gelmiyor. Tasarım gereği gateway **global MCP olarak kaydedilmiyor** — sıradan turda 0 araç tanımı; yalnız skill açıldığında kısa ömürlü oturum açılıyor.
- premium: yok

## Ne yapar

Context7'yi (güncel kütüphane/framework belgeleri) yalnız gerektiğinde sunan yerel MCP uç noktası. Dosya, Git, GitHub, web arama, tarayıcı ve dış yazma işleri kasten kapsam dışı — onları yerel araçlar ya da amaca özel skill'ler yapıyor. Yönlendirme `routing-table.json` ile, sürüm `VERSION` dosyasında; yerel `mcp-config.json` commit edilmiyor.

## Core'a alınacak

- **fikir**: "gateway'i global MCP olarak kaydetme" kuralı — araç tanımlarının her turda bağlamda durmasını engelleyen tek cümlelik politika. Core'un ilkesinin MCP tarafındaki karşılığı; kütüphaneye "MCP'yi ne zaman bağlama" bölümü olur.
- **fikir**: açık kapsam sınırı tablosu (`normal iş -> yerel araç/skill`, `resmî kütüphane belgesi -> gateway -> Context7`). Core'un `??`/`++` önekiyle aynı mantık, iki satırda anlatılmış.
- **fikir**: sağlayıcı kimlik dizinini container'a mount etmeme kuralı — güvenlik sınırı olarak yazılı.

## Karar

fikir notu — kod alınacak bir şey yok, ama "MCP'yi kalıcı bağlama, skill'le kısa ömürlü aç" kuralı Core'un sıfır-token savını dışarıdan doğrulayan iyi bir örnek.
