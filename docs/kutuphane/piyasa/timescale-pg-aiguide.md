# timescale/pg-aiguide

- Apache-2.0 · kurulum biçimi: Claude Code plugin + skill paketi + genel HTTP MCP sunucusu (üçü birden) · ★1835
- mekanizma: 0 kanca, 0 komut, 0 ajan, **9 skill**, 1 uzak MCP (`mcp.tigerdata.com/docs`)
- sıradan turda bağlama: 9 SKILL.md frontmatter'ı toplam **~8,5 KB ≈ 2.100 token** (her `---` bloğunun bayt sayısı toplandı) + `CLAUDE.md` 2,4 KB. MCP açıksa araç şemaları ayrıca.
- premium: yok; MCP sunucusu ücretsiz ve genel, Tiger Cloud ürününe yönlendiriyor

## Ne yapar
Postgres bilgisini üç ambalajda dağıtıyor: resmî PG/PostGIS/TimescaleDB kılavuzları üzerinde semantik arama yapan MCP, kürasyonlu "en iyi uygulama" skill'leri ve bir plugin. İddia: MCP kapalıyken üretilen şemaya göre 4 kat fazla kısıt, %55 fazla indeks.

## Core'a alınacak
- **fikir**: `skills/postgres` bir **şemsiye skill**; `references/` altındaki dosyaların hepsi 42-66 baytlık **sembolik bağ**, kardeş skill'lerin gövdesine işaret ediyor. Tek açıklama, çok gövde. Core'un raf dizini de aynı hileyle tek girişten dallanabilir — kopya yok, bayt yok.
- **fikir**: `.claude-plugin/marketplace.json` içinde `mcpServers` gömülü; plugin kurulunca MCP de geliyor. Core'un bilerek kaçındığı şey — karşı örnek olarak not.
- hiç (kitap/betik yok; içerik Postgres'e özel, Core'un alanı değil)

## Karar
Fikir notu — şemsiye skill + sembolik bağ tekniği alınmaya değer, ama 2.100 token'lık daimi frontmatter yükü Core'un sıfır-token ilkesinin tam karşıtı.
