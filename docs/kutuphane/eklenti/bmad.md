# bmad-code-org/BMAD-METHOD

- lisans: MIT
- kurulum biçimi: Claude Code skill paketi (`npx skills add` veya `/plugin marketplace add bmad-code-org/bmad-plugins`); hook, MCP, `.claude-plugin` manifesti yok
- mekanizma: kanca 0; 29 skill (`skills/*/SKILL.md`, her biri kendi `references/scripts/assets` altında); merkezi `bmad` hub skill'i durumu okuyup sıradaki skill'i önerir; ajan yok, MCP yok
- sıradan turda bağlama: 29 skill description'ının toplamı ~7,6 KB (~1900 token, description metinlerini `wc -c` ile topladım); her skill her zaman yüklü tutulur, gövdeleri (SKILL.md tam metni + references) yalnız çağrılınca okunur
- premium: yok; README "free and open source, no paywalled workflows" diyor. Ayrı bir "BMad Test Architect" enterprise eklentisi var ama bağımsız repo, bu depoda değil

## Ne yapar
PRD/mimari/spec/story/kod-inceleme gibi yazılım geliştirme adımlarını sıralı skill'lere böler (bmad-prd, bmad-architecture, bmad-build, bmad-code-review vb.). `bmad` hub skill'i kullanıcı sorusuna ve proje durumuna bakıp hangi skill'in sırada olduğunu önerir. Kurulum/onarım da (`bmad setup`, `bmad doctor`) bir skill üzerinden yürüyor.

## Kullanıcıya nasıl hissettirir
Sessiz — kanca yok, statusline dokunmuyor; yalnız description'lar bağlamda durur ve model conversation akışına göre ilgili skill'i kendi seçip devreye sokuyor. Çıktı stili normal Claude Code metin akışı, banner yok.

## Core'a alınacak
- fikir: "hub skill" deseni — merkezi bir skill'in durumu okuyup sıradaki adımı önermesi, Core'un `map.js`/eşik mantığına benzer bir yönlendirme fikri verebilir ama Core zaten kendi eşik/handoff mekanizmasına sahip.
- hiç: kanca, MCP, ajan yok; kod olarak alınacak somut bir mekanizma (betik, kanca) bulunmuyor — hepsi metin talimatı (skill gövdeleri).

## Ölçülecek
Alınırsa: hub-skill deseninin Core'un mevcut `map.js`/handoff akışına eklenmesi durumunda sıradan turda kaç ek token gireceği (yeni skill description'ları) ölçülür.

## Karar
hayır — mekanizma yalnız metin/skill talimatları, Core'un kanca/betik temelli yapısına aktarılacak somut bir parça yok.
