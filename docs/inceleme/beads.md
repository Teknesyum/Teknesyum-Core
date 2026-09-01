# beads (bd)

> Kanıt seviyesi: doküman (resmî README, doküman sitesi, depo meta verisi; kurulmadı,
> çalıştırılmadı)

## Kimlik

Depo bulundu ve doğrulandı: `steveyegge/beads` bugün **`gastownhall/beads`**'e
yönleniyor — Steve Yegge'nin projesi bir kuruluş hesabına taşınmış. Ad ve açıklama:
"Beads - A memory upgrade for your coding agent". MIT lisansı, dil **Go**, varsayılan
dal `main`, arşivlenmemiş. Son push 2026-09-01 — günlük hareket var.

Kurulum bir CLI ikilisi olarak: `brew install beads`, `npm install -g @beads/bd`, ya da
sağlama toplamı doğrulayan bir kurulum betiği. macOS, Linux, Windows, FreeBSD.

Bağımlılık: kod tarafı tek ikili (Go, statik). Ama **çalışma zamanında Dolt'a bağımlı** —
sürüm kontrollü bir SQL veritabanı; git yalnız senkron ve kanca tarafında, opsiyonel.
Yani "sıfır bağımlılık" ölçütünde: kaynak seviyesinde temiz, veri seviyesinde **gömülü
bir veritabanı motoru taşıyor**.

## Çözdüğü dert

"Ajanım uzun işlerde kayboluyor: markdown'daki TODO listesi büyüyünce ne bitti ne kaldı
ve neyin neyi beklediği belirsizleşiyor, her oturumda baştan anlatıyorum."

## Veri akışı

Otoritatif depo **Dolt**'tur. İki kip var: gömülü (varsayılan, süreç içi, veriler
`.beads/embeddeddolt/` altında) ve sunucu kipi (dışarıda bir `dolt sql-server`, eşzamanlı
yazıcılar için). Senkron `bd dolt push/pull` ile git uzak sunucularına yapılır.
`.beads/issues.jsonl` **otoritatif değildir** — takas/dışa aktarım biçimidir. Bu ayrım
önemli: beads "git içinde yaşar" diye anılsa da yaşadığı şey git değil, git remote'una
itilen bir veritabanıdır.

Şema: hiyerarşik ve çakışmaya dayanıklı kimlikler — `bd-a3f8` (epic) → `bd-a3f8.1`
(görev) → `bd-a3f8.1.1` (alt görev). Kimlikler hash tabanlı, çünkü asıl dert çok
ajanlı/çok dallı çalışmada **birleştirme çakışması**: artan sayaçlı ID'ler iki dalda aynı
numarayı üretir, hash üretmez. İş kaydında öncelik (P0…), atanan, `in_progress` gibi
durumlar var. Bağımlılıklar anlamlıdır ve dört tür taşır — engelleme, ilişki, ebeveyn-
çocuk ve "bu işten türedi" (discovered-from). Ayrıca bağlantı türleri (`relates-to`,
`duplicates`, `supersedes`, `replies-to`) ve geçici yaşam döngülü bir `message` türü.

Ajan tarafı komutlarla akar: `bd prime` (iş akışı bağlamını ve kalıcı notları enjekte
eder), `bd ready` (bağımlılıkları çözülmüş, **hazır** işleri listeler), `bd update <id>
--claim` (atomik sahiplenme), `bd remember` (sonradan enjekte edilecek proje çıkarımı).
Çıktı JSON. `bd setup <agent>` hedef aracın yönerge dosyasına (CLAUDE.md / AGENTS.md) bir
"BEADS INTEGRATION" bölümü ve kancalar yazar.

Güncelleme zamanı: ajan komut çağırdıkça, artı **oturum başlangıcında kanca ile**.

## Bağlam maliyeti

Burada net bir sayı var ve Core açısından belirleyici:

