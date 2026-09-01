# Ekosistem Raporu

Soru: büyük MCP'ler, skill'ler, plugin'ler ve benzeri projeler kurulmalı mı; bizim
mentalitemize (maliyet, sözleşme, denetim) uyuyorlar mı; Core onların yaptığının ne
kadarını yapıyor. Ölçü tek: **bir turda modelin bağlamına kaç token yazıyor.**

Karar ortağı Fable'a danışıldı; hükümler onun kararıdır, ölçüler bu makinede
doğrulanmıştır.

## Maliyet sınıfları

| Sınıf | Ne zaman yazar | Örnek |
|---|---|---|
| Z — sıfır | Hiç. Ekran ya da disk. | Core kancaları, statusline, MessageDisplay bandı |
| A — çağrıldığında | Yalnız araç çalışınca | `graphify`, LSP, `gh` |
| B — oturum başına | Şema/açıklama her oturuma girer | MCP sunucuları, kurulu skill'ler |
| C — her turda | Tasarımı gereği sürekli okur/yazar | kalıcı bellek MCP'leri, RAG |

Core tamamen Z sınıfıdır. B ve C sınıfı her şey altın kuralı bozar; A koşullu kabul.

## Karar

| Kategori | Karar | Gerekçe |
|---|---|---|
| Bilgi grafiği / kod indeksleme | **Koşullu** | `graphify` zaten kurulu ve A sınıfı; ikinci bir grafik aracı aynı işi iki kez ödetir |
| Obsidian / Obsidian-MCP | **Kurma** | Vault şeması ve not içeriği her turda sızar; `MEMORY.md` + yol haritası aynı işi 0 pasif tokenle yapıyor |
| Kalıcı bellek MCP'leri | **Kurma** | C sınıfı: değer üretmek için her tur okuyup yazmak zorundalar; Claude Code'un yerleşik hafızası zaten var |
| Semantik arama / RAG | **Kurma** | Şema kalıcı, embedding bakımı sürekli; bu ölçekte Grep + graphify yetiyor |
| Tarayıcı/masaüstü otomasyonu | **Koşullu** | Bu istemcide `ToolSearch` ile ertelenmiş, maliyeti isim başına birkaç token; ertelemenin olmadığı istemcide Windows-MCP tek başına büyük bir şema kalemi, orada kapat |
| GitHub / issue MCP'leri | **Kurma** | `gh` aynı yüzeyi sıfır şema maliyetiyle veriyor; GitHub-MCP en pahalı şema setlerinden biri |
| LSP eklentileri | **Koşullu** | A sınıfı; tanım/refactor işinde Grep'ten ucuz, ama proje kökünde oturum ister |
| Gözlemlenebilirlik / telemetri | **Kurma** | Modelin bağlamına girmesi gereken bir şey değil; `rtk gain` ve `/context` zaten ölçüyor |

## Core ile örtüşme

- **Denetim ve izlenebilirlik** — tamamen Core'da (ledger, risk, kapılar). Bu iş için
  araç kurmak gereksiz.
- **GitHub akışı** — Core + `gh` + Bash kapısı karşılıyor. MCP eklemek yalnız maliyet ekler.
- **Gerçek boşluk 1: kod tabanını anlamak.** Core indekslemez. `graphify` kapatıyor;
  Core'a taşıma, ayrı kalsın.
- **Gerçek boşluk 2: oturumlar arası proje hafızası.** Core taşımıyor; yerleşik hafıza
  ve `docs/YOL-HARITASI.md` kapatıyor.
- **Boşluk sanılan ama olmayan: semantik arama.** Grep'in çözemediği bir sorgu henüz
  günlüğe düşmedi. Sorun kanıtlanmadan araç alınmaz.

## Altın kuralı sessizce bozmanın yolları

1. **Şema vergisi.** Erteleme olmayan istemcide her MCP aracının tam şeması oturum
   başında bağlama girer; araç başına yüzlerce token, sunucu başına binlerce.
   Ölçü: sunucuyu aç/kapat, `/context` çıktısındaki MCP satırını karşılaştır.
2. **Skill açıklama vergisi.** Her kurulu skill'in `description`'ı her oturumun sistem
   istemine girer — hiç çağırmasan da. Ölçü: skill sayısını değiştir, `/context` farkına bak.
3. **Kanca enjeksiyonu.** `SessionStart`/`UserPromptSubmit` kancası olan bir eklenti her
   tura `system-reminder` yazabilir. Ölçü: oturum JSONL'inde `system-reminder` blokları.
4. **Sonuç şişmesi.** MCP araç sonuçları filtresizdir; tek çağrı on binlerce token dökebilir.
   Ölçü: `rtk gain --history` ile bash tarafını, transcript'te `tool_result` uzunluklarını
   karşılaştır.
5. **Enjeksiyon yüzeyi.** Her yeni MCP, gözlemlenen içerikten talimat sızması için yeni bir
   kapıdır. Bunun maliyeti token değil güvendir ve denetim defteri bunu kaydetmez.

## Tavsiye

Şu an kurulacak şey **yok**. Yapılacak iki iş kurulum değil budamadır:

1. **Windows-MCP varsayılan kapalı olsun**, yalnız masaüstü işi olan oturumda açılsın —
   en büyük pasif şema kalemi odur.
2. **`graphify` tek grafik aracı ilan edilsin**; Obsidian, bellek ve RAG soruları
   "kanıtlanmış ihtiyaç yok" gerekçesiyle kapansın.

Yeni araç, ancak Grep + graphify'ın çözemediği somut bir vaka günlüğe düştüğünde gündeme
gelir.
