# GitHub Spec Kit

> Kanıt seviyesi: doküman + kod (komut şablonları `templates/commands/` içinden okundu;
> kurulmadı, çalıştırılmadı)

## Kimlik

Depo `github/spec-kit`, MIT, dil **Python** (3.11+). Son push 2026-09-01. Kurulum bir CLI
aracı olarak: `uv tool install specify-cli` (ya da `uv tool install specify-cli --from
git+https://github.com/github/spec-kit.git@vX.Y.Z`), alternatif `pipx`. Ön koşullar: git,
Python 3.11+, desteklenen bir ajan.

Bağımlılık sayısı: tam sayılmadı; ama kurulum yolu `uv`/`pipx` üzerinden bir Python
paketidir, yani Node dünyasındaki bir eklenti için doğrudan taşınabilir değil.
Asıl teslim ettiği şey kod değil, **şablon ve komut metinleridir** — projeye `.specify/`
altına kopyalanan templates ve hedef ajanın komut dizinine yazılan slash komutları.

## Çözdüğü dert

"Ajana ne istediğimi doğru dürüst anlatmadan kod yazdırıyorum; sonra çıkan şey benim
istediğim şey olmuyor ve nerede saptığını gösteremiyorum."

## Veri akışı

Zincir sabit ve her halka bir dosya bırakır:

`/speckit.constitution` → `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` →
`/speckit.implement` → `/speckit.converge`. Yanında isteğe bağlı `clarify`, `analyze`,
`checklist`.

Artefaktlar dosya sistemindedir. Şablonlar ve yerel geçersiz kılmalar `.specify/templates/`
(ve `.specify/templates/overrides/`) altında; özellik başına klasörler `specs/` altında;
proje ilkeleri `memory/constitution.md` içinde. Yani **durum tamamen markdown'dır** —
veritabanı yok, JSON durum dosyası yok. Core'un markdown + frontmatter tercihiyle
aradaki mesafe, incelenen dört adayın en kısası.

Görev üretimi kayda değer biçimde ayrıntılı. `/speckit.tasks`, önce depo kökünden bir
hazırlık betiği çalıştırıyor (bash / PowerShell / Python sürümleri var) ve özellik
dizinini, mevcut tasarım belgelerini, görev şablonunu döndürüyor. Sonra zorunlu girdileri
okuyor — `plan.md` (teknoloji yığını, yapı) ve `spec.md` (öncelikli kullanıcı hikâyeleri)
— isteğe bağlı olarak `data-model.md`, `contracts/`, `research.md`, `quickstart.md` ve
varsa `memory/constitution.md`. Çıktı tek bir `tasks.md`, satır biçimi katı:

```
- [ ] T012 [P] [US1] Create User model in src/models/user.py
```

`[P]` = paralel çalıştırılabilir (farklı dosyalar, engelleyen bağımlılık yok), `[US1]` =
hangi kullanıcı hikâyesine ait. Fazlar sabit: Faz 1 kurulum, Faz 2 engelleyen temel işler,
Faz 3+ öncelik sırasına göre kullanıcı hikâyesi fazları, sonda cilalama. Görev durumu
`- [ ]` / `- [x]` kutucuğuyla taşınıyor.

Güncelleme zamanı: her şey talep üzerine, kullanıcı komutu çağırdığında.

## Bağlam maliyeti

**Pasif yük: sıfır.** Spec Kit bir oturum kancası kurmuyor; komutları yalnız çağrıldığında
okunan slash komut dosyaları olarak yerleştiriyor. Bu, incelenen adaylar içinde altın
kurala aykırı düşmeyen tek yapıdır — ama sebebi tasarım tercihi değil, kapsam: Spec Kit
bir "durum bildirici" değil, bir "komut zinciri".

**Çağrı başına yük yüksek.** Her komut, kendi şablonunu **artı** okuduğu artefaktları
bağlama alıyor. `/speckit.tasks` en pahalısı: komut şablonu + `plan.md` + `spec.md` +
opsiyonel dört belge + anayasa. **Tahmin:** komut şablonu 1-3k, `spec.md` 1-4k, `plan.md`
1-3k, anayasa 0.5-1.5k → **çağrı başına 5-12k token** (ölçülmedi). `/speckit.analyze` üç
artefaktı birden okuduğu için benzer mertebede.

## Core'daki karşılık

**Aynı işi yapan organ: relay + sözleşme.** Relay, T0'ın işi bölüp sözleşmelere dağıtması;
Spec Kit'in `/tasks` adımı da tam olarak plandan görev listesi türetme. `tasks.md`
satırının karşılığı Core'da bir `contracts/<ID>.md` dosyasıdır; `[P]` işaretinin
karşılığı relay'in "bağımsız parçalar → paralel, her birine bir sözleşme" satırıdır;
`- [x]`'in karşılığı `status: done` ve `done/` klasörüdür.

**Core'da hiç olmayan kısımlar üç tane.** Birincisi **spesifikasyon katmanı**: Core'un
sözleşmesi bir `## Goal` cümlesi ve `## Acceptance` maddeleriyle başlar; öncesinde
kullanıcı hikâyesi, öncelik (P1/P2/P3) ve kabul senaryosu yoktur. İkincisi **anayasa**:
projeye özgü, komutlar arası taşınan kalıcı ilke dosyası — Core'da bunun yerine
kullanıcının global `RULES.md`'si ve `AGENTS.md` dosyaları var, ama sözleşme kapısının
denetlediği bir proje anayasası yok. Üçüncüsü **çapraz tutarlılık taraması**: spec ↔
plan ↔ tasks arasında kapsanmayan gereksinim, çelişen yönerge, ölçülemez ifade avı.

