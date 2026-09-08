<!-- lang -->

[<img src="assets/badge-lang.tr.svg" alt="Türkçe seçili, switch to English" width="124" height="44">](README.md)

# Teknesyum Core

Sayar, Gösterir, Bir Kez Konuşur

---

## Önce Sayılar

Aşağıdaki her iddia düz Claude Code'a karşı aynı koltukta (sonnet, düşük efor), temiz
config ile 2026-09-05 ve 2026-09-06'da ölçüldü. Yöntem, tablolar ve ham satırlar
[bench/rapor.md](bench/rapor.md) içinde; bench'in tamamı yaklaşık 40 $ tuttu.

| Ne ölçüldü | Düz Claude Code | Core 0.16 |
|---|---|---|
| Sıradan tur, kancaların bağlama yazdığı bayt (200 tur) | 0 | 0 |
| Sıradan tur, tur başına ek token, p50 / p95 | - | +207 / +427, tamamı cache okuması, 0,0001 $ |
| Görev 02-05, medyan maliyet, beşer koşu | 0,11-0,39 $ | %3 içinde ya da daha ucuz, hepsi geçti |
| Görev 06, dört dosya ve ~185 satır, üç koşu | 0,34 $, 3/3 geçti | 0,37 $, 3/3 geçti, kanca 3/3 sustu |
| Kancanın konuştuğu tek satır, konuştuğunda | - | ~450 token, 0,0007 $, ek araç çağrısı yok |
| Devam: altı turda kesilen oturum, sonraki oturum yalnız "devam et" | 0/3 bitirdi | 3/3 bitirdi; ikinci oturum 0,33 $'a 0,11 $ |
| Sökülen 0.15 makinesi olduğu gibi geri takıldı | - | 4-8 kat maliyet, 7-15 ajan çağrısı, aynı kabul |
| Sökülen her 0.15 parçası tek başına geri takıldı | - | taban aralığının içinde ya da üstünde, kabulün görebildiği hiçbir şey yok |

Tek nefeste: hiçbir şeyin olmadığı turda Core'un bedeli sıfır. Görevde Core, düz Claude
Code ne tutuyorsa onu tutuyor. Satın aldığı tek şey kesilip yeniden alınabilen oturum;
para oraya gidiyor, çünkü ikinci oturum "iyi görünüyor" demek yerine işi yapıyor.

Son iki satır tasarımın kanıtı. Önceki sürüm çok ajanlı işi sözleşmelerin, rollerin ve
katmanların arkasına alıyordu. Olduğu gibi geri takılınca aynı görevleri dört-sekiz kat
fiyata geçti. Karar kuralı koşudan önce yazılıp parça parça geri takılınca hiçbir parça
kabul sütununu oynatmadı, hiçbiri geri girmedi. Satırlar raporun 8. bölümünde; varyantlar
`bench/varyant/` altında, tek komutla yeniden koşar.

---

## Nedir

Teknesyum Core, sıradan tura hiçbir şey eklemeyen bir Claude Code eklentisidir. Oturumun
dokunduğu dosyaları sayar, sayıyı statusline'da gösterir ve sohbete tam bir kez konuşur:
iş eşiği aştığında ve diskte plan yoksa. Oturum bittiğinde ya da bağlam penceresi
dolduğunda bir devir dosyası yazar; bir sonraki oturum iki kelimeyle sürer: "devam et".

Claude Code'un native yaptığı her şey - alt ajanlar, worktree'ler, plan modu, kancalar,
statusline - olduğu gibi bırakılır. Hiçbir şey sarılmaz, kapıya alınmaz, yeniden yazılmaz.

---

## Ne Yapar

### Sayar

Her `Write`, `Edit` ve `NotebookEdit` sonrası kanca dokunulan dosyayı kaydeder ve git'e
kaç satır değiştiğini sorar. Eşiğin altında hiçbir şey yazmaz: bağlama sıfır bayt.

