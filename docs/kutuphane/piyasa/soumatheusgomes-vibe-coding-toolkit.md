# soumatheusgomes/vibe-coding-toolkit

- MIT · metin paketi (docs + şablonlar; kurulacak eklenti yok) · ★570
- mekanizma: kanca 0, komut 0, ajan 0, skill 0, MCP 0; 26 doküman (~67 KB) + `templates/` (CLAUDE.md şablonu, eslint kural seti, `hook-io.mjs.example`, `settings.json.example`)
- sıradan turda bağlama: 0 — hiçbir dosya otomatik yüklenmiyor, kullanıcı okuyup kendi projesine uyguluyor
- premium: yok

## Ne yapar
Bir üretim projesinden (fintekh, NDA) çıkarılmış AI-destekli geliştirme akışını dokümante ediyor: 9 hazır istem (proje temizliği, eslint uyarı eritme, çok ajanlı kod incelemesi, paralel dalga sevkiyatı, bellek başlatma, dosya boyutu refaktörü) ve 14 araç notu (superpowers, subagent orkestrasyonu, rtk, graphify, hooks best practices, context7).

## Core'a alınacak
- **kitap**: `docs/tools/10-hooks-best-practices.md` + `templates/hooks/hook-io.mjs.example` — kanca yazma pratikleri; Core'un tek mekanizması kanca.
- **kitap**: `templates/rules/parallel-subagent-driven-development.md` ve `docs/prompts/05-parallel-wave-dispatch.md` — Core'un alt ajan sevk deseni için ikinci bir uygulama.
- **fikir**: paketin biçimi. Kurulan hiçbir şey yok, sıradan turda 0 token, bilgi istenince okunan pasif metin — Core'un kütüphane ilkesinin piyasadaki en yakın eşi (★570 ile karşılığı da var).

## Karar
Al — biçimi Core'un raf ilkesiyle birebir; iki metin doğrudan rafa girer.
