# disler/claude-code-hooks-multi-agent-observability

- lisans yok · CLAUDE.md + `.claude/` kopyala (proje kurulumu) · ★1532
- mekanizma: 13 kanca betiği (PreToolUse, PostToolUse, Notification, Stop, SubagentStart/Stop,
  PreCompact, SessionStart/End, UserPromptSubmit, PermissionRequest), 12 komut, 7+ ajan,
  4 skill, statusline; sunucu tarafı Bun + SQLite + WebSocket + Vue
- sıradan turda bağlama: `CLAUDE.md` 431 B (~110 token) + 4 skill açıklaması (~80 token) ≈ 0,5 KB;
  ama her araç çağrısında `send_event.py --summarize` çalışıyor, yani tur başına ek süreç ve
  (özet için) ek model çağrısı
- premium: yok; ANTHROPIC_API_KEY zorunlu, ElevenLabs/Firecrawl opsiyonel

## Ne yapar
Claude Code'un tüm kanca olaylarını HTTP ile bir Bun sunucusuna gönderip SQLite'a yazar ve
canlı bir panoda gösterir. Amaç paralel çalışan çok ajanlı bir sürüde her araç çağrısını, her
devri ve her ajan yaşam döngüsü olayını izlemek.

## Core'a alınacak
- **fikir — kanca olay listesi**: 13 olayın tamamı tek yerde örneklenmiş; Core'un bugün
  kullanmadığı `PreCompact`, `SubagentStop`, `PermissionRequest` için hazır referans.
- **fikir — olay akışını dosyaya biriktirme**: `user_prompt_submit.py` oturumu
  `.claude/data/sessions/<id>.json` altında tutuyor. Core'un handoff dosyasının makine tarafı
  için aynı desen; model hiç okumadan sayım yapılır.
- **hayır — `--summarize`**: her araç çağrısında özet için model çağırmak Core'un "sıradan turda
  sıfır" ilkesini doğrudan bozar.

## Karar
Fikir notu — pano ve sunucu Core'un kapsamı dışında, ama kanca olay kataloğu olarak değerli.
