# Gemini CLI kanca şeması (2026-09-11)

Sonnet alt ajanı, yerel kurulum 0.58.0 belgeleri ve kaynağı, 98.752 token, 79 sn. Cevap olduğu gibi:

---

**1. Sürüm ve varsayılan durum**
`gemini --version` → `0.58.0`. Hooks **varsayılan açık**: kaynakta `enableHooks = params.enableHooks ?? true` (`chunk-MFLFXOVQ.js:376996`) ve `docs/cli/settings.md`: `hooksConfig.enabled` → default `true`. Kapatmak için `{"hooksConfig":{"enabled":false}}`.

**2. Konfig biçimi ve yerler**
`hooks.<EventName>: [{ matcher, sequential?, hooks: [{ type:"command", command, name?, timeout?, description? }] }]`. Öncelik sırası: proje `.gemini/settings.json` > kullanıcı `~/.gemini/settings.json` > sistem `/etc/gemini-cli/settings.json` > eklentiler. Ortam değişkenleri: `GEMINI_PROJECT_DIR`, `GEMINI_PLANS_DIR`, `GEMINI_CWD`, `GEMINI_SESSION_ID`, ve uyumluluk için `CLAUDE_PROJECT_DIR` (= cwd).

**3. Olay listesi**
`SessionStart, SessionEnd, BeforeAgent, AfterAgent, BeforeModel, AfterModel, BeforeToolSelection, BeforeTool, AfterTool, PreCompress, Notification`. Ortak stdin alanları: `session_id, transcript_path, cwd, hook_event_name, timestamp`.

**4. Özel sorular**

- **BeforeTool**: kabuk aracı adı `run_shell_command`. Komut alanı `tool_input.command`. Reddetme: `{"decision":"deny","reason":"..."}` (exit 0) veya exit 2 + stderr. `reason` modele tool-error olarak gider. `systemMessage` **kullanıcıya** terminalde gösterilir, modele gitmez.
- **AfterTool**: yazma araçları `write_file` ve `replace`. `tool_input.file_path`. `hookSpecificOutput.additionalContext` sonuca eklenir.
- **AfterAgent**: `decision:"deny"` + `reason` → `reason` yeni bir prompt olarak modele verilir, otomatik retry. `stop_hook_active` alanı **var**. `continue:false` retry yapmadan durdurur.
- **BeforeAgent**: istem alanı `prompt`. Bağlam ekleme `hookSpecificOutput.additionalContext`. `decision:"deny"` mesajı tarihçeden siler.
- **Modele gitmeden kullanıcıya gösterim**: `systemMessage` — tüm olaylarda ortak, modele hiç gitmez.
- **Claude Code uyumluluğu**: yalnız `CLAUDE_PROJECT_DIR` alias'ı; alan adları paralel ama resmi eşleme yok.

**5. Windows'ta kabuk**
Hook komutları `powershell.exe -NoProfile -NonInteractive -Command <command>` ile koşar; sonuna `; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }` eklenir.

## Kaynaklar
- `%APPDATA%\npm\node_modules\@google\gemini-cli\bundle\docs\hooks\{index,reference,writing-hooks,best-practices}.md`
- `...\bundle\docs\cli\settings.md` (192-197)
- `...\bundle\chunk-MFLFXOVQ.js` (254475-254499, 279729-279734, 361780-361929, 376995-376996)