**Core'un açık ara daha iyi olduğu kısım: kapının nasıl zorlandığı.** Spec Kit'in
`/speckit.analyze` komutu altı geçiş yapıyor (yineleme, muğlaklık, eksik belirtim,
anayasa uyumu, kapsama boşluğu, tutarsızlık) ve CRITICAL bulgular için "`/implement`
öncesi çözmenizi öneririm" diyor. Anahtar kelime **öneririm**. Bu kapı bir betik değil,
bir **model yönergesidir**: hazırlık betiği yalnız dosyaların varlığını doğruluyor,
tutarlılık kararını modelin kendisi veriyor ve kendi kararını uygulamak zorunda değil.
Görev tamamlanması da öyle — `- [x]` işaretini koyan, işi yapan ajandır; hiçbir şey
çalıştırılmaz. Core'da ise `contract.js complete` `verify:` adımlarını **çalıştırır**,
sıfır dönmeyen adım kapıyı kapatır, risk `git diff --numstat`'tan hesaplanır ve yüksek
riskte `headSha` + `diffHash`'e bağlı, tüketilen bir denetim kaydı ister. Aynı sorunun
iki cevabı: Spec Kit modele "kontrol et" diyor, Core kabuğa "çalıştır" diyor.

## Çalınabilir fikir

1. **Anayasa dosyası: her kapının okuduğu, projeye özgü kalıcı ilkeler.** Mekanizma:
   tek bir `memory/constitution.md`, MUST/SHOULD ayrımlı maddeler, ve bu maddelere
   **atıfla** yapılan denetim (bulgu "anayasa III. maddeye aykırı" diye adlandırılır).
   Core'daki yeri belli: `auditor` rolü bugün genel bir muhakeme yapıyor; numaralı bir
   proje anayasası, denetim kaydındaki `verification` alanını "iyi görünüyor"dan
   "madde 4 sağlandı, madde 7 sağlanmadı"ya çevirir.
   **Altın kuralı ihlal eder mi — hayır**, dosya yalnız denetim anında okunur; hiçbir
   kanca onu bağlama enjekte etmez. (Enjekte edilirse kuralı ihlal eder — sınır burada.)

2. **`[P]` işareti: paralellik iddiası dosya ayrıklığından türer.** Mekanizma: bir görev
   ancak dokunduğu dosyalar başka hiçbir eşzamanlı görevle kesişmiyorsa paralel
   işaretlenir. Core'da bu **hesaplanabilir**, çünkü `owns:` zaten dosya listesidir ve
   dizin yasaktır: açık sözleşmelerin `owns` kümeleri kesişmiyorsa paralel açılabilirler,
   kesişiyorsa hayır. Bugün bu güvence yok — iki sözleşme aynı dosyayı `owns`'una
   yazabilir ve bunu kimse söylemez. Bir `contract.js overlap` kontrolü, iddiayı küme
   kesişimine indirger. **Altın kuralı ihlal eder mi — hayır**, talep üzerine komut.

3. **Kapsama eşlemesi: her gereksinim ↔ en az bir görev.** Mekanizma: `analyze`'in
   beşinci geçişi, gereksinimleri görevlere eşliyor ve **eşlenmemiş olanı** bulgu olarak
   basıyor. Core karşılığı doğrudan: sözleşmenin her `## Acceptance` maddesi, en az bir
   `verify:` adımına eşlenmeli. Eşlenmeyen madde varsa `check` bunu söyler. Bu, bugünkü
   "verify: [] yazıp niçinini açıkla" kaçış kapısını denetlenebilir hâle getirir.
   **Altın kuralı ihlal eder mi — hayır**, `check`/`complete` içinde çalışır.

4. **Faz sıralaması: kurulum → engelleyen temel → hikâye fazları → cilalama.** Mekanizma
   bir veri yapısı değil, sabit bir **şablon iskeleti**; relay'in "boyut" tablosuna
   eşdeğer ama zaman eksenli. Core'un `PLAN.md`'si (sıfırdan projeler için) bu iskeleti
   ödünç alabilir: temel fazı bitmeden hikâye fazı sözleşmesi açılmaz.
   **Altın kuralı ihlal eder mi — hayır.**

5. **`converge` adımı: kodu spec'e karşı ölçüp kalan işi göreve çevirmek.** Mekanizma:
   bitiş bir beyan değil, bir **fark hesabı** — kod tabanı spec/plan/tasks'a karşı
   değerlendirilir ve eksik ne varsa listeye yeni görev olarak eklenir. Core'da
   `contract.js close --reason` işi kapatıyor ama kalan işi bir yere kaydetmiyor;
   kapanmayan kabul maddesinin otomatik olarak yeni bir sözleşme taslağına dönüşmesi bu
   fikrin Core'daki hâli olurdu. **Altın kuralı ihlal eder mi — hayır.**

## Ret adayı gerekçe

En güçlü neden ağırlık ve tekrar: Spec Kit tek bir özellik için altı komut ve yarım düzine
markdown artefaktı üretiyor, ve bu artefaktların her biri sonraki komutta yeniden bağlama
okunuyor. Core'un tüm maliyet felsefesi bunun tersi — sözleşme tek dosya, kapanışta
kapanır, defterde tek satır kalır. Üstelik Spec Kit'in kapısı model yönergesiyle
zorlanıyor; Core'a kazandıracağı katılık değil, ondan alacağı katılık var. Ayrıca Python
kurulumu, Node + sıfır bağımlılık duruşuna doğrudan bir yabancı cisim.

## README cümlesi

You do not need to install this: Core turns intent into work through a single gated
contract whose acceptance is executed rather than reviewed, so you get the discipline of
a spec chain without carrying six markdown artifacts back into context at every step.
