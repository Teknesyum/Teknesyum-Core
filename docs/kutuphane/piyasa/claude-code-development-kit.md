# peterkrueck/Claude-Code-Development-Kit

- MIT · kurulum: plugin/starter kit (install.sh, `.claude` içine kopya) · ★1380
- mekanizma: 6 kabuk kancası (`track-file-touch`, `review-on-stop`, `security-scan`, `snapshot-baseline`, `cleanup-session`, `notify`) · 3 komut (prime, merge, verify) · 9 skill · ajan yok · MCP yok (Context7 izni öneriliyor)
- sıradan turda bağlama: `templates/CLAUDE.md` 5.9 KB + `templates/AGENTS.md` 5.1 KB = ~11 KB (~2.8k token) ve 9 skill açıklaması (ölçülen: ortalama ~450 karakter, toplam ~4 KB ≈ 1k token). Kancaların sıradan turda stdout'u yok; eşiği geçmeyen turda `review-on-stop` sessizce çıkıyor.
- premium: yok

## Ne yapar
Oturumlar arası tutarlılık için dört sabit bağlam dosyası (spec, project-structure, progress, deployment) ve bunları güncel tutan komutlar sunar. Stop kancası oturumun dokunduğu dosyaları ölçüp inceleme/test/doküman önerir. Codex ya da Gemini CLI ile "ikinci görüş" alma yolu da paketlenmiş.

## Core'a alınacak
- **fikir — üç fazlı stop uyarısı**: `review-on-stop.sh` "tam uyarı → kısa hatırlatma → serbest bırak" biçiminde ilerliyor ve asla tuzağa düşürmüyor. Core'un "eşikte bir kez konuş, ikinci kez sorma" kuralının olgun hâli; `pipeline.json` eşikleri (min_lines_changed 10, review_threshold 50) dışarıda ayarlanabilir olması da kayda değer.
- **fikir — oturuma özgü dokunma manifestosu**: PostToolUse kancası dokunulan dosyaları `/tmp/claude-touched-<session>.files` içine yazıyor; Stop kancası diff'i yalnız bu dosyalara daraltıyor. Core'un dosya sayacı, oturum öncesi kirli ağaçtan gelen yanlış pozitifi böyle eleyebilir.
- **pasif betik — sır tarama deseni**: `hooks/config/sensitive-patterns.json` (canlı anahtar önekleri, kimlik alan adları, `.env` listesi) veriyi koddan ayırmış; Core'a betik olarak alınabilir.

## Karar
Al (fikir notu + desen dosyası) — kanca mimarisi Core'un eşik ilkesiyle birebir örtüşüyor, ama 11 KB'lık CLAUDE.md şablonu ve 9 skill Core'un sıfır-token ilkesine aykırı, o kısım alınmaz.
