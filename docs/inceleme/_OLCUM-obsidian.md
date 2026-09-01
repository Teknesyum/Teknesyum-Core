# Ölçüm — Obsidian vault mı, düz Markdown mı?

**Soru:** Wiki-link'li, backlink'li bir Obsidian vault, bilgiyi geri getirmede düz
Markdown + `rg`'den daha mı ucuz?

**Hipotez:** Fark yok.

**Ölçülen şey:** Vault'un **dosya düzeni**. Obsidian **uygulaması** değil.

---

## Adalet notu — ne ölçülmedi

Obsidian'ın satış argümanı olan iki şey, grafik görünümü ve backlink paneli,
**uygulamanın içindedir**; vault dosyalarında karşılığı yoktur. Model bir vault'a
baktığında yalnız `.md` dosyalarını, YAML ön maddesini ve `[[wiki-link]]` metinlerini
görür. Bu ölçüm o dosya düzenini ölçer.

Bu yüzden ikinci bir koşul eklendi: **B1+**, vault'a bir betikle üretilmiş
`backlinks.md` ters bağlantı tablosu eklenmiş hali. Bu, Obsidian'ın uygulama içinde
hesapladığı şeyi diske düşürmenin karşılığıdır — yani "grafiği modele göstermek"
denemesi.

---

## Adım 1 — Bilgi seti

Kaynaklar: `docs/DECISIONS.md` (D1-D16), `docs/YOL-HARITASI.md`,
`logs/openlogs/closed/*.md`, `git log`.

Yirmi madde çıkarıldı: on beş karar, beş hata kaydı. Her madde başlık, 3-6 cümle
gövde ve ilgili dosya adları taşıyor. Gövdeler üç biçimde **birebir aynı**; değişen
yalnız paketleme.

Çalışma alanı: `scratchpad/olcum-obsidian/` (depoya girmez).

## Adım 2 — Üç biçim ve boyutları

| Biçim | Yapı | Dosya | Bayt | Gövdeye göre fazlalık |
|---|---|---|---|---|
| **B3 Tek dosya** | tek `MEMORY.md`, 20 başlık | 1 | 19.165 | taban |
| **B2 Core tarzı** | konu klasörleri + `INDEX.md` | 21 | 21.923 | +%14 |
| **B1 Obsidian vault** | 20 not + `MOC.md`, YAML + wiki-link | 21 | 26.401 | +%38 |
| **B1+ vault + backlinks** | B1 + türetilmiş `backlinks.md` | 22 | 43.662 | +%128 |

Ara ölçüler:

- `B1-vault/MOC.md` — 1.672 bayt, 32 satır
- `B2-core/INDEX.md` — 2.859 bayt, 24 satır
- `B1plus-vault/backlinks.md` — **17.261 bayt, 183 satır**
- B1'de 57 wiki-link, 0 kırık; B1+'da 215

`backlinks.md` tek başına B1 vault'un **%65'i** kadar. Türetilmiş indeks, türetildiği
gövdeyle aynı büyüklük sınıfında.

## Adım 3 — Sorular ve altın cevaplar

Beş soru, hiçbirinin kelimeleri notların kelimeleriyle birebir örtüşmüyor.

| # | Soru | Altın cevap |
|---|---|---|
| S1 | "Zaten sahip olduğumuz bir şeyi ikinci kez satın almak" gerekçesiyle kurulmayan ya da sökülen iki düzenek neydi? | M07 (plan konseyi), M10 (oturum açılış bandı) |
| S2 | Bir satır yazının kullanıcının gözüne modele para ödemeden ulaşması için kaç yol denendi, hangisi tuttu? | M10 → M11 → M12 → M13 → **M14** |
| S3 | Biten bir iş arkasında canlı bir şey bırakıp sonraki denemeyi düşürdü mü? Belirti, elle çare, kalıcı çare. | M18 (MSB3027/21 · `Stop-Process -Force` · süreç ağacı) |
| S4 | İki iş birimi eşzamanlı koşarken birinin ürünü ötekinin hanesine yazıldı mı? Sonrasında hangi alan zorlanır oldu? | M20 + M03 (`owns:`) |
| S5 | Hangi değişmeyen metinler modelin çıktı yolundan çıkarıldı, hangi kayıtlarda geçiyor, gerekçedeki sayı? | M05 (+M15, M16); 8-10 bin çıktı tokeni |

Sorular ve tam altın cevaplar: `scratchpad/olcum-obsidian/sorular.md`.

## Adım 4 — Koşum tablosu

Her biçim için bir alt ajan (`general-purpose`), beş soru tek istemde, klasör dışına
çıkmak yasak.

<!-- SONUC-TABLOSU -->

## Ne öğrendik

<!-- OGRENDIK -->

## Obsidian-MCP köprüsü kurulsaydı

<!-- MCP -->
