<!-- lang -->

**Türkçe** · [English](README.md)

<div align="center">
<img src="assets/banner.tr.svg" alt="Teknesyum Core, Claude Code için çok amaçlı iş istasyonu. Adın altında eklentinin sohbete bastığı satır: Teknesyum, 3 Opus-Medium İşçi Çalışıyor. Onun altında birbirine bağlı üç aşama: kancalar zorluyor, kapı kapatıyor, roller işi yapıyor." width="900">
</div>

# Teknesyum Core

Çok Amaçlı İş İstasyonu

---

## Nedir

Teknesyum Core, Claude Code için tasarlanmış çok amaçlı bir plugindir. Büyük işleri küçük
sözleşmelere böler: her sözleşme hangi dosyalara dokunacağını ve bittiğini nasıl
kanıtlayacağını baştan yazar. Ajanlar paralel çalışır, her iş kendine uygun modelde koşar ve
doğrulama komutları geçmeden hiçbir sözleşme kapanmaz.

---

## Özellikler

- **Sözleşmeler** — Her iş parçası kendi dosyalarını sahiplenir. İki ajan aynı dosyaya
  yazamaz; kim neye dokunuyor baştan belli.
- **Doğrulama kapısı** — "Bitti" demek yetmiyor. Sözleşme kapanmadan önce testler gerçekten
  çalışır; geçmezse iş açık kalır.
- **Paralel ajanlar** — İş bölünür, ajanlar aynı anda koşar, her biri kendi kaydını tutar.
- **İşe göre model** — Basit iş güçlü modele gitmez; kimse faturayı sevmiyor. Rol ve profil
  modeli ve eforu birlikte seçer.
- **Riskten haberdar** — Risk diff'ten hesaplanır. Yükseldiğinde kapanış denetim kaydı
  ister, yoksa reddeder.
- **Bağlamda yer kaplamaz** — Kurallar kancalarda durur, sohbete girmez. Ölçüsü aşağıda.

---

## Neyi yapmıyor

- **Ajanlarınızı akıllandırmıyor.** Kötü kapanışı reddeder, o kadar.
- **Slash komutu yok, bilerek.** Giriş noktası `relay` skill'i; gerisi betik.
- **Kum havuzu değil.** `guard.js` bir politika, çekirdek değil.
- **Claude Code'u çeviremiyor.** Core sizin dilinizde konuşur, istemcinin etiketleri değil.
- **Git'inize dokunmuyor.** Commit yok, dal yok, push yok.

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

**Sonrasında Claude Code'u yeniden başlatın.** Kancalar oturum ortasında yeniden yükleniyor
ama masaüstü istemci ürettiklerini yeniden başlatana kadar çizmiyor. Bunu herkes bir kez
unutuyor.

İki tek satırlık komut da `main`'e değil bir etikete bakıyor — kabuğa borulanan şey
yayınlanmış betik olmalı, dalın o gün taşıdığı şey değil. Her sürüm iki kurulum betiğinin
SHA-256 özetini yayınlıyor.

**Gerekli:** Claude Code, git. **İsteğe bağlı:** Node.js. O olmadan durum satırı ve kapı
betikleri çalışmıyor; bu size söyleniyor, tahmine bırakılmıyorsunuz.

Kurulum betikleri sonunda kurulumu kendi terminalinizde çalıştırıyor, soruları orada bedava
soruyor. Atladıysanız betiği kendiniz çalıştırın:

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

**ya da şunu Claude'a yapıştırın:**

> Teknesyum Core'u kur. `node <plugin>/scripts/setup.js --check` çalıştır; `<plugin>`
> kurulu teknesyum-core dizinidir. JSON basar. `missing` altındaki her soruyu tek bir
> mesajda bana sor, sonra karşılık gelen bayraklarla `node <plugin>/scripts/setup.js
> --apply` çağır. Hiçbir ayar dosyasını kendin yazma.

Kurulum `~/.claude/teknesyum/config.json` yazıyor ve durum satırını bağlıyor. Bir sonraki
oturumda geçerli oluyor.

---

## Nasıl çalışıyor

### Sözleşme

`.claude/relay/contracts/` altında bir markdown dosyası. Bir hedef, sahip olduğu dosyalar,
bunu kanıtlayan komutlar.

```markdown
## Goal
Banner kullanıcının dilinde okunuyor.

## owns
core/scripts/statusline.js
core/strings.json

## verify
node test/all.js
```

