# fcakyon/claude-codex-settings

- Apache-2.0 · plugin (33 eklentilik pazar yeri) + CLAUDE.md · ★1134
- mekanizma: 33 eklenti, 69 skill, 20 komut, 5 `.mcp.json`, 6 `hooks.json` (PreToolUse×5, PostToolUse×2, SessionStart, UserPromptSubmit, PreCompact)
- sıradan turda bağlama: `CLAUDE.md` 21.995 B + 69 skill açıklaması 21.481 B = ~43 KB ≈ 11k token (wc -c ve frontmatter `description:` satırlarının byte toplamı). Tek eklenti kurulursa pay çok küçülür; kancalar sessizken sıfır.
- premium: yok

## Ne yapar
Claude Code, Codex ve Cursor için tek depoda toplanmış ayar takımı. Her alan (github, python, react, stripe, supabase) ayrı eklenti; kancalar davranış zorlar: `git commit` öncesi `/simplify` şartı, AI imzası engelleme, PR öncesi görsel kanıt isteme, WebFetch'i Tavily'ye çevirme.

## Core'a alınacak
- kanca: `plugins/simplify/hooks/scripts/guard.py` — PreToolUse ile `git commit`'i tek kullanımlık işaretçi (`.git` içinde) olmadan bloklar; işaretçiyi ajan ya da kullanıcının açık "atla" sözü basar. Core'un "eşikte bir kez konuş" kalıbının bloklayan sürümü, kabuk operatörü ayrıştırması dahil hazır.
- kitap: `plugins/intelligent-compact/hooks/scripts/precompact_priorities.sh` (3.539 B) — PreCompact stdout'unu varsayılan 9 bölümlü özet istemine yama olarak yazar: cevapsız sorular, kök neden ve elenen hipotez ayrımı, birebir sayı/kimlik. Core'un compact talimatı bundan beslenir.
- fikir: `fable-advisor` — danışman skill'i Claude Code'da yerel ajana, başka araçta `ask_fable.mjs`'e yönlendirir; Core'un `advice.js`/`agency.js` yönlendirmesiyle aynı desen.

## Karar
Al — üç mekanizma da dosya düzeyinde kopyalanabilir, eklentinin 43 KB'lık bağlam yükü alınmaz.
