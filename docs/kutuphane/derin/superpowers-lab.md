# obra/superpowers-lab

- lisans: MIT (Jesse Vincent, 2025)
- tür: skills
- kitap sayısı ve yeri: 4 SKILL.md, `skills/` altında dört klasörde (finding-duplicate-functions, mcp-cli, using-tmux-for-interactive-commands, windows-vm)
- scan: `skills/*` · skip: `.claude-plugin/`, kök `README.md`/`CHANGELOG.md`

## Ne işe yarar
Jesse Vincent'ın "Superpowers" ekosisteminin deneysel şubesi; henüz olgunlaşmamış dört teknik barındırıyor. finding-duplicate-functions çok fazlı (extract→categorize→detect→report) bir haiku/opus alt-ajan hattıyla LLM kaynaklı kod tabanlarında anlamsal kopya fonksiyon avlıyor. mcp-cli, MCP sunucularını kalıcı entegrasyon kurmadan `mcp` CLI'siyle keşfetmeyi öğretiyor; windows-vm ve tmux-for-interactive-commands ise sırasıyla Windows VM ve tmux ile etkileşimli komutları yönetmeyi anlatıyor.

## ??'de ne zaman bulunmalı
Kod tabanında yinelenmiş yardımcı fonksiyonları bulmam lazım, nasıl tespit ederim
MCP sunucusunu tek seferlik denemek istiyorum, context'i şişirmeden nasıl yaparım
Windows VM üzerinde interaktif komut çalıştırma / tmux ile uzun süren komutları yönetme yöntemi ne

## Kalite
Her SKILL.md düzgün frontmatter (name/description) taşıyor, adımlar somut betik/prompt dosyalarına bağlanıyor — iskelet değil, çalışır plan. "-lab" adı ve son sürümün (v0.5.0, 2026-06-01) bir beceriyi kaldırmış olması deneysel/taşınabilir olduğunu gösteriyor; olgun superpowers deposunun ayrı, kararlı bir sürümü var.

## Karar
raf — MIT lisanslı, frontmatter'lı gerçek SKILL.md'ler; dar ama net kapsamlı dört teknik, düşük risk taşıyor.
