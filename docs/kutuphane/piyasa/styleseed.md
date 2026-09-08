# bitjaru/styleseed

- MIT · skill paketi (`npx skills add`) + `.styleseed/` proje kaydı · ★944
- mekanizma: 0 kanca, 0 ajan, 23 skill (+ eklenti `ss-learn` ve 1 MCP sunucusu: `extensions/learning/`), 17 doğrulama/derleme betiği (`scripts/*.mjs`)
- sıradan turda bağlama: 23 skill açıklaması 4529 B (~1.1k token, `grep '^description:' skills/*/SKILL.md | wc -c`) + CLAUDE.md/AGENTS.md'ye yazılan yönetilen blok ~0.45 KB (`scripts/write-managed-instructions.mjs`). 50.7 KB'lik `engine/CLAUDE.md` el kitabı tura girmez
- premium: yok; `demo-pricing/` var, depo açık kaynak

## Ne yapar
Tasarım kararlarını (grid, palet, elevation, dokunma hedefi) depoda kilitler; ekran üretirken derle → render → puanla → düzelt döngüsü çalıştırır. 120 hücrelik kendi ölçümünde puan kapısının modeli +5.3 puan iyileştirdiğini, kuru kural yığınının iyileştirmediğini (Codex +1.6, Claude Code −3.7) söylüyor.

## Core'a alınacak
- fikir: **büyük el kitabını tura sokmama** — `/ss-resolve` 50 KB kitabı `.styleseed/effective-rules.md` adlı küçük, hash'li pakete derler; Core'un rafları için birebir derleme deseni.
- fikir: kural yığını tek başına kaliteyi düşürebiliyor, işe yarayan şey ölçen kapı. Core'un "kitap koy" refleksine karşı ölçüm argümanı.
- kitap: CLAUDE.md'ye BEGIN/END işaretli yönetilen blok yazıp yalnız o bloğu güncelleyen betik deseni (`write-managed-instructions.mjs`, 0.45 KB blok).

## Karar
Fikir notu — 23 skill açıklaması (~1.1k token) her turda yüklendiği için mekanizma alınmaz, derleme deseni ve ölçüm argümanı alınır.
