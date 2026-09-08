# JuliusBrussee/caveman

- lisans: split — MIT (skills/, packages/agent, sdk vb.) + BSL-1.1 (engine/, proxy/, rewriter/, browse/, shrink/, cavemem Go core)
- kurulum biçimi: plugin (+ Codex/Gemini uzantısı, CLI, `npx skills` ile ajan kural dosyaları)
- mekanizma: 2 kanca (SessionStart, UserPromptSubmit) + 6 komut (.toml) + 18 skill + 3 cavecrew alt-ajanı (investigator/builder/reviewer) + ayrı MCP dizini
- sıradan turda bağlama: varsayılan mod `full` (env/repo/user config yoksa) — SessionStart her oturumda `skills/caveman/SKILL.md`'yi (~7 KB, ~1800 token) banner ile birlikte enjekte ediyor; üstüne 18 skill description'ı (~2-3 KB, ~600-800 token) her turda yükleniyor. Toplam tahmini ~2500 token/tur, sayım: dosya boyutu / 4 kaba tahmin.
- premium: var — "Caveman Cloud" (caveman.so, waitlist), LLM harcama gözlemi/routing/deney yönetimi (discover/evidence-review/manage/optimize/setup skill'leri buna bağlanıyor); fiyat açık değil.

## Ne yapar
Claude Code'u "mağara adamı" tarzı sıkıştırılmış çıktıya zorlayarak output token'ı azaltıyor (iddia: unprompted baseline'a karşı %65, ölçülmüş). Ayrıca commit/review/compress gibi sıkıştırılmış alt-modlar ve context-şişmesini tarayan bir "learn" akışı var. Cavecrew alt-ajanları arama/düzenleme/inceleme işini ana bağlamdan koparıp özet döndürüyor.

## Kullanıcıya nasıl hissettirir
Her oturum başında "CAVEMAN MODE ACTIVE — level: X" banner'ı ve statusline eklentisi var; sessiz değil, kimliğini sürekli gösteriyor. Varsayılan olarak açık geliyor, kapatmak kullanıcı eylemi gerektiriyor.

## Core'a alınacak
- fikir | cavecrew tarzı "arama/düzenleme/inceleme sonucu özetle, ham çıktıyı ana bağlama sızdırma" deseni — Core zaten Explore/alt-ajan kısaltmasını yapıyor, ek değeri düşük.
- fikir | `caveman-learn`: CLAUDE.md/todo gibi tekrar okunan dosyaları tarayıp token maliyetini raporlayan pasif betik fikri — Core'un map.js/log.js mantığına yakın, betik olarak uyarlanabilir.
- hiç | mağara-adamı üslup katmanı — Core'un "kısa cevap, yorum yok" kuralı zaten var, banner + persona fazlalık.

## Ölçülecek
- Core'a bir "context-sinkleri raporla" betiği eklenirse: hedef repo üstünde çalıştırıp gerçek KB/token tasarrufunu ölç, iddia edilen %65 ile karşılaştırma yapma (farklı ölçüm metodolojisi).

## Karar
fikir notu — persona/banner katmanı Core'un sıfır-bağlam ilkesine ters (varsayılan mod açık, her tur skill+banner yüklüyor); yalnız "context sinki tarama" fikri ayrı değerlendirilebilir.
