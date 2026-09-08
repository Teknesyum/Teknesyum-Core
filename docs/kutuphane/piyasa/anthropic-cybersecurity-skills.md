# mukul975/Anthropic-Cybersecurity-Skills

- Apache-2.0 · plugin / skill kataloğu · ★32411
- mekanizma: 818 skill, 0 kanca, 0 komut, 0 ajan, 0 MCP; `index.json` üretilmiş katalog, `tools/` altında doğrulayıcılar
- sıradan turda bağlama: 818 frontmatter 156086 B (~39000 token) — tümü kurulursa. AGENTS.md 2526 B.
- premium: yok

## Ne yapar
MITRE ATT&CK, NIST CSF 2 dahil 6 çerçeveye eşlenmiş 818 siber güvenlik prosedürü, düz `skills/<ad>/SKILL.md` düzeninde. agentskills.io standardı.

## Core'a alınacak
- kitap: AGENTS.md'deki "negatif tetikleyici" kuralı — açıklamada `Do not use for X — use other-skill` yazılır, çünkü iki skill aynı isteğe rakip olur. Core raflarında da aynı çakışma var.
- fikir: `tools/generate-index.py` ile makine-okunur `index.json` katalog — Core'un `kutuphane.js` listesi için ucuz bir arama yüzeyi.
- fikir: "elle yazılmış regex frontmatter ayrıştırıcısı 818 açıklamanın 604'ünü ilk satıra kırptı, CI artık regex ayrıştırıcıyı reddediyor" — Core'un frontmatter okuyan betikleri için somut uyarı.

## Karar
Hayır · içerik alanı Core'un dışında; yalnız negatif-tetikleyici kuralı fikir olarak not edildi.
