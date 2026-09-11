# Danışma 029 girdi: Cursor, Codex ve akrabalar için Teknesyum Core

Fable'a gönderilen metin olduğu gibi:

---

Sen Teknesyum Core'un karar ortağısın. Cevabın Türkçe, en çok 600 kelime. Gerekirse web'de
araştır (Cursor hooks, OpenAI Codex CLI hooks/AGENTS.md, Gemini CLI, Windsurf); her iddiaya
kaynak ver, doğrulayamadığını "doğrulanmadı" diye yaz.

## Kullanıcının düşüncesi (kendi sözleri)

"cursor içinde bi versiyon üretelim şeklinde düşünüyorum fable değerlendirsin bu düşüncemi
komple ayrı bir release mi lazım yoksa sadece bir kaç dosyanın değiştiği modifiye sistem mi
cursor codex vb gibi akrabalarımıza da uyumlu hale getirmek istiyorum ancak claude daki
bannerdan vazgeçmeyeceğiz tabiki"

## Core bugün

Claude Code eklentisi, marketplace'ten kurulur (`claude plugin install teknesyum-core@teknesyum`),
v0.32.0. Altın kural: sıradan tur modelin bağlamına 0 bayt ekler.

- `core/hooks/hooks.json`: SessionStart, PostToolUse, PostToolUseFailure, Stop → `count.js`;
  PreToolUse Bash|PowerShell → `yasak.js` (tehlikeli komut denylist), `loop.js` (sınırsız bekleme);
  PreToolUse Agent → `scout.js`; Stop → `dur.js` (kanıt kapısı + iş kapısı, `decision:block`);
  SessionEnd → `handoff.js` (`.claude/handoff.md`); Notification → `notify.js`;
  UserPromptSubmit → `mod.js` (`??` `++` `pp` `aa` `ff` işaretleri, `.claude/jobs.md` geri verme);
  MessageDisplay → `bant.js`.
- Banner kanalı: kancalar satırı `~/.claude/teknesyum/banner-<oturum>.json` kuyruğuna yazar,
  `bant.js` MessageDisplay'in `displayContent`'i ile mesajın üstüne çizer; modelin bağlamına
  girmez, 0 token. `systemMessage`/`additionalContext` ile banner yasak (Standing law).
- `core/hooks/lib.js`: ortak durum (`stateFile`, `say`, `setting`, `t` çeviri), `core/strings.json` en/tr.
- `core/scripts/`: statusline.js, kutuphane.js (raf kataloğu), advice.js, agency.js, release.js,
  setup.js, doctor.js, map.js, procs.js vb. Hepsi düz node, modelsiz.
- Kullanıcı kuralları `~/.claude/CLAUDE.md` ve `~/.claude/teknesyum/yordam.md`'de.
- Test: `npm test`, 392 vaka.

## Cursor hakkında bildiğimiz (sonnet araştırması, 2026-09-11)

Cursor 1.7'den beri `.cursor/hooks.json`: sessionStart, beforeSubmitPrompt, preToolUse /
beforeShellExecution, postToolUse, stop, sessionEnd, preCompact. Alan adları farklı
(`permission: allow/deny/ask`). MessageDisplay karşılığı yok. Cursor CLI AGENTS.md ve CLAUDE.md'yi
okur. `/statusline` var, format farklı. Alt ajan `.cursor/agents/`, Agent aracıyla (model seçimi)
uyuşmuyor. Marketplace yok. Cursor içinde resmi Claude Code VS Code eklentisi de kurulabiliyor;
onun Claude Code kancalarını kullanıp kullanmadığı doğrulanmadı.

## Senden istenen

1. Tek bir çekirdek + ince adaptörler (ör. `adapters/cursor/hooks.json` + olay/alan eşleyici)
   mi, yoksa ayrı bir dağıtım/release mı? Hangisi, neden. "Birkaç dosya" gerçekçi mi; hangi
   dosyalar çekirdek kalır, hangileri adaptöre gider?
2. Hangi Core özellikleri Cursor'a, hangileri Codex CLI'ya taşınır, hangileri taşınamaz?
   (banner, iş kapısı `dur.js`, denylist, döngü, devir, işaretler, statusline, kütüphane)
3. Claude'daki banner kalacak. MessageDisplay olmayan yerde kullanıcıya satırı 0 token
   gösteren bir yol var mı (ör. Cursor'un stop çıktısı, bildirim, statusline)? Yoksa o
   hostta banner sessizce kapansın mı?
4. Sürümleme: tek sürüm numarası ve tek depo mu, host başına ayrı paket mi? Kurulum nasıl
   (Cursor'da marketplace yok)?
5. Sıfır token kuralı her hostta korunabilir mi; hangi hostta kural kırılır?
6. İlk adım olarak ne yapılmalı ve neyi ölçerek "çalışıyor" diyeceğiz? Hangi sıra?

Cevabın sonunda tek satır karar: "Tek çekirdek + adaptör" ya da "Ayrı release", gerekçesiyle.
