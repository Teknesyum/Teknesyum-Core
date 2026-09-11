# Cursor kanca şeması (2026-09-11)

Sonnet alt ajanı, cursor.com/docs/agent/hooks, 65.661 token, 80 sn. Cevap olduğu gibi:

---

## 1. Dosya yerleri ve format

Öncelik sırası (yüksekten düşüğe): Enterprise (`C:\ProgramData\Cursor\hooks.json` Windows'ta) → Team (bulut, yalnız Enterprise) → **Project**: `<proje-kökü>/.cursor/hooks.json` → **User**: `~/.cursor/hooks.json`.

```json
{
  "version": 1,
  "hooks": {
    "hookName": [
      { "command": "./path/to/script.sh", "type": "command", "timeout": 30, "matcher": "pattern|regex", "loop_limit": 5, "failClosed": false }
    ]
  }
}
```

`version` zorunlu, `1` olmalı. Girdi alanları: `command` (zorunlu), `type` (`"command"` varsayılan, veya `"prompt"`), `timeout` (saniye, verilmezse platform varsayılanı), `loop_limit` (yalnız `stop`/`subagentStop`, `null` = sınırsız, varsayılan 5), `failClosed` (true ise hook hata verirse eylem engellenir), `matcher` (hook tipine göre filtre alanı).

**cwd**: Proje hook'ları proje kökünden çalışır (`.cursor/hooks/script.sh` gibi yaz); kullanıcı hook'ları `~/.cursor/`'dan çalışır (`./hooks/script.sh`).

**Ortam değişkenleri**: `CURSOR_PROJECT_DIR`, `CURSOR_VERSION`, `CURSOR_USER_EMAIL`, `CURSOR_TRANSCRIPT_PATH`, `CURSOR_CODE_REMOTE` (uzak çalışma alanında `"true"`), `CLAUDE_PROJECT_DIR` (Claude uyumluluğu için takma ad). `sessionStart` çıktısındaki `env` alanı o oturumdaki sonraki tüm hook'lara aktarılır.

## 2. Ortak stdin alanları

Her hook temel olarak şunu alır: `conversation_id`, `generation_id`, `model`, `model_id` (opsiyonel), `model_params`, `hook_event_name`, `cursor_version`, `workspace_roots`, `user_email`, `transcript_path`. İstisna: `workspaceOpen` oturum dışı ateşlenir, `conversation_id`/`generation_id`/`model`/`transcript_path` içermez.

## 3. Olaylar

- **sessionStart**: Composer konuşması başlarken. stdin: `session_id`, `is_background_agent`, `composer_mode`. stdout: `env`, `additional_context` — **var**.
- **sessionEnd**: fire-and-forget. stdin: `session_id`, `reason`, `duration_ms`, `is_background_agent`, `final_status`, `error_message?`. stdout `{}`.
- **beforeSubmitPrompt**: kullanıcı mesajı gönderdikten hemen sonra, backend isteğinden önce. stdin: `prompt`, `attachments`. stdout: **`continue: boolean`**, `user_message` (opsiyonel). Belgede bağlama serbest metin ekleyen ayrı bir `additional_context` alanı **bu olayda yok**.
- **preToolUse / postToolUse**: `preToolUse` stdin: `tool_name`, `tool_input`, `tool_use_id`, `cwd`, `agent_message`; stdout: `permission` (`allow|deny`), `user_message?`, `agent_message?`, `updated_input?`. `postToolUse` stdin'e `tool_output`, `duration` eklenir; stdout: `updated_mcp_tool_output?`, `additional_context?`.
- **postToolUseFailure**: stdin'de `failure_type` (`timeout|error|permission_denied`), `is_interrupt`.
- **beforeShellExecution**: stdin: `command`, `cwd`, `sandbox`. stdout: **`permission`** (`allow|deny|ask`), **`user_message`** (kullanıcıya gösterilir), **`agent_message`** (ajana gider). Exit code: `0`=JSON kullan, **`2`=engelle**, diğer=hata, varsayılan fail-open.
- **afterShellExecution**: stdin `command`, `output`, `duration`, `sandbox`; stdout `{}`.
- **beforeMCPExecution / afterMCPExecution**: var.
- **beforeReadFile**: stdin `file_path`, `content`, `attachments`; stdout `permission`, `user_message?`.
- **afterFileEdit**: stdin **`file_path`**, **`edits`** (`old_string`/`new_string` dizisi); stdout `{}`.
- **subagentStart / subagentStop**: stdout `followup_message?` (yalnız `status=completed` iken).
- **stop**: stdin: **`status`** (`completed|aborted|error`), **`loop_count`**. stdout: **`followup_message`** — Claude'daki `decision:block` karşılığı: ajanı yeni bir turla sürdürür, `loop_limit`e (varsayılan 5) tabi. `stop` çıktısında `user_message` alanı **belgede yok**.
- **preCompact**: yalnız gözlemsel. stdout yalnız `user_message?`.
- **afterAgentResponse / afterAgentThought**: gözlemsel, stdout `{}`.

## 4. CLI ve Windows

CLI (`cursor-agent`) aynı hook sistemini kullanır. Windows'ta hangi kabukla çalıştığı belgede yok. Bulut ajanlarında `sessionStart`, `sessionEnd` desteklenmez.

## Kaynaklar
- https://cursor.com/docs/agent/hooks
