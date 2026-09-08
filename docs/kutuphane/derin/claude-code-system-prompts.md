# Piebald-AI/claude-code-system-prompts

- lisans: MIT (Piebald LLC, 2025) — içerik Anthropic'in Claude Code ikilisinden ters
  mühendislikle çıkarılmış kendi sistem promptları; telif durumu belirsiz/tartışmalı.
- tür: docs (ters mühendislik dökümü — skill/agent/tool/system-reminder promptlarının ham metni)
- kitap sayısı ve yeri: 697 md dosyası, tek klasörde: `system-prompts/` (694 dosya) + kök
  `README.md`, `CHANGELOG.md`. `tools/` klasörü kitap değil, çıkarma script'i (`updatePrompts.js`).
- scan: `system-prompts/` (`skill-*.md` alt kümesi ~46 adet) · skip: `tools/`, `CHANGELOG.md`

## Ne işe yarar
Claude Code'un (v2.1.263) 500+ iç prompt parçasını — agent promptları, tool açıklamaları,
skill metinleri, system-reminder'lar — dakikalar içinde güncellenen minify JS'den çekip
tek tek md dosyasına döküyor. Her dosya HTML-comment içinde name/description/ccVersion
taşıyor (YAML frontmatter değil, SKILL.md yok), gövde `${VAR}` şablon değişkenleriyle dolu
ham kaynak — bağımsız okunacak dokümantasyon değil.

## ??'de ne zaman bulunmalı
- "Claude Code'un code-review prompt'u nasıl çalışıyor"
- "artifact skill'inin tam metnini göster"
- "Claude Code'un şu sürümde ne değişmiş" (CHANGELOG.md)

## Kalite
Güncel (2026-09-05, v2.1.263, dakikalar içinde senkron) ve teknik olarak doğru görünüyor
ama özgün içerik değil — Anthropic'in kendi ürününden izinsiz çıkarılmış ham string dökümü;
`${VAR}` placeholder'ları ve HTML-comment metadata yüzünden doğrudan kullanılabilir "kitap"
formatında değil, referans/arşiv niteliğinde.

## Karar
hayır — raf kriterine uymuyor (SKILL.md/frontmatter yok, ham şablon metni, telif riski taşıyan ters mühendislik dökümü); fikir notu olarak CHANGELOG.md takibi ileride işe yarayabilir.
