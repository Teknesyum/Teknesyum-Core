# VoltAgent/awesome-codex-subagents

- lisans: MIT (VoltAgent, 2026)
- tür: araç — Codex özel-ajan tanımları, markdown "kitap" değil
- kitap sayısı ve yeri: 0 md kitap; 174 `.toml` dosyası, 13 `categories/NN-*/` klasöründe
- scan: yok · skip: tamamı (format uyuşmuyor)

## Ne işe yarar
OpenAI Codex CLI'ın `~/.codex/agents/` yerleşimine kopyalanan 174 hazır alt-ajan tanımı sunuyor. Her dosya TOML: `name`, `description`, `model`, `sandbox_mode`, `developer_instructions` alanları — Claude Code'un frontmatter'lı md ajan/skill şemasıyla uyuşmuyor. Kardeş depo awesome-claude-code-subagents'ın (fikir notu almış) Codex'e uyarlanmış paralel sürümü; kategori isimleri ve konu kapsamı neredeyse birebir aynı.

## ??'de ne zaman bulunmalı
- "Codex için hazır ajan var mı" — bu depo eşleşir ama format Claude Code'a taşınmaz
- "backend-developer ajan tanımı nasıl yazılır (Codex)" — örnek olarak referans olabilir, kitap olarak değil
- Genel "subagent koleksiyonu" araması — kardeş depo (md) tercih edilmeli, bu değil

## Kalite
Kardeş depoyla aynı kategori iskeletini taşıyor (13 kategori, ~aynı ajan adları) ama içerik TOML'a ve Codex'in `developer_instructions` alanına özgü yeniden yazılmış; kelimesi kelimesine kopya değil, format dönüşümü. Güncel (son commit 2026-09-07), aktif bakımda.

## Karar
hayır — kitap formatı md/SKILL.md değil, TOML tabanlı Codex ajan tanımları; Claude Code kütüphanesine raf olarak giremez.
