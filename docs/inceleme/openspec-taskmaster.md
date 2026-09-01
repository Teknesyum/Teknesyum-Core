# OpenSpec ve Taskmaster

> Kanıt seviyesi: doküman (her iki projenin resmî dokümanları ve depo meta verisi;
> kurulmadı, çalıştırılmadı)

Aynı kategorinin iki farklı cevabı: **spec'ten görev üretimi ve durum takibi**. OpenSpec
cevabı dosyaya, Taskmaster cevabı JSON'a ve MCP'ye veriyor. Kıyas boyunca ölçüt tek:
durum nerede saklanıyor, kapı neyle zorlanıyor, ve sıradan tur kaç token ödüyor.

## Kimlik

**OpenSpec** — `Fission-AI/OpenSpec`, MIT, dil **TypeScript**, son push 2026-09-01.
Kurulum npm üzerinden bir CLI (`openspec init` ile projeye yerleşir); `openspec update`
seçili ajanlar için komut/skill dosyalarını yeniden üretir. Bağımlılık sayısı
sayılmadı — bir Node CLI'ı, LLM'e kendi başına gitmiyor: model çağrılarını **ajan
yapıyor**, CLI yalnız dosyaları ve doğrulamayı yönetiyor. Bu, Core'un felsefesine bu
raporun en yakın noktası.

**Taskmaster** — `eyaltoledano/claude-task-master`, lisans "Other/NOASSERTION" (net
değil, `LICENSE with Commons Clause` olduğu biliniyor — doğrulanmadı), dil
**JavaScript**. Son push **2026-04-28** — dört aydan uzun süredir hareketsiz; incelenen
dördü içinde tek durgun depo. Kurulum: `npm i -g task-master-ai` CLI olarak, ya da bir
**MCP sunucusu** olarak editöre bağlanarak (Cursor, Windsurf, Roo, Claude Code). Ek
paketleri var (`@taskmasterai/cli`). LLM sağlayıcısına doğrudan bağımlı: PRD'yi ayrıştıran,
görev üreten ve karmaşıklık puanlayan model çağrılarını **kendisi** yapıyor, yani API
anahtarı ister.

## Çözdüğü dert

**OpenSpec:** "İstediğim şey sohbet geçmişinde kalıyor; ajan neyi kabul ettiğimizi
bilmiyor, ben de sonradan neyin niçin değiştiğini gösteremiyorum."

**Taskmaster:** "Elimde bir gereksinim belgesi var; onu tek tek görevlere bölüp sırasını
ve neyin neyi beklediğini elle çıkarmakla uğraşmak istemiyorum."

## Veri akışı

**OpenSpec** iki dizini keskin biçimde ayırıyor ve asıl fikri burada:

- `openspec/specs/` — **şu anki gerçek**, alan alan (`auth/`, `payments/`), her alanda bir
  `spec.md`. Gereksinimler Given/When/Then senaryolarıyla ve RFC 2119 anahtar
  kelimeleriyle (MUST/SHALL/SHOULD/MAY) yazılıyor.
- `openspec/changes/` — **önerilen değişiklikler**, her biri kendi klasöründe:
  `proposal.md` (niyet, kapsam, yaklaşım), `tasks.md` (1.1, 1.2 diye numaralı, kutucuklu
  kontrol listesi) ve **delta spec**'ler.

Delta biçimi çalınmaya değer olan şey: bir değişiklik, spec'in tamamını yeniden yazmıyor;
üç bölüm altında yalnız farkı yazıyor — `ADDED Requirements`, `MODIFIED Requirements`
(eskisi not düşülerek), `REMOVED Requirements`. Aynı spec dosyasına dokunan birden çok
değişiklik böylece çakışmadan paralel yürüyebiliyor. İş bitince **archive** adımı
deltaları ana spec'e birleştiriyor ve değişiklik klasörünü tarih önekiyle
`changes/archive/` altına taşıyor. Yani spec zamanla birikerek oluşuyor, tek seferde
yazılmıyor.

