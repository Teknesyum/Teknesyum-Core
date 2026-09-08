# xiaopu-ai/web-design

- MIT · tek skill (elle `~/.claude/skills/` altına klonlanıyor) · ★755
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill, 0 MCP; 3 Python betiği (Playwright tarayıcı, statik token çıkarıcı, Unsplash görsel çekici), 9 referans dosyası
- sıradan turda bağlama: `SKILL.md` 20.190 bayt ama gövde yalnız tetiklenince okunuyor; daima yüklü olan frontmatter `description` ~490 bayt ≈ **125 token**. Referanslar (`references/*.md`) tamamen tembel
- premium: yok

## Ne yapar
Önce spesifikasyon, sonra kod. PRD / referans URL / ekran görüntüsü / anahtar kelimeden 9 bölümlük bir `DESIGN.md` üretiyor (renk, tipografi, bileşen, yerleşim, hareket, derinlik, yapılacak-yapılmayacak, duyarlılık, erişilebilirlik); kullanıcı onaylayınca kodu bu spesifikasyona harfiyen uyarak yazıyor ve 100 puanlık kontrol listesine karşı kendini denetliyor.

## Core'a alınacak
- kitap: `references/quality-checklist.md` ve `design-md-template.md` — Core'un `teknesyum-ui` standardı henüz kurulu değil; "renk/ölçü uydurma" kuralının yerine geçecek somut bir şablon rafta durabilir.
- fikir: **ürün olarak dosya** — `DESIGN.md` projede kalıyor, elle düzenlenebiliyor, başka araç okuyabiliyor. Core'un `docs/plan.md` mantığının arayüz işine uzantısı.
- fikir: 20 KB'lık gövdeyi 125 token'lık açıklamanın arkasına saklama; Core'un pasif raf modelinin skill biçimindeki karşılığı.

## Karar
Al — `quality-checklist.md` + `design-md-template.md` metin olarak kütüphaneye alınır; skill olarak kurulmaz, ilke gereği rafta durur.
