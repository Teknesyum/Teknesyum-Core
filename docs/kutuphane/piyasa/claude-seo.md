# AgriciDaniel/claude-seo

- MIT · kurulum biçimi: plugin (`.claude-plugin/plugin.json` + `marketplace.json`, install.sh/install.ps1) · ★16568
- mekanizma: 25 SKILL.md, 18 ajan, 0 komut, 1 kanca (`PostToolUse`, matcher `Edit|Write`), isteğe bağlı MCP eklentileri
- sıradan turda bağlama: 25 skill açıklaması 1987 B + 18 ajan açıklaması 2556 B = 4543 B (~1.1k token, her turda). Depodaki 18987 B'lik `CLAUDE.md` geliştirici dosyası, kuruluma girmiyor. Kanca yalnız Edit/Write sonrası, sessiz
- premium: var (kod MIT ve tam; erken erişim ayrıcalığı ücretli Skool topluluğuna açılan özel aynada)

## Ne yapar
SEO denetimi için 25 alt-skill ve 18 uzman ajanı paralel çalıştırıp önceliklendirilmiş eylem planı üreten eklenti. Teknik SEO, E-E-A-T, Schema.org, GEO, yerel/e-ticaret/uluslararası SEO. Tek kancası yazılan dosyada JSON-LD şema doğrulaması yapıyor.

## Core'a alınacak
- **Fikir — ölçülmüş karşı örnek.** 43 birim, her turda 4.5 KB. Core'un "sıfır token" ilkesinin bedelinin ne olduğunu gösteren sayı; kütüphane büyüdükçe google/skills'teki katalog yoluna gitmenin gerekçesi.
- **Pasif betik — Windows Python köprüsü.** `hooks/run-python-hook.js` (65 satır): `CLAUDE_SEO_PYTHON` → `py -3` → `python3` → `python` sırayla yoklanır ve **Microsoft Store saplaması** çıktıdan tanınıp elenir. Core Node tabanlı olduğu için doğrudan gerekmez; Windows'ta dış yorumlayıcı çağıran her betik için hazır desen.
- **Fikir — kanca kapsamı.** Tek kanca, tek matcher, çıktısız. Core'un eşik disiplinine uyan bir örnek.

## Karar
Fikir notu — alanı Core'a yabancı; alınacak olan Windows yorumlayıcı yoklama deseni ve 4.5 KB'lik boşta maliyet ölçüsü.
