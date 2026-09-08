# dair-ai/Prompt-Engineering-Guide

- lisans: MIT (DAIR.AI, 2022)
- tür: docs
- kitap sayısı ve yeri: 0 uygun kitap — 1099 `.mdx`, yalnız 134'ü `.en.mdx`; ayrıca 12 kök `.md` (README/LICENSE/CLAUDE.md)
- scan: — · skip: tamamı (Next.js/Nextra site kaynağı, frontmatter/SKILL.md yok, import ifadeli JSX-MDX)

## Ne işe yarar
Next.js + Nextra ile derlenen promptingguide.ai sitesinin kaynağı; teknikler (CoT, few-shot, agents, RAG, risks) konu başına `.en.mdx` sayfalara bölünmüş. Dosyalar `import { Screenshot } from '../../components/...'` gibi React bileşen importlarıyla başlıyor, düz markdown değil. Repo kökünde kendi geliştirici `CLAUDE.md`'si var (Obsidian notları, git push kuralı) — bana yönelik değil, siteyi geliştirenlere yönelik.

## ??'de ne zaman bulunmalı
- "chain-of-thought prompting nasıl yazılır" (ama raf değil, referans amaçlı arama)
- "prompt engineering teknikleri özeti nerede"
- "AI agent tasarım desenleri kaynağı"

## Kalite
İçerik özgün ve akademik referanslı (Wei et al. 2022 gibi atıflar), 2026-03 tarihli güncel commit'ler var. Ama format tamamen web-sitesi kaynağı: frontmatter yok, SKILL.md yok, JSX import'ları md okuyucusunu bozar; Claude Code rafına doğrudan taşınabilir tek dosya yok.

## Karar
hayır — Nextra/Next.js JSX-MDX site kaynağı, frontmatter'lı veya başlıklı saf markdown "kitap" formatında değil; raf yapmak için her dosyadan import satırlarını temizlemek gerekir.
