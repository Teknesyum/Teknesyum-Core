# Serena

> Kanıt seviyesi: kod (`src/serena/tools/*.py` sınıf listesi ve `pyproject.toml`
> okundu) + doküman (README)

## Kimlik

Depo `oraios/serena`, dil Python (>=3.11, <3.15), lisans MIT, paket adı
`serena-agent`, sürüm 1.7.1.dev0. `pyproject.toml` içinde **~34 sabitlenmiş
doğrudan bağımlılık** var — `mcp`, `pydantic`, `flask`, `pygls`, `lsprotocol`,
`tiktoken`, `anthropic`, `pywebview`, `pystray`, `cryptography`, Windows'ta
`pythonnet` dahil. Son commit 2026-08-30 (etkin bakımda; o commit bile araç
kümesi kısıtlamasıyla ilgili).

Kurulum biçimi: **MCP sunucusu** (`uv tool install -p 3.13 serena-agent`, uvx ile
git'ten de kurulabiliyor). Arka uç iki türlü: 40'tan fazla dil için **LSP**, ya da
alternatif olarak **JetBrains eklentisi**.

## Çözdüğü dert

"Bir sınıfı düzeltmek için 900 satırlık dosyayı baştan sona okutma; sembolü bul,
gövdesini getir, gövdesini değiştir."

## Veri akışı

Kaynağı **dil sunucusudur (LSP)**, dosya metni değil. Proje etkinleştirildiğinde
(`activate_project`) o dil için bir language server süreci başlar; semboller,
referanslar, tanımlar, tip hiyerarşisi ve tanılamalar bu süreçten sorulur.
Serena kendi kalıcı kod indeksini kurmaz — indeks LSP'nin içindedir ve dil
sunucusunun ısınma süresi vardır.

Diskte `.serena` klasörü tutar: proje yapılandırması ve **bellek dosyaları**.
Bellek araçları (`write_memory`, `read_memory`, `list_memories`, `delete_memory`,
`rename_memory`, `edit_memory`) modelin oturumlar arası not bırakmasını sağlar;
`onboarding` aracı projeyi ilk kez gezip bu notları üretir.

Güncelleme zamanı: **talep üzerine**, ama LSP arka planda dosya değişikliklerini
kendi izler. `initial_instructions` aracı ise oturum başında modele Serena'nın
kendi kullanım talimatını okutur — yani tasarımı gereği bağlama yazar.

## Bağlam maliyeti

Araç sınıflarını saydım (kod kanıtı): toplam **50 `Tool` alt sınıfı**.
Dağılım — `symbol_tools` 12, `jetbrains_tools` 12, `file_tools` 10,
`memory_tools` 6, `config_tools` 4, `workflow_tools` 3, `query_project_tools` 2,
`cmd_tools` 1.

JetBrains kümesi (12) LSP'ye alternatif arka uçtur, ikisi aynı anda etkin olmaz;
ayrıca 10 kadar sınıf `ToolMarkerOptional` işaretli, yani varsayılan kümede yok.
Buradan **varsayılan etkin araç sayısı ≈ 28** çıkıyor (**tahmin**, işaretlerden
türetildi, çalıştırılarak doğrulanmadı).

Pasif yük: ertelenmiş araç yüklemesi olmayan bir istemcide 28 aracın tam JSON
şeması oturum sistem istemine girer. Araç başına **tahmin 150–350 token**
(`find_symbol` gibi çok parametreli araçlar üst sınırda), toplam
**tahmin 4.000–10.000 token/oturum** — Core'un sınıflandırmasında net **B sınıfı**.
Buna `initial_instructions`/onboarding çıktısı eklenirse bir kısmı **C sınıfına**
kayar. Bu istemcide `ToolSearch` erteleme yaptığı için pasif yük isim başına
birkaç tokene düşer; erteleme olmayan istemcide düşmez.

Çağrı başı yük: asıl kazanç burada. `get_symbols_overview` bir dosyanın yalnız
sembol iskeletini döndürür — 900 satırlık dosya için **tahmin 200–600 token**,
tam okumanın onda biri. `find_symbol` tek gövde getirir. Yani Serena pasif
maliyeti artırıp çağrı maliyetini düşüren bir takastır.

## Core'daki karşılık

- **Hiçbir organ bu işi yapmıyor.** Core sembol bilmez; `map.js` dosya
  düzeyindedir ve import kenarından öteye gitmez. Sembol düzeyinde okuma/düzenleme
  Core'da yoktur ve `EKOSISTEM.md` bunu zaten "gerçek boşluk 1: kod tabanını
  anlamak" başlığı altında kaydetmiş, `graphify` ile kapatmıştır.
- **Bellek araçları** Core'da bilinçli olarak yok: `MEMORY.md` ve
  `docs/YOL-HARITASI.md` aynı işi 0 pasif tokenle yapıyor. `EKOSISTEM.md`'nin
  "kalıcı bellek MCP'leri — kurma" hükmü doğrudan bu kümeyi kapsıyor.
- **Core'da daha iyi olan:** kapı ve denetim. Serena'nın `execute_shell_command`,
  `replace_symbol_body`, `rename_symbol`, `delete_lines` gibi yazan araçları
  vardır; hiçbiri sözleşme kapısından, `risk.js`'ten ya da `audits/ledger.jsonl`
  denetim defterinden geçmez. Serena'nın tek koruması `read_only` proje bayrağı —
  son commit'in konusu da tam olarak o bayrağın uygulanmamasıydı.
- Ayrıca Core'un `owns` listesi Serena'da karşılıksızdır: hangi ajanın hangi
  dosyaya dokunabileceği kavramı yok.

## Çalınabilir fikir

1. **`get_symbols_overview` deseni: önce iskelet, sonra gövde.** Mekanizma, iki
   aşamalı okumadır — birinci çağrı yalnız adları ve satır aralıklarını döndürür,
   ikinci çağrı seçilen aralığı getirir. Core'a LSP'siz uyarlaması var:
   `map.js` zaten dosya başına `lines` tutuyor; aynı regex hattı üst düzey
   `function`/`class`/`const X =`/`def`/`public class` tanımlarını satır numarasıyla
   `map.json`'a yazabilir. O zaman "önce `map.js who`, sonra hedefli okuma"
   iki aşamalı okuma olur.
   **Altın kuralı ihlal eder mi — hayır.** Çıkarım `map.js` çalışınca olur,
   sonuç diske yazılır.

2. **Araç işaretleyicileri (`ToolMarker*`) ile küme daraltma.**
   `ToolMarkerOptional`, `ToolMarkerCanEdit`, `ToolMarkerSymbolicEdit`,
   `ToolMarkerBeta` — her araç kendi yetenek etiketini taşır ve etkin küme
   yapılandırmayla daraltılır. Bu, Core'un `risk.js`'inin yol regex'lerine
   alternatif bir sınıflandırma ekseni: **eylemi yolla değil, yeteneğiyle
   etiketlemek.** Sözleşmenin `verify` adımları "bu sözleşme yazan araç
   kullanabilir mi" sorusuna aynı etiketle cevap verebilir.
   **Altın kuralı ihlal eder mi — hayır.** Etiketler sözleşme dosyasında ve
   kapıda yaşar.

3. **`read_only` proje bayrağı + tek yerden uygulanması.** Fikir değil, alınacak
   ders: Serena bu bayrağı 1.7'ye kadar bazı araç kümelerinde uygulamayı unutmuş.
   Core'un karşılığı, kapıyı **tek nokta** yapmaktır — `contract.js complete`
   dışında kapanış yolu olmaması bu dersin zaten uygulanmış hali. Yeni yazan
   yüzey eklenirse aynı tek noktadan geçme kuralı korunmalı.
   **Altın kuralı ihlal eder mi — hayır.**

4. **`.serena` gibi tek proje klasörü + adlandırılmış bellek dosyaları.**
   Core'un `.claude/relay` klasörü aynı rolde. Serena'nın eklediği tek şey
   belleklere **ad vermek ve listeleyebilmek** (`list_memories`) — yani
   "hepsini oku" yerine "adına bakıp gerekeni oku". `docs/` altındaki rapor ve
   karar dosyaları için tek satırlık bir dizin (ad + bir cümle) aynı kazancı verir.
   **Altın kuralı ihlal eder mi — hayır**, dizin diskte durduğu ve okunmadığı sürece.
   *Uyarı:* Serena bunu `initial_instructions` ile her oturuma yazdırıyor; alınacak
   olan dosya biçimidir, enjeksiyon alışkanlığı değil.

## Ret adayı gerekçe

Serena bir **MCP sunucusudur** ve Core'un altın kuralıyla doğrudan çelişir: 28
civarı araç şeması ve `initial_instructions` oturum başına binlerce token yazar
(B, kısmen C sınıfı). Bu istemcide `ToolSearch` ertelemesi faturayı küçültür ama
Core'un başka istemcilerde de çalışması gereken bir eklenti olduğu düşünülürse
kural yine bozulur.

İkinci ve daha ağır sebep: Serena **yazan** bir araç kümesi getirir
(`replace_symbol_body`, `rename_symbol`, `execute_shell_command`) ve bunların
hiçbiri Core'un sözleşme kapısını, risk hesabını ya da denetim defterini bilmez.
Yani Core'un varlık sebebi olan izlenebilirliğin yanından dolaşan ikinci bir
yazma yolu açılır. Üstüne 34 Python bağımlılığı ve dil sunucusu süreçleri gelir;
`EKOSISTEM.md` bu kategoriyi zaten "LSP eklentileri — koşullu, A sınıfı" diye
ayırmıştı, Serena ise A değil B sınıfıdır.

## README cümlesi

Serena buys cheaper reads by paying a permanent per-session tax in tool schemas
and by opening a second write path that never passes a contract gate; Core keeps
reads cheap through targeted search and keeps every write behind one gate, so the
trade is not one you need to make.
