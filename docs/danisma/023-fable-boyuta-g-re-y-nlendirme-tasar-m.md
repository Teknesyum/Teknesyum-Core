# Fable: boyuta göre yönlendirme tasarımı

- soran: T0
- danisilan: fable
- tarih: 2026-09-05

## Sorulan

C:/Users/Teknesyum/.claude/plugins/cache/teknesyum/teknesyum-core/0.15.0/roles/advisor.md dosyasını oku ve onu izle. Başlıklar Türkçe: `## Karar`, `## Gerekçe`, `## Kaçırdığın`. Depo kökü: C:\Users\Teknesyum\Desktop\Projeler\Teknesyum Core. Soran: T0. Koltuğun: fable/medium. Kod yazma, dosya yazma; en fazla 35 satır.

Kullanıcının sorusu, aynen: "graphify daha verimli ise niye onu kullanmıyoruz? hem büyükte hem küçükte daha mı avantajlı / küçükte başka büyükte başkalaşan bir sistem dizaynını bir düşün"

Olgular:
- Core'un yönlendiricisi `core/scripts/map.js` (377 satır, deterministik, model yok): import grafiği çıkarır (js/ts/py/cs), `.claude/relay/map.md`'ye hub'lar (ilk 12), döngüler, yetimler, kenar sayısı yazar. Builder rolü adım 2: "kaynak açmadan önce map.md'yi oku". Bu depoda map.md şu an yok; bench klonlarında da yoktu (taze klon), ajanlar Edit'ten önce 5-11 grep/sed ile aradı, native ile aynı.
- graphify (Graphify-Labs/graphify): tree-sitter AST ile ~20 dil, deterministik, vektör yok, kalıcı grafik, "sorgu başına ham dosya okumaya göre 71,5x az token" iddiası (kendi iddiaları, biz ölçmedik). Kurulu değil; kullanıcının genel CLAUDE.md'si "büyük/yabancı kod tabanı → graphify" der. Daha önce bir inceleme yazılmış: `C:/Users/Teknesyum/.claude/plugins/marketplaces/teknesyum/docs/inceleme/graphify.md` ve `docs/GRAPHIFY.md` — oku, orada ne bulunduğunu kullan.
- Bench görevleri küçük (tek dosyalık hata düzeltmeleri, 9-17 tur, $0,08-0,17). Kullanıcı toleransı: native'e göre +%5.
- İndeks kurmanın kendi bedeli var (graphify: python bağımlılığı, ilk kurulum, güncel tutma; map.js: sıfır model, milisaniye).

Sorular:
1. graphify küçükte de kazandırır mı, yoksa yalnız büyükte mi? Ölçmeden söylenebilecek sınır neresi (dosya sayısı / ajanın Edit öncesi keşif turu)?
2. "Küçükte başka, büyükte başka" tasarım: eşik nasıl ölçülür (deterministik, sıfır model), küçükte ne (hiçbir şey? map.md?), büyükte ne (graphify? map.md + graphify?), geçiş kim tarafından ve ne zaman yapılır, bedel nerede?
3. Bu tasarımın kendisi Core'a %5 üstünde bir şey bindirir mi?
4. Ölçmeden karar verilmemeli diyorsan: en ucuz ölçüm nedir?
5. Kaçırdığımız?

## Donen

## Karar

Küçükte hiçbir şey; büyük/yabancı depoda graphify, ama yalnız `graphify-out/` zaten varsa ve
skill metni açılmadan (yalnız CLI `query`). Eşiği Core ölçmez, klasörün varlığı eşiktir.

## Gerekçe

Bench görevi tek dosya, keşif 5-11 grep ≈ 1-2k token. Bir `graphify query` tek başına ~1.600
token, SKILL.md açılırsa +10.600; %5 payı (~$0,005) ilk sorguda aşar. Kazanç "ham dosya
okumaya göre 71,5x" — ajanlar zaten ham dosya okumuyor, grep yapıyor; kıyas nesnesi yanlış.
Kazandıracağı yer grep'in çöktüğü soru: "bunu kim çağırıyor" (`calls`, sembol düzeyi), dosya
sayısı değil; inceleme de aynı sınırı çizmişti (`imports` regex ile alınır, `calls` alınmaz).

## Kaçırdığın

1. Sınır: ölçmeden söylenebilecek tek şey soru tipidir. Edit öncesi keşifte ajan ≥3 farklı
   dosya açıyorsa ya da ≥2 grep aynı sembolün çağıranını arıyorsa graphify'ın alanı; tek
   dosyada string arıyorsa değil. Dosya sayısı proxy olarak zayıf (33 dosyada 1142 kenar çıktı).
2. Tasarım: builder adım 2 tek koşul olur — `graphify-out/graph.json` varsa `graphify query`,
   yoksa `map.js who <dosya>` (~60 token), map.md'nin tümü (~2.550) hiç. Geçişi kullanıcı
   yapar (`/graphify .`, bir kez, 3 s); Core ne kurar ne günceller. Bedel: grafiğin
   bayatlaması (manifest mtime+hash var, bench klonunda sıfırdan kurulur → runner çalıştırır,
   deterministik) ve Python/uv bağımlılığı bench makinesinde.
3. Tasarımın kendisi: rol dosyasına bir satır, sıfır model; %5'e bir şey bindirmez. Bindiren
   tek şey skill metninin açılması — Core bunu yasaklamalı, CLI komutu rol satırına gömülmeli.
4. En ucuz ölçüm koşu değil, eldeki transkript: bench kayıtlarında ilk Edit'ten önceki turların
   token'ını say. Bu, graphify'ın kazanabileceği tavandır; tavan 1.600'ün altındaysa (ki
   $0,08-0,17'lik görevde büyük ihtimalle öyle) hiç koşu yapma. Tavan yüksekse tek görev,
   üçüncü kol: graph.json hazır, rol satırı "grep'ten önce query" — ~$0,15.
5. Asıl kaçırılan rakip LSP. Claude Code'un LSP araçları "tanım / referanslar"ı sembol düzeyinde,
   indeks kurmadan, Python'suz veriyor; graphify'ın kod üzerindeki tüm kenarları AST-kaynaklı
   ve LSP'nin zaten cevapladığı sorular. Büyükte de önce LSP açık mı diye bak; graphify'ın
   kalan payı topluluk/etki analizi ("affected") ve LSP'siz diller.
