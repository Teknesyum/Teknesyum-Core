# rohitg00/pro-workflow

- MIT · plugin (npm + `.claude-plugin/`) · ★2842
- mekanizma: 37 kanca betiği 10 olayda (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop, SubagentStop, PreCompact, PostCompact, SessionEnd, Notification) · 23 komut · 8 ajan · 41 skill
- sıradan turda bağlama: skill açıklamalarının frontmatter'ı tek başına 11.6 KB (~3 bin token, `awk /^description:/ | wc -c`); üstüne SessionStart tüm öğrenilmiş kuralları, UserPromptSubmit ilgili wiki parçalarını enjekte eder. Core'un sıfırına karşı en pahalı örnek.
- premium: yok (README'de fiyat/abonelik geçmiyor); tüm depo MIT

## Ne yapar
Her oturumun altına tek bir SQLite deposu koyar. Kullanıcının düzeltmesi kurala dönüşür, FTS5 ile aranır, oturum başında yüklenir; ayrıca konu başına kalıcı "wiki"ler tutup gece kendi kendine büyütür. Yanına kalite kapıları, gizli anahtar taraması, git koruyucuları ve maliyet takibi koyar.

## Core'a alınacak
- **kanca**: `scripts/reread-tracker.js` (2 KB) — aynı dosya değişmeden ikinci kez okunursa stderr'e tek satır uyarı. Sessiz, deterministik, token tasarrufuna doğrudan hizmet eder; Core'un "eşikte bir kez konuşur" kuralına birebir.
- **kanca**: `scripts/tool-call-budget.js` (1.7 KB) — oturumdaki araç çağrısını sayar, yalnız 15/20/25/30/40/50/65/80 eşiklerinde tek satır konuşur, gerisi sıfır çıktı. Core'un dosya sayacının araç-çağrısı ikizi.
- **fikir**: gizli anahtar taramasının LLM'siz regex'le yapılması (`secret-scan.js`, 2.8 KB) — Core'un "model gerekmiyorsa model kullanma" kuralının hazır örneği.

## Karar
Fikir notu — bütünü Core'un tam zıddı (11.6 KB hep-açık skill açıklaması), ama iki kanca betiği bağlama sıfır token yazıp yalnız eşikte konuştuğu için doğrudan alınabilir.
