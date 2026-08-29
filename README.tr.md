<!-- lang -->

**Türkçe** · [English](README.md)

<div align="center">
<img src="assets/banner.svg" alt="Teknesyum Core: Claude Code'da çok ajanlı iş için sözleşme kapısı. Adın altında eklentinin sohbete bastığı satır duruyor: Teknesyum, 3 Opus-Medium İşçi Çalışıyor. Onun altında birbirine bağlı üç aşama: kancalar, kapı ve roller." width="900">
</div>

# Teknesyum Core

Claude Code'da çok ajanlı iş için sözleşme kapısı.

---

## Neyi çözüyor

"Bitti" diyen bir ajan iddia ediyordur, kimse de bunu ölçmez. Küçük bir değişiklikte
sorun değil. On iki paralel ajanda ise bir dal sessizce böyle bozulur: hepsi başarı
bildirir, hiçbiri ötekinin testini çalıştırmamıştır, hata bir saat sonra başkasının işinin
içinde ortaya çıkar.

Core "bitti"yi iddia olmaktan çıkarıp ölçüme çeviriyor. İş sözleşmelere bölünüyor. Bir
sözleşme sahip olduğu dosyaları ve bittiğini kanıtlayan komutları yazar. O komutlar 0 ile
çıkmadan hiçbir şey kapanmaz, risk beyandan değil gerçek diff'ten hesaplanır ve yüksek
riskli bir kapanış denetim kaydı olmadan reddedilir.

İkinci sorun bütün bu iskelenin maliyeti. Eklentiler yapılarını genelde bağlamla satın
alır: komut listesi, ajan açıklamaları, her mesaja enjekte edilen bir kural bloğu. Bu, her
turda ödediğiniz ve transkriptin tamamıyla birlikte tekrar tekrar gönderilen bir faturadır.
Core'un zorlaması kancalarda yaşıyor; kancalar dosya okur, dosya yazar ve modelle hiç
konuşmaz. **Tur başına maliyet sıfır token** — tahmin değil, ölçüm; tablo
[docs/COST-MODEL.md](docs/COST-MODEL.md) içinde.

---

## Kurulum

### Windows — tek satır

```powershell
irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.1.12/install.ps1 | iex
```

### macOS / Linux — tek satır

```bash
curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.1.12/install.sh | bash
```

### Claude Code içinden

```
/plugin marketplace add Teknesyum/Teknesyum-Core
```

```
/plugin install teknesyum-core@teknesyum
```

**Kurduktan sonra Claude Code'u yeniden başlatın.** Kancalar oturum ortasında yeniden
yükleniyor, ama masaüstü istemci ürettiklerini yeniden başlatana kadar çizmiyor.

İki tek satırlık komut da `main`'e değil bir **etikete** bakıyor: kabuğa borulanan şey
yayınlanmış betiktir, dalın bugün taşıdığı şey değil. Her sürüm, iki kurulum betiğinin
SHA-256 özetini notlarında yayınlıyor.

**Gerekli:** Claude Code, git. **İsteğe bağlı:** Node.js — o olmadan durum satırı ve kapı
betikleri çalışmaz, bu size söylenir, tahmin etmeye bırakılmazsınız.

Kurulum betikleri sonunda kurulumu kendi terminalinizde çalıştırır; soruları orada sorar ve
hiçbir maliyeti olmaz. Atlarsanız betiği kendiniz çalıştırabilirsiniz:

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

**ya da şunu Claude'a yapıştırın:**

> Teknesyum Core'u kur. `node <plugin>/scripts/setup.js --check` çalıştır; `<plugin>`
> kurulu teknesyum-core dizinidir. JSON basar. `missing` altındaki her soruyu tek bir
> mesajda bana sor, sonra karşılık gelen bayraklarla `node <plugin>/scripts/setup.js
> --apply` çağır. Hiçbir ayar dosyasını kendin yazma.

Kurulum `~/.claude/teknesyum/config.json` dosyasını yazar ve durum satırını bağlar. Bir
sonraki oturumda geçerli olur.

---

## Nasıl çalışıyor

### Sözleşme

Sözleşme, `.claude/relay/contracts/` altında bir markdown dosyası. Bir hedef, sahip olduğu
dosyaların `owns:` listesi ve `verify:` komutları taşır.

```markdown
## Goal
Banner kullanıcının dilinde okunuyor.

## owns
core/scripts/statusline.js
core/strings.json

## verify
node test/all.js
```