`owns:` dosya listeliyor, dizin değil — dizin, henüz var olmayan dosyalar hakkında verilmiş
bir söz. Sözleşmeyi kapatılabilir kılan kısım `verify:`. Kabul ölçütü 0 ile çıkan bir komut
olarak yazılamıyorsa bölme yanlış demektir, planlayıcıya da onay kutusu uydurmak yerine
bunu açıkça söylemesi söylenir.

<div align="center">
<img src="assets/flow-contract.tr.svg" alt="Bir sözleşmenin ömrü: açılır, bir ajan onu çalışılıyor duruma alır, ajan sunar ve kapı sözleşmenin kendi verify komutlarını çalıştırır. Başarısız bir komut sözleşmeyi geri gönderir. Her komut sıfırla çıktığında kapı riski diff'ten hesaplar; yüksek riskte ayrıca denetim kaydı ister ve ancak o zaman sözleşme biter." width="900">
</div>

### Kapı

Bir sözleşmeyi kapatabilen tek şey `contract.js complete`. Rapora inanmak yerine verify
komutlarını kendisi çalıştırıyor, riski diff'ten çıkarıyor ve yüksek riskli bir sözleşmeyi,
ajanı ve neyi doğruladığını yazan bir denetim kaydı olmadan kapatmıyor. Denetim kayıtları
mühürlü bir zincir; birini sonradan tarihlemek görünür bir kırık bırakıyor.

Dosya sisteminin önünde iki kanca duruyor. `guard.js` mevcut sözleşmenin sahip olmadığı
dosyalara yazmayı engelliyor ve kapının kendi muhasebesini kabuğa tamamen kapatıyor — onları
düzenleyebilen bir kabuk kapanış taklit edebilir. `prefs.js` gerekli işaretleri taşımayan
README ya da LICENSE yazımını engelliyor; yazarın tercih dosyası yoksa hemen çıkıyor, yani
başkası için hiçbir şey yapmıyor.

### Maliyet

Claude Code'un sunduğu her mekanizma bedelini ne zaman ödediğinize göre sınıflanıyor: **S**
bağlam başına bir kez, **O** yalnız özellik çalışınca, **C** her mesajda sonsuza kadar,
**Z** hiç. Bu tablodan tek bir kural çıkıyor — sıradan bir turda hiçbir kanca bağlama
yazmaz.

<div align="center">
<img src="assets/flow-cost.tr.svg" alt="Bir turun eklenti kancalarından geçişi ve her birinin modelin bağlamına ne yazdığı. Cue kancası susar; guard sözleşme dışı yazımı engeller; prefs işaretsiz README'yi engeller; izleyici adımı diske yazar; notice kancası bannerı yalnızca görüntü olarak çizer; bildirici sonunda ses çalar. Bağlam sütunundaki her hücre boştur, yani tur başına maliyet sıfır tokendir." width="900">
</div>

Sohbetteki banner `MessageDisplay` kancasında gidiyor; çizileni değiştiriyor, saklananı ve
modelin gördüğünü değiştirmiyor. Binary'nin kendi cümlesi: *"Display-only: the stored
message and what the model sees are untouched."* Mesaj başına yaklaşık 43 ms node açılışı,
token yok. Ondan önce on beş kanal denendi ve gömüldü; taziyeler
[docs/DECISIONS.md](docs/DECISIONS.md) içinde.

### Ajanlar

<div align="center">
<img src="assets/flow-agents.tr.svg" alt="İşin nasıl dağıtıldığı. Ana ajan işi sözleşmelere böler. Her sözleşme bir rol adı taşır; rol çarpı profil kademe tablosundan tek bir hücre seçer, hücre bir model ve efora çözülür. Ajanlar paralel çalışır ve her biri diske kendi kaydını bırakır. Yanlarında danışman soranın bir üst basamağında açılır: sonnet sorar opus cevaplar, opus sorar fable cevaplar." width="900">
</div>

Tek ajan türü: `worker`. Rol, istemde adı geçen bir dosya:

