# SuperClaude-Org/SuperClaude_Framework

- lisans: MIT
- kurulum biçimi: plugin (.claude-plugin/plugin.json altında commands+agents+skills+hooks+mcpServers)
- mekanizma: 3 kanca (SessionStart → script; PostToolUse Write|Edit → prompt; Stop → prompt), 30 komut, 20 ajan, 6 skill, 2 MCP sunucusu (context7, sequential-thinking)
- sıradan turda bağlama: ~9.3 KB / ~2300 token — 6 skill'in frontmatter description'ları her zaman yüklü (dosyalar toplandı, `---`e kadar kesildi, karakter sayıldı). Buna ek her oturum başında SessionStart scripti sabit ~10 satır banner basıyor (git durumu + "Core Services Available"), her Write/Edit sonrası ve her Stop'ta birer prompt-tipi kanca tetikleniyor (kalıcı bağlam değil ama her düzenlemede ek bir model turu).
- premium: yok. README'de "Claude Max $100/ay" geliştirme maliyeti olarak anılıyor, satılan bir katman değil.

## Ne yapar
Claude Code'u bir "SC Agent" kimliğine büründürüp PDCA döngüsü, güven eşiği (%90) ve rol bazlı 20 ajanla (backend-architect, security-engineer, pm-agent vb.) yapılandırılmış geliştirme dayatıyor. Brainstorm/deep-research/troubleshoot/token-efficiency gibi modları skill olarak paketlemiş; komutlar (/analyze, /implement, /workflow…) bu modları ve ajanları çağırıyor.

## Kullanıcıya nasıl hissettirir
Oturum açılışında emoji'li banner ("📊 Git: …", "🛠️ Core Services Available") ve "SC Agent ready" mesajı karşılıyor; sessiz değil, her tur kimlik hatırlatması var. Her Write/Edit'ten sonra ayrıca bir doğrulama promptu araya giriyor.

## Core'a alınacak
- confidence-check skill'inin ölçütleri (duplicate check, resmi doküman doğrulama, OSS referans) — fikir notu: mekanizma değil, Core zaten kanca-eşik mantığında.
- Hiçbiri doğrudan alınacak mekanizma değil; Core'un "sıradan turda sıfır bağlam" ilkesiyle çelişen bir tasarım (6 skill hep yüklü, kanca her turda konuşuyor).

## Ölçülecek
Alınmayacak, ölçüm gereksiz.

## Karar
hayır — mekanizması Core'un "sıradan turda bağlam sıfır, kanca yalnız eşikte konuşur" ilkesine ters: 20 ajan + 6 skill + banner kanca her oturumda ve her düzenlemede token yakıyor.
