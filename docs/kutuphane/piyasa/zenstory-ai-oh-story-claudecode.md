# zenstory-ai/oh-story-claudecode

- MIT · plugin (skill paketi, marketplace.json ile) · ★6670
- mekanizma: 0 kanca (kurulum kancası yok; `story-setup` skill'i hedef projeye Always-On Rule ve workspace hook yazıyor) · 13 skill (`story`, `story-setup`, `story-long-scan/analyze/write`, `story-short-*`, `story-deslop`, `story-review`, `story-cover`, `story-import`, `browser-cdp`) · 7 custom agent (yalnız Antigravity dağıtımında) · 0 MCP
- sıradan turda bağlama: 13 skill açıklaması; ölçüm: her açıklama 1-3 satır, toplam ~1.5 KB ≈ 400 token. Kurulum `~/.claude`'a dokunmuyor, hedef projenin `.agents/`ine yazıyor.
- premium: yok.

## Ne yapar
Web romanı yazımının tüm hattını skill'lere bölmüş: liste tarama, popüler metni sökme, modül kitaplığı kurma, yazma, "AI kokusunu" temizleme, kapak görseli. Çekirdek tezi "kalıp = belirlenmiş duygusal tatmin".

## Core'a alınacak
- fikir: `story-deslop` — üretilen metinden model tikleri temizleyen ayrı bir geçiş; Core'un README/rapor üretiminde aynı ayrı geçiş uygulanabilir.
- fikir: hattın taramaya, sökmeye, yazmaya bölünmesi ve her adımın çıktısının diske yazılması — bağlamı değil dosyayı taşıyan iş akışı; Core'un `handoff.md` mantığıyla aynı.
- fikir: `story-setup`'ın `~/.claude`'a değil proje klasörüne yazması — Core'un "dosya dışına bir şey kurma" kuralının aynısı.

## Karar
hayır — kurgu yazımı Core'un alanı değil; alınacak tek şey "deslop ayrı geçiş" fikri.
