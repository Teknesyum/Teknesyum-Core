# Danışma 029: Cursor, Codex ve akrabalar için Teknesyum Core

Fable, web araması ve depo okuması, 65.994 token, 69 sn. Girdi:
[029-fable-cursor-codex-girdi.md](029-fable-cursor-codex-girdi.md). Cevap olduğu gibi:

---

**Karar özeti:** tek çekirdek, ince adaptör. Ayrı release iki sürüm numarası, iki test seti ve her düzeltmenin iki kez yapılması demek; Core'un mantığı zaten host'tan bağımsız düz node (`lib.js` durum/kilit/kuyruk/çeviri, `count`, `yasak`, `loop`, `dur`, `mod`, `handoff`). Host'a bağlı olan yalnız üç şey: olay adları, alan adları (`hook_event_name`, `tool_name`, `permissionDecision`), ve `${CLAUDE_PLUGIN_ROOT}` / `CLAUDE_CODE_SESSION_ID` ortam değişkenleri.

**1. Dosya bölüşümü.** Çekirdek kalır: `core/hooks/*.js` gövdeleri, `core/scripts/*`, `strings.json`. Adaptöre gider: `adapters/<host>/hooks.json` (olay haritası) ve tek bir `core/hooks/host.js` çeviri katmanı: gelen JSON'u Claude şemasına normalize eder (`beforeShellExecution` → `PreToolUse/Bash`, `permission:"deny"` ← `permissionDecision:"deny"`), oturum kimliğini host'un verdiği alandan alır. "Birkaç dosya" gerçekçidir ama dürüst sayı: `hooks.json` başına bir, `host.js` bir, `lib.js`'de `sessionId()`/`configRoot()` dallanması, `setup.js`'e kurulum yolu. Yaklaşık 4-5 dosya, artı testler.

**2. Taşınabilirlik.**
- Cursor: denylist (`beforeShellExecution` → `permission:"deny"` + `user_message`), döngü (`loop.js` aynı olay), sayaç (`postToolUse`), işaretler (`beforeSubmitPrompt` var; prompt'u değiştirebildiği doğrulanmadı), devir (`sessionEnd`). İş kapısı `dur.js`: Cursor `stop` olayında `decision:block` karşılığı olup olmadığı doğrulanmadı; yoksa kapı yalnız uyarır, durduramaz. Statusline: Cursor'un formatı farklı, `bridge.js` ayrı çıktı üretir. Kütüphane: düz script, taşınır. Scout (`Agent` aracı): `.cursor/agents/` modeli uyuşmuyor, taşınmaz.
- Codex CLI: hooks deneysel, varsayılan kapalı, **Windows'ta yok** (v0.114, Mart 2026; `[features] codex_hooks = true`). Senin masaüstü Windows olduğuna göre Codex adaptörü bugün fiilen çalışmaz; yalnız `notify` (tur bitince tetik) ve `AGENTS.md` var. Codex'e ancak `AGENTS.md` metniyle "yumuşak" Core gider: kurallar okunur, kapı yok.
- Gemini CLI: `BeforeTool/AfterTool` regex matcher'lı, `~/.gemini/settings.json`; şema Claude'a en yakın olan, denylist ve sayaç doğrudan taşınır. Windsurf: araştırmadım, doğrulanmadı.

**3. Banner.** MessageDisplay'in eşi hiçbir hostta yok. Cursor'da 0 token'a en yakın kanal `user_message` alanı: istemciye gösterilir, ajana `agent_message` gitmez. Ama yalnız `beforeShellExecution` ve `stop`'ta gösterildiği belgeli; her olayda değil. Öneri: banner satırı çekirdekte kuyruğa yazılmaya devam etsin (`say`), boşaltan taraf host'a göre değişsin: Claude'da `bant.js`, Cursor'da bir sonraki `beforeShellExecution`/`stop`'ta `user_message` ile toplu. Hiç kanalı olmayan hostta banner sessiz kapanır; kuyruk dosyada kalır, `doctor.js` okuyabilir. Claude'daki banner değişmez.

**4. Sürümleme.** Tek depo, tek sürüm numarası; `release.js` her adaptörü aynı tag'e paketler. Kurulum: Cursor'da marketplace yok, `setup.js --host cursor` depo `.cursor/hooks.json`'ını yazar ve `~/.cursor/` altına klonu/gerekli yolu koyar. `~/.claude/teknesyum/` durum klasörü hostlar arası ortak kalırsa statusline ve raf sayıları tek yerde toplanır; `configRoot()` host'a göre kök seçer, `stateFile` aynı kalır.

**5. Sıfır token.** Claude: korunur. Cursor: `user_message` ajana gitmediği sürece korunur; `agent_message` kullanılırsa kırılır, kural "adaptör `agent_message` yazmaz". Codex: hooks yoksa kural anlamsız, `AGENTS.md` satırları zaten her tur okunur; orada kural kırılır ve bunu açıkça yazmalı. Gemini: `BeforeTool` çıktısının modele dönüp dönmediği doğrulanmadı.

**6. İlk adım ve ölçü.** Sıra: (a) `host.js` normalize katmanı + mevcut 392 test kırılmadan Claude yolu (ölçü: `npm test` yeşil, hook süresi değişmedi). (b) Cursor adaptörü, yalnız `yasak` + `count` + `loop` (ölçü: `rm -rf` denemesi Cursor'da reddedilir ve `user_message` görünür; sayaç dosyası aynı `stateFile`'a yazar). (c) `stop`'ta banner boşaltma ve `dur.js` denemesi; `decision:block` yoksa uyarı moduna düşer. (d) Gemini, aynı üçlü. Codex: bekler; hooks Windows'a gelene kadar yalnız `AGENTS.md` şablonu.

**Karar: Tek çekirdek + adaptör.** Gerekçe: host'a bağlı yüzey üç alanla sınırlı, kod gövdeleri ortak; ayrı release her düzeltmeyi ikiye katlar, ince adaptör ise yalnız çağrıldığında maliyet üretir.

Kaynaklar: https://cursor.com/docs/hooks · https://blog.gitbutler.com/cursor-hooks-deep-dive · https://developers.openai.com/codex/config-advanced · https://github.com/openai/codex/blob/main/docs/config.md · https://geminicli.com/docs/hooks/reference/
