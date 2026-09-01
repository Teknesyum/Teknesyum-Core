# Ölçüm — graphify vs map.js vs çıplak Grep

> Kanıt seviyesi: çalıştırıldı (2026-09-02)

Mikro ölçüm. Hüküm yok, yalnız sayı ve gözlem.

## 1. Deney kurulumu

Depo: `fastify/fastify`, `--depth 1` klon, sürüm 6.0.0-alpha.2, HEAD `4cdb0c5d`.

- 394 dosya (`.git` hariç), bunların 261'i `.js`
- 69.290 satır JS
- graphify'ın gördüğü: 354 dosya, ~298.375 kelime
- map.js'in gördüğü: 294 dosya, 339 kenar, 3 döngü, 106 orphan

Sorular üç sınıfta, sekiz adet. Altın cevaplar koşulardan **önce** elle (Grep + dosya
okuma) çıkarıldı ve sonra değiştirilmedi: `scratchpad/olcum/altin-cevaplar.md`.

- **S1 x3 — sembolü kim çağırıyor:** `handleRequest` (altın: 1 dosya), `wrapThenable` (2),
  `buildErrorHandler` (3). Tanım dosyası ve `module.exports` satırı listeye dahil değil.
- **S2 x3 — dosyayı değiştirirsem kim etkilenir:** `lib/validation.js` (2),
  `lib/context.js` (3), `lib/content-type-parser.js` (2). Yalnız doğrudan require edenler.
- **S3 x2 — mimari:** ana modüller (8 alan), bir HTTP isteğinin yolu (7 durak).

Kapsam kuralı her koşulda aynı: `test/` ve `docs/` altı listeye alınmaz.

## 2. İndeksleme maliyeti

| | duvar saati | çıktı boyutu | model tokeni (toplam) | amortize /8 soru |
|---|---|---|---|---|
| `graphify update` (soğuk) | 10.657 ms | 5.293 KB | **0** | 0 token, 1.332 ms |
| `graphify update` (ikinci koşu) | 10.774 ms | aynı | 0 | 0 token, 1.347 ms |
| `node map.js` | 144 ms | 71,5 KB | **0** | 0 token, 18 ms |

graphify çıktısının dağılımı: `graph.json` 2,3 MB, `graph.html` 2,1 MB,
`GRAPH_REPORT.md` 59 KB, `manifest.json` 57 KB, `cache/`.
map.js çıktısı: `.claude/map.md` 14,1 KB + `.claude/map.json` 57,4 KB.

Graf: **3.067 düğüm, 3.574 kenar, 357 topluluk**. Kenarların **%100'ü `_origin: ast`**;
model kaynaklı tek kenar yok. Rapor kendi satırında da doğruluyor:
`Token cost: 0 input, 0 output`. Kenarların 172'si INFERRED (ortalama güven 0,55) ama
bunlar da AST kökenli, LLM değil. İlişki dağılımı: contains 2355, imports_from 306,
calls 219, references 165, indirect_call 172, method 162, imports 156, kalan <15.

İkinci koşunun ilkinden hızlı olmadığı gözlendi (10,7 s, 10,6 s); AST önbelleği bu
depoda süreye yansımadı.

## 3. Koşu karşılaştırması

Her koşul ayrı bir alt-ajanda, aynı sekiz soruyla çalıştı. Token = `subagent_tokens`.

| koşul | token | süre | hit | miss | false |
|---|---|---|---|---|---|
| K1 graphify (`graphify-out/` + CLI) | 63.462 | 135 s | 28/28 | 0 | 0 |
| K2 map.js (`.claude/map.md`) | 56.120 | 46 s | 27/28 | 1 | 2 |
| K3 çıplak (Grep/Read) | 50.525 | 68 s | 28/28 | 0 | 1 |

Soru bazında (hit/miss/false):

