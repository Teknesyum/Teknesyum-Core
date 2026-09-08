# ThibautMelen/agentic-ai-systems

- MIT · metin paketi (kurulum yok, salt depo) · ★304
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; 45 Markdown + 8 `*.nika.yaml` desen dosyası, CI ile doğrulanıyor (`check.yml`).
- sıradan turda bağlama: 0 B — `.claude-plugin/`, `hooks/`, `CLAUDE.md` yok; hiçbir şey yüklenmiyor. Sayım: `find -type f` (70 dosya) + `du --exclude=.git` = 520 KB, tamamı istenince okunan pasif metin.
- premium: yok.

## Ne yapar
Anthropic'in "Building Effective Agents" taksonomisini (zincirleme, yönlendirme, paralel, orkestratör, değerlendirici) çalışır örneklerle anlatır ve 2024 sonrasını haritalar: bağlam mühendisliği, Agent Skills, AGENTS.md, harness mühendisliği. Her iddia tarihli ve kaynaklı. `implementation/components/` altında subagent, komut, skill, kanca için ayrı birer sayfa.

## Core'a alınacak
- kitap: `foundations/what-changed-2026.md` — alt ajanı "küçük çalışan" değil bağlam yalıtımı olarak konumlandıran, kaynaklı özet. Core'un raf mantığına doğrudan uyar.
- kitap: `implementation/components/{hook,skill,slash-command,subagent}.md` — dört mekanizmanın ne zaman hangisi olduğu, tablo halinde.
- fikir: desenleri CI ile doğrulama (`check.yml`) — Core'un `bench/` tarafına örnek.

## Karar
Al — kurulum sıfır, bağlama sıfır, içerik tam olarak Core'un pasif kütüphanesinin aradığı mekanizma odaklı metin.