`owns:` dosya listeler, dizin değil — dizin, henüz var olmayan dosyalar hakkında verilmiş
bir sözdür. Sözleşmeyi kapatılabilir kılan şey `verify:`: kabul ölçütü 0 ile çıkan bir
komut olarak yazılamıyorsa sözleşme yanlış bölünmüştür, planlayıcıya da onay kutusu
uydurmak yerine bunu açıkça söylemesi söylenir.

<div align="center">
<img src="assets/flow-contract.svg" alt="Bir sözleşmenin ömrü: açılır, bir ajan onu etkin duruma alır, ajan sunar ve kapı sözleşmenin kendi verify komutlarını çalıştırır. Başarısız bir komut sözleşmeyi etkin duruma geri gönderir. Her komut sıfırla çıktığında kapı riski diff'ten hesaplar; yüksek riskte ayrıca ajanı ve doğrulamayı yazan bir denetim kaydı ister ve ancak o zaman sözleşme bitmiş sayılıp dosyası kapalı klasöre taşınır." width="900">
</div>

### Kapı

Bir sözleşmeyi kapatabilen tek şey `contract.js complete`. Rapora inanmak yerine verify
komutlarını kendisi çalıştırır, riski diff'ten hesaplar ve yüksek riskli kapanışı, ajanı ve
neyi doğruladığını yazan bir denetim kaydı olmadan reddeder. Denetim kayıtları mühürlü bir
zincir oluşturur; sonradan kayıt eklemek kırığı göstermeden mümkün değildir.

Dosya sisteminin önünde iki kanca duruyor. `guard.js`, mevcut sözleşmenin sahip olmadığı bir
dosyaya yazmayı engeller ve kapının kendi muhasebe klasörlerine kabuktan yazmayı tamamen
kapatır — onları düzenleyebilen bir kabuk kapanışı taklit edebilir. `prefs.js`, gerekli
işaretleri taşımayan bir README ya da LICENSE yazımını engeller; yazarın tercih dosyası
yoksa hemen çıkar, yani başkası için etkisizdir.

### Maliyet

Claude Code'un sunduğu her mekanizma, bedelini ne zaman ödediğinize göre sınıflanıyor:
**S** bağlam başına bir kez, **O** yalnız özellik çalışınca, **C** her mesajda sonsuza
kadar, **Z** hiç. Tablodan çıkan tek kural şu: sıradan bir turda hiçbir kanca bağlama
yazmaz.

<div align="center">
<img src="assets/flow-cost.svg" alt="Bir turun eklenti kancalarından geçişi ve her birinin modelin bağlamına ne yazdığı. İstem gelir; cue kancası susar; araç çalışmadan önce guard bir yazımı, prefs ise işaretsiz bir README'yi engelleyebilir; her araçtan sonra izleyici adımı diske yazar; cevap akarken notice kancası banner'ı yalnızca görüntü olarak çizer; sonunda bildirici ses çalar. Modelin bağlamına giden her ok boştur, yani tur başına maliyet sıfır tokendir." width="900">
</div>

Sohbetteki banner `MessageDisplay` kancasından geliyor; çizileni değiştiriyor, saklananı ve
modelin gördüğünü değiştirmiyor — binary'nin kendi cümlesiyle *"Display-only: the stored
message and what the model sees are untouched."* Mesaj başına yaklaşık 43 ms node açılışı
tutuyor, token maliyeti hiç yok. Ondan önce on beş kanal denendi ve kapandı; kaydı
[docs/DECISIONS.md](docs/DECISIONS.md) içinde.

### Ajanlar

<div align="center">
<img src="assets/flow-agents.svg" alt="İşin nasıl dağıtıldığı. Ana ajan işi sözleşmelere böler. Her sözleşme bir rol adı taşır; rol ile etkin profil kademe tablosundan tek bir hücre seçer, hücre de bir model ve efora çözülür. Ajanlar sonra paralel çalışır ve her biri diske kendi kaydını bırakır. Yanlarında danışman, soranın bir üst basamağında açılır: opus soruyorsa fable, sonnet soruyorsa opus cevaplar." width="900">
</div>

Tek bir ajan türü var: `worker`. Rol, istemde adı geçen bir dosya:

