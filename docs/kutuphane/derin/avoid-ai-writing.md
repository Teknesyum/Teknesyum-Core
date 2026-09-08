# conorbronsdon/avoid-ai-writing

- lisans: MIT (Conor Bronsdon, 2026)
- tür: skills
- kitap sayısı ve yeri: kök `SKILL.md` (tek dosya kural seti, `dist/avoid-ai-writing.md`) + çok kopyalı skill ağacı: `skills/avoid-ai-writing/SKILL.md`, `skills/avoid-ai-writing-router/SKILL.md`, `skills/ai-writing-detector/SKILL.md`, `skills/false-positive-reviewer/SKILL.md`, `skills/file-edit-in-place/SKILL.md`, `skills/preservation-verifier/SKILL.md`, `skills/voice-preserving-rewriter/SKILL.md`, ayrıca `plugins/avoid-ai-writing/skills/avoid-ai-writing/SKILL.md` (plugin paketlemesi için aynı içeriğin tekrarı). Toplam 38 md dosyası, çoğu aynı içeriğin üç farklı yerleşimde (kök, skills/, plugins/) kopyası.
- scan: `SKILL.md`, `references/patterns.md`, `skills/*/SKILL.md` · skip: `.agents/`, `.claude-plugin/`, `.codex-plugin/`, `plugins/` (kök ile yinelenen), `corpus/`, `dist/`, `submission/`, `cursor-rules/`

## Ne işe yarar
AI yazı kalıplarını ("AI-ism") tespit edip düzeltmek için bir yazı-kalitesi becerisi; detect / rewrite / edit-in-place üç mod sunuyor. 74 kalıp kategorisi ve 112 kelime değişim tablosu referans dosyasında (`references/patterns.md`) tutuluyor, SKILL.md sadece giriş noktası. Router, false-positive-reviewer, preservation-verifier gibi yardımcı alt skill'lerle çok parçalı bir sistem kurmuş.

## ??'de ne zaman bulunmalı
- "bu metni AI gibi durmaktan çıkar"
- "yazımı insan sesine yakınlaştır, AI-ism temizle"
- "içeriği AI kalıpları için denetle, düzeltme"

## Kalite
Özgün ve güncel: son commit 2026-09-06, versiyon 3.33.2, akademik kaynaklara (Stanford/Patterns 2023, BFI 2025, arXiv 2506.07001) atıfla dengeli bir duruş sergiliyor — "sinyal, kanıt değil" diyerek aşırı iddiadan kaçınıyor. Ancak depo kendi içinde ciddi tekrar taşıyor: aynı SKILL.md içeriği en az üç konumda (kök, `skills/`, `plugins/`) kopyalanmış.

## Karar
raf — MIT lisanslı, tek amaçlı, iyi belgelenmiş yazı-denetim becerisi; sadece kök `SKILL.md` + `references/patterns.md` alınmalı, kopya klasörler atlanmalı.