- **Pasif yük:** `bd prime`, Claude Code / Codex / Gemini CLI'nın **SessionStart**
  kancasına bağlanacak şekilde tasarlanmış ve çalıştığında bağlama **~1-2k token**
  enjekte ediyor (proje dokümantasyonunun kendi rakamı). Buna ek olarak CLAUDE.md /
  AGENTS.md'ye yazılan entegrasyon bölümü var; projenin kendi issue'larından biri bu iki
  kaynağın çakıştığını ve **oturum başına ~300 token**'ın tekrarla boşa gittiğini
  söylüyor. Yani sıradan bir oturum, tek satır kod okunmadan önce 1-2k token borçlanıyor.
- **Çağrı başına yük:** `bd ready` gibi komutlar JSON döner; boyut açık iş sayısıyla
  büyür. **Tahmin:** 10 hazır iş için 400-1200 token (ölçülmedi).
- Buna karşılık projenin kendi maliyet savunması "semantik bellek çürümesi"dir: kapanan
  işler sıkıştırılıp özetlenerek bağlam penceresi korunur.

Core'un altın kuralıyla kıyas doğrudan: Core sıradan turda **0**, beads oturum başında
**~1-2k**.

## Core'daki karşılık

Karşılığı çok yakın ve karşılaştırma en verimli burada.

**Aynı işi yapan organ: sözleşme kapısı + relay.** Core'un `contracts/<ID>.md` dosyaları
beads'in issue'larıdır: kimlik (`T7`, `UI3`, `FIX12`), durum (`open → active → submitted
→ done`, geri dönüşsüz), sahiplik (`owns:`, dosya listesi), kabul ölçütü (`verify:`,
her biri 0 dönmeli) ve ilerleme (`## Checkpoint`). `done/` klasörü kapanmış işlerin
yeri, `audits/ledger.jsonl` ise kapanışın kalıcı kaydı.

**Core'da hiç olmayan kısım: bağımlılık grafiği.** Core'un sözleşmeleri birbirini
tanımıyor. Relay "bağımsız parçalar → her birine bir sözleşme, paralel" diyor ama bu
bağımsızlığı T0'ın kafasında tutuyor; dosyada `blocks` / `blocked-by` diye bir alan yok.
Dolayısıyla "şimdi hangi sözleşme hazır?" sorusunun makine cevabı da yok — `bd ready`'nin
karşılığı Core'da bir insan/model muhakemesi. İkinci eksik: "discovered-from" — çalışırken
keşfedilen işin nereden türediğini taşıyan kenar. Core'da bu bilgi `## Checkpoint`
içinde düz metin olarak kalır ve kapanışta buharlaşır.

