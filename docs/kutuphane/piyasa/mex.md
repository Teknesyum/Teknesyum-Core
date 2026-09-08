# mex-memory/mex

- MIT · CLI (npm `mex-agent`) + skill + ajan + isteğe bağlı MCP · ★1550
- mekanizma: 2 skill (`mex-inbox`, `mex-relay`), 4 ajan, 0 kanca; CLAUDE.md'ye işaretli blok yazıyor; MCP "yalnız kaynak"
- sıradan turda bağlama: CLAUDE.md bloğu 978 B + 2 skill açıklaması 1032 B ≈ 2,0 KB / ~500 token; ayrıca blok "her oturum başında `.mex/AGENTS.md` ve `.mex/ROUTER.md` oku" diyor — gerçek maliyet bunların boyutu kadar daha artıyor
- premium: yok (mexmemory.com sitesi ve Discord var, ücretli katman görünmüyor)

## Ne yapar
Takım hafızasını depoya koyuyor: mimari, kararlar, gereksinimler ve devir notları Markdown olarak `.mex/` altında, Git ile paylaşılıyor. `mex-relay` mühendisten mühendise devir bayrağı, `mex-inbox` yönetişimli spec önerisi.

## Core'a alınacak
- **fikir**: `mex-relay` — Core'un `.claude/handoff.md` / `docs/devir.md` düzeninin çok kullanıcılı hali. Alınacak tek şey "devri alma/kapatma" durumu: notun sahibi ve kapanışı açıkça işaretleniyor, Core'da not bitince `trash/`e gidiyor ama kim aldı yazmıyor.
- **fikir**: yazma sonrası "paylaşım sınırı" cümlesi — yerel taslak mı, commit gerektiren kanonik dosya mı; Core'un özel raf/genel raf ayrımına birebir uyuyor.
- **hiç**: ROUTER.md deseni alınmaz; her oturum iki dosya okutmak Core'un sıfır-token ilkesini bozar.

## Karar
Fikir notu — mekanizma iyi ama her oturumda ~500 token + iki zorunlu dosya okuması Core'un ilkesiyle çelişiyor; yalnız devir-sahipliği ve paylaşım-sınırı cümlesi alınır.
