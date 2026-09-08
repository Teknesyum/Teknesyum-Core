# wondelai/skills

- MIT · plugin marketplace (10 koleksiyon) + taşınabilir skill · ★2125
- mekanizma: 0 kanca, 0 komut, 0 ajan; 65 skill (14'ü "metaskill"), depoda 196 SKILL.md
  (Claude/Codex/Cursor/Windsurf aynaları dahil)
- sıradan turda bağlama: tüm SKILL.md frontmatter'ları 165,6 KB (~41k token); tek koleksiyon
  kurulursa ~8 KB (~2k token). Ölçüm: 196 dosyanın `---` blokları toplandı.
- premium: yok (skills.wondel.ai kataloğu ücretsiz)

## Ne yapar
Çok satan iş/UX/pazarlama/kod kitaplarını (Clean Code, Blue Ocean, Contagious, 37signals)
skill'e çeviriyor. Metaskill'ler bunları faz faz sıraya koyup kullanıcıya karar sorusu soruyor
ve yolculuğun durumunu projenin `docs/` klasöründe tutuyor.

## Core'a alınacak
- fikir: metaskill durumunu `docs/` altında tutmak — oturum ölse de yolculuk sürüyor;
  Core'un `docs/plan.md` + `handoff.md` ikilisinin aynı sorunu çözen hali, faz/karar alanları var.
- fikir: kitaptan rafa dönüştürme disiplini — bir kitabın çerçevesi tek dosyada, uygulama
  soruları ayrı; Core kütüphanesinin 14 rafında biçim standardı yok.
- hiç: 65 skill'in kendisi; tek koleksiyon bile ~2k token sabit yük getiriyor.

## Karar
hayır — içerik alan bilgisi, Core'un konusu değil; iki biçim fikri dışında alınacak yok.
