# anthropics/skills

- lisans: her skill klasöründe ayrı `LICENSE.txt` — "Proprietary", Anthropic Consumer/Commercial Terms'e bağlı; servis dışına çıkarma, kopya saklama, türetme açıkça yasak
- tür: skills (Claude için SKILL.md formatında yetenek paketleri)
- kitap sayısı ve yeri: 19 SKILL.md, hepsi `skills/<isim>/SKILL.md` altında (pdf, docx, pptx, xlsx, mcp-builder, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, doc-coauthoring, frontend-design, internal-comms, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, academy-guide); toplamda 115 markdown dosyası (referans/ek dosyalarla)
- scan: `skills/*/SKILL.md` · skip: `skills/*/scripts`, `skills/*/schemas` (ISO-IEC29500 xsd'leri Windows'ta dosya adı çok uzun hatası verdi, klonlama kısmi başarısız oldu), `spec/`, `template/`

## Ne işe yarar
Anthropic'in resmi Claude Code / Claude platformu için yayınladığı hazır yetenek paketleri deposu: PDF/DOCX/PPTX/XLSX işleme, MCP sunucu inşası, algoritmik sanat, marka rehberi, iç yazışma gibi konularda frontmatter'lı (name/description/license) SKILL.md dosyaları. Her skill kendi klasöründe scripts, references ve ayrı LICENSE.txt taşıyor. Son commit 2026-09-03, aktif bakımda.

## ??'de ne zaman bulunmalı
- "PDF'den tablo çıkar, sırayla nasıl yapılır" gibi resmi yöntem sorulduğunda
- "MCP server nasıl doğru tasarlanır" (mcp-builder referansı) sorulduğunda
- Yeni bir skill yazarken şablon/konvansiyon örneği aranırken (skill-creator)

## Kalite
Anthropic'in kendi ürünüyle beraber dağıttığı resmi malzeme — özgün ve güncel, kopya değil. Ama içerik "Proprietary" lisanslı: servis dışında saklamak ve türetmek sözleşmeyle yasaklanmış.

## Karar
hayır — her skill'in LICENSE.txt'si servis dışına çıkarmayı ve türetmeyi açıkça yasaklıyor, rafa kopyalamak sözleşmeyi ihlal eder.
