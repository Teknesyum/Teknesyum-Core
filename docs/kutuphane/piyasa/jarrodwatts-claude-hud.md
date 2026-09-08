# jarrodwatts/claude-hud

- MIT · plugin (marketplace + statusline) · ★27875
- mekanizma: 0 kanca, 2 komut (`setup.md` 41 KB, `configure.md` 20 KB), 0 ajan, 0 skill, 0 MCP; tüm iş `dist/` altındaki statusline betiği
- sıradan turda bağlama: 0 KB. Depoda CLAUDE.md var (6.6 KB) ama o geliştiricinin kendi dosyası, kurulumda kopyalanmıyor; komut dosyaları yalnız `/claude-hud:setup` çağrılınca okunur
- premium: yok

## Ne yapar
Claude Code oturumunun durumunu statusline'a basar: bağlam doluluk yüzdesi, çalışan araçlar, alt ajanlar, todo ilerleyişi, maliyet. Veriyi statusline stdin'inden ve transcript JSONL'ini satır satır okuyarak çıkarır (`src/transcript.ts`, `src/context-cache.ts`).

## Core'a alınacak
- **pasif betik**: oturum başına sha256'lı bağlam önbelleği + 3 sn yazma TTL'i ve %1 olasılıkla temizlik taraması (`context-cache.ts`). Core'un statusline'ı her tikte disk yazmasın diye aynı desen doğrudan uygulanabilir.
- **fikir**: transcript satırlarında `isSidechain` ve `requestId` alanlarını kullanarak alt ajan turlarını ana turdan ayırma — Core'un bench ve sayaçları alt ajan tokenini bugün ana turla karıştırıyor.
- **fikir**: cache_creation/cache_read tokenlerini TTL katmanına (5 dk / 1 sa) ayırıp raporlama.

## Karar
Al · Core ile aynı ilkede (bağlama sıfır, iş statusline'da) ve iki somut ölçüm tekniği hazır.
