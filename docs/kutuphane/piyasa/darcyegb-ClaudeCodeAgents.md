# darcyegb/ClaudeCodeAgents

- MIT · metin paketi (kök dizinde 6 ajan .md dosyası, elle kopyalanır) · ★761
- mekanizma: 6 ajan tanımı (Jenny, karen, claude-md-compliance-checker, code-quality-pragmatist, task-completion-validator, ui-comprehensive-tester, ultrathink-debugger), 0 kanca/komut/skill/MCP; toplam 9 dosya
- sıradan turda bağlama: ajanlar `~/.claude/agents/` altına kopyalanırsa yalnız frontmatter'ları yüklenir (~6 × 200 B ≈ 300 token); kopyalanmazsa sıfır
- premium: yok

## Ne yapar
QA odaklı altı ajan kişiliği. Jenny uygulamanın spesifikasyonla eşleşip eşleşmediğini bağımsız doğruluyor, Karen "gerçeklik denetimi" yapıyor, claude-md-compliance-checker değişikliği projenin CLAUDE.md kurallarına karşı sınıyor, code-quality-pragmatist aşırı mühendisliği avlıyor.

## Core'a alınacak
- fikir: `claude-md-compliance-checker` — Core'un kendi CLAUDE.md/AGENTS.md kurallarına (yorum yazma, Türkçe, trash'e taşı) karşı diff'i sınayan pasif bir kontrol; kanca değil, istenince koşan betik olabilir.
- kitap: "aşırı mühendislik" belirti listesi (gereksiz soyutlama, erken optimizasyon, kullanılmayan esneklik) — kısa ve olgusal, rafa sığar.
- hayır: ajan olarak kurulması; Core hiçbir şeyi ajan olarak kurmuyor.

## Karar
Fikir notu — içerik iyi ama kurulum biçimi (6 ajan) ilkeye aykırı; CLAUDE.md uyum denetimi pasif betik olarak alınabilir.
