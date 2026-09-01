# Ölçüm — Obsidian vault mı, düz Markdown mı?

**Soru:** Wiki-link'li, backlink'li bir Obsidian vault, bilgiyi geri getirmede düz
Markdown + `rg`'den daha mı ucuz?

**Hipotez:** Fark yok.

**Ölçülen şey:** Vault'un **dosya düzeni**. Obsidian **uygulaması** değil.

---

## Adalet notu — ne ölçülmedi

Obsidian'ın satış argümanı olan iki şey, grafik görünümü ve backlink paneli,
**uygulamanın içindedir**; vault dosyalarında karşılığı yoktur. Model bir vault'a
baktığında yalnız `.md` dosyalarını, YAML ön maddesini ve `[[wiki-link]]` metinlerini
görür. Bu ölçüm o dosya düzenini ölçer.

Bu yüzden ikinci bir koşul eklendi: **B1+**, vault'a bir betikle üretilmiş
`backlinks.md` ters bağlantı tablosu eklenmiş hali. Bu, Obsidian'ın uygulama içinde
hesapladığı şeyi diske düşürmenin karşılığıdır — yani "grafiği modele göstermek"
denemesi.

---

## Adım 1 — Bilgi seti

Kaynaklar: `docs/DECISIONS.md` (D1-D16), `docs/YOL-HARITASI.md`,
`logs/openlogs/closed/*.md`, `git log`.

Yirmi madde çıkarıldı: on beş karar, beş hata kaydı. Her madde başlık, 3-6 cümle
gövde ve ilgili dosya adları taşıyor. Gövdeler üç biçimde **birebir aynı**; değişen
yalnız paketleme.

Çalışma alanı: `scratchpad/olcum-obsidian/` (depoya girmez).

## Adım 2 — Üç biçim ve boyutları

| Biçim | Yapı | Dosya | Bayt | Gövdeye göre fazlalık |
|---|---|---|---|---|
| **B3 Tek dosya** | tek `MEMORY.md`, 20 başlık | 1 | 19.165 | taban |
| **B2 Core tarzı** | konu klasörleri + `INDEX.md` | 21 | 21.923 | +%14 |
| **B1 Obsidian vault** | 20 not + `MOC.md`, YAML + wiki-link | 21 | 26.401 | +%38 |
| **B1+ vault + backlinks** | B1 + türetilmiş `backlinks.md` | 22 | 43.662 | +%128 |

Ara ölçüler:

- `B1-vault/MOC.md` — 1.672 bayt, 32 satır
- `B2-core/INDEX.md` — 2.859 bayt, 24 satır
- `B1plus-vault/backlinks.md` — **17.261 bayt, 183 satır**
- B1'de 57 wiki-link, 0 kırık; B1+'da 215

`backlinks.md` tek başına B1 vault'un **%65'i** kadar. Türetilmiş indeks, türetildiği
gövdeyle aynı büyüklük sınıfında.

## Adım 3 — Sorular ve altın cevaplar

Beş soru, hiçbirinin kelimeleri notların kelimeleriyle birebir örtüşmüyor.

| # | Soru | Altın cevap |
|---|---|---|
| S1 | "Zaten sahip olduğumuz bir şeyi ikinci kez satın almak" gerekçesiyle kurulmayan ya da sökülen iki düzenek neydi? | M07 (plan konseyi), M10 (oturum açılış bandı) |
| S2 | Bir satır yazının kullanıcının gözüne modele para ödemeden ulaşması için kaç yol denendi, hangisi tuttu? | M10 → M11 → M12 → M13 → **M14** |
| S3 | Biten bir iş arkasında canlı bir şey bırakıp sonraki denemeyi düşürdü mü? Belirti, elle çare, kalıcı çare. | M18 (MSB3027/21 · `Stop-Process -Force` · süreç ağacı) |
| S4 | İki iş birimi eşzamanlı koşarken birinin ürünü ötekinin hanesine yazıldı mı? Sonrasında hangi alan zorlanır oldu? | M20 + M03 (`owns:`) |
| S5 | Hangi değişmeyen metinler modelin çıktı yolundan çıkarıldı, hangi kayıtlarda geçiyor, gerekçedeki sayı? | M05 (+M15, M16); 8-10 bin çıktı tokeni |

Sorular ve tam altın cevaplar: `scratchpad/olcum-obsidian/sorular.md`.

## Adım 4 — Koşum tablosu

Her biçim için bir alt ajan (`general-purpose`), beş soru tek istemde, klasör dışına
çıkmak yasak.

| Biçim | `subagent_tokens` | Araç çağrısı | Süre | Doğruluk |
|---|---|---|---|---|
| **B3 Tek dosya** | **51.552** | 3 | 59 sn | 5/5 |
| **B2 Core tarzı** | 55.832 | 2 | 60 sn | 5/5 |
| **B1 Obsidian vault** | 56.812 | 2 | 38 sn | 5/5 |
| **B1+ vault + backlinks** | 58.859 | 3 | 47 sn | 5/5 |

Soru bazında hit/miss:

| Soru | B1 | B1+ | B2 | B3 |
|---|---|---|---|---|
| S1 (M07, M10) | hit | hit | hit | hit |
| S2 (M10→M14 sırası) | hit | hit | hit | hit + fazlası |
| S3 (M18) | hit | hit | hit | hit |
| S4 (M20 + M03) | hit | hit* | hit | hit |
| S5 (M05, M15, M16) | hit | hit** | hit | hit |

