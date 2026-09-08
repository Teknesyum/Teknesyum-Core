# zanwei/design-dna

- MIT · kurulum: taşınabilir Agent Skill (`npx skills add`, Claude Code/Cursor/global) · ★1716
- mekanizma: 1 `SKILL.md` (8.5 KB) · `references/` şema dosyaları · `scripts/` · kanca 0 · komut 0 · ajan 0 · MCP 0
- sıradan turda bağlama: yalnız tek skill frontmatter'ı (~250 karakter ≈ **~65 token**); 8.5 KB gövde ve referans şeması çağrılınca okunuyor.
- premium: yok

## Ne yapar
Ekran görüntüsü, görsel veya URL'den bir arayüzün görsel kimliğini üç boyutta (ölçülebilir token'lar, niteliksel üslup, görsel efektler) makine okunur JSON'a çıkarır, sonra o JSON'dan yeni arayüz üretir.

## Core'a alınacak
- **fikir — ölçülebilir token / niteliksel üslup ayrımı**: renk, tipografi, aralık gibi sayılabilir alanlar ile "mizaç, kompozisyon, marka sesi" gibi niteliksel alanlar aynı şemada ama ayrı bölümlerde; her alan doldurulmak zorunda, çelişkiler not ediliyor. `teknesyum-ui` standardı yazılırken alan listesi olarak kullanılabilir.
- **fikir — tek skill + referans dosyaları düzeni**: gövde ince, şema `references/` altında; Core'un raf biçimiyle aynı, 65 token'lık giriş maliyeti ölçüldü.
- hiç — üretim tarafı (Canvas/WebGL efekt kataloğu) Core'un alanı dışında.

## Karar
Fikir notu — Core'a mekanizma katmıyor ama `teknesyum-ui` yazılırken şema alan listesi olarak bakılacak; kurulum maliyeti ölçüldü, ~65 token.
