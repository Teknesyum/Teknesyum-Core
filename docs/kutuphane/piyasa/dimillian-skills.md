# Dimillian/Skills

- MIT · metin paketi (Codex skill klasörleri, `$CODEX_HOME/skills` altına kopyalanır) · ★3945
- mekanizma: 16 skill, kanca yok (yalnız depo bakımı için `scripts/git-hooks`), komut yok, ajan yok, MCP yok; toplam 488 KB, çoğu `references/*.md`
- sıradan turda bağlama: 16 description toplamı 5.4 KB (~1.35k token) — hepsi yüklüyse. Gövde ve references yalnız skill tetiklenince okunur.
- premium: yok

## Ne yapar
Apple platformları, GitHub `gh` iş akışı, React performansı, refactor orkestrasyonu ve çoklu ajan diff/bug taraması için 16 bağımsız skill. Ağırlık alan içeriğinde (SwiftUI, Swift concurrency), ama iki tanesi meta.

## Core'a alınacak
- fikir: `project-skill-audit` — geçmiş oturum kayıtlarını, MEMORY.md'yi ve mevcut yerel skill'leri okuyup "yeni yaz" yerine "var olanı güncelle"yi öneren denetim; Core'un kütüphane raflarını büyütürken aynı soruyu sorması (kanıt geçmiş oturumdan, beyin fırtınasından değil).
- fikir: `review-and-simplify-changes` ve `orchestrate-batch-refactor`'ın "work packet" şablonu — büyük refactor'ü bağımlılık sırasına göre paketlere bölen düz metin şablon; pasif betik değil, `docs/plan.md` kalıbına eklenecek biçim.
- kitap: yok — geri kalan 14 skill Apple/React alan bilgisi, Core'un kapsamı dışı.

## Karar
fikir notu — mekanizma yok (kancasız, düz metin), yalnız skill denetimi ve iş paketi şablonu fikir olarak alınır.
