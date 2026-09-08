# openai/codex-plugin-cc

- Apache-2.0 · plugin (Claude Code marketplace) · ★32913
- mekanizma: 3 kanca (SessionStart, SessionEnd, Stop) · 8 komut · 1 ajan (`codex-rescue`) · 3 skill · 0 MCP
- sıradan turda bağlama: CLAUDE.md yok; üç skill de `user-invocable: false` ve açıklamaları toplam ~330 B ≈ 80 token; SessionStart/SessionEnd kancaları yalnız iş defteri tutuyor, stdout'a bağlam yazmıyor; Stop kancası ancak açıkça açılan gözden geçirme kapısı için çalışıyor. Ölçülen sıradan tur maliyeti ≈ 80 token.
- premium: yok; ChatGPT aboneliği ya da OpenAI API anahtarı gerekiyor (kullanım Codex limitine yazılıyor).

## Ne yapar
Claude Code içinden Codex'e iş devretmeyi ve kod incelemesi almayı sağlıyor: `/codex:review`, adversarial review, arka plan işleri için `status`/`result`/`cancel`, oturum devri için `transfer`/`rescue`.

## Core'a alınacak
- fikir: `user-invocable: false` frontmatter — kullanıcıya görünmeyen, yalnız iç sözleşme taşıyan skill; Core'un "hiçbir şey skill olarak kurulmaz" ilkesine en yakın resmi kaçamak, en azından ölçüm için bilinmeli.
- fikir: Stop kancasıyla isteğe bağlı çıkış kapısı — varsayılan kapalı, açılınca son turu ikinci bir modele denetletiyor; Core'un eşikte tek satır konuşan kanca desenine uyum sağlar.
- kitap: arka plan iş defteri deseni (job state + status/result/cancel üçlüsü) tek sayfa.

## Karar
fikir notu — mekanizması örnek (80 token'lık sıradan tur), ama işlevi Codex'e bağlı; Core'a giren şey desen, ürün değil.
