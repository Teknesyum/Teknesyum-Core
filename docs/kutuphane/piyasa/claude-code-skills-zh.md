# laolaoshiren/claude-code-skills-zh

- MIT · skill koleksiyonu (kopyala-kur) · ★823
- mekanizma: 20 skill (api-tester, changelog-gen, db-migrator, dep-auditor, error-translator, log-analyzer, perf-profiler, refactor-advisor, security-audit, skill-curator, test-generator, zh-code-reviewer, zh-docgen, zh-readme …); 0 kanca, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: 20 skill'in tüm açıklama satırları toplam 3553 B / ~890 token (hepsi kurulursa). Tek tek kurulursa skill başına ~45 token
- premium: yok (claude-skills.bt199.com kaynak sitesi)

## Ne yapar
Çince geliştiriciler için 425+ skill/agent/plugin listesi ve bunların içinden 20 özgün, kopyala-kur skill paketi. Açıklamalar tek satır; SKILL.md'ler kısa ve tek işlevli.

## Core'a alınacak
- **fikir**: `skill-curator` — kurulu skill'leri tarayıp gereksizleri işaretleyen bir skill. Core'da bunun pasif betik karşılığı anlamlı: kurulu skill açıklamalarının toplam token maliyetini sayan bir `skill-maliyet.js`.
- **fikir**: açıklamayı tek satırda tutma disiplini (skill başına ~45 token) — dilim 39'daki en ucuz açıklama ortalaması; Core'un raf indeksi için ölçü.
- **hiç**: skill'lerin kendisi alınmaz, hepsi ajan/skill olarak kuruluyor.

## Karar
Hayır — mekanizma yok, 20 skill kurulumu Core'un "hiçbir şey skill olarak kurulmaz" ilkesine aykırı; yalnız maliyet-sayacı fikri not edilir.
