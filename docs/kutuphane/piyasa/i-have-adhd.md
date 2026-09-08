# ayghri/i-have-adhd

- MIT · plugin (Claude Code + Codex + Gemini + opencode) · ★28885
- mekanizma: 2 skill, 1 kanca (SessionStart; node/sh/ps1 üç sürüm), 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: kanca bayrak dosyası yoksa 0 B; iki skill frontmatter'ı 548 B (~137 token). Bayrak varsa SKILL.md gövdesi 6953 B (~1700 token) tek seferde basılır.
- premium: yok

## Ne yapar
ADHD okuyucusu için çıktı biçimini zorlar: önce bir sonraki eylem, çok adımlı işi numarala, durumu her turda yenile, teğetleri bastır, süre tahmini ver. `/i-have-adhd` ile açılır, "stop adhd mode" ile kapanır.

## Core'a alınacak
- kanca (mekanizma): `hooks/always-on.mjs` — `$CLAUDE_CONFIG_DIR/.i-have-adhd-always` bayrak dosyası yoksa `exit 0`, varsa SKILL.md gövdesini frontmatter'ı sıyırıp stdout'a basar. Core'un "sıradan turda sıfır" ilkesinin dosya-bayraklı biçimi; `pp` önekine kalıcı alternatif.
- fikir: skill yolunu `CLAUDE_PLUGIN_ROOT` env'ine değil, `import.meta.url`e göre çözüyor ("güvenilmeyen env değişkeni" gerekçesi yorumda yazılı) — Core kancaları için de doğru refleks.
- kitap: `disable-model-invocation: true` frontmatter'ı — skill listede görünür ama model kendiliğinden çağıramaz; Core'un pasif raf mantığının resmi karşılığı.

## Karar
Al · bayrak dosyası + `exit 0` deseni Core'un ilkesini birebir uyguluyor ve maliyeti ölçülü (0 B / 1700 token).
