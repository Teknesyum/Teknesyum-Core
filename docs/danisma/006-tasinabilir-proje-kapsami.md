# 006 — Taşınabilir Proje Klasörü Kapsamı

Danışılan: Fable (`advisor` rolü). Tarih: 2026-09-05. 51.398 token, 1 araç çağrısı, 24 sn.

## Sorulan (tam metin)

Teknesyum Core adlı **herkese açık** bir Claude Code eklentisinin tasarım kararında görüşünü istiyoruz. Kod yazmanı istemiyoruz; hangi yolu kurmamız gerektiğine dair kısa ve gerekçeli bir hüküm istiyoruz.

### Sorun

Claude Code, bir oturumda yalnız açıldığı çalışma klasörünün altına yazabilir. Dışarı çıkmak için `~/.claude/settings.json` içindeki `permissions.additionalDirectories` listesine klasör eklemek gerekiyor.

Kullanıcımızın bütün projeleri `C:/Users/Administrator/Desktop/Projeler` altında duruyor. Bir projede açılan oturumun kardeş projeye dokunması gerektiğinde izin katmanı engelliyordu. Şimdilik elle şunu yazdık:

```
"additionalDirectories": ["~/Desktop/Projeler", "C:/Users/Administrator/Desktop/Projeler"]
```

`~` ev dizinine açıldığı için kullanıcı adı değişse de çalışıyor. Ama bu yalnız **bu** klasör düzeni için doğru.

### Asıl soru (kullanıcının kendi cümlesi)

"Desktop/Projeler de ancak kullanıcı ismi falan farklı. Benim istediğim zaten potansiyel diğer kullanıcılar — atıyorum İngiliz bir adam `Projects` yazdı ve `Belgelerim`in içine attı vb. gibi senaryolar. Hepsini kapsayacak kolay bir yol var mı?"

Yani eklenti başka makinelere kurulduğunda proje kökü `~/Desktop/Projeler` olmayabilir: `~/Documents/Projects`, `D:/work`, `~/dev`, `/home/x/src` olabilir. Klasör adı, sürücü, dil, işletim sistemi değişebilir.

### Elimizdeki malzeme

- `setup.js` adlı bir makine-ayarı betiği zaten var. Kurulumda bir kez koşuyor, `settings.json`'a dokunuyor (statusline'ı bağlıyor), dokunmadan önce `.bak` alıyor, JSON okunamıyorsa hiçbir şey yazmadan reddediyor.
- `setup.js` içinde `findCore()` diye bir işlev var: bulunduğu yerden yukarı doğru yürüyüp `core/.claude-plugin/plugin.json` dosyasını arıyor, yani depo kökünü kendi bulabiliyor. Depo kökünün **üst klasörü** çoğu kurulumda proje kökü olur ama bu bir varsayım.
- Kurulumda kullanıcıya soru sorulabiliyor; `setup.js` zaten `--<anahtar>` biçiminde bayraklarla cevap alıyor ve cevapsız kalanlara varsayılan koyuyor.
- Claude Code'un oturum içinde klasör ekleyen kendi komutu da var (`/add-dir`), ama o kalıcı değil, her oturumda tekrar gerekir.

### Düşündüğümüz seçenekler

**A — `setup.js`'e bir adım.** Kurulumda "proje kökün nerede?" diye sorulur; cevap verilmezse depo kökünün üst klasörü varsayılır ve `additionalDirectories`'e yazılır. Yaklaşık 40 satır, 3 sav.

**B — Hiç yazma.** Eklenti kullanıcının küresel izin ayarına hiç dokunmaz; belgeye "şunu ekleyin" diye yazılır. Sıfır satır, sıfır risk, her seferinde elle iş.

**C — Otomatik tahmin.** Kurulumda bilinen adayları (`~/Desktop/Projeler`, `~/Documents/Projects`, `~/dev`, `~/src`, `~/Projects`...) tarayıp bulunanı yazmak. Kırılgan, dil bağımlı, sürpriz.

**D — Klasör değil, depo sınırı.** İzin kapsamını klasörle değil, "içinde `.git` olan kardeş depolar" gibi bir kuralla tanımlamak. Ama `additionalDirectories` yalnız düz yol listesi kabul ediyor, kural kabul etmiyor — yani bu ancak kurulumda hesaplanıp listeye açılarak yapılabilir.

### Bağlam ve kısıtlar

- Bu **herkese açık** bir eklenti. Kurulumda bir kullanıcının küresel izin kapsamını sessizce genişletmek güvenlik açısından ciddi bir davranış. Kullanıcı ne onayladığını görmeli.
- Projenin altın kuralı maliyet: sıradan bir turda hiçbir kanca modelin bağlamına tek token yazmıyor. Kurulum betiği zaten tur dışında koşuyor, bu kuralı ilgilendirmiyor.
- Kullanıcının kuralı: "bana araçlarının yapabileceği işi verme" — yani mümkünse elle iş bırakma.
- Her yeni davranış sav ister; depoda 2.674 sav var.
- Windows, macOS ve Linux'ta çalışması gerekiyor.

### Soru

1. A, B, C, D ya da başka bir yol — hangisini kurmalıyız, neden?
2. Herkese açık bir eklentinin kurulumda küresel izin kapsamını genişletmesi kabul edilebilir mi? Kabul edilebilirse hangi koşulla (açık onay, tek klasör, günlüğe yazma)?
3. "Depo kökünün üst klasörü proje köküdür" varsayımı ne kadar güvenli? Yanlış olduğu durumda ne olur?
4. Gözden kaçırdığımız daha ucuz bir yol var mı?

Kısa yaz. Hükmü başa koy.

## Gelen cevap (tam metin)

## Hüküm

A'yı kur, ama "yazmadan önce göster ve açık evet iste" koşuluyla; cevapsız varsayılanı hiç yazmasın, yalnızca öneri olarak ekrana bassın. Kalıcı yazım tek satır, tek klasör, `.bak` ve kurulum günlüğüne "ne, nereye, kimin onayıyla" notu.

## Neden

Herkese açık eklentide izin kapsamını sessizce genişletmek kabul edilemez; bayrakla veya soruya "evet"le verilmiş tek klasör kabul edilir ve `.bak` + günlük ile geri alınabilir kalır. B kullanıcının "araçların yapabileceği işi bana verme" kuralını çiğner; C dil/sürücü/OS matrisinde kırılır ve sürpriz üretir; D'nin tanımı iyi ama liste zaten tek klasöre açılınca A'nın alt kümesi olur. "Depo kökünün üstü proje kökü" varsayımı bir öneri olarak güvenli, bir yazım olarak değil: eklenti önbelleğinde (`~/.claude/plugins/cache/...`) yanlış çıkar ve `~/.claude/plugins` gibi bir klasörü açar; `~` veya `/` çıkarsa reddedilmeli.

## Kaçırılan

`~` genişletmesi Windows'ta Claude Code tarafından yapılıyorsa iki girişe gerek yok, tek `~/...` yeter; ayrıca projeye özel `.claude/settings.json` içine `additionalDirectories` yazmak küresel dosyaya hiç dokunmadan kardeş projeye ulaşmanın en ucuz yolu — `setup.js` bunu depo başına yazabilir ve kapsam o projeyle sınırlı kalır. Seçenek üçüncü: `--projects-root` bayrağı yoksa ve TTY yoksa hiç yazma, yalnız komutu bas (CI ve sessiz kurulum güvenli kalır).
