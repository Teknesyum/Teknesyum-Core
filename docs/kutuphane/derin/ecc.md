# affaan-m/ECC

- lisans: MIT (2026, Affaan Mustafa)
- tür: skills (+ agents, commands, hooks, workflows — çok araçlı dev harness)
- kitap sayısı ve yeri: `skills/` altında 286 SKILL.md (kanonik); toplamda 2497 md — aynı 286 kitap `.agents/skills`, `.cursor/skills`, `.kiro/skills` içine ve `docs/{es,ja-JP,ko-KR,tr,zh-CN,zh-TW}/skills` altına dil/araç başına kopyalanmış
- scan: `skills/` · skip: `.agents/skills`, `.cursor/skills`, `.kiro/skills`, `docs/*/skills` (hepsi `skills/`in kopyası, sadece araç veya dil değişiyor)

## Ne işe yarar
ECC ("agent harness operating system"), Claude Code / Cursor / Kiro / Codex gibi çoklu ajan araçları için ortak bir skill+agent+hook seti sağlayan mono-repo. `skills/` altındaki 286 dosya frontmatter'lı (`name`, `description`, opsiyonel `argument-hint`, `metadata.origin: ECC`) gerçek SKILL.md formatında — TDD, API tasarımı, dil/framework kalıpları (React, Rust, Go, Django...), güvenlik taramaları, ajan orkestrasyonu gibi geniş bir yelpaze. Aynı içerik proje kökünde tekrar tekrar farklı araç klasörlerine ve dillere kopyalanmış, tek kaynak `skills/` gibi görünüyor.

## ??'de ne zaman bulunmalı
- "TDD iş akışı için hazır bir skill var mı"
- "REST API tasarım kuralları için referans skill ara"
- "Çoklu-ajan orkestrasyon (agent-sort, council, team-builder) için örnek skill bul"

## Kalite
Depo aktif ve güncel (son commit 2026-09-07, "ECC 2.2.1 maintenance patches"); geniş katkı altyapısı (CONTRIBUTING, CODE_OF_CONDUCT, güvenlik politikası) özgün ve bakımlı bir proje izlenimi veriyor. İçerik hacmi yüksek ama %90'ı aynı 286 dosyanın araç/dil kopyası — kütüphaneye "kaynak" olarak yalnız `skills/` alınmalı, geri kalanı gürültü.

## Karar
raf — 286 kitaplık gerçek SKILL.md seti, frontmatter'ı düzgün, `skills/` tek dizinden taranabilir.
