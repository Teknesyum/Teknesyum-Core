# costiash/claude-code-docs

- NOASSERTION · plugin (marketplace) · ★49
- mekanizma: 5 skill, 1 kanca (SessionStart → `sync-docs.sh`, timeout 45 s), 0 ajan, 0 MCP
- sıradan turda bağlama: 5 SKILL.md frontmatter'ı 2981 B ≈ 745 token + kanca her oturum başında tek satır yazıyor ("Claude docs up-to-date (N pages indexed)") ≈ 20 token. Sayım: frontmatter baytları + kancanın `output_context` çağrıları.
- premium: yok

## Ne yapar
700+ resmî Claude dokümanını kopyalamadan indeksler: depoda yalnız ~3 MB meta veri (manifest 477 KB + `search_index.json` 2.8 MB) durur, sayfanın kendisi istendiğinde Anthropic sunucusundan çekilip yerel önbelleğe yazılır. MCP sunucusu, Python, API anahtarı yok; istemci saf bash + curl + jq.

## Core'a alınacak
- fikir: "aynala değil, indeksle" — Core kütüphanesi de raf metnini şişirmek yerine indeks + istenince getirme yapabilir; 2.8 MB indeks, 0 token bağlam.
- pasif betik: canlı doküman getirici (curl + yerel önbellek + indeks arama) — kütüphaneye dış kaynak eklemenin modelsiz yolu.
- fikir: kanca çıktısını tek cümleye kısan `output_context` kalıbı; Core'un "eşikte tek satır" kuralıyla birebir.

## Karar
Al · mimari Core'un kütüphane ilkesinin aynısı; skill'lerin 745 token sabit bedeli alınmaz, getirme betiği alınır.
