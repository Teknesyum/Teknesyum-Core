# obra/superpowers

- lisans: MIT
- kurulum biçimi: plugin (Claude Code, Cursor, Codex, Gemini, Copilot, Devin, Kimi... çok-koşum destekli)
- mekanizma: 1 kanca (SessionStart: startup|clear|compact) + 14 skill (13 içerik + `using-superpowers` bootstrap), komut/ajan/MCP yok
- sıradan turda bağlama: ~5 KB / ~1250 token — SessionStart kancası `using-superpowers/SKILL.md`'yi (3.1 KB) tam metin JSON'a kaçırıp context'e enjekte ediyor; buna ek diğer 13 skill'in description satırı (Skill tool listesinde ~2 KB) her turda görünür
- premium: yok

## Ne yapar
TDD, sistematik hata ayıklama, plan yazma/yürütme, kod incelemesi isteme/alma, paralel alt-ajan dağıtımı, git worktree izolasyonu gibi 13 "işleyiş disiplini" skill'i toplar. `using-superpowers` bootstrap skill'i her oturum başında zorla enjekte edilip "bir skill %1 ihtimalle bile uyuyorsa kullanmak zorundasın" diyerek diğerlerini tetikliyor. Model-davranışı şekillendiren metin kitapları — çalıştırılabilir kod değil.

## Kullanıcıya nasıl hissettirir
Sessiz kurulum sonrası her oturum "You have superpowers" banner'ıyla EXTREMELY_IMPORTANT bloğu görür; skill'ler `Skill` aracıyla adı geçtikçe devreye girer, ayrı bir statusline/çıktı yok. Ton emirvari (HARD-GATE, Iron Law, ABSOLUTELY MUST) — Core'un sakin diliyle çelişiyor.

## Core'a alınacak
- kitap: `systematic-debugging`, `verification-before-completion` içeriği — Core'un `log.js` / kanıt disiplinine metin olarak uyarlanabilir, ama pasif kütüphaneye (kutuphane.js) tek tek kitap olarak girsin, otomatik enjekte edilmesin
- fikir: SessionStart kancasının "tek skill'i escape edip context'e bas" tekniği — Core'un kendi handoff/devir mekanizmasında zaten var, tekrar alınmaz
- hiç diğerleri: "her turda zorunlu skill tetikleme" felsefesi Core'un "sıradan turda bağlama sıfır token" ilkesiyle doğrudan çelişiyor

## Ölçülecek
- Alınacak metin kitapları kütüphaneye eklenirse: `??` sorgusunda bulunuyor mu, `show --lean` token maliyeti nedir
- SessionStart enjeksiyonu örnek alınmaz; alınırsa mevcut kanca-eşik ilkesiyle token artışı ölçülmeli

## Karar
fikir notu — disiplin metinleri kütüphaneye kitap olarak alınabilir, ama zorunlu-enjeksiyon mekanizması Core'un sıfır-bağlam ilkesine aykırı.
