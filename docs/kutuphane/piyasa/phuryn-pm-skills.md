# phuryn/pm-skills

- MIT · plugin (Claude Code marketplace, 9 eklenti) · ★26112
- mekanizma: kanca yok · 59 komut · 68 skill · ajan yok · MCP yok; 9 ayrı eklenti tek bir `marketplace.json` altında.
- sıradan turda bağlama: 68 SKILL.md frontmatter'ının toplamı 20.291 B ≈ 5.000 token — hepsi kurulursa her turda yüklü. Tek eklenti kurulursa bu 1/9'una (~550 token) iniyor. Depo kökündeki CLAUDE.md 8.229 B yalnız katkıcılar için, kullanıcıya gitmiyor.
- premium: yok; yazarın ücretli bülteni/kursu var, eklenti ücretsiz.

## Ne yapar
Ürün yönetimi çerçevelerini (keşif, varsayım haritası, strateji tuvali, PRD, OKR, lansman, büyüme) adım adım yürüten skill'ler ve bunları zincirleyen 42 iş akışı. Skill'ler otomatik tetikleniyor, komutlar zincirin girişi.

## Core'a alınacak
- fikir: tek pazar yerini 9 bağımsız eklentiye bölmek — kullanıcı yalnız ihtiyacı olan rafı kuruyor, bağlam maliyeti 5.000'den 550 token'a düşüyor. Core'un raf mantığının eklenti düzeyindeki karşılığı; kütüphane büyüdüğünde uygulanacak bölme kuralı.
- fikir: `validate_plugins.py` — her eklentinin manifest/skill/komut tutarlılığını CI'da doğrulayan deterministik betik; Core'un `npm test` tarafına eklenebilir desen.
- hayır: içerik; PM çerçeveleri Core'un alanı değil.

## Karar
fikir notu — içerik alakasız, ama "rafı eklentiye böl, maliyeti 9'a bölünsün" ölçümü Core'un kütüphane büyüme planına doğrudan girdi.
