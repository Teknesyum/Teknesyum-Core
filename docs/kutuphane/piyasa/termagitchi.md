# TevvvB/termagitchi

- MIT · plugin + Go ikilisi (ikisi birlikte gerekir) · ★14
- mekanizma: 2 skill (`pets`, `pets-setup`), 0 komut, 0 ajan, 0 MCP; ikili `pets install` ile statusline + 3 kanca yazar (`PostToolUse`, `Stop`, `SessionStart`, `internal/harness/harness.go:157`)
- sıradan turda bağlama: ~0,2 KB / ~55 token — yalnız iki skill frontmatter açıklaması (SKILL.md gövdeleri 1172 + 844 bayt, çağrılmadan yüklenmez); kanca çıktısı statusline'a gider, modele değil
- premium: yok (bağış bağlantısı)

## Ne yapar
Her git worktree'sine bir şehir, her ajan oturumuna oturum karmasından türeyen bir yaratık verir; yaratığın ruh hali worktree'nin temizliğine bağlıdır. Amaç eğlence değil ayırt etme: altı paralel ajan altı farklı yaratık, hangisinin başı dertte bir bakışta görülür.

## Core'a alınacak
- **fikir — eklenti yapılandırma taşır, çalıştırılabilir taşımaz.** `plugin/README.md` bunu açıkça yazıyor; ikili ayrı kurulur, skill yalnız `/pets-setup` çağrısında kurulumu koşar. Core'un `setup.js` ile eklenti ilişkisiyle aynı ayrım.
- **fikir — kancanın çıktısı statusline'a, bağlama değil.** Üç kanca yazıyor ama modele giren metin sıfır; Core'un "sıradan turda bağlama sıfır" ilkesinin bağımsız doğrulaması.
- **fikir — deterministik türetme, kayıt yok.** Yaratık oturum karmasının fonksiyonu; saklanacak durum dosyası yok.

## Karar
Hayır — mekanizması Core ilkesiyle örtüşüyor ama işlevi (ajan oturumu ayırt etme, macOS/Go ikilisi) Core'un alanı değil.