```
Read <plugin>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `ui-builder`, `planner`, `auditor`, `advisor`, `scout`, `scribe`. Her bağlamda
duran yedi ajan açıklaması bire indi; rol metnini yalnız o rolü taşıyan ajan ödüyor.

Rol ve profil [core/tiers.json](core/tiers.json) içinden bir hücre seçer; hücre bir model ve
bir efordur. Üç profil — `eco`, `normal`, `premium` — bütün ızgarayı kaydırır. Sinyaller
hücreyi yükseltir, profil tavan koyar; hiçbir şey aşağı çekmez. Tekrarlayan hata önce eforu
sonra modeli yükseltir ve art arda hata sayısını kimsenin hafızası değil bir kanca tutar.

**Danışman** soranın bir üst basamağında çalışır: sonnet sorar opus cevaplar, opus sorar
fable cevaplar. Bir model kendine ikinci görüş veremez. İkinci bir akıl ufku açacaksa açılır
— uygunluk listesi yoktur — ve kendisine hedef, kabul ölçütü ve ham kanıt verilir, soranın
taslak cevabı asla.

---

## Banner

Cevap yazılırken, üstünde ve altında tek bir satır eklentinin ne yaptığını söylüyor. Bu bir
durum çubuğu değil: olan biten **en önemli tek şeyi** bildiriyor.

```
Teknesyum ▸ Opus-Medium İşçi — Banner Kodunu Yazıyor
Teknesyum ▸ 3 Opus-Medium İşçi Çalışıyor
Teknesyum ▸ Dikkat — 4 Araç Çağrısı Üst Üste Başarısız
Teknesyum ▸ Premium · 1 Sözleşme Onay Bekliyor · 1 Sözleşme Başlanmadı
```

Art arda başarısız araç çağrısı her şeyin önüne geçiyor. Kapanış bandı ne bittiğini
söylüyor, çünkü mesajdan sonra hesaplandığı için daha çok biliyor. Yalnızca büyüyen
sayaçlar — atılan adım, açık günlük — kaldırıldı: karşılaştıracak bir şeyi olmayan bir sayı
bilgi değildir.

Her kelime sizin dilinizde, rol adları dahil.

---

## Neyi yapmıyor

- **Ajanları akıllandırmıyor.** Kötü kapanışları reddediyor; o kapanışa götüren işi
  iyileştirmiyor.
- **Bilerek hiç slash komutu yok.** Her komutun adı ve açıklaması her oturuma yükleniyor.
  Giriş noktası `relay` skill'i; gerisi yolla çalıştırılan betikler.
- **Hiçbir şeyi kum havuzuna almıyor.** `guard.js` bir kanca, kanca da çekirdek değil bir
  politikadır. Modelin gerçekten yürüdüğü yolları kapatır; kararlı bir aşmaya karşı savunma
  değildir ve bilinen aşma yolları onları kapsayan testlerde adıyla yazılıdır.
- **Claude Code'un kendisini yerelleştirmiyor.** Banner ve Core'un yazdığı her mesaj sizin
  dilinizde. İstemcinin kendi etiketlerine bir eklenti erişemiyor.
- **Git'inizi yönetmiyor.** Commit yok, dal yok, push yok.

---

## Dizin

```
.claude/relay/
  contracts/           açık işler, sözleşme başına bir dosya
  audits/              denetim kayıtları ve ledger.jsonl
  live/                ajan kayıtları, kanca yazıyor
  map.md               import haritası
```

`node <plugin>/scripts/map.js` import haritasını yazar — merkezler, döngüler, öksüzler,
kenarlar. Okuması dosya açmaktan ucuzdur ve dosya açmanın cevaplamadığı soruları
cevaplar.

---

## Komutlar

Yok. Giriş noktası `relay` skill'i; gerisi betik:

| Betik | Ne yapıyor |
|---|---|
| `contract.js` | açma, sunma, kapatma, denetim kaydı, kademe çözümü |
| `map.js` | import haritası — merkezler, döngüler, öksüzler |
| `risk.js` | diff'ten ve geri alınamaz yollardan risk |
| `log.js` | hata günlüğü; elle yazılmaz |
| `setup.js` | makine ayarı, durum satırı bağlama |
| `scaffold.js` | lisans, imza, dil bağlantıları |
| `statusline.js` | durum satırı ve sohbet banner'ı |

---

## Testler

```bash
node test/all.js
```

2.261 doğrulama: guard, kapanış kapısı, denetim zinciri, defter, bilinen aşma yolları,
kademe ve kota kilitleri, kişisel sözleşme kapısı, scaffold, cue, banner ve hiçbir kancanın
bağlama yazmadığının denetimi.

---

## Tasarım notları

- [docs/COST-MODEL.md](docs/COST-MODEL.md) — token nereye gidiyor ve bundan çıkan kural
- [docs/TRIAGE.md](docs/TRIAGE.md) — Teknesyum Base'den ne geldi, ne bırakıldı
- [docs/DECISIONS.md](docs/DECISIONS.md) — bunu şekillendiren kararlar ve gerekçeleri

---

## Lisans

AGPL-3.0-or-later. Bkz. [LICENSE](LICENSE).

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Teknesyum'a destek ol" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="Lisans AGPL-3.0" height="38"></a>

</div>
