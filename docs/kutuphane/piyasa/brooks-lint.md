# hyhmrright/brooks-lint

- MIT · plugin (+ Codex/Cursor/OpenCode metin kurulumu) · ★1457
- mekanizma: 6 skill, 6 komut, 1 kanca (SessionStart; matcher `startup|clear|compact`), ajan yok, MCP yok
- sıradan turda bağlama: 6 SKILL.md frontmatter'ı 4.957 bayt ≈ 1.240 token (her zaman yüklü) + SessionStart kancasının `additionalContext` metni ~700 bayt ≈ 175 token, oturum başına bir kez. Skill gövdeleri (11 KB) ve `skills/_shared` referansları (64 KB) yalnız çağrılınca okunuyor.
- premium: yok

## Ne yapar

On iki klasik mühendislik kitabından (Brooks, Parnas, Fowler…) çıkarılmış altı "çürüme riski"ne göre kod incelemesi yapıyor. Her bulgu Belirti → Kaynak (kitap + bölüm) → Sonuç → Çare biçiminde ve alıntılı; çıktı 0-100 sağlık puanı. Kitap metni değil, kitaptan damıtılmış kriterler `skills/_shared/decay-risks.md` gibi paylaşılan referanslarda duruyor.

## Core'a alınacak

- **kitap**: `skills/_shared/decay-risks.md` + `remedy-guide.md` — Core'un kod inceleme rafı için hazır, kaynak atıflı kriter listesi; 64 KB tamamı değil, damıtılmışı.
- **fikir**: bulguyu "Belirti → Kaynak → Sonuç → Çare" dört alanına zorlamak ve her bulguya kitap atıfı istemek — Core'un `log.js` hata günlüğü ve inceleme çıktısı için ucuz bir biçim disiplini.
- **fikir**: paylaşılan `_shared/` referans klasörü; altı skill aynı metni tekrar yazmıyor, çağrınca okuyor — Core'un raf mantığının aynısı, doğrulayıcı örnek.

## Karar

Fikir notu — mekanizması Core'da zaten var (pasif raf), ama kriter metni ve dört alanlı bulgu biçimi rafa damıtılmaya değer; SessionStart'ta 175 token yazan kanca Core'un "sıfır token" ilkesine aykırı, alınmaz.
