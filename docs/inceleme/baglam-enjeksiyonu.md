# context-hogs (karanb192/claude-code-hooks)

> Kanıt seviyesi: doküman | kod

## Kimlik

`karanb192/claude-code-hooks` — 20 eklentilik bir Claude Code marketplace'i. İçinden
`plugins/context-hogs` bu incelemenin konusu: PostToolUse + SessionEnd kancalarıyla
çalışan, saf Node (sadece `fs`, `path`, `os`; sıfır npm bağımlılığı) tek dosyalık bir betik.

İncelenen kaynaklar: depo README'si, `plugins/context-hogs/README.md`,
`plugins/context-hogs/hooks/hooks.json` ve `plugins/context-hogs/context-hogs.js`.
Betik okundu, çalıştırılmadı.

İkinci aday olarak `thedotmack/claude-mem` (docs.claude-mem.ai) incelendi: beş kancalı
kalıcı hafıza sistemi, SessionStart'ta "progressive disclosure index" enjekte ediyor.
Politikası var ama tersi yönde — bilinçli olarak bağlama yazıyor, sonra maliyeti
katmanlayarak kısıyor. Karşılaştırma için aşağıda geçiyor.

## Çözdüğü dert

Bir oturumda bağlamı asıl şişiren şey modelin okuduğu dosyalardır, ama kimse hangi
dosyanın kaç token yediğini bilmez. context-hogs bunu ölçer: her araç sonucunun
byte'ını, sonucun ait olduğu dosya yoluna yazar.

Dert ölçüm değil, ölçümü modele ödetmemek. Klasik çözüm ölçümü rapora çevirip bağlama
basmaktır; bu, ölçtüğü şeyin kendisini büyütür.

## Veri akışı

`hooks.json` iki kanca tanımlıyor. `PostToolUse`, `matcher: "Read|Grep|Glob|Bash"` ve
`async: true` ile; `SessionEnd` matcher'sız ve senkron. İkisi de aynı betiği çağırıyor,
betik `hook_event_name` alanına bakıp dallanıyor.

PostToolUse dalında: stdin'den `tool_name`, `tool_response`, `cwd`, `session_id` okunur,
sonucun byte'ı ölçülür, yol normalize edilir, tek satır JSONL olarak
`~/.claude/context-hogs/<repo-key>/ledger.jsonl` dosyasına eklenir. Satır şekli:
`{ts, path, tool, bytes, tokens, session_id}`. stdout'a `{}` yazılır — çıktı değil,
yan etki.

SessionEnd dalında: defter okunur, yola göre toplanır, ilk `TOP_N` dosya bir kart
metnine dönüşür ve **`systemMessage`** olarak verilir. `systemMessage` kullanıcıya
görünür, modele girmez. Aynı adımda defter `LEDGER_CAP` satıra budanır. Üçüncü bir
yol da var: `/context-hogs:leaderboard` komutu, yani kullanıcı istediğinde.

Betikte `additionalContext` hiçbir dalda üretilmiyor; kaynakta bunun bilinçli olduğunu
söyleyen bir not var (SessionEnd'de Claude Code'un onu zaten onurlandırmadığı yazıyor).

## Bağlam maliyeti

Pasif (sıradan tur, Read/Grep/Glob/Bash sonrası): **0 token.** PostToolUse dalı stdout'a
boş nesne yazıyor, `async: true` olduğu için turu da bloklamıyor.

Çağrı başı (SessionEnd): **0 token modele.** Kart `systemMessage` ile yalnız ekrana
gider; ekranda ~10 satır, ~150 kelime (**tahmin**, TOP_N=10 varsayımıyla).

