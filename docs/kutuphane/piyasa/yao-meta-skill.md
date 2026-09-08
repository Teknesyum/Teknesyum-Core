# yaojingang/yao-meta-skill

- MIT · tek kök skill + metin paketi (CLAUDE.md yok, eklenti manifesti yok) · ★2604
- mekanizma: 1 SKILL.md (3.149 bayt), 39 `references/` metni (224 KB), 7 JSON şeması, 2,5 MB `scripts/`, kanca 0, komut 0, MCP 0, ajan yalnız `agents/interface.yaml`
- sıradan turda bağlama: frontmatter 379 bayt ≈ 95 token. Gövde ve referanslar yalnız çağrılınca okunuyor; kendi kuralı, ilk yüklemeyi kademeye göre 700-1.300 token'la sınırlıyor.
- premium: yok

## Ne yapar

Skill üretme/değerlendirme/sürüm çıkarma "fabrikası". Bir işi önce platformdan bağımsız ara temsile (Skill IR) çeviriyor, oradan Claude/OpenAI hedeflerine derliyor, eval kanıtı üretip sürüm kapısından geçiriyor. Kendi kalite kıyaslamasında Anthropic ve OpenAI skill creator'larını puanlıyor.

## Core'a alınacak

- **kitap**: `references/resource-boundaries.md` — neyin SKILL.md'de, neyin `references/`de, neyin `scripts/`te durması gerektiğini ve kademe başına ilk-yükleme token bütçesini (700/1.000/1.300) yazan spec. Core'un raf/pasif betik ayrımının dışarıdan gelen ölçülü karşılığı; rafa doğrudan girer.
- **fikir**: "deterministik, tekrarlı, düzyazıya çevrilince kırılgan olan iş `scripts/`e gider" kuralı — Core'un "angarya işte önce deterministik araç" kuralının test edilebilir biçimi.
- **fikir**: `manifest.json` içinde `context_budget_tier` alanı; bağlam bütçesini metadata olarak beyan edip denetlemek. Core'un eşik sayacına eklenebilecek bir alan.

## Karar

Al — 95 tokenlik ayak izi ve `resource-boundaries.md`'nin sayısal bütçe kuralları Core'un ilkesini dışarıdan doğruluyor; makinesi değil, o tek metin alınır.
