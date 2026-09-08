# anthropics/launch-your-agent

- Apache-2.0 · kurulum biçimi: proje içi skill paketi (`.claude/skills/`, klonla-çalıştır) · ★985
- mekanizma: 0 kanca, 0 MCP, **2 skill** (`launch-your-agent` 4 fazlı + `wrap-up`), 4 referans dosyası
- sıradan turda bağlama: `CLAUDE.md` **9,2 KB ≈ 2.300 token** + 2 skill frontmatter'ı (asıl skill'inki 760 bayt). Gövdeler (SKILL.md 29 KB, referanslar 60 KB) ancak skill tetiklenince yükleniyor
- premium: yok; Anthropic'in bakımsız ilan ettiği referans uygulama. README'de açık uyarı: "amaca özel bir ajandan daha token-yoğun"

## Ne yapar
Teknik kurucuyu röportajla başlatıp Claude Managed Agents üstünde canlı bir ajana götüren resmî öğretici skill: v0 kapsamı, API çağrılarının açık gösterimi, eval ile notlandırma, gerekiyorsa zamanlanmış dağıtım. Kapanışı ayrı bir `wrap-up` skill'i devralıyor.

## Core'a alınacak
- **kitap**: `CLAUDE.md`'nin "Key decisions" bölümü — her karar *ne yapıldığı değil, neden ve neyin karşısında* seçildiği biçiminde yazılmış (ör. "spend-limit adımı yok, tek sessiz maliyet varsayılanı `max_iterations: 3`"). Core'un `docs/` karar günlükleri için doğrudan biçim örneği.
- **fikir**: iki skill'in `references/` dizinini paylaşması (`../launch-your-agent/references/`) — Core'un rafları arasında kopyasız paylaşım.
- **fikir**: Anthropic'in kendi deposunda 9,2 KB'lık daimi `CLAUDE.md` tutup token yoğunluğunu README'de uyarı olarak yazması — Core'un "sıfır token" iddiasının pazarda ne kadar aykırı olduğunun ölçüsü.

## Karar
Fikir notu — içerik Managed Agents'a özel, Core'a girmez; alınacak tek şey karar günlüğü biçimi.
