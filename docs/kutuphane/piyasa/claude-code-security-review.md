# anthropics/claude-code-security-review

- MIT · GitHub Action + tek slash komut (`.claude/commands/security-review.md`) · ★6182
- mekanizma: 0 kanca, 1 komut, 0 ajan, 0 skill, 0 MCP; Python paketi (claudecode/) Action tarafında çalışır
- sıradan turda bağlama: 0 KB. Komut dosyası 10.8 KB (~2.7k token) yalnız çağrılınca yüklenir; prompts.py 7.1 KB Action içinde, editöre hiç girmez
- premium: yok (Anthropic API anahtarı gerekir)

## Ne yapar
PR diff'ini Claude Code'a verip yalnız yüksek güvenli (>%80 sömürülebilir) güvenlik bulgularını çıkarır. İkinci bir aşama, `findings_filter.py` (15.3 KB) ile sabit dışlama kurallarını uygulayıp gürültüyü eler. Aynı istem yerelde `/security-review` komutu olarak da çalışır.

## Core'a alınacak
- kitap: "yüksek güvenli bulgu" istem iskeleti — kategori listesi + `DOS, diskteki sır, rate limit bildirme` gibi açık dışlamalar + iki fazlı yöntem (önce depo bağlamı, sonra karşılaştırma). Core'un rapor/inceleme işlerinde doğrudan kullanılır.
- fikir: bulgu üretimi ile bulgu eleme ayrı adım; eleme kuralları modelde değil dosyada. Core'un log/rapor betiklerine aynı ayrım uyar.
- fikir: komutun `allowed-tools` satırında `Bash(git diff:*)` gibi kalıp kısıtı — pasif betiklerde yetki daraltma örneği.

## Karar
Al (kitap) — 0 KB sıradan yük, istem ve eleme kuralları metin olarak rafa taşınabilir.
