# gotalab/cc-sdd

- MIT · npx kurucu (CLI) + Agent Skills paketi · ★3656
- mekanizma: 17 skill (SKILL.md), 0 kanca, 0 MCP; eski sürümde `/kiro:*` komutları, artık deprecated; 8 farklı ajan için ayrı şablon dizini
- sıradan turda bağlama: proje köküne yazılan `CLAUDE.md` 3.376 B + 17 skill frontmatter açıklaması (~2,5 KB) ≈ 5,9 KB ≈ ~1,5k token (wc -c ile ölçüldü; skill gövdeleri toplam 136 KB, istenince yükleniyor)
- premium: yok

## Ne yapar
Kiro tarzı spec-driven geliştirmeyi tek `npx cc-sdd@latest` komutuyla projeye kurar: keşif, gereksinim, tasarım, görev, sonra `kiro-impl` ile görev başına taze alt ajan + bağımsız gözden geçirici + kök neden hata ayıklama. Spec'i "kod parçaları arasındaki sözleşme" sayar, kod kaynak doğru kabul edilir.

## Core'a alınacak
- kitap: "sınır önce" disiplini — `design.md` içindeki Dosya Yapısı Planı görev sınırlarını belirliyor, görevler `_Boundary:_` / `_Depends:_` etiketi taşıyor; Core'un `docs/plan.md` alışkanlığına doğrudan uyar.
- fikir: `kiro-discovery` gibi tek giriş — "spec gerekli mi, doğrudan yap mı, böl mü" kararını başta veren yönlendirici; Core'un K0 kuralının olgunlaşmış hâli.
- fikir: görev başına taze bağlamda bağımsız gözden geçirici; iki kez reddedilirse temiz bağlamda hata ayıklama turu.

## Karar
fikir notu — 17 skill + proje CLAUDE.md ile turda ~1,5k token yazıyor, Core'un sıfır ilkesine ters; ama sınır etiketli plan disiplini kitap olarak alınır.
