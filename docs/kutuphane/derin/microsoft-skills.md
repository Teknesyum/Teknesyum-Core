# microsoft/skills

- lisans: MIT (Copyright Microsoft Corporation)
- tür: skills (Azure SDK'lar ve Microsoft AI Foundry için ajan becerileri)
- kitap sayısı ve yeri: 198 SKILL.md, tümü `.github/plugins/<plugin>/skills/<skill>/SKILL.md` altında; toplam 1533 md dosyası (references/, docs, README dahil)
- scan: `.github/plugins/*/skills/*/SKILL.md` · skip: `.github/plugins/*/skills/*/references/`, `docs-site/`, `tests/`, `.github/agents/`, `.opencode/`

## Ne işe yarar
Azure SDK'ları (özellikle .NET) ve Kusto/KQL için ajan becerileri paketliyor; her SKILL.md kurulum, ortam değişkenleri, kod örnekleriyle tek bir SDK paketini veya KQL operatör grubunu anlatıyor. Ayrıca AGENTS.md şablonları, MCP konfigürasyonları ve `.github/agents/*.agent.md` ajan tanımları içeriyor. Kurulum `npx skills add microsoft/skills` ile seçici (wizard) yapılıyor, elle klonlamak yerine.

## ??'de ne zaman bulunmalı
- "Azure Identity .NET DefaultAzureCredential nasıl kurulur"
- "KQL make-graph ile graph-match nasıl yazılır"
- "Azure OpenAI .NET SDK kimlik doğrulama örneği"

## Kalite
Frontmatter düzenli ve zengin (name, description, license, metadata.author/version/package); description alanları "WHEN:" tetikleyici listeleriyle arama dostu yazılmış. Aktif geliştirilen resmi Microsoft deposu (son commit 2026-09-04), README "Work in Progress" uyarısı taşıyor — kapsam sürekli genişliyor, kod örnekleri güncel SDK sürümlerine bağlı.

## Karar
raf — MIT lisanslı, resmi, frontmatter'lı 198 kitap; Azure/.NET/Kusto işi geldiğinde doğrudan kullanılabilir.
