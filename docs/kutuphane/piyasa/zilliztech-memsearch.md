# zilliztech/memsearch

- lisans: depoda LICENSE var (Apache tarzı) · plugin + Python CLI · ★2577
- mekanizma: 5 kanca betiği (SessionStart, UserPromptSubmit, Stop, SessionEnd, ortak `common.sh`), 17 SKILL.md, 4 istem şablonu (`memory_to_skill`, `summarize`, `user_profile`, `project_review`), bakım koşucusu `maintenance-runner.py`
- sıradan turda bağlama: `CLAUDE.md` 9.884 B ≈ 2,5k token + 17 skill açıklaması 6.293 B ≈ 1,6k token = ~4k token; üstüne UserPromptSubmit kancasının her istemde enjekte ettiği anı metni.
- premium: yok (Zilliz/Milvus arka ucuna bağlı ama yerel çalışır)

## Ne yapar
Claude Code, Codex, OpenCode, DSH gibi ajanlar için ortak semantik bellek katmanı. Oturum sonunda transkripti ayrıştırıp özetler, anıları vektör deposuna yazar, sonraki oturumun başında ve her istemde geri getirir.

## Core'a alınacak
- betik: `plugins/claude-code/hooks/parse-transcript.sh` — transkript JSONL'ini kabuktan ayrıştırma; Core'un `log.js` ve devir notu için modelsiz veri kaynağı.
- fikir: `prompts/` klasörü — modele verilecek sabit metinler kod içine gömülmemiş, ayrı dosyada; Core'un "sabit metinleri model yazmaz" kuralının dosya düzeni karşılığı.

## Karar
Hayır — 4k token'lık sabit yük ve her istemde enjeksiyon; ayrıştırma betiği ile istem klasörü düzeni fikir olarak kalır.
