# xu-xiang/everything-claude-code-zh

- MIT · plugin (marketplace.json + plugin.json, `install.sh`) · ★1935
- mekanizma: 14 kanca girdisi (PreToolUse 6, PostToolUse 6, SessionStart/End, PreCompact, Stop), 35 komut, 14 ajan, 58 skill, mcp-configs klasoru
- sıradan turda bağlama: CLAUDE.md 2,9 KB + 58 skill'in `name`+`description` satirlari 11,9 KB = ~14,8 KB; Cince metin oldugu icin ~6-7k token. Sayim: `wc -c` CLAUDE.md ve tum SKILL.md frontmatter description satirlari.
- premium: yok

## Ne yapar
affaan-m/everything-claude-code'un Cince cevirisi: ajan, skill, kanca, komut, kural ve MCP ayarlarindan olusan tam bir Claude Code kurulumu. Kancalar tmux disinda dev server'i engeller, edit sonrasi format/typecheck calistirir, oturum durumunu SessionStart/SessionEnd'de diske yazar, `continuous-learning-v2/hooks/observe.sh` her arac kullanimini async kaydeder.

## Core'a alınacak
- fikir: `suggest-compact.js` — Edit|Write sayaci belli araliga gelince "simdi sikistir" diye tek satir uyarir. Core'un dosya sayaci ile ayni desen, farkli esik; ucuz.
- fikir: `doc-file-warning.js` — Write kancasi standart disi dokuman dosyasi uretimini uyarir (exit 0). Core'un "olu dosya yok" kuralinin makine karsiligi.
- kitap: kanca envanteri — 14 kancanin olay/matcher dagilimi, `async: true` + `timeout` kullanimi ve `${CLAUDE_PLUGIN_ROOT}` yolu; kanca yazarken bakilacak ornek katalog.

## Karar
fikir notu — 58 skill'in tanimi her turda ~6-7k token bagliyor, Core'un sifir-token ilkesine ters; yalniz iki kanca deseni ve kanca katalogu alinir.
