# egorfedorov/claude-context-optimizer

- MIT · plugin (`.claude-plugin/plugin.json`, v4.10.0) · ★107
- mekanizma: 6 kanca olayı / 9 kanca komutu (PreToolUse Read, UserPromptSubmit, PostToolUse, PreCompact, SessionStart, SessionEnd) · 22 skill · 1 ajan · 0 komut · 0 MCP · 26 dosyalık `src/`
- sıradan turda bağlama: CLAUDE.md yok; 22 SKILL.md frontmatter'ının name+description toplamı 3.245 bayt ≈ **~810 token** (grep ile sayıldı). Kanca stdout'u koşullu: `prompt-coach.js` puan ≥80 ya da sessiz kipte hiç yazmaz, zayıf istemde ~6 satır `additionalContext` basar.
- premium: yok

## Ne yapar
Her Read/Edit/Bash çağrısını izleyip hangi dosyanın okunup kullanılmadığını öğrenir; token ve dolar maliyetini model başına (Fable 5.1 / Opus 5 / Sonnet 5, 1 saatlik önbellek oranlarıyla) hesaplar. `read-cache.js` aynı dosyanın tekrar okunmasını PreToolUse'da engelleyip yerine ~100 token'lık bir yapı özeti (fonksiyon/sınıf + satır numarası) döndürür. `context-shield.js` geçmişte 3+ oturumda israf çıkan dosyalar için uyarır ve `.contextignore` kuralı önerir.

## Core'a alınacak
- **kanca** — tekrar okuma engeli: PreToolUse/Read'de dosya + satır aralığı defteri; ikinci okumada tam metin yerine yapı haritası. Core'un "sıradan turda sıfır token" ilkesini bozmaz, yalnız israfta konuşur.
- **kanca** — istem koçu eşiği: puan ≥80 ise sus deseni, Core'un "eşikte bir kez konuş" kuralının birebir aynısı; puanlama sezgileri (dosya adı geçiyor mu, sınırsız kapsam var mı) alınabilir.
- **fikir** — model başına gerçek fiyat + önbellek TTL tablosu; bench maliyet hesabında işe yarar.

## Karar
Al — 22 skill'lik yüzeyi (~810 token sabit) alınmaz ama `read-cache` ve istem koçu eşiği Core'un kanca felsefesiyle birebir uyumlu.
