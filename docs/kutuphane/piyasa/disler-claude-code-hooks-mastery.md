# disler/claude-code-hooks-mastery

- lisans yok (LICENSE dosyası yok) · kurulum biçimi: `.claude/` şablon deposu (klonla-kullan) · ★3914
- mekanizma: 13 kanca (tüm yaşam döngüsü olayları), 15 komut, 6 ajan, 9 statusline sürümü, 8 output-style, 4 validator
- sıradan turda bağlama: `CLAUDE.md` **0 bayt**; ama `settings.json` matcher'ı boş — her araç çağrısında `uv run` ile Python süreci kalkıyor; `session_start.py` ve `user_prompt_submit.py` bağlama metin enjekte edebiliyor
- premium: yok; ElevenLabs/OpenAI/Ollama isteğe bağlı TTS bağımlılıkları

## Ne yapar
Claude Code'un 13 kanca olayını tek tek gösteren öğretici depo. Her olay için ayrı `uv` tek-dosya Python betiği, JSON yükü loglanıyor. Yanında `ai_docs/` altında resmî kanca (57 KB), statusline (11 KB) ve subagent (40 KB) dokümanlarının damıtılmış kopyaları duruyor.

## Core'a alınacak
- **kitap**: `ai_docs/claude_code_hooks_docs.md` (57 KB) — 13 olayın yükü, exit kodları, `hookSpecificOutput`/`additionalContext` sözleşmesi tek yerde. Core'un `hooks/mod.js`'i büyüdükçe rafta durması gereken referans.
- **kanca**: `pre_tool_use.py`'deki `rm -rf` desen listesi ve `.env` okuma engeli (`.env.sample` hariç) — Core'un kapısına saf regex olarak taşınır, model maliyeti sıfır.
- **fikir**: statusline'ın 9 sürümü versiyon adıyla yan yana duruyor; Core da statusline varyantlarını silmeden numaralayabilir.

## Karar
Al — 57 KB'lık kanca referansı ve 60 satırlık yıkıcı-komut regex'i doğrudan pasif; ajan/skill kurulumu gerekmiyor.