\* B1+ `owns:` gerçeğini doğru söyledi ama atıf listesine M03'ü yazmadı.
\*\* B1+ M16'yı (rozet ön tarihi) atıfa almadı, M05'i "bağlantılı M04, M15" ile verdi.

Farklar, B3 tabanına göre:

- B2 **+%8,3** (+4.280 token)
- B1 **+%10,2** (+5.260 token)
- B1+ **+%14,2** (+7.307 token) — B1'e göre **+%3,6**

Beş sorunun yirmi cevabının yirmisi de doğru maddeye ulaştı. **Ayırt edici tek değişken
maliyet oldu ve sıralama hipotezin tersine değil, tam tersi yönde çıktı: vault en
pahalısı.**

## Ne öğrendik

1. **Doğrulukta fark yok, hipotez bu kısımda doğrulandı.** Dört biçim de 5/5. Yirmi
   maddelik bir bilgi tabanında hiçbir biçim bir ötekinin bulamadığını bulmadı —
   çünkü hepsi tek bir grep'e sığıyor.

2. **Vault, geri getirmeyi ucuzlatmadı; pahalılaştırdı.** Aynı gövdeler, aynı sorular,
   aynı cevaplar: B1 B3'ten %10 fazla token yaktı. Fazlalık paketlemenin kendisi —
   YAML ön maddesi, 57 wiki-link, `MOC.md`. Model bu metadatayı **okuyor** ve
   okuduğu için ödüyor, ama cevap üretirken kullanmıyor.

3. **Ters bağlantı tablosu farkı kapatmadı, açtı.** B1+ en pahalı koşu oldu (+%3,6) ve
   **atıf isabeti düştü** — iki soruda kaynak listesi eksildi. Türetilmiş indeks
   17.261 bayt, yani vault'un %65'i; grafiği diske düşürmek, gövdeyi ikinci kez
   yazmakla aynı büyüklükte bir vergi.

4. **Sınırlayıcı kaynak dosya sayısı, bağlantı yapısı değil.** B3 bir `Read` ile
   19KB'lık külliyatın tamamını aldı; B1 ve B2 grep'ten sonra ayrı ayrı dosya açtı.
   Bu ölçekte "tek dosyayı bütün oku" stratejisi her navigasyon stratejisinden ucuz.

5. **Wiki-link modelin gezinme aracı değil.** Alt ajanların hiçbiri `[[...]]`
   bağlantısını izleyerek ikinci bir not açmadı; hepsi grep sonucundan doğrudan
   gitti. Bağlantılar Obsidian **uygulaması** için bir gezinme aracıdır; `rg`
   elindeyken model için süs.

6. **`INDEX.md` ile `MOC.md` arasında ölçülebilir fark çıkmadı.** İkisi de tek satırlık
   girdiler listesi; B2 %2 daha ucuz koştu ve bu fark gürültü seviyesinde.

7. **B3'ün tek üstünlüğü kapsam oldu.** Tek dosyayı bütün okuyan ajan S2'de altı
   denemeyi saydı (`SubagentStart` reddi dahil), ötekiler beş saydı. Parçalamak
   maliyeti değil, **çevre görüşü** kesiyor.

8. **Bu sonuç ölçeğe bağlıdır ve ölçek büyüdükçe tersine dönmesi beklenir.** 20 madde /
   19KB'da "hepsini oku" kazanıyor. Külliyat bir bağlam penceresine sığmadığı anda B3
   düşer, B2 ve B1 ayakta kalır. Ölçülen şey bu ölçek; başka ölçek için hüküm yok.

## Obsidian-MCP köprüsü kurulsaydı

Mekanizma düzeyinde ne değişirdi:

**Tabloya eklenirdi**

- Sunucu tanımının **sabit kirası**: her bağlamda araç şemaları. Core'un maliyet
  sınıflarıyla sınıf **S** — bu ölçümde hiç görünmeyen, ama her turda ödenen kalem.
  Bu ölçümde ölçülmedi.
- Uygulamanın hesapladığı **gerçek** backlink ve grafik verisi — `backlinks.md`
  gibi diske yazılmış bir kopya değil, sorulduğunda dönen bir cevap. Yani B1+'ın
  17KB'lık vergisi diskten çıkıp çağrı başına ödemeye dönerdi.
- Tam metin arama ve etiket sorgusu, `rg` yerine sunucu tarafında.

**Tablodan çıkarılırdı**

- Grep turu. Dört koşumun hepsinde ilk araç çağrısı bir aramaydı; MCP bunu tek bir
  yapılandırılmış sorguya indirir.
- Dosya adı/yol yönetimi. Modelin not adlarını, klasörleri ve `[[...]]` hedeflerini
  eşleştirme yükü kalkar.

**Tahmin:** bu ölçekte köprü **net zarar** yazar. Kazandığı şey iki araç çağrısı
(~birkaç yüz token); kaybettiği şey her turda ödenen araç şeması kirası. Kazanç
noktasının, külliyat tek `Read` ile alınamayacak kadar büyüdüğü ve grep'in isabetsiz
kaldığı yerde başlaması beklenir. **Bu tahmindir, ölçülmedi.**

---

Ham veri, üretici betik ve dört koşum çıktısı:
`scratchpad/olcum-obsidian/` (depoya girmez).
