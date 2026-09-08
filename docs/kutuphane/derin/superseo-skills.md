# inhouseseo/superseo-skills

- lisans: Apache License 2.0
- tür: skills
- kitap sayısı ve yeri: 11 SKILL.md, `skills/<isim>/SKILL.md` altında (content-brief, eeat-audit, expert-interview, featured-snippet-optimizer, improve-content, keyword-deep-dive, linkbuilding, page-audit, semantic-gap-analysis, topic-cluster-planning, write-content); her klasörde ek `references/` alt dosyaları var (toplam 135 md)
- scan: skills/*/SKILL.md · skip: skills/*/references/**, demo/

## Ne işe yarar
SEO içerik üretim ve denetim işleri için 11 ayrı beceri sunuyor: anahtar kelime araştırması, içerik brifi, sayfa/E-E-A-T denetimi, link kurma, içerik yazma ve iyileştirme gibi. Her SKILL.md, ajana bir "rol" (kıdemli SEO stratejisti) ve adım adım prosedür (Google'da ara, rakipleri oku, sınıflandır, üret) veriyor. Frontmatter'da name/description standart Claude Code SKILL.md formatında.

## ??'de ne zaman bulunmalı
"yeni makale için içerik brifi hazırla"
"şu sayfayı E-E-A-T açısından denetle"
"şu anahtar kelime için içerik kümesi planla"

## Kalite
Frontmatter düzenli, her SKILL.md kendi içinde tutarlı adım listesi ve "references" ile destekleniyor — şablon kopyası değil, özgün prosedür metni. Son commit 2026-09-03 (v0.2.1), güncel ve bakımlı. İçerik "Google'ı ara, oku, üret" tarzı ajan-otonom akışlara dayanıyor; canlı web erişimi gerektiriyor (WebSearch/WebFetch), Core'un kütüphane modeliyle (statik referans okuma) örtüşmüyor.

## Karar
fikir notu — SEO alanına özgü, Core'un genel kullanıcı tabanına dar; canlı web araması gerektirdiği için "sıfır token'lı statik kitap" modeline tam uymuyor, ileride SEO iş akışı istenirse rafa alınabilir.
