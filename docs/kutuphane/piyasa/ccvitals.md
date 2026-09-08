# educlopez/ccvitals

- MIT · plugin (marketplace) + Homebrew/git kurulum · ★9
- mekanizma: 1 kanca betiği (`ccvitals-hook.sh`, 145 satır; 5 olay: SessionStart,
  MessageDisplay, TaskCreated, PostCompact, Stop), 2 komut (`setup.md` 6,5 KB,
  `configure.md` 13,2 KB), 0 ajan, 0 skill, 0 MCP; `statusline.sh` 2238 satır saf bash
- sıradan turda bağlama: 0 KB — `.claude-plugin/plugin.json` yalnız iki komut bildiriyor,
  CLAUDE.md yok, skill yok; kanca stdout'a hiçbir şey yazmıyor (kendi başlığındaki kural:
  "Never print to stdout"), statusline çıktısı modele değil terminale gidiyor. Komutlar
  çağrılınca ~5k token, sıradan turda 0.
- premium: yok

## Ne yapar

Claude Code statusline'ı: kullanım kotası, bağlam penceresi, maliyet, git durumu. Saf bash
+ jq, Node yok. Kanca oturum başına `~/.claude/.ccvitals-state/<session_id>.json` yazıyor
(atomik `.tmp` + `mv`), statusline bu bayat-ama-taze-yenilenen önbelleği okuyor, bu yüzden
prompt'u hiç bloklamıyor.

## Core'a alınacak

- fikir: `subagent-statusline.sh` — Claude Code'un `subagentStatusLine` sözleşmesi
  (stdin'de `tasks[]`: id, name, status, tokenCount; stdout'a görev başına bir JSON satır).
  Core'un statusline'ı yalnız ana oturumu gösteriyor; alt ajan başına token satırı bench
  kolları için doğrudan işe yarar.
- pasif betik: kanca disiplini kalıbı — `set +e`, jq yoksa sessiz çık, her yolda exit 0,
  atomik yazım. Core kancaları da aynı sözü veriyor; 145 satırlık bu dosya sınanmış hali.
- fikir: durum dosyasını oturum kimliğiyle ayırma; Core'un handoff/sayaç durumu şu an
  proje köküne bağlı, oturum başına ayrım çakışmayı bitirir.

## Karar

Fikir notu — statusline zaten var; alınacak olan alt-ajan satırı sözleşmesi ile kanca
disiplini kalıbı, ürünün kendisi değil.
