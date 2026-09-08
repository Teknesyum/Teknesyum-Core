# Plan: Kütüphane (mega raf) ve `??`

Kullanıcının isteği (2026-09-08): agency tek raf olur, onlarca raf içeren bir kütüphane
kurulur; `??` ile başlayan istemde kütüphane taranır, işe yarayan kitap derin okunur,
model o konunun uzmanı gibi davranır. Sıradan turda kütüphane sıfır bayt. 100+ repo
taranır, işe yarayanlar raf olur.

## Yer

- Raflar proje dışında: `~/.claude/teknesyum/kutuphane/<raf>/` (env `TEKNESYUM_KUTUPHANE`).
  Agency `~/.claude/teknesyum/agency` buradan `kutuphane/agency`ye taşınır (ilk çağrıda).
- Raf listesi: `core/kutuphane.json` (eklentiyle gelen) + `<kütüphane>/raflar.json` (kullanıcı
  ekler). Katalog `<kütüphane>/katalog.json`, fetch sonunda yazılır; model çağrısı yok.
- Repoda yalnız tarama raporu ve raf kararları durur: `docs/kutuphane/`.

## Betik: `core/scripts/kutuphane.js`

`fetch [raf|all]` · `raf add <slug> <url> [--kind agents|skills|prompts|docs] [--scan a,b]` ·
`list [raf]` · `find <kelimeler>` · `show <slug…> [--lean]` · `record --topic --books --ask --reply`.

Kitap = markdown; ad ve açıklama frontmatter'dan, yoksa ilk başlık ve ilk paragraf.
`kind` kitabı seçer: agents → frontmatter `name` şart; skills → yalnız `SKILL.md`; docs/prompts
→ başlıklı her md. Kitap kimliği `<raf>/<yol>`. `show` en çok 3 kitap ve 48 KB; üstü reddedilir,
tek satırla daraltma söyler. Koltuk izi (`seat.json`) aynı kalır, Stop sohbette basar.
`agency.js` kalır: aynı komutlar, `home()` yeni yere bakar.

## `??`

Ev CLAUDE.md kuralı değişir: `??` = önce `kutuphane.js find` (sıfır token). İsabet varsa en
çok 3 kitap `show --lean` ile okunur, model kaynağı tek satır söyler ve o uzmanlıkla çalışır.
İsabet yoksa bunu söyler, normal devam eder. Netleştirme (`advice.js ask`) `netleştir`
sözcüğüyle çağrılır; kapı ve kayıt aynen kalır.

## Graphify kararı

Kitaplar başlık+açıklama taşıyan kısa metinler; kelime puanı kataloğu sıfır token'a tarar.
Graphify'ın semantik katmanı dosya başına model çağrısıdır: 100 raf × yüzlerce dosya, tarama
öncesi ödenen sabit bedel. Arama kalitesinde ölçülmüş bir üstünlüğü yok. Karar: katalog +
kelime puanı; graphify yalnız bir rafın içi kod tabanıysa ve istenince. Ölçü: agency rafında
`find` süresi ve isabet, test ve raporda.

## Tarama (100+ repo)

1. Aday listesi: awesome listeleri ve bilinen paketlerden GitHub URL'leri, mükerrer atılır.
2. Metadata `gh api` ile (yıldız, lisans, boyut, son itme, konu, README başı): sıfır token.
   Tablo `docs/kutuphane/tarama-2026-09-08.md`, ham `tarama.jsonl`.
3. Eleme: lisans (MIT/Apache/BSD/CC-BY girer, NC/GPL işaretli), tür (metin paketleri raf
   olur; MCP/kod aracı olmaz, fikri not edilir), tazelik, boyut.
4. Derin okuma: elenen 20-30 repo, her biri tek sonnet alt ajan, sınırlı istem, Türkçe
   hüküm: ne işe yarar, hangi `kind`, hangi klasörler, `??`'de ne zaman bulunmalı.
5. Girenler `core/kutuphane.json`'a raf olarak yazılır, `fetch all` ile kurulur, katalog ölçülür.

## Dosyalar

core/scripts/kutuphane.js (yeni), core/kutuphane.json (yeni), core/scripts/agency.js (home),
core/strings.json, test/all.js (testKutuphane), README.md, README.tr.md, ev CLAUDE.md (+ayna),
docs/kutuphane/*, docs/YOL-HARITASI.md.

## Maliyet

İskelet: model dışı, bench payı yok. Tarama 1-3: sıfır token. Derin okuma: 20-30 × ~0,3-0,5 $.
Verim kanıtı ayrı deney: aynı `??` sorusu kütüphaneli/kütüphanesiz, 2-3 görev × n=3.
