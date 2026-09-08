# affaan-m/ECC

- lisans: MIT
- kurulum biçimi: plugin (çok-harness: Claude Code, Codex, Cursor, Zed, OpenCode, Kiro, Gemini, Qwen...)
- mekanizma: 7 kanca olayı (PreToolUse 9, PostToolUse 2, PostToolUseFailure 2, SessionStart 2, PreCompact 1, Stop 7, SessionEnd 1 = 24 kanca girdisi); 94 komut, 68 ajan, 286 skill, tek MCP (chrome-devtools) tanımlı
- sıradan turda bağlama: CLAUDE.md 3.9 KB (~1000 token); skill description'ları 286 adet SKILL.md frontmatter'ından toplanır, tahmini 15-25 KB (~5-8K token) — okumadım, sayı adet×ortalama frontmatter uzunluğuyla kestirildi; SessionStart kancası ayrıca "önceki bağlamı yükle" çıktısı basıyor (session-start.js), boyutu ölçülmedi
- premium: var — "ECC Pro" hosted GitHub App, private repo analizi + PR denetimi, $19/koltuk/ay; ayrıca "ECC Tools" marketplace (free/pro/enterprise); yerel plugin tamamen MIT/ücretsiz kalıyor

## Ne yapar
Tek depoda 7 farklı ajan harness'ine (Claude Code, Codex, Cursor, Kiro, Zed, OpenCode, Gemini/Qwen) aynı kural/ajan/skill/kanca setini uyarlayıp dağıtan bir "mega-plugin". Dil/framework başına reviewer, build-resolver, TDD rehberi gibi 68 ajan ve 286 konu-spesifik skill barındırıyor. Kancalar oturum başlangıcında bağlam yükleme, araç öncesi/sonrası kalite-güvenlik denetimi ve Stop anında rapor üretimi yapıyor.

## Kullanıcıya nasıl hissettirir
SessionStart'ta "önceki bağlam yüklendi" gibi metin banner'ı basıyor; PreToolUse kancaları sessiz güvenlik/kalite filtresi gibi çalışıyor. Ölçek çok büyük (94+68+286 birim) — sıradan kullanıcı için "her şeyi kapsayan ama ağır" bir izlenim, gerçek profil gating (`minimal/standard/strict`) var ama varsayılan `standard`.

## Core'a alınacak
- fikir: hook-profile gating (`minimal/standard/strict`, `ECC_CONTEXT_MONITOR_COST_WARNINGS`) — kancaların maliyetini kullanıcı seçimiyle kısma deseni, Core'un "eşikte bir kez konuş" ilkesiyle örtüşüyor
- fikir: `resolveEccRoot` gibi çok-konumlu plugin-kök bulucu — plugin cache yol belirsizliğini node ile çözüyor, Core'un kendi kurulum yolunu sağlamlaştırmak için örnek olabilir
- hayır (gerisi): 68 ajan + 286 skill metin kitaplığı — MEKANİZMA değil içerik, kütüphaneye pasif kitap olarak da girmez çünkü dil/framework spesifik ve Core'un kapsamı dışında

## Ölçülecek
- Core'a hook-profile gating alınırsa: aynı kancanın "minimal" ve "standard" profilinde gerçek stdout token farkı ölçülür
- resolveEccRoot deseni alınırsa: farklı 3 kurulum yolunda (global, plugin cache, marketplace) doğru kök bulma oranı test edilir

## Karar
fikir notu — hook-profile gating ve plugin-kök çözücü deseni not edilecek kadar iyi, ama repo boyu (94 komut/68 ajan/286 skill) doğrudan alım için uygun değil.
