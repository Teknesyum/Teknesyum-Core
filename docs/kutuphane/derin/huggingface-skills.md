# huggingface/skills

- lisans: Apache License 2.0
- tür: skills
- kitap sayısı ve yeri: 25 (`skills/*/SKILL.md`) + 1 (`hf-mcp/skills/hf-mcp/SKILL.md`) = 26
- scan: skills, hf-mcp/skills · skip: apps, assets, .github, .claude-plugin, .cursor-plugin, scripts, agentsmd

## Ne işe yarar
Hugging Face'in resmi Claude Skills deposu; `hf` CLI, Spaces, Datasets, Gradio, ZeroGPU, model eğitimi (LLM/vision/sentence-transformers/TRL) ve SageMaker gibi HF ekosistemi görevleri için standart frontmatter'lı (name/description) SKILL.md dosyaları içerir. Her kitap tek bir alt görevi kapsar (ör. `hf-cli`, `huggingface-spaces`, `huggingface-datasets`) ve description alanı tetikleyici anahtar kelimeleri açıkça listeler. Depo ayrıca apps/ altında liderlik tabloları ve hf-mcp/ altında MCP entegrasyonu barındırır, bunlar raf dışı.

## ??'de ne zaman bulunmalı
- "hf cli ile model nasıl indiririm" / "huggingface-cli komutları"
- "hugging face spaces'e nasıl gradio app deploy ederim, zerogpu"
- "hugging face dataset viewer api ile satır filtreleme / parquet indirme"

## Kalite
İçerik özgün ve HF'nin kendi ekibi tarafından üretilmiş (huggingface_hub sürüm numarasıyla otomatik üretilen `hf-cli` dahil); genel LLM bilgisi tekrarı değil, CLI komut listeleri ve gerçek API endpoint'leri gibi somut olgular içeriyor. Son commit 2026-09-03, güncel ve aktif bakımlı.

## Karar
raf — 25+ kitap, standart frontmatter, HF ekosistemiyle çalışan sorgularda doğrudan isabetli ve güncel.