| soru | altın | K1 | K2 | K3 |
|---|---|---|---|---|
| S1a `handleRequest` | 1 | 1/0/0 | 1/0/**1** | 1/0/**1** |
| S1b `wrapThenable` | 2 | 2/0/0 | 2/0/0 | 2/0/0 |
| S1c `buildErrorHandler` | 3 | 3/0/0 | 3/0/**1** | 3/0/0 |
| S2a `lib/validation.js` | 2 | 2/0/0 | 2/0/0 | 2/0/0 |
| S2b `lib/context.js` | 3 | 3/0/0 | 3/0/0 | 3/0/0 |
| S2c `lib/content-type-parser.js` | 2 | 2/0/0 | 2/0/0 | 2/0/0 |
| S3a ana modüller | 8 | 8/0/0 | 8/0/0 | 8/0/0 |
| S3b istek yolu | 7 | 7/0/0 | 6/**1**/0 | 7/0/0 |

Hataların kaynağı tek ve aynı: **`lib/reply.js`**. Bu dosya
`require('./handle-request.js')[Symbol.for('internals')]` yazıyor — modülü import ediyor
ama `handleRequest`'i değil. K2 dosya düzeyinde çalıştığı için onu S1a'ya ve aynı
mantıkla (error-handler.js importundan) S1c'ye ekledi. K3 aynı tuzağa S1a'da düştü,
üstelik kaynağı okuduğu hâlde. K1, `calls` kenarı olmadığı için `lib/reply.js`'i almadı
ve `fastify.js -> handle-request.js` yönündeki `indirect_call` kenarını da INFERRED
olduğu gerekçesiyle eledi.

K2'nin S3b'de kaçırdığı durak `lib/context.js` — map.md'de kenarı var ama akış
sırasındaki rolü dosya listesinden çıkmıyor.

## 4. Bayatlama testi

Beş dosyada gerçek değişiklik yapıldı, **hiçbir indeks güncellenmedi**:

- `wrapThenable` -> `settleThenable` (lib/wrap-thenable.js, lib/handle-request.js,
  lib/error-handler.js)
- `lib/reply.js`'e `require('./validation')` eklendi -> S2a'nın altın cevabı 2'den
  **3 dosyaya** çıktı
- `lib/server.js`'e `require('./context')` eklendi -> S2b'nin altın cevabı 3'ten
  **4 dosyaya** çıktı

Sonra iki soru K1 ve K2 koşullarında tekrar soruldu.

| | B1: `wrapThenable`'ı kim çağırıyor (doğrusu: **böyle bir sembol artık yok**) | B2: `lib/validation.js` (doğrusu: handle-request, route, **reply**) | token / süre |
|---|---|---|---|
| K1 graphify | error-handler.js (import L4, çağrı L68), handle-request.js (import L4, çağrı **L219**) | route.js, handle-request.js — `reply.js` **kaçtı** | 46.691 / 34 s |
| K2 map.js | error-handler.js, handle-request.js | route.js, handle-request.js — `reply.js` **kaçtı** | 44.843 / 25 s |

Sapma biçimi: **ikisi de sessizce yanlış**. Ne "bayat olabilir" uyarısı verdiler ne de
tutarsızlık sezdiler. K1 daha iddialı sapıyor — artık var olmayan bir sembol için
**satır numarası** üretti (L4/L68/L219); o satırlarda bugün `settleThenable` yazıyor.
K2 satır numarası vermediği için yalnız dosya listesi kadar yanlış.

Yeni eklenen `reply.js -> validation.js` kenarını ikisi de göremedi. `GRAPH_REPORT.md`
bayatlığa karşı bir satır taşıyor ("Built from commit: `4cdb0c5d` ... karşılaştır") ama
alt-ajan bunu kendiliğinden yapmadı; `map.md` başlığında da HEAD yazılı, o da
kullanılmadı.

## 5. Ne öğrendik

1. **İki indeksin de model tokeni sıfır.** graphify'ın `update` yolu %100 AST; 3.574
   kenarın hiçbiri LLM üretimi değil. Amortize maliyet tartışması bu koşuda konusuz.
2. **Kurulum süresi 74 kat farklı, ama soru başına ikisi de önemsiz:** 1,3 ms (graphify)
   ve 18 ms (map.js). Fark asıl disk boyutunda: 5,3 MB'a karşı 71 KB.
