# NVIDIA/SkillSpector

- lisans: Apache 2.0
- kurulum biçimi: CLI (`uv tool install`) + ayrı bir Claude Skill (`skills/skill-inspector/SKILL.md`); Claude Code plugin manifesti (`.claude-plugin/`), hook, komut veya ajan yok
- mekanizma: kanca yok. Komut/ajan yok. Bir MCP sunucusu var (`skillspector mcp`, opsiyonel extra) ve bir Pi tool entegrasyonu (`docs/PI_EXTENSION.md`). Asıl gövde `src/skillspector/` altında LangGraph tabanlı statik analiz hattı (AST, YARA kuralları, MCP-poisoning/rug-pull testleri, SARIF çıktısı)
- sıradan turda bağlama: skill sadece tetiklendiğinde (kullanıcı bir skill'in güvenli olup olmadığını sorunca) yükleniyor; her zaman yüklü olan yalnız frontmatter `description` (~350 karakter, ~90 token). Gövde (7,4 KB, ~1850 token) yalnız tetiklenince okunuyor. CLAUDE.md yok, her-zaman-açık kanca stdout'u yok
- premium: yok. Tamamen açık kaynak; ticari taraf NVIDIA'nın barındırdığı "Verified Skills" kataloğu/imzalama hattı ile bağlantılı ama bu depo bedava

## Ne yapar
`skillspector scan <path>` ile bir agent skill klasörünü (SKILL.md, script, MCP manifesti, bağımlılıklar) statik olarak tarar; risk skoru, SARIF/JSON rapor, kural ID'leri üretir. `skill-inspector` adlı Claude Skill bu CLI'ı çağırıp üstüne kaynak-farkında semantik inceleme ekleyerek APPROVE/CAUTION/REJECT kararı veriyor.

## Kullanıcıya nasıl hissettirir
Sessiz — yalnız "bu skill güvenli mi" türü bir istek geldiğinde devreye giriyor, banner yok. Çıktısı disiplinli bir tablo formatlı güvenlik raporu (skor, kanıt, karar rubriği); statusline'a dokunmuyor.

## Core'a alınacak
- fikir | Core'un kendi eklenti/kütüphane inceleme akışı (bu görevin kendisi — "yeni bir eklentiyi değerlendir") için skill-inspector'daki rubrik yapısı (skor aralığına göre varsayılan tavır, HIGH/CRITICAL'i itibarla indirmeme kuralı) örnek alınabilir; kod olarak değil, ilke olarak.
- hiç | CLI/YARA/AST tarayıcısının kendisi alınmaz — Teknesyum Core bir Claude Code eklentisi, ayrı bir Python güvenlik tarayıcısı taşımak kapsam dışı.

## Ölçülecek
- Alınacak tek şey bir ilke notu olduğu için ölçüm yok; Core'a girecek somut bir betik/kanca olmadı.

## Karar
hayır — bağımsız bir Python güvenlik tarayıcısı ve ayrı bir skill; Core'un plugin/kanca mekanizmasına aktarılacak taşınabilir bir parça yok, en fazla rubrik fikri akılda kalır.
