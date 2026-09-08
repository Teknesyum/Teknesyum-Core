# danielmiessler/fabric

- lisans: MIT (kök `LICENSE`)
- tür: prompts (LLM sistem komutları, Go CLI ile çalıştırılıyor)
- kitap sayısı ve yeri: 256 klasör, `data/patterns/<ad>/system.md` (bazılarında ek `user.md`, 25'inde `README.md`)
- scan: `data/patterns/*/system.md` · skip: `user.md`, `README.md`, kök `README.md`/`CHANGELOG.md`, tüm Go kaynağı

## Ne işe yarar
Fabric, metni bir "pattern" (system.md) ile LLM'e besleyip özetleme, iddia analizi, bilgi çıkarma gibi işler yaptıran bir Go CLI'sı. `system.md` dosyaları frontmatter'sız, doğrudan LLM'e "sen ... yapan bir uzmansın, şu adımları izle" diyen ham talimat metinleri — insan okuması için değil, model girdisi olarak yazılmış. Klasör adı pattern'in kimliği (örn. `summarize`, `extract_wisdom`, `analyze_claims`).

## ??'de ne zaman bulunmalı
Bulunmamalı — bu bir uzmanlık kitabı değil, LLM prompt şablonu deposu.
"fabric pattern'i nasıl çalışır" gibi bir soru gelse bile içerik `??` kütüphanesinin aradığı türden değil.

## Kalite
Pattern'ler özgün ve güncel (repo 2026-09-07'de commit almış, aktif bakımda). Ama format 233/255 dosyada frontmatter içermiyor — düz "IDENTITY and PURPOSE" başlıklı prompt metni. İçerik bir konuda insana bilgi/rehber vermek için değil, modele rol ve çıktı formatı dikte etmek için yazılmış.

## Karar
hayır — bunlar frontmatter'lı bilgi kitapları değil, LLM'e beslenen ham sistem promptları; `??` kütüphanesinin okuma modeliyle uyuşmuyor.