Akış: `/opsx:explore` → `/opsx:propose` → `/opsx:apply` → `/opsx:archive`; içeride
öneri → spec → tasarım → görev → uygulama. Görev durumu `tasks.md`'deki `- [ ]` / `- [x]`
kutucuğunda; `openspec status` artefakt ve görev tamamlanma durumunu basıyor.

**Taskmaster** durumu tek bir yapılandırılmış dosyada tutuyor: `tasks.json`. Şema —
zorunlu `id` (sayı), `title`, `description`, `status`; opsiyonel `dependencies` (görev
id'lerinden dizi), `priority`, `details`, `testStrategy`, `subtasks`. Geçerli durumlar:
`pending`, `in-progress`, `done`, `review`, `deferred`, `cancelled`. Alt görevler aynı
alanları taşıyor, id'leri yalnız ebeveyn içinde tekil. Ayrıca her görev için okunabilir
birer markdown dosyası **türetiliyor** — otoritatif olan JSON, markdown onun görüntüsü.

Giriş bir PRD; `parse-prd` onu bir model çağrısıyla bağımlılıkları eşlenmiş görev
listesine çeviriyor. `analyze-complexity` görevleri 1-10 arası puanlıyor ve kaç alt
göreve bölünmesi gerektiğini öneriyor; `expand-task` bölüyor. Ajan tarafı yedi çekirdek
araçla dönüyor: `get_tasks`, `next_task`, `get_task`, `set_task_status`, `update_subtask`,
`parse_prd`, `expand_task`. `next_task`, bağımlılıkları çözülmüş bir sonraki işi seçiyor.

Kıyasın özeti: **OpenSpec'in durumu insanın okuduğu markdown, Taskmaster'ınki makinenin
okuduğu JSON.** OpenSpec'te git diff'i anlamlıdır (bir kutucuk işaretlendi, bir gereksinim
eklendi); Taskmaster'da `tasks.json` diff'i yeniden sıralanmış bir nesne ağacıdır.

## Bağlam maliyeti

**OpenSpec.** Pasif yük tasarım gereği düşük: komutlar slash komut / skill dosyası olarak
yerleşiyor ve yalnız çağrıldığında okunuyor. Ama `openspec init` hedef aracın yönerge
dosyasına (AGENTS.md / CLAUDE.md) bir yönlendirme bloğu yazıyor ve **o blok her turda
bağlamdadır**. **Tahmin:** 200-600 token/tur (ölçülmedi). Çağrı başına yük, okunan
artefaktla orantılı: bir `proposal.md` + delta + `tasks.md` için **tahmin** 2-6k token.

**Taskmaster.** MCP kipinde pasif yük kaçınılmazdır ve bu, altın kural açısından
belirleyici olan noktadır: **MCP araç tanımları her istemde bağlamdadır.** Yedi çekirdek
araç için **tahmin: 1.5-3k token/tur**; aracın tüm araç yüzeyi açıldığında (belgelerde
çekirdek yedinin dışında onlarca komut var) bu rakam katlanır. Buna AGENTS/CLAUDE.md
yönerge bloğu ekleniyor. Çağrı başına: `get_tasks` açık iş sayısıyla büyür, **tahmin**
20 görev için 1-3k token.

Core ile kıyas tek satırda: Core sıradan turda **0** token; OpenSpec birkaç yüz;
Taskmaster MCP olarak bağlandığında binler.

## Core'daki karşılık

**Görev/durum tarafında aynı işi yapan organ, ikisi için de sözleşme kapısı.** Core'un
`contracts/<ID>.md` frontmatter'ı Taskmaster'ın `tasks.json` kaydının markdown'a
serilmiş hâlidir: `id`, `status`, `round`, `owns`, `verify`. OpenSpec'in `tasks.md`
kutucukları ise Core'un `## Checkpoint`'ine denk düşer.

Üç fark kritik:

1. **Durum makinesi.** Taskmaster'ın altı durumu serbestçe dolaşılabilir bir kümedir;
   Core'unki yönlüdür — `open → active → submitted → done`, geri dönüş yok, `open`
   doğrudan `active`'i atlayamaz, `blocked` iki yönde de serbest. Core burada daha sıkı.
2. **Kapıyı kim zorluyor.** Her ikisinde de cevap: kimse. Taskmaster'da `set_task_status`
   bir alan yazar; hiçbir şey çalıştırılmaz. OpenSpec'te doğrulama var (`openspec
   validate --strict`, `/opsx:verify` bulguları CRITICAL/WARNING/SUGGESTION diye
   ayırır) ama dokümanın kendi ifadesiyle arşivleme **eksik görevlerde bloke etmez,
   yalnız uyarır**; CI ya da git kancası yok, doğrulama ajan iş akışının içinde kalır.
   Core'da `complete` `verify:` adımlarını çalıştırır, riski diff'ten hesaplar, yüksek
   riskte tüketilen bir denetim kaydı ister. **Bu üçlü içinde tek gerçek kapı Core'da.**
3. **Bağımlılık.** İkisinde de var, Core'da yok. Taskmaster `dependencies` dizisi +
   `next_task`; OpenSpec artefakt bağımlılıklarını izliyor ve karşılanmadan komutun
   ilerlemesine izin vermiyor. Core'un sözleşmeleri birbirini tanımıyor.

**Core'da hiç olmayan ikinci kısım: değişikliğin gerçekten ne değiştirdiğinin metinsel
kaydı.** Core'un defteri "T7 kapandı, risk düşük, HEAD abc1234" der; hangi davranışın
eklendiğini söylemez. OpenSpec'in delta'sı tam olarak bunu söyler ve arşivlenince kalıcı
spec'e karışır.

**Core'un daha iyi olduğu kısım, kapının yanında ikinci bir yerde: sahiplik.** İki araçta
da bir görevin hangi dosyalara dokunacağı yazılı değildir. Core'da `owns:` bir dosya
listesidir, dizin reddedilir (dizin digest'i içeriği değişince değişmez, mühür yalan
söylerdi), ajan ilk düzenlediği sözleşmeye bağlanır ve sonra yalnız o listenin içine
yazabilir. Bu, "görev takibi"nden "yetki sınırı"na geçiştir ve iki adayda da karşılığı
yok.

## Çalınabilir fikir

1. **Delta biçimi: `ADDED` / `MODIFIED` / `REMOVED` üçlüsü (OpenSpec).** Mekanizma:
   değişiklik, hedef belgenin kopyası olarak değil, üç başlık altında yalnız fark olarak
   yazılır; kapanışta bir birleştirme adımı farkı gerçeğe işler. Core'daki yeri:
   sözleşmenin `## Acceptance`'ı bugün havada duran bir vaattir; kapanışta hiçbir yere
   birleşmez. Bir `## Delta` bölümü ve `complete` sırasında onu proje spec'ine ekleyen
   bir adım, defteri "ne oldu"dan "ne oldu ve sistem artık ne yapıyor"a taşır.
   **Altın kuralı ihlal eder mi — hayır**, birleştirme kapanış anında çalışır; sıradan
   turda kimse okumaz.

2. **Ayrık iki dizin: gerçek ve öneri (OpenSpec).** Mekanizma bir veri yapısından çok bir
   yerleşim kuralı: `specs/` yalnız kanıtlanmış davranışı, `changes/` yalnız önerilmişi
   tutar; ikisi asla karışmaz ve karışma anı **archive** diye adlandırılmış tek bir
   geçittir. Core'un `contracts/` ve `contracts/done/` ayrımı bunun yarısıdır — eksik
   olan, `done/`'un bir **birikime** dönüşmesi. **Altın kuralı ihlal eder mi — hayır.**

3. **Arşive tarih öneki ve tam klasörün korunması (OpenSpec).** Mekanizma: kapanan iş
   silinmez, `YYYY-MM-DD-<ad>` diye önek alıp arşive taşınır. Core'un `RULES.md`'sindeki
   `trash/` kuralıyla aynı ruh; `done/` için tarih öneki, kronolojiyi dosya adından
   okunur kılar. **Altın kuralı ihlal eder mi — hayır.**

4. **`next` / hazır iş seçimi bağımlılıktan türetilir (Taskmaster).** Mekanizma:
   `dependencies` alanı + "hepsi `done` olan"ı süzen türetilmiş sorgu. Core'da
   `blocked-by:` frontmatter alanı ve `contract.js next`, aynı hesabı diskten yapar —
   `done/` zaten orada. **Altın kuralı ihlal eder mi — hayır**, talep üzerine komut;
   sonucu göstermek gerekirse statusline'a düşer, bağlama değil.

5. **Karmaşıklık puanı → bölme eşiği (Taskmaster).** Mekanizma: görev 1-10 arası
   puanlanır ve eşiği aşan görev için alt görev sayısı önerilir. Core'da bunun **modelsiz**
   karşılığı hazır duruyor: `risk.js` zaten dosya sayısı (>8) ve diff satırı (>300)
   sayıyor. Aynı sayaç, kapanışta risk için değil **açılışta bölme için** kullanılabilir:
   `owns` 8 dosyayı aşan bir sözleşme açılırken "bunu ikiye böl" uyarısı verir.
   **Altın kuralı ihlal eder mi — hayır**, `risk.js` git'e sorar, modele değil.

6. **Türetilmiş insan görünümü (Taskmaster).** Mekanizma: otorite JSON'da, insan için
   markdown **üretilir**. Core bunu bilerek ters çeviriyor — otorite markdown. Çalınacak
   olan yön değil, **ilke**: iki temsil varsa biri türetilmiş olmalı ve elle
   düzenlenmemeli. Core'da `map.md` zaten böyle (üretilen import grafiği); kural açıkça
   yazılırsa `done/` özetleri de aynı disiplinle üretilebilir.
   **Altın kuralı ihlal eder mi — hayır.**

**Almaya değmeyecek kısım:** Taskmaster'ın MCP taşıyıcısı. Araç tanımları her istemde
bağlamda durur; Core'un tek ayırt edici vaadi tam olarak o satırların **olmaması**dır.

## Ret adayı gerekçe

**OpenSpec için:** getirdiği ağırlık, çözdüğü derdin Core'da zaten kısmen çözülmüş
olmasına oranla büyük. Bir özellik için öneri + delta + tasarım + görev dosyası açmak,
Core'un "tek dosya, tek sözleşme, kapanınca deftere tek satır" ekonomisini bozar; ve
OpenSpec'in doğrulaması bloke etmediği için Core'a katılık da katmaz. Fikir olarak delta
biçimi taşınabilir, araç olarak taşıyıcı gereksizdir.

**Taskmaster için:** iki bağımsız sebep üst üste biniyor. Birincisi taşıyıcı — MCP
sunucusu olarak bağlandığında sıradan turda binlerce token'lık araç tanımı taşır ve bu
altın kuralın doğrudan ihlalidir. İkincisi bakım ve lisans — depo aylardır hareketsiz,
lisansı NOASSERTION görünüyor, ve PRD ayrıştırma ile karmaşıklık puanlaması kendi model
çağrılarını yaptığı için Core'a bir API anahtarı bağımlılığı sokar. Üstelik Core'un
`risk.js`'i aynı bölme kararını modelsiz, git'ten okuyarak verebiliyor.

## README cümlesi

You do not need to install this: Core keeps the same spec-to-task discipline in one
markdown contract whose acceptance is executed at close and whose status never reaches
the model as tool definitions or a preamble, so an ordinary turn still costs zero tokens.
