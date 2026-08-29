<!-- lang -->

**Türkçe** · [English](README.md)

# Teknesyum Core

Claude Code'da çok ajanlı iş için sözleşme kapısı.

İş sözleşmelere bölünür. Sözleşme hangi dosyalara sahip olduğunu ve bittiğini kanıtlayan
komutları yazar. O komutlar 0 dönmeden hiçbir şey kapanmaz; hassas yere dokunan sözleşmeler
ayrıca tek satır bile yazmamış bir denetçi ister.

**Mesaj başına bedeli yoktur.** Sıradan bir turda hiçbir kanca modelin bağlamına yazmaz,
hiçbir kural modele banner bastırmaz, slash komutu yoktur. Durum statusline'da durur, orayı
model hiç görmez. Bedel bir kez, kurulumda ödenir.

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

**Kurulumdan sonra Claude Code'u yeniden başlat.**

İki tek satırlık komut da `main`'i değil bir etiketi gösterir: kabuğa akıtılan şey yayımlanan
betiktir, dalın o gün taşıdığı şey değil. Her sürüm iki kurulum betiğinin SHA-256 özetini
sürüm notlarına yazar.

**Gerekli:** Claude Code, git. **İsteğe bağlı:** Node.js — o olmadan statusline ve kapı
betikleri çalışmaz, bu sana söylenir, sessizce eksik kalmaz.

Kurulum betikleri sonunda kurulumu kendi terminalinde çalıştırır; sorularını orada sorar ve
hiç token harcamaz. Atlarsan ya betiği kendin çalıştır:

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

**ya da şunu Claude'a yapıştır:**

> Teknesyum Core'u kur. `node <eklenti>/scripts/setup.js --check` çalıştır; `<eklenti>`
> kurulu teknesyum-core klasörüdür. JSON basar. `missing` altındaki her soruyu bana tek
> mesajda sor, sonra `node <eklenti>/scripts/setup.js --apply` komutunu uygun bayraklarla
> çağır. Ayar dosyalarını kendin yazma.

Kurulum `~/.claude/teknesyum/config.json` dosyasını yazar ve statusline'ı bağlar. Bir
sonraki oturum açılışında yürürlüğe girer.

---

## Nasıl çalışır

Ne istediğini söyle. `relay` skill'i işi ölçer: tek dosyalık iş doğrudan yapılır, fazlası
sözleşmeye dönüşür.

Bir sözleşme:

```markdown
---
id: T7
status: open
round: 1
owns: [src/auth/token.js, test/token.test.js]
verify:
  - node --test test/token.test.js
---

## Goal
Yenileme belirteçleri 15 dakikada dolar.

## Acceptance
- Dolmuş yenileme 401 döner, 500 değil.

## Checkpoint
İş ilerledikçe güncellenir.
```

Kapatmak:

```bash
node <eklenti>/scripts/contract.js complete --id T7
```

Bu komut her `verify:` adımını çalıştırır, riski gerçek diff'ten hesaplar ve ancak her şey
tutuyorsa dosyayı taşır. `contracts/done/` içine giden tek yol budur — yazmayı, kabuktan
taşımayı ve deneyen başka her şeyi kanca engeller.

### Risk beyan edilmez, ölçülür

"Bitti" diyen taraf "risksiz" de diyemez. Kapı kendisi hesaplar:

| İşaret | Sonuç |
|---|---|
| auth, migration, kanca, CI, bağımlılık veya ayar dosyaları | yüksek |
| 8'den fazla sahip olunan dosya | yüksek |
| 300'den fazla değişen satır | yüksek |
| diğer | düşük |

Sözleşme `risk: high` yazarak yukarı çıkabilir. Aşağı inemez. Yüksek risk; tek sözleşmeye,
tek tura, tek HEAD'e ve sahip olunan dosyaların o andaki içeriğine bağlı bir denetim kaydı
ister — kayıt kullanılınca tükenir, ikinci kez oynatılamaz.

### Denetçinin yapamayacağı

Yazmak. Denetim turunda yazılan tek dosya denetimi geçersiz kılar; kapı ajanın canlı kaydını
okur ve mührü reddeder. "Ajan bitti dedi ama kod öyle demiyor" durumunu yakalayan şey budur.

Kaydı da yazamaz — `audits/` ve `live/` klasörleri Write, Edit ve kabuğa kapalıdır. Kayıt,
özetleri kendisi hesaplayan bir komuttan doğar:

```bash
node <eklenti>/scripts/contract.js audit --id T7 --run-id <ajan> --verification "..."
```

### Çizginin içinde kalmak

Ajan ilk dokunduğu sözleşmeye bağlanır ve ondan sonra yalnız o sözleşmenin `owns` kümesine
yazabilir. `done/`, `audits/`, `live/` veya `contract.js` içine uzanan verify adımları
çalışmadan reddedilir. Sözleşmeye bağlanmamış bir oturum — seninki — hiç kısıtlanmaz.

---

## Ajanlar

Tek ajan tipi: `worker`. Rol, prompt'ta adı verilen bir dosyadır:

```
Read <eklenti>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `auditor`, `planner`, `advisor`, `scout`. Her bağlama giren yedi ajan tanımı bire
indi; rol metnini yalnız o rolü gerçekten üstlenen ajan öder.

---

## Düzen

```
.claude/relay/
  contracts/<ID>.md    açık iş
  contracts/done/      kapalı; buraya yalnız contract.js yazar
  audits/              kayıtlar ve ledger.jsonl
  live/                ajan kayıtları, kanca yazar
  map.md               import haritası
```

`node <eklenti>/scripts/map.js` import haritasını yazar — merkezler, döngüler, yetimler,
bağlar. Okuması dosya açmaktan ucuzdur ve dosya açmanın cevaplamadığı soruları cevaplar.

---

## Komutlar

Yok. Mesele tam olarak bu: her slash komutunun adı ve açıklaması her oturumda yükleniyor.
Eklentinin giriş noktası `relay` skill'idir; gerisi senin ya da modelin yoldan çağırdığı
betiklerdir.

---

## Testler

```bash
node test/all.js
```

Kapıyı, tamamlama kapısını, denetim zincirini, defteri, bilinen atlatma yollarını ve hiçbir
kancanın bağlama yazmadığını doğrulayan 2.305 sınama.

---

## Tasarım notları

- `docs/COST-MODEL.md` — token nereye gidiyor ve bundan çıkan kural
- `docs/TRIAGE.md` — Teknesyum Base'den ne geldi, ne bırakıldı
- `docs/DECISIONS.md` — projeyi biçimlendiren on beş karar ve gerekçeleri

## Lisans

AGPL-3.0-or-later. Bkz. [LICENSE](LICENSE).

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Support Teknesyum" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="License AGPL-3.0" height="38"></a>

</div>
