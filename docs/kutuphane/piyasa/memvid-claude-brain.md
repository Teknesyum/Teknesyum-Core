# memvid/claude-brain

- MIT · plugin (marketplace) · ★576
- mekanizma: 4 kanca olayı (SessionStart×2 — biri `smart-install`, PostToolUse matcher `*`, Stop), 4 komut, 2 skill (`mind` ve `memory` aynı içerik, kopya), ajan 0, MCP 0
- sıradan turda bağlama: `PostToolUse` matcher `*` — her araç çağrısında bir Node süreci başlıyor (timeout 10 s). İki skill frontmatter'ı ~2×130 B; SessionStart'ta bellek enjekte ediliyor
- premium: yok (memvid-cli ayrı npm paketi, ücretsiz)

## Ne yapar
Oturum bağlamını, kararları, hataları tek taşınabilir `.claude/mind.mv2` dosyasında tutuyor; veritabanı yok. Oturum başında otomatik enjekte ediliyor, `/mind search`, `/mind ask` ile sorgulanıyor. Boş dosya ~70 KB, anı başına ~1 KB.

## Core'a alınacak
- **fikir**: tek dosya belleğin git'e commit'lenebilir / `scp`'lenebilir olması — Core'un `handoff.md` + özel raf ikilisiyle aynı taşınabilirlik iddiası, doğrulayıcı.
- **hiç**: `PostToolUse` matcher `*` ile her araç çağrısında süreç başlatmak Core'un ilkesine doğrudan aykırı; `SessionStart`'ta bağımlılık kuran `smart-install` kancası da öyle.

## Karar
Hayır — recall aynı işi sıfır bağımlılıkla ve her araç çağrısında süreç başlatmadan yapıyor; bunun alınacak mekanizması yok.