Eşik beş dosya, ya da izlenen dosyalarda yüz elli değişen satır, ya da yolu riskli görünen
tek bir dosya: `migrations/`, `auth`, `secur`, `config`, bir lock dosyası, `.github/`,
bir `Dockerfile`. Yeni dosyaların satırları gösterilir ama satır eşiğine girmez; üç yeni
dosya yazan iş plan isteyen iş değildir. Eşik aşıldığında ve `docs/plan.md` yoksa oturumda
bir kez tek satır gelir:

> 5 dosyaya dokunuldu ve plan yok. docs/plan.md yaz ya da atla de.

Konuşmanın tamamı bu. Model planı yazar ya da atla der; kanca bir daha sormaz.

### Gösterir

Statusline aynı durumu okur: dokunulan dosyalar eklenen ve silinen satırlarla, plan var mı,
oturumun koştuğu testler ve kaçının düştüğü, bağlam yüzdesi, bekleyen devir var mı, açık
hata günlükleri, varsa kanca hataları. Düz metin; burada renk ya da ölçü uydurulmaz.

Oturumun kabuk üzerinden başlattığı ve otuz dakikadan uzun süredir çalışan süreçleri de
sayar: `⏳ 2 süreç 40 dk`. Sayımı ayrık bir süreç en çok dakikada bir tazeler, statusline
onu hiç beklemez; ilk takılı süreç göründüğünde zil bir kez çalar. Hiçbir şey durdurulmaz;
doksan dakikalık iş doksan dakika alabilir, satır yalnız hâlâ orada olduğunu söyler.

### Sınırlar

Her `Bash` ve `PowerShell` çağrısından önce kanca üst sınırı olmayan bekleme döngüsü arar:
`sleep` çevresinde `until` ya da `while`, `timeout` yok, sayaç yok, son tarih yok. Böyle bir
döngü beklediği şey gelmezse sonsuza kadar asılı kalır. Çağrı, nasıl sınırlanacağını söyleyen
tek satırla reddedilir; sınırı model işten seçer ve yeniden koşar. Gerisi tek bayt yazılmadan
geçer.

### Devreder

Bağlam yüzde altmışı geçince ya da oturum bitince `.claude/handoff.md` makine tarafından
yazılır. Tek satır kuralla açılır - önce task'ı, sonra değişen dosyaları oku, ilk bitmemiş
parçadan sür, diff'in gösterdiğini yeniden yapma - ve sonra şunları taşır: `task`, oturumun
ilk istemi, transkriptten; `changed_files`, `git diff --stat`'tan; `tests_run`, kancanın
gördüğü komutlar, çıkış kodları ve o anın ağaç karması; `steer`, ilkinden sonraki son üç
istem; varsa `plan`. İki bölüm modele bırakılır, `decisions`
ve `next_action`; eşikte tek satır onları ister:

> Bağlam %64. .claude/handoff.md içinde decisions ve next_action doldur.

Yeniden üretilen devir modelin yazdığını korur. Sonraki oturum başında tek satır söylenir,
`Devam: .claude/handoff.md`, başka hiçbir şey. İş bitince dosya `trash/`e gider.

### Çalar

Claude sizi beklerken bir ses - izin sorusu, soru, diyalog - ve sizi gerektirmeyen her şey
için sessizlik. Tek ayarla kapanır.

### Danışır

`??` ya da `++` ile başlayan istem önce kütüphaneyi açar. `hooks/mod.js` kancası kelimeleri
`kutuphane.js find`e verir, model çağrısı yok; en çok sekiz bulgu ve üç satır kural o turun
bağlamına girer; model en çok üç kitabı lean okur, kaynağı tek satırda söyler ve o uzmanlıkla
çalışır. Türkçe kelimeler İngilizce kataloğa çevrilir, eşleşme tam kelimedir. `pp` ile
başlayan istem ise özel rafı açar: sahibin kendi kitapları, `~/.claude/teknesyum-private/private/`
altında, bütün (8 KB tavan), cevap bandı `◆ Teknesyum · özel raf`; raf yalnız o aynanın
uzak deposu sahibinse vardır, başka makinede `pp` bunu söyler ve durur. `aa` ile başlayan istem ajansı açar: kelimeler `agency.js find`e gider, en çok üç koltuk ve bir kural
bağlama girer; model koltuğu lean okur, soruyla birlikte Türkçe bir alt ajana verir, cevabı `docs/danisma/`
altına kaydeder. Sıradan tur hiçbirinden bir şey almaz. `netleştir` sözcüğü ise
soruyu keskinleştirme isteğidir: `advice.js ask` soruyu `docs/netlestirme/` altına yazar,
`hooks/scout.js` kapısı bir kez bırakır, `record` cevabı dosyalar.

