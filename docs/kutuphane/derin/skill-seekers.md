# yusufkaraaslan/Skill_Seekers

- lisans: MIT (Yusuf Karaaslan, 2025)
- tür: araç
- kitap sayısı ve yeri: 300 md dosyası; asıl "kitap" tek adet: `skills/skill-seekers/SKILL.md` (skill-builder). Geri kalan md'lerin çoğu `docs/` (kullanıcı kılavuzu, çok dilli README) ve `tests/golden/phase2/*` altında test sabiti olarak üretilmiş SKILL.md kopyaları.
- scan: yok · skip: tümü — raf değil

## Ne işe yarar
Skill Seekers, dokümantasyon sitesi, GitHub deposu, PDF, video, Jupyter defteri gibi 18 kaynak tipini tarayıp Claude/Gemini/OpenAI için AI Skill paketine, ya da RAG hattı (LangChain, Pinecone, Weaviate vb.) için vektör verisine dönüştüren bir Python aracı (MCP sunucusu + 40 araç). Depodaki tek gerçek "kitap" (`skills/skill-seekers/SKILL.md`) kendisi bir raf içeriği değil, bu aracı Claude Code içinden çalıştırmayı öğreten bir yönerge dosyası. `tests/golden/` altındaki 25 SKILL.md ise aracın ürettiği örnek çıktılar, test sabiti amaçlı.

## ??'de ne zaman bulunmalı
- "bu dokümantasyon sitesini skill'e çevir"
- "bir GitHub reposundan Claude skill'i üret"
- "PDF/video'dan RAG için knowledge base çıkar"

## Kalite
Aktif ve güncel (son commit 2026-08-09, PyPI'da 3.9.0, 3900+ test). Özgün bir araç projesi; SKILL.md'leri kopya değil, aracın kendi ürettiği yapılandırılmış çıktılar.

## Karar
fikir notu — depo bir SKILL üretici araç, kütüphaneye konacak sabit bir "kitap" içermiyor; skill-builder SKILL.md'sini Claude Code'a MCP aracı olarak tanıtıyor, dokümandan skill üretimi Teknesyum'un `kutuphane.js`/`agency.js` desenine ilham olabilir.
