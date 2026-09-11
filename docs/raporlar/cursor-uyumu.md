# Cursor'da Teknesyum Core (2026-09-11)

Sonnet alt ajanı, web araması, 66.753 token, 67 sn. Cevap olduğu gibi:

---

## Cursor'da Claude Code eklentisi: yüzey yüzey durum

**Kancalar (`.cursor/hooks.json`)** — Cursor 1.7'den beri kendi kanca sistemi var, farklı isim ve şema:
SessionStart→`sessionStart`, UserPromptSubmit→`beforeSubmitPrompt`, PreToolUse→`preToolUse`/`beforeShellExecution`, PostToolUse→`postToolUse`, Stop→`stop`, SessionEnd→`sessionEnd`, PreCompact→`preCompact`. Alan adları farklı (`permission: allow/deny/ask` vs Claude'un `permissionDecision`), stdin/stdout JSON şekli uyuşmuyor. **MessageDisplay karşılığı yok** — Cursor'da ekran metnini değiştiren bir hook yok.
Cursor `.claude/hooks.json`'u okumuyor; Claude Code uyumluluk katmanı yok. (Kaynak: [Hooks | Cursor Docs](https://cursor.com/docs/hooks))

**CLAUDE.md/AGENTS.md** — Cursor CLI hem `AGENTS.md` hem `CLAUDE.md`'yi proje kökünde okuyup rule olarak uyguluyor; VS Code eklentisi tarafında bu net değil. `~/.claude/` durum dosyaları ve `CLAUDE_CONFIG_DIR` Cursor'un bilmediği bir yol — **doğrulanmadı**. (Kaynak: [CLAUDE.md vs AGENTS.md vs Cursor Rules](https://getunblocked.com/blog/claude-md-vs-agents-md-vs-cursor-rules/))

**Statusline** — Cursor CLI'da `/statusline` ile özel komut ayarlanabiliyor, format farklı ama fikir aynı. (Kaynak: [CLI Changelog](https://cursor.com/docs/cli/changelog))

**Alt ajan** — Cursor'un kendi `.cursor/agents/` / `subagentStart` mekanizması var, Claude Code'un `Agent` aracı modeliyle (sonnet/opus/fable seçimi) uyuşmuyor.

**Plugin marketplace** — `claude plugin install` Cursor'da yok; Cursor eklentileri VS Code Extensions üzerinden kurulur.

**Sonuç:** Doğrudan çalışmaz. hooks.json, statusLine komutu ve CLAUDE.md/AGENTS.md'nin kaba mantığı yeniden yazılabilir (ince adaptör), ama Agent aracı, plugin marketplace kurulumu ve MessageDisplay hook'u Cursor'da hiç karşılığı olmadığı için taşınamaz. Cursor içinde asıl çözüm, VS Code Extensions'tan resmi Claude Code eklentisini kurup Teknesyum Core'u onun kanca sistemine (kendi Claude Code kanca formatı) bağlamak — ama Cursor'un `.cursor/hooks.json`'u değil, VS Code eklentisinin kendi mekanizması kullanılmalı; bu da doğrulanmadı.

Sources:
- [Hooks | Cursor Docs](https://cursor.com/docs/hooks)
- [CLI Changelog | Cursor Docs](https://cursor.com/docs/cli/changelog)
- [Using Agent in CLI | Cursor Docs](https://cursor.com/docs/cli/using)
- [CLAUDE.md vs AGENTS.md vs Cursor Rules: 2026 Comparison](https://getunblocked.com/blog/claude-md-vs-agents-md-vs-cursor-rules/)
- [Use Claude Code in VS Code - Claude Code Docs](https://code.claude.com/docs/en/vs-code)