Gecikme: kanca çağrısı başına ~34-38 ms (depo README'sinin kendi ölçümü, M3 Pro;
context-hogs'a özel değil, marketplace geneli).

Disk: defter satırı ~120 byte (**tahmin**), 50.000 satırlık tavanla ~6 MB üst sınır
(**tahmin**). Eşikler env ile ayarlanır: `CONTEXT_HOGS_LEDGER_CAP` (50.000),
`CONTEXT_HOGS_TOP_N` (10), `CONTEXT_HOGS_BYTES_PER_TOKEN` (4),
`CONTEXT_HOGS_USD_PER_MTOK` (3.0).

Karşılaştırma: claude-mem SessionStart'ta son 10 oturum özeti + varsayılan 50 gözlem
enjekte ediyor; dokümanda tek gözlem için ~51 token örneği veriliyor, yani açılış bloğu
kabaca 2.500-3.000 token (**tahmin**). Toplam bütçe ya da tur başı tavan dokümante
edilmemiş.

## Core'daki karşılık

Aynı hat: Core'un altın kuralı ile context-hogs'un "PostToolUse `{}` döner" dalı aynı
kararın iki uygulaması. `audits/ledger.jsonl` ile `context-hogs/ledger.jsonl` sadece
isim benzerliği değil — ikisi de append-only JSONL, ikisi de modelin görmediği yerde.

`statusline.js` + mesaj bandı, context-hogs'un `systemMessage` + slash komutu çiftinin
karşılığı: durum ekrana, karar defterine, hiçbiri bağlama.

Ayrışma noktaları: Core'un defterinde budama yok, context-hogs'ta `LEDGER_CAP` var.
Core `risk.js` ile diff'ten risk hesaplar, context-hogs byte'tan token tahmin eder —
ikisi de "modele sormadan ölç" ailesinden. Core'da tur başı ölçüm hiç yok; context-hogs
her araç sonucunda ölçüyor ve bunu bedavaya yapıyor.

## Çalınabilir fikir

**1. Async kanca bayrağı.** `hooks.json` içinde `"async": true` — kanca turu bloklamaz,
yan etkisini arkada yazar. Core'un PostToolUse tarafındaki her yazma işi için doğrudan
uygulanabilir. Altın kuralı ihlal eder mi — **hayır** (bağlama değil, gecikmeye dokunur).

**2. Boş nesne sözleşmesi.** Kanca hep çalışır, hep `{}` döner; bilgi dosyaya gider.
"Susmak" bir istisna değil, betiğin normal çıkışı. Core'da bunu tek bir yardımcıya
(`emitSilent()`) bağlamak, altın kuralı kod düzeyinde tek noktadan denetlenebilir yapar.
Altın kuralı ihlal eder mi — **hayır**, kuralın kendisini mekanizmaya çevirir.

**3. `systemMessage` kanalı.** Kullanıcıya görünen, modele girmeyen resmi kanal.
Core'un mesaj bandı bunu zaten yapıyor; `systemMessage`'ın ne zaman `additionalContext`
yerine geçtiği ve hangi kancalarda onurlandırıldığı, Core'un banner yolunun kanca
tarafındaki eşdeğerini seçerken ölçülmeye değer. Altın kuralı ihlal eder mi — **hayır**.

**4. Defter tavanı ve SessionEnd'de budama.** Ölçüm defteri sınırsız büyümez;
oturum bitiminde tek geçişte `LEDGER_CAP` satıra iner. `audits/ledger.jsonl` için
doğrudan alınabilir; tek şart budamanın denetim izini bozmaması (Core'da defter kanıt,
context-hogs'ta sadece istatistik). Altın kuralı ihlal eder mi — **hayır**.

**5. Byte→token dönüşümüyle ucuz maliyet tahmini.** `bytes / 4`, env ile ayarlanabilir
oran, üstüne `USD_PER_MTOK` ile para. Tokenizer yok, model çağrısı yok. Core'un
`COST-MODEL.md` hattına deterministik bir ölçüm organı olarak eklenebilir.
Altın kuralı ihlal eder mi — **hayır**.

**6. (claude-mem'den) Kademeli açığa çıkarma.** Bağlama tam veri değil, kimlikli bir
indeks yazılır; ayrıntıyı model isterse araçla çeker. Core bugün hiç yazmıyor, ama
ileride bir şey yazmak gerekirse doğru şekil budur. Altın kuralı ihlal eder mi —
**evet**, indeks de olsa tur başı token yazar; ancak SessionStart'a hapsedilirse
"sıradan tur" tanımının dışında kalır.

## Ret adayı gerekçe

- Kapsam Core'un derdinden dar: context-hogs bir ölçüm eklentisidir, sözleşme kapısı ya
  da risk hesabı gibi bir karar organı değil. Alınacak şey mimari değil, üç dört kalıp.
- Ölçüm byte tabanlı; gerçek tokenizer değil. Core'un maliyet modeli hassaslık isterse
  bu tahmin taşımaz.
- `systemMessage`'ın hangi kancada onurlandırıldığı sürüme bağlı; betiğin kendi notu
  SessionEnd'de `additionalContext`'in çalışmadığını söylüyor. Bu tür davranışlara
  bağlanan her mekanizma Claude Code sürümüyle bayatlar.
- Defter ev dizininde (`~/.claude/...`), proje kökünde değil. Core'un denetim defteri
  depoyla birlikte seyahat ediyor; iki yerleşim politikası birbirine karışırsa
  denetim izi bölünür.
- Budama (`LEDGER_CAP`) istatistik için doğru, kanıt için tehlikeli. Aynı mekanizma
  `audits/ledger.jsonl`'e sorgusuz taşınırsa denetim kaydı sessizce silinir.
- claude-mem tarafı için ayrı gerekçe: açılışta binlerce token yazıyor ve toplam bütçe
  tavanı dokümante değil; Core'un ölçüsüyle uyuşmuyor.

## README cümlesi

Core's hooks stay silent by contract: every ordinary turn returns an empty object, and
what gets measured goes to an append-only ledger and the status line — never to the model.