### Yalnız çağrılınca çalışan araçlar

| Betik | Ne yapar |
|---|---|
| `scripts/map.js .` | Import grafiği: merkezler, döngüler, yetimler. `map.js who <dosya>` kimin import ettiğini söyler. |
| `scripts/log.js write` | Sabit biçimli hata günlüğü, projenin kendi deposuna. |
| `scripts/advice.js` | `ask <soru> [--facts <dosya>]` `??` sorusunu `docs/netlestirme/` altına yazar ve kapıyı herhangi bir modelde tek çağrı için kurar; `record` cevabı dosyalar; `list` `docs/danisma/` kayıtlarını gösterir. |
| `scripts/kutuphane.js` | Kütüphane: raflar projenin dışına klonlanır (`fetch`), katalog frontmatter'dan ya da ilk başlık ve paragraftan kurulur, `find <kelimeler>` modelsiz puanlar, `show <slug…> --lean` üç kitap ve 48 KB ile sınırlı, `record` `docs/danisma/` altına yazar, `push private` özel rafı commit'ler ve iter, `stale [gün]` her rafın kaç gün önce çekildiğini listeler, `fetch all --stale 7` yalnız ondan eskileri çeker. Otuz üç raf `core/kutuphane.json` ile gelir (1890 kitap; MIT, Apache-2.0, CC0, CC BY-SA 4.0 ve bir CC BY-NC-SA 4.0; seçim `docs/kutuphane/` altında; 8 Eylül 2026 piyasa taraması, 1000 depo, 963 okundu, 93 Al, `docs/kutuphane/piyasa-2026-09-08.md`), `raf add <slug> <url> --kind agents|skills|prompts|docs` ekler; tür neyin kitap sayılacağını seçer. Hiçbiri kurulmaz, hiçbir raf bağlama girmez. |
| `scripts/agency.js` | [agency-agents](https://github.com/msitarzewski/agency-agents) deposu artık kütüphanenin `agency` rafı, komutlar aynı: `find ui` seçer, `show <slug> --lean` rolü kişilik ve ölçüt bloklarını atarak alt ajana verir, `record` alışverişi `docs/danisma/` altına yazar. `show` bir koltuk izi bırakır, sonraki `Stop` onu sohbette `Koltuk: <slug> okundu · <n> KB` diye basar; satır bağlama girmez. Hiçbiri ajan olarak kurulmaz; liste bağlama hiç girmez. |
| `scripts/manset.js` | Markdown raporu denetler: düzyazıdaki her sayı aynı bölümün tablosunda ya da listesinde bulunmalı. |
| `scripts/scaffold.js` | Lisans, imza bloğu, dil linki: modelin asla yazmadığı sabit metinler. |
| `scripts/setup.js` | Makine ayarı: dil, zil, özel depo, projeler klasörü. |
| `scripts/doctor.js` | Yedi kontrol: node, git, sürüm, kancalar, statusline, harita, günlükler. |
| `scripts/scan.js` | Projenin kendisine yedi salt okunur kontrol: lisans yüzeyleri, beş dosya eşiğine karşı plan, devir boşlukları, sürüme karşı belgeler, test betiği, `trash/` atıfları, harita. Yazmaz, model çağırmaz, bağlama taşımaz; profil yalnız belge kümesini genişletir. |
| `scripts/scout.js` | Öncül arama, istenince ve bir kez: `brief <konu>` `docs/oncul/` altına sınırlı bir öncül yazar (5 arama, 3 sayfa, 5 aday, 400 kelime) ve kapıyı kurar; öncül sonnet üstünde tek alt ajana gider; `record` cevabı 8.000 karakterde keserek dosyalar. `hooks/scout.js` kapısı aynı öncüle ikinci çağrıyı, başka modeli ya da uzatılmış istemi reddeder. |
| `scripts/release.js` | Sürümü `.changes/` altındaki notlardan artırır, kurulum satırlarını yeniler, etiketler. |

---

## Ne Çıktı

0.16 bir çıkarma sürümü. Şunlar eklentiden çıktı; hepsi `v0.15.0` etiketinde duruyor,
`bench/varyant/` ölçtüğü her parçanın kaynağını oradan adlandırıyor:

- sözleşme makinesi: `contract.js`, `risk.js`, `verify-runner.js`, relay'in `handoff.js`'i;
- dokuz kanca: autoclose, closure, cue, embed, guard, notice, schema, seal, watch;
- altı rol metni, `worker` ajanı, relay skill'i, `tiers.json`.

Yerine iki kanca geldi, `count.js` ve `handoff.js`, bir de aşağıdaki beş satırlık kural.
Ajanlar, worktree'ler ve plan modu yerinde; onlar Claude Code'un kendisinin ve model onları
her zamanki gibi kendi seçiyor. Çıkan parça, onun yerine seçen makineydi.

---

## Kurulum

### Windows - tek satır

```powershell
irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.24.0/install.ps1 | iex
```

### macOS / Linux - tek satır

```bash
curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.24.0/install.sh | bash
```

**Sonra Claude Code'u yeniden başlatın.** Kancalar oturum ortasında yüklenir; masaüstü
istemci ürettiklerini yeniden başlamadan çizmez.

İki tek satır da bir etikete bakar, asla `main`'e değil. Her sürüm iki kurucunun da
SHA-256'sını yayınlar.

**Gereken:** Claude Code, git, Node.js.

Kurucular kendi terminalinizde setup'ı çalıştırarak biter. Atladıysanız kendiniz çalıştırın:

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

Setup `~/.claude/teknesyum/config.json` yazar ve statusline'ı bağlar. Sonraki oturum
başında geçerli olur.

---

## CLAUDE.md Kuralı

Eklenti modele nasıl çalışacağını söylemez. Kendi `CLAUDE.md`'nize koymanızı önerdiği beş
satırlık kural bu; sayım kancası tek yaptırımı, kuralın kendisi de yukarıdaki tablodaki tur
başına ~200 token.

```
- Tek dosya ve bildiğin iş: yap.
- Beş ve üstü dosya: önce docs/plan.md.
- Bilmediğin kütüphane: yazmadan önce oku.
- Bitince çalıştır, çıktıyı göster.
- Küçük iş: bunların hiçbiri.
```

---

## Kullanımda Nasıl Görünür

```
Teknesyum ▸ my-app · bağlam %41 · 3 dosya +82-14 · plan yok · test geçti
Teknesyum ▸ my-app · bağlam %67 · 6 dosya +240-31 · plan · test bayat · devir
```

İlk satır her eşiğin altındaki bir oturum: modele hiçbir şey söylenmemiş. İkincisi planını
yazmış, testlerini koşmuş, sonra dosya değiştirmiş (son kayıt bayat) ve `decisions` ile
`next_action` satırlarını bekleyen bir devri olan oturum. Test sözcüğü yalnız son kayıttır:
çıkış kodundan geçti ya da kaldı, koşu hiçbir şey basmadıysa bilinmiyor, HEAD ya da çalışma
ağacı sonradan değiştiyse bayat.

---

## Kancalar

Yedi olay, altı dosya, hepsi `core/hooks/` altında:

| Olay | Kanca | Söyler |
|---|---|---|
| `SessionStart` | `count.js` | varsa `Devam: .claude/handoff.md`; varsa `docs/plan.md`nin ilk açık `- [ ]` adımı; yoksa hiçbir şey. Günde bir kez `kutuphane.js fetch all --stale 7`yi arka planda ayrık başlatır, hiçbir raf bir haftadan eski kalmaz; model hiçbirini görmez |
| `UserPromptSubmit` | `mod.js` | `??` / `++`de kütüphane bulguları, `pp`de özel kitaplar, `aa`da ajans koltukları; yoksa hiçbir şey |
| `PostToolUse` | `count.js` | eşikte tek satır, bir kez; yoksa hiçbir şey |
| `PostToolUseFailure` | `count.js` | hiçbir şey; kalan test komutunu kaydeder |
| `PreToolUse` | `prefs.js` | README yazılırken kendi README kurallarınız |
| `PreToolUse` | `loop.js` | bekleme döngüsünün üst sınırı yoksa tek satır; yoksa hiçbir şey |
| `PreToolUse` | `scout.js` | hiçbir şey; bütçesini aşan öncül ya da `netleştir` çağrısını reddeder |
| `Stop` | `count.js` | bağlama hiçbir şey; diff'i tazeler, `agency.js show` sonrası koltuğu bir kez sohbet satırı olarak basar |
| `SessionEnd` | `handoff.js` | hiçbir şey; devri yazar |
| `Notification` | `notify.js` | hiçbir şey; çalar |

Bağlama yalnız `count.js` ve `mod.js` yazabilir; test takımı başkasının yazmadığını denetler. Ölçüm: sıradan tur 0 bayt, `??` ~1,7 KB, `pp` ~3,7 KB, `aa` 1 KB altı.

---

## Düzen

```
.claude/
  handoff.md           iş nerede kaldı, makine yazar, iki satır sizin
  map.md               import grafiği
docs/
  plan.md              kancanın istediği plan, istediğinde
  netlestirme/         ?? soruları ve cevapları
  danisma/             danışma kayıtları
bench/
  rapor.md             yukarıdaki tablonun arkasındaki rapor
  varyant/             çıkan parçalar, yeniden ölçülmeye hazır
~/.claude/teknesyum/
  config.json          sizin ayarınız
  state-<oturum>.json  sayım
  hook-errors.log      bir kancanın yapamadığı
```

---

## Testler

```bash
npm test
```

Takım gerçek kancaları geçici bir depodan geçirir: sayım eşiğin altında susar ve sıfır bayt
yazar, üstünde bir kez konuşur, riskli yolu tek başına sebep sayar, diskte plan varken
susar. Devir git'ten üretilir, modelin yazdığını korur, sonraki başlangıçta duyurulur ama
sıkıştırmadan sonra duyurulmaz. Yanında: iki dilde statusline, kişisel kural kapısı,
scaffold, harita, zil, doctor ve bench'in kendi maliyet ve koşu yardımcıları.

---

## Tasarım Notları

- [docs/COST-MODEL.md](docs/COST-MODEL.md) - token nereye gidiyor ve ondan çıkan kural
- [docs/DECISIONS.md](docs/DECISIONS.md) - bunu biçimlendiren kararlar ve nedenleri
- [docs/BENCH.md](docs/BENCH.md) - eklenti düz Claude Code'a karşı nasıl ölçülüyor

---

## Katkı

Kod yazmadan önce issue açın - yamanızın bir şeyle çakıştığını sonradan öğrenmekten hızlı.
Pull request'i küçük tutun; tek iş yapan diff aynı gün okunur, beş iş yapan hiç. Yeni
özellik `bench/varyant/` altında bir girdi ve satırlarıyla gelir; çıta en üstteki tablo.

Depo İngilizce yazılır. Katkılar AGPL-3.0-or-later altında iner, buradaki her şey gibi;
imzalanacak CLA, yapılacak tören yok.

Zaman kazandırdıysa [çalışmayı destekleyebilirsiniz](https://github.com/sponsors/Teknesyum).

---

## Destek

Eklenti ücretsiz ve ücretsiz kalıyor - AGPL, ücretli katman yok, satın almanız gereken bir
sürüm için saklanan hiçbir şey yok. Kötü bir merge'den ya da bir öğleden sonradan
kurtardıysa, sponsor olmak bunu söylemenin bir yolu.

Ücretsiz yardım yolları da var: çarptığınız hataları bildirin, eleştirinizi yazın, bir
arkadaşa önerin.

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Support Teknesyum" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="License AGPL-3.0" height="38"></a>

</div>
