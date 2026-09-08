# Taiizor/agents-md-cookbook

- MIT · CLI + metin paketi (npm: `agents-md-lint`, `agents-md-migrate`; GitHub Action) · ★16
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; 16 `AGENTS.md` şablonu (50-123 satır),
  15 lint kuralı (`byte-cap`, `line-budget`, `vague-platitudes`, `naked-donts`,
  `inline-secret`, `executable-command`, `freshness`, `windsurf-chars`, ...)
- sıradan turda bağlama: 0 KB — hiçbir şey yüklenmez; linter CI'da ya da elle çalışır.
  Şablonlar 60-150 satır hedefli (~1,5-3k token, dosya boyu/4).
- premium: yok

## Ne yapar

`AGENTS.md` için sınanmış şablonlar, bunları CI'da denetleyen bir linter ve eski
`CLAUDE.md` / `.cursorrules` dosyalarını tek komutla dönüştüren bir göçmen. Kurallar
kanıta bağlı: ETH Zürih AGENTbench'te `/init` ile üretilen dosya başarıyı ~%3 düşürüp
maliyeti ~%20-23 artırmış; Augment'ın ölçümünde tatlı nokta 100-150 satır, ~300 üstü ters
dönüyor, çıplak "yapma" yığını ajanı ~2 kat yavaşlatıyor.

## Core'a alınacak

- pasif betik: `agents-md-lint` mantığının küçük bir kopyası — `AGENTS.md` satır/bayt
  tavanını ve boş öğüt cümlelerini sayar. Core zaten "her klasörde ≤20 satır AGENTS.md"
  diyor ama bunu ölçen bir şey yok; deterministik, model gerektirmez.
- kitap: `docs/anatomy.md` + `docs/common-mistakes.md` (7,7 KB toplam) — bölüm sırası ve
  anti-desenler sayısal kanıtla; rafta doğrudan kullanılabilir boyut.
- fikir: her "asla"yı bir "yap" ile eşleştirme kuralı; RULES.md'nin 30 satır tavanına
  uygun tek satırlık ekleme adayı.

## Karar

Al — kitap (anatomi + hatalar) ve satır sayan pasif betik; ikisi de bağlama sıfır token ekler.