3. **Token sıralaması indeksin lehine değil.** En pahalı koşul graphify (63,5 K), en ucuz
   çıplak Grep (50,5 K). İndeks okumak bu boyda bir depoda tasarruf getirmedi; graphify
   koşusu 14 araç çağrısı harcadı, çıplak koşu 9.
4. **Doğrulukta fark S1 sınıfında, S2'de yok.** S2'nin üç sorusunda üç koşul da 7/7 doğru.
   S1'de map.js iki false verdi, graphify sıfır. Ayrım "dosya kimi import ediyor"da değil,
   "**sembolü** kim çağırıyor"da doğuyor.
5. **`lib/reply.js` tek başına ölçümün ayırt edici vakası oldu.** Dosya düzeyi bir kenarın
   sembol düzeyinde karşılığı olmayabilir (`[Symbol.for('internals')]`); bu farkı yalnız
   `calls` kenarı olan graf ayırdı. Çıplak Grep bile ayıramadı, kaynağı gördüğü hâlde.
6. **Bayat indeks yanlış cevabı güvenli göstererek veriyor.** İki koşul da uyarı üretmedi;
   graphify ek olarak geçersiz satır numarası uydurdu. Bayatlığın maliyeti "eksik bilgi"
   değil, "**yanlış bilgiye eklenen sahte kesinlik**".
7. **Bayatlığa karşı iki indeks de kanıt taşıyor ama kimse okumuyor.** Hem GRAPH_REPORT.md
   hem map.md HEAD commit'ini yazıyor; alt-ajanlar `git rev-parse HEAD` ile karşılaştırmayı
   kendiliğinden yapmadı. Bu araç eksiği değil, protokol eksiği.
8. **Mimari sorularda (S3) koşullar arasında kayda değer fark çıkmadı.** 15 altın maddenin
   15'ini K1 ve K3, 14'ünü K2 buldu. Bu sınıfta indeksin katkısı ölçülemedi.

## 6. map.js'in kapatamadığı boşluk

Somut olarak tek bir yerde: **S1 — sembol düzeyi çağrı grafiği.**

- map.js dosya-dosya `require` kenarından başka bir şey bilmiyor. S1'in üç sorusunda da
  cevabı "modülü import eden dosyalar" diye vermek zorunda kaldı ve bunu kendisi de not
  düştü ("sembol düzeyinde doğrulama map'te yok").
- Bedeli bu ölçüde **3 soruda 2 false** oldu: `lib/reply.js` iki kez fazladan listelendi.
  S1 sınıfında 6 altın maddenin 6'sı bulundu ama yanına %33 gürültü eklendi. graphify'da
  bu gürültü 0.
- **S2 sınıfında boşluk yok.** Üç soruda da map.js graphify ile birebir aynı ve tam doğru
  cevabı verdi, üstelik 7,3 K daha az tokenle ve 3 kat hızlı. Bu sınıfta map.js'in eksiği
  ölçülemedi.
- **S3'te boşluk 1 madde:** akış sırasındaki `lib/context.js` durağı. Dosya listesi
  kenarları taşıyor ama rol bilgisi taşımıyor.
- Bayatlıkta iki indeks **aynı derecede** yanlış. Burada map.js geride değil; satır
  numarası uydurmadığı için hatası daha az iddialı.

## 7. Ölçülemeyenler

- Semantik (LLM'li) `graphify extract --mode deep` yolu çalıştırılmadı; API anahtarı yok.
  `update` yolunun ötesindeki kenar kalitesi ve token maliyeti **ölçülemedi**.
- Tek depo, tek dil (JS), tek boy (~69 K satır). Ölçek eğrisi **ölçülemedi**.
- Her koşul tek koşu; varyans **ölçülemedi**.
- 357 topluluk üretildi ama topluluk adları dosya adlarının kendisiydi (LLM etiketleme
  çalışmadı); topluluk katmanının cevaplara katkısı **ölçülemedi**.
- Soruları tek bir kişi seçti; soru seçiminin sonucu ne kadar belirlediği **ölçülemedi**.

## 8. Yeniden üretim

Deney deposu ve ham veri: `scratchpad/olcum/` (fastify klonu, `altin-cevaplar.md`,
`sorular.md`, `graphify-update.log`). Core kaynağına dokunulmadı.