```
Read <plugin>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `ui-builder`, `planner`, `auditor`, `advisor`, `scout`, `scribe`. Her bağlamda
oturan yedi ajan açıklaması bire indi; rol metnini yalnız o rolü taşıyan ajan ödüyor.

Rol ve profil [core/tiers.json](core/tiers.json) içinden bir hücre seçiyor; hücre bir model
ve bir efor. Üç profil — `eco`, `normal`, `premium` — bütün ızgarayı kaydırıyor. Sinyaller
hücreyi yükseltiyor, profil tavan koyuyor, hiçbir şey aşağı çekmiyor. Tekrarlayan hata önce
eforu sonra modeli yükseltiyor; art arda hata sayısını kimsenin hafızası değil bir kanca
tutuyor.

**Danışman** soranın bir üst basamağında çalışıyor: sonnet sorar, opus cevaplar; opus sorar,
fable cevaplar. Bir model kendine ikinci görüş veremez. Uygunluk listesi yok — istemek
yeterli sebep — ve kendisine hedef, kabul ölçütü ve ham kanıt veriliyor, taslak cevabınız
asla.

---

## Kullanımda nasıl görünüyor

Her cevabın üstünde ve altında tek satır, olan biten en önemli tek şeyi söylüyor. Gösterge
paneli değil.

```
Teknesyum ▸ Opus-Medium İşçi — Banner Kodunu Yazıyor
Teknesyum ▸ 3 Opus-Medium İşçi Çalışıyor
Teknesyum ▸ Dikkat — 4 Araç Çağrısı Üst Üste Başarısız
Teknesyum ▸ Premium · 1 Sözleşme Onay Bekliyor · 1 Sözleşme Başlanmadı
```

Art arda başarısız araç çağrısı her şeyi geçiyor. Kapanış satırı ne bittiğini söylüyor,
çünkü mesajdan sonra hesaplandığı için daha çok biliyor. Yalnızca büyüyen sayaçlar — atılan
adım, açık günlük — kesildi: karşılaştıracak bir şeyi olmayan sayı süstür.

---

## Komutlar

Yok. Giriş noktası `relay` skill'i; gerisi betik.

| Betik | Ne yapıyor |
|---|---|
| `contract.js` | açma, sunma, kapatma, denetim kaydı, kademe çözümü |
| `map.js` | import haritası — merkezler, döngüler, öksüzler |
| `risk.js` | diff'ten ve geri alınamaz yollardan risk |
| `log.js` | hata günlüğü; elle yazılmaz |
| `setup.js` | makine ayarı, durum satırı bağlama |
| `scaffold.js` | lisans, imza, dil bağlantıları |
| `statusline.js` | durum satırı ve sohbet bannerı |

---

## Dizin

```
.claude/relay/
  contracts/           açık işler, sözleşme başına bir dosya
  audits/              denetim kayıtları ve ledger.jsonl
  live/                ajan kayıtları, kanca yazıyor
  map.md               import haritası
```

`node <plugin>/scripts/map.js` import haritasını yazıyor — merkezler, döngüler, öksüzler,
kenarlar. Okuması dosya açmaktan ucuz ve dosya açmanın cevaplamadığı şeyleri cevaplıyor.

---

## Testler

```bash
node test/all.js
```

2.294 doğrulama: guard, kapanış kapısı, denetim zinciri, defter, bilinen aşma yolları,
kademe ve kota kilitleri, kişisel sözleşme kapısı, scaffold, cue, banner ve hiçbir kancanın
bağlama yazmadığına dair tek bir denetim.

---

## Tasarım notları

- [docs/COST-MODEL.md](docs/COST-MODEL.md) — token nereye gidiyor, bundan çıkan kural ne
- [docs/TRIAGE.md](docs/TRIAGE.md) — Teknesyum Base'den ne geldi, ne gelmedi
- [docs/DECISIONS.md](docs/DECISIONS.md) — bunu şekillendiren kararlar ve gerekçeleri

---

## Katkı

Kod yazmadan önce bir issue açın — yamanızın başka bir şeye çarptığını sonradan öğrenmekten
hızlıdır. Pull request'i küçük tutun; tek iş yapan diff aynı gün okunur, beş iş yapan diff
hiç okunmaz.

Depo İngilizce yazılıyor. Katkılar buradaki her şeyle aynı lisansla, AGPL-3.0-or-later
altında kabul ediliyor; imzalanacak CLA ya da yapılacak bir tören yok.

İşinize yaradıysa [sponsor olabilirsiniz](https://github.com/sponsors/Teknesyum).

---

## Lisans

AGPL-3.0-or-later. Bkz. [LICENSE](LICENSE).

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Teknesyum'a destek ol" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="Lisans AGPL-3.0" height="38"></a>

</div>
