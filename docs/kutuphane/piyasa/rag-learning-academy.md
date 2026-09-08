# TakaGoto/rag-learning-academy

- MIT · CLAUDE.md + `.claude/` (depo klonlanıp içinde çalışılıyor) · ★18
- mekanizma: 6 kanca betiği (SessionStart, Stop, ayrıca freshness/references/progress/validate),
  20 ajan, 22 skill (komut olarak sunuluyor), 0 MCP
- sıradan turda bağlama: `CLAUDE.md` 9.496 B (~2.400 token) + 22 skill frontmatter açıklaması
  (~600 token) + 20 ajan tanımı ≈ 10 KB üstü; SessionStart kancası her oturumda banner basıyor
- premium: yok

## Ne yapar
Claude Code'u RAG öğretmenine çeviren bir müfredat paketi: 9 modül, ders/quiz/challenge
komutları, ilerleme ve seri (streak) takibi. Öğrenme durumu `progress/` altındaki markdown
dosyalarında tutuluyor, kancalar bu dosyaları güncelliyor.

## Core'a alınacak
- **pasif betik — `check-freshness.sh`**: her içerik dosyasının son commit tarihini `git log -1
  --format=%ct` ile okuyup 90 günden eskileri listeliyor. Core'un 14 raflık kütüphanesi tam
  olarak bu sorunu yaşıyor; model çağırmadan "şu raf bayat" diyen deterministik betik.
- **fikir — durumu markdown'da tutup kancayla güncelleme**: ilerleme dosyası model tarafından
  değil `sed` ile güncelleniyor; Core'un handoff/yol haritası sayaçları için aynı desen.
- **hayır — 20 ajan + 22 skill**: Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesine karşıt;
  ölçülen ~3.000 token sıradan turda ödeniyor.

## Karar
Al — yalnız `check-freshness.sh` mantığı; gerisi Core'un ilkesinin zıt örneği.
