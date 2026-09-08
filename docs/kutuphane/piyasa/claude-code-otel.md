# ColeMurray/claude-code-otel

- MIT · kurulum biçimi: CLI/altyapı (docker-compose + Makefile) · ★495
- mekanizma: 0 kanca, 0 komut, 0 skill, 0 ajan, 0 MCP; Claude Code'un kendi OpenTelemetry çıkışı (`CLAUDE_CODE_ENABLE_TELEMETRY=1`) OTel Collector → Prometheus + Loki → Grafana zincirine akıtılıyor
- sıradan turda bağlama: 0 token — hiçbir şey modele yazmıyor, ölçüm süreç dışında; ölçüm README kurulum bölümünden (yalnız env değişkeni + docker) sayıldı
- premium: yok

## Ne yapar
Claude Code kullanımını, maliyetini ve performansını izlemek için hazır bir gözlemlenebilirlik yığını. Model bazlı maliyet, DAU/WAU/MAU, araç kullanım sıklığı, API gecikmesi ve hata analizi için hazır Grafana panoları getiriyor.

## Core'a alınacak
- fikir: maliyeti modele hiç dokunmadan, ürünün kendi telemetri çıkışından toplamak — Core'un bench raporu şu an elle üretiliyor.
- fikir: araç kullanım sıklığı panosu; hangi kancanın/betiğin gerçekten çalıştığını ölçmek için.

## Karar
fikir notu — docker yığını Core'a girmez, ama telemetriyi env değişkeniyle dışarı akıtıp 0 token'la ölçme yolu bench tarafında kullanılabilir.
