# Kuberwastaken/claurst

- GPL-3.0 · CLI (Rust, Claude Code benzeri ajan terminali) · ★10292
- mekanizma: kendi kanca sistemi (4 kanca türü), komut/ajan/skill/MCP eklenti şeması; Core'a kurulan bir eklenti değil, rakip bir çalıştırıcı
- sıradan turda bağlama: Core'a hiç girmez (ayrı program); kendi deposunda AGENTS.md 10235 B
- premium: yok

## Ne yapar
Claude Code'un Rust'ta yeniden yazımı. Asıl değeri `docs/` (15 dosya) ve `spec/` (12 bölüm, toplam 1,28 MB): hooks, plugins, tools, agents, permissions, context/state mimarisi ayrıntılı yazılmış.

## Core'a alınacak
- **kitap** — `docs/hooks.md`: kanca yaşam döngüsü, JSON stdin sözleşmesi, çıkış kodu/engelleme kuralları, async kanca. Core'un kanca yazımı için doğrudan raf malzemesi.
- **fikir** — dört kanca türü: `command` yanında HTTP isteği, LLM istemi ve "agentic verifier". Core bugün yalnız `command` kullanıyor; doğrulayıcı kanca türü fikri kaydedilmeli.
- **fikir** — `spec/07_hooks.md` + `spec/05_..._permissions_design.md`: izin ve kanca etkileşiminin yazılı sözleşmesi.

## Karar
fikir notu — kurulacak bir şey yok, ama `docs/hooks.md` kanca rafına kaynak olarak alınmaya değer.
