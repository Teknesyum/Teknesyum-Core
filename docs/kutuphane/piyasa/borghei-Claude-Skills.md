# borghei/Claude-Skills

- MIT + Commons Clause (ticari kullanım kısıtlı) · plugin demetleri (`bundles/`) + CLI · ★723
- mekanizma: 369 SKILL.md, 85 ajan, 28 komut, 2 kanca dosyası, 0 MCP; 3.825 dosya; depo içi CLAUDE.md toplamı 155 KB
- sıradan turda bağlama: skill frontmatter 15.164 B + ajan frontmatter 29.681 B = 44,8 KB ≈ 11.200 token; demet başına kurulum bunu bölüyor (`bundles.json` ile c-level, compliance vb. ayrı eklentiler)
- premium: yok ama lisans ticari kullanımı kapatıyor (Commons Clause)

## Ne yapar
20 alanda 368 skill, 76 uzman ajan, 859 stdlib Python aracı — mühendislik dışındaki ekipleri de hedefliyor (pazarlama, hukuk, uyum). 18 uyum çerçevesi ayrı demet. Ölçek stratejisi demetleme: her şeyi kurmak yerine `bundles/` altından ilgili paketi kuruyorsun.

## Core'a alınacak
- fikir: `bundles.json` — rafları konuya göre demetleyip yalnız ilgili demeti bağlama sokma; Core'un kütüphanesi 14 raf, büyüdüğünde bu ayrım gerekecek.
- fikir: skill başına ortalama 41 B frontmatter (15.164 / 369) — 369 skill'i 3.800 token'da tutan aşırı kısa açıklama disiplini; ölçülmüş bir üst sınır örneği.
- hayır: Commons Clause; Core'a metin kopyalamak lisans açısından temiz değil.

## Karar
Hayır — lisans (MIT + Commons Clause) metin almayı kirletiyor; yalnız demetleme ve 41 B/skill açıklama disiplini fikir olarak kalıyor.
