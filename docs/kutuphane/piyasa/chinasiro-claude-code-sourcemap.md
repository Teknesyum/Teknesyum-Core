# ChinaSiro/claude-code-sourcemap

- lisans yok (telif Anthropic'te, depo "yalnız araştırma" diyor) · metin/kaynak paketi · ★9657
- mekanizma: 0 kanca · 0 komut · 0 ajan · 0 skill · 0 MCP — `@anthropic-ai/claude-code` 2.1.88 npm paketindeki `cli.js.map` içinden `sourcesContent` çıkarılarak geri kurulmuş 4756 dosya (1884 `.ts`/`.tsx`)
- sıradan turda bağlama: 0 — hiçbir şey kurulmuyor.
- premium: yok.

## Ne yapar
Claude Code CLI'ın kendi kaynak ağacını gösteriyor: `tools/` (30+ araç), `commands/` (40+ komut), `plugins/`, `skills/`, `coordinator/` (çok ajan koordinasyonu), `remote/`, `voice/`, `vim/`.

## Core'a alınacak
- fikir: `plugins/` ve `skills/` dizinlerinin gerçek yükleme sırasını buradan doğrulamak — Core'un kanca davranışına dair varsayımları belgeye değil koda dayamak.
- hiç (lisanssız, telifli kod; hiçbir parçası kopyalanamaz).

## Karar
hayır — telifli ve lisanssız; Core'a hiçbir şey alınamaz, yalnız davranış doğrulama kaynağı olarak bilinsin.