**Core'un daha iyi olduğu kısım:** kapı gerçekten kapıdır. beads'te durum alanı bir
sütundur; `in_progress`'ten `done`'a geçmek için bir şey kanıtlamak gerekmez, ajan yazar
ve olur. Core'da `complete`, `verify:` adımlarını **çalıştırır**, riski `git diff
--numstat`'tan **hesaplar** (hassas yol örüntüleri, >8 dosya, >300 satır), yüksek riskte
`headSha` + `diffHash` ile mühürlenmiş ve kullanıldığında **tüketilen** bir denetim kaydı
ister, sonra deftere yazar. Bir sözleşme kendini düşük risk ilan edemez. beads'in
grafiği daha zengin, Core'un kapısı daha sert. İkinci üstünlük: veri biçimi. Core'un
durumu markdown + frontmatter — git diff'inde okunur, `cat`'lenir, elle düzeltilir,
hiçbir ikili gerekmez. beads'in durumu bir Dolt veritabanıdır; `issues.jsonl` yalnız
gölgesidir ve otoritatif değildir. Core'un "tek gerçek dosyadır" tercihi burada bilerek
alınmış bir tavizdir, eksiklik değil.

## Çalınabilir fikir

1. **Hash tabanlı kimlik.** Mekanizma: ID artan bir sayaçtan değil içerikten türer
   (`bd-a3f8`), böylece iki dalda açılan iki iş aynı kimliği almaz ve birleştirme
   çakışmaz. Core'un `T1`, `T7` sayacı tam bu tuzağa açıktır: iki ajan iki dalda T8
   açarsa dosya adları çakışır. Uygulanışı ucuz — `T` + hedefin/başlığın sha256'sının
   ilk 4 hane'si. **Altın kuralı ihlal eder mi — hayır**, kimlik üretimi yazma anındadır.

2. **`ready` hesabı: bağımlılık kenarı + türetilmiş sorgu.** Mekanizma: iş kaydında
   `blocked-by: [T3, T5]` alanı; "hazır" ise türetilmiş bir küme — engelleyenlerin hepsi
   `done` olan açık işler. Core'da frontmatter'a tek alan eklemekle çıkar, çünkü `done/`
   zaten diskte: `contract.js ready` açık sözleşmeleri tarar, `blocked-by`'ları `done/`
   ile eşler, hazır olanları basar. Kapı da bedava gelir: engelli bir sözleşme `active`'e
   geçemesin. **Altın kuralı ihlal eder mi — hayır**, talep üzerine çalışan alt komut;
   sonucu statusline'a düşürmek de bandın işidir, bağlamın değil.

3. **Anlamlı kenar türleri, özellikle `discovered-from`.** Mekanizma: bağımlılık tek tip
   değil; "engelliyor", "ebeveyn", "bundan türedi" ayrı kenarlar. Core için değerli olan
   üçüncüsüdür: relay zaten "sözleşmeyi genişletme, blokeri Checkpoint'e yaz ve dön"
   diyor — o blokerden yeni bir sözleşme açıldığında `from: T7` kenarı, kapanmış işin
   niçin dallandığını deftere taşır. **Altın kuralı ihlal eder mi — hayır.**

4. **Kapanan işin sıkıştırılması ("semantik bellek çürümesi").** Mekanizma: kapanan iş
   tam metniyle değil özetiyle saklanır, ayrıntı arşivde kalır. Core'un `done/`'u tam
   metni tutuyor; deftere giden satır zaten kısa. Yani Core bunu yarı yarıya yapıyor —
   çalınacak kısım, `done/` içindeki sözleşmelerin belli bir yaştan sonra tek satıra
   indirilip ayrı bir arşive taşınması olurdu. **Altın kuralı ihlal eder mi — hayır**,
   ama `trash/` kuralıyla ve "ölü dosya bırakma" ilkesiyle önce uzlaştırılmalı.

5. **Atomik sahiplenme (`--claim`).** Mekanizma: durum değişimi ve atama tek işlemde,
   yarış koşulu olmadan. Core'da "bir ajan ilk düzenlediği sözleşmeye bağlanır" kuralı
   var ama bağlanma örtük; açık bir `claim` adımı iki ajanın aynı sözleşmeye girmesini
   dosya kilidi seviyesinde engellerdi. **Altın kuralı ihlal eder mi — hayır.**

**Almaya değmeyecek kısım açıkça:** `bd prime` + SessionStart kancası. Mekanizma olarak
bile alınamaz — Core'un tek ayırt edici vaadi, o kancanın yazmadığı 1-2k token'dır.

## Ret adayı gerekçe

En güçlü neden bağımlılık ve otorite: beads'i almak, Core'un durumunu markdown'dan
Dolt'a taşımak demek. Core'un sözleşmesi bugün `git diff`'te okunuyor, elle
düzeltilebiliyor ve hiçbir ikiliye muhtaç değil; beads'te otoritatif olan JSONL bile
değil, gömülü veritabanı. Buna ek olarak beads'in ajan entegrasyonu kanca ile bağlam
enjeksiyonuna dayanıyor — Core'un baştan reddettiği desen. Fikirleri (grafik, ready,
hash ID) taşınabilir; taşıyıcısı taşınamaz.

## README cümlesi

You do not need to install this: Core already tracks work as gated markdown contracts
whose status is verified by running your own commands rather than asserted in a database,
and it does it without injecting a kilobyte of workflow preamble into every session.
