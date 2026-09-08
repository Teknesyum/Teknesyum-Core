# stefanprodan/cctop

- Apache-2.0 · CLI (Bun/TypeScript TUI) · ★139
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; tek program, `src/` 296 KB
- sıradan turda bağlama: 0 KB / ~0 token — Claude Code'a hiçbir şey kurmuyor; salt okuyucu dış araç. Ölçüm: depoda `CLAUDE.md` yok, `.claude-plugin/` yok, kanca yok
- premium: yok

## Ne yapar
Çalışan tüm Claude Code oturumlarını `top` gibi listeler: PID, bellek, meşgul/boşta,
bağlam boyutu, model, proje, dal, son istem, alt ajan ağacı. `~/.claude/projects/<dizin>/
<id>.jsonl` transkriptinin kuyruğunu path+mtime ile önbellekleyerek okur; hiçbir şeye
yazmaz. Yalnız macOS ve Linux (süreç tablosu `libproc`/`/proc`).

## Core'a alınacak
- pasif betik — bağlam boyutu formülü: `input_tokens + cache_read_input_tokens +
  cache_creation_input_tokens` (`src/collect/entry.ts:47`). Core statusline'ı bunu
  transkriptten aynı biçimde çıkarabilir, dış araç gerekmez.
- pasif betik — `CLAUDE_CONFIG_DIR` çözümü ve proje dizini türetmesi
  (`cwd.replace(/[^a-zA-Z0-9]/g, "-")`, `src/collect/paths.ts`). Core'un betikleri
  `~/.claude`'u sabit varsayıyor; override'lı makinede sessizce boş dönüyor.
- fikir — kayıtsız süreçlerin transkript "sahiplenme" kilidi (`claimed` kümesi): aynı
  transkripti iki satırın sahiplenip kopya göstermesini engelliyor.

## Karar
Al — iki küçük formül platformdan bağımsız ve Core'un statusline'ı ile betiklerinde
bugün eksik; aracın kendisi Windows'ta çalışmadığı için yalnız formüller alınır.
