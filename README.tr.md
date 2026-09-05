<!-- lang -->

[<img src="assets/badge-lang.tr.svg" alt="Türkçe seçili, switch to English" width="124" height="44">](README.md)

<div align="center">
<img src="assets/banner.tr.svg" alt="Teknesyum Core, Claude Code için bir çıkarma eklentisi." width="900">
</div>

# Teknesyum Core

Sayar, Gösterir, Bir Kez Konuşur

---

## Nedir

Teknesyum Core, sıradan tura hiçbir şey eklemeyen bir Claude Code eklentisidir. Oturumun
dokunduğu dosyaları sayar, sayıyı statusline'da gösterir ve sohbete tam bir kez konuşur:
iş eşiği aştığında ve diskte plan yoksa. Oturum bittiğinde ya da bağlam penceresi
dolduğunda bir devir dosyası yazar; bir sonraki oturum iki kelimeyle devam eder:
"devam et".

Claude Code'un native yaptığı her şey — alt ajanlar, worktree'ler, plan modu, kancalar,
statusline — olduğu gibi bırakılır. Hiçbir şey sarılmaz, kapıya alınmaz, yeniden yazılmaz.

Önceki tasarım çok ajanlı işi sözleşmelerin arkasına alıyordu. Düz Claude Code ile
ölçüldüğünde aynı sonuç için kat kat pahalı çıktı ve daha geç bitti. Bu sürüm o makineyi
ayarlamak yerine söküyor; ölçümler `docs/raporlar/` altında.

---

## Ne yapar

### Sayar

Her `Write`, `Edit` ve `NotebookEdit` sonrası kanca dokunulan dosyayı kaydeder ve kaç satır
değiştiğini git'e sorar. Eşiğin altında hiçbir şey yazmaz: bağlama sıfır bayt.

Eşik beş dosya, ya da yüz elli değişen satır, ya da yolu riskli görünen tek bir dosyadır:
`migrations/`, `auth`, `secur`, `config`, bir lock dosyası, `.github/`, `Dockerfile`. Eşik
aşılınca ve `docs/plan.md` yoksa oturumda bir kez tek satır gelir:

> 4 dosyaya dokunuldu ve plan yok. docs/plan.md yaz ya da atla de.

Konuşmanın tamamı budur. Model planı yazar ya da atla der; kanca bir daha sormaz.

### Gösterir

Statusline aynı durumu okur: dokunulan dosyalar ve eklenen/silinen satırlar, plan var mı,
oturumun koştuğu testler ve kaçının düştüğü, bağlam yüzdesi, bekleyen devir var mı, açık
hata günlükleri ve varsa kanca hataları. Arayüz standardı gelene kadar düz metindir; burada
renk ya da ölçü uydurulmaz.

### Devreder

Bağlam yüzde altmışı geçince ya da oturum bitince `.claude/handoff.md` makine tarafından
üretilir: `changed_files` `git diff --stat`'tan, `tests_run` kancanın gördüğü komutlar ve
çıkışlarından, `plan` varsa yolundan, `task` oturumun ilk istemi olarak transkriptten. İki
bölüm modele kalır, `decisions` ve `next_action`; eşik anında tek satır bunları ister:

> Bağlam %64. .claude/handoff.md içinde decisions ve next_action doldur.

Yeniden üretilen devir, modelin yazdığını korur. Sonraki oturum başında tek satır söylenir,
`Devam: .claude/handoff.md`, başka hiçbir şey. İş bitince dosya `trash/`'e gider.

### Çalar

Claude sizi beklerken bir ses: izin sorusu, bir soru, bir diyalog. Sizi gerektirmeyen her
şeyde sessizlik. Tek ayarla kapanır.

### Yalnız çağrılınca çalışan araçlar

| Betik | Ne yapar |
|---|---|
| `scripts/map.js .` | Import grafiği: merkezler, döngüler, yetimler. `map.js who <dosya>` kimin import ettiğini söyler. |
| `scripts/log.js write` | Sabit biçimli hata günlüğü, projenin kendi deposuna. |
| `scripts/manset.js` | İsterseniz manşet satırı. |
| `scripts/advice.js list` | `??` turları için `docs/danisma/` altındaki danışma kayıtları. |
| `scripts/scaffold.js` | Lisans, imza bloğu, dil linki: modelin asla yazmadığı sabit metinler. |
| `scripts/setup.js` | Makine ayarı: dil, zil, özel depo, projeler klasörü. |
| `scripts/doctor.js` | Yedi kontrol: node, git, sürüm, kancalar, statusline, harita, günlükler. |
| `scripts/release.js` | Sürümü artırır, kurulum satırlarını yeniler, etiketler. |

---

## Kurulum

### Windows — tek satır

```powershell
irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.16.0/install.ps1 | iex
```

### macOS / Linux — tek satır

```bash
curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.16.0/install.sh | bash
```

**Sonrasında Claude Code'u yeniden başlatın.** Kancalar oturum ortasında yüklenir; masaüstü
istemci ürettiklerini yeniden başlayana kadar çizmez.

İki tek satır da bir etikete işaret eder, asla `main`'e değil. Her sürüm iki kurucunun
SHA-256'sını yayınlar.

**Gerekli:** Claude Code, git, Node.js.

Kurucular kendi terminalinizde kurulumu çalıştırarak biter. Atladıysanız kendiniz çalıştırın:

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

Kurulum `~/.claude/teknesyum/config.json` dosyasını yazar ve statusline'ı bağlar. Bir
sonraki oturum başında geçerli olur.

---

## CLAUDE.md kuralı

Eklenti modele nasıl çalışacağını söylemez. Kendi `CLAUDE.md` dosyanıza koymanızı önerdiği
beş satırlık kural budur; sayma kancası tek yaptırımıdır.

```
- Tek dosya ve bildiğin iş: yap.
- Beş ve üstü dosya: önce docs/plan.md.
- Bilmediğin kütüphane: yazmadan önce oku.
- Bitince çalıştır, çıktıyı göster.
- Küçük iş: bunların hiçbiri.
```

---

## Kullanımda nasıl görünür

```
Teknesyum ▸ my-app · bağlam 41% · 3 dosya +82-14 · plan yok · test 1✓
Teknesyum ▸ my-app · bağlam 67% · 6 dosya +240-31 · plan · test 2✓ 1✗ · devir
```

İlk satır her eşiğin altındaki bir oturum: modele hiçbir şey söylenmemiş. İkincisi planını
yazmış, testlerini koşmuş ve `decisions` ile `next_action` satırlarını bekleyen bir devri
olan oturum.

---

## Ölçüldü

Core 0.16.0, 2026-09-05'te düz Claude Code'a karşı: aynı koltuk (sonnet, düşük effort), temiz
config, kol başına beş tekrar. Tablolar, yöntem ve ham satırlar [bench/rapor.md](bench/rapor.md)
içinde.

- Sıradan tura kancalardan sıfır bayt gelir. CLAUDE.md'de duran beş satırlık kural tur başına
  yaklaşık 200 token cache okuması tutar, kabaca doların on binde biri.
- Görev 02-05: medyan maliyet native'in yüzde üçü içinde ya da daha ucuz, yani gürültü. Görev
  06 tam dört dosyaya dokundu, sayma kancası her koşuda konuştu; model her seferinde atla dedi ve
  koşu yüzde dokuz pahalı çıktı. Eşik beş dosyaya çekildi ve yeni dosyaların satırları satır
  eşiğine girmez oldu; son üç tekrarlık ölçümde kanca hiç konuşmadı, medyan native'in yüzde
  yedi üstünde kaldı, üç koşunun gürültüsü içinde.
- Kancanın söylediği tek satır: yaklaşık 450 token, ek araç çağrısı yok.
- Resume: devir her seferinde yazılır ama altı turda kesilen oturum bağlam eşiğine varmaz;
  decisions ve next_action boş kalır ve dosya görevi taşımaz. "Devam et" işi devirle beşte bir,
  devirsiz beşte sıfır koşuda bitirdi. Devir artık oturumun ilk istemini `task` olarak taşıyor
  ve başında sonraki oturuma ilk bitmemiş parçadan sürmesini söyleyen tek satır var. Bununla
  "devam et" işi üçte üç koşuda bitirdi; düz Claude Code üçte sıfır. İkinci oturum core kolunda
  yaklaşık üç kat pahalı, çünkü işi yapıyor. Satırlar raporun 6. ve 7. bölümünde; bir turun kabul
  sütunu geçersiz, koşturucu bash'i bulamamıştı.

---

## Kancalar

Altı olay, altı komut, hepsi `core/hooks/` altında:

| Olay | Kanca | Söylediği |
|---|---|---|
| `SessionStart` | `count.js` | varsa `Devam: .claude/handoff.md`, yoksa hiçbir şey |
| `PostToolUse` | `count.js` | eşikte bir satır, bir kez; yoksa hiçbir şey |
| `PreToolUse` | `prefs.js` | README yazılırken kendi README kurallarınız |
| `Stop` | `count.js` | hiçbir şey; statusline için diff'i tazeler |
| `SessionEnd` | `handoff.js` | hiçbir şey; devri yazar |
| `Notification` | `notify.js` | hiçbir şey; çalar |

Bağlama yalnız `count.js` yazabilir; test takımı tek konuşanın o olduğunu denetler.

---

## Düzen

```
.claude/
  handoff.md           işin durumu, makine yazar, iki satır sizin
  map.md               import grafiği
docs/
  plan.md              kancanın sorduğunda istediği plan
  danisma/             ?? turlarının danışma kayıtları
~/.claude/teknesyum/
  config.json          ayarınız
  state-<oturum>.json  sayım
  hook-errors.log      bir kancanın yapamadığı
```

---

## Testler

```bash
npm test
```

Takım gerçek kancaları geçici bir depodan geçirir: sayım eşiğin altında sessiz kalır ve
sıfır bayt yazar, üstünde bir kez konuşur, riskli yolu tek başına sebep sayar, diskte plan
varken susar. Devir git'ten üretilir, modelin yazdığını korur, sonraki başlangıçta söylenir
ama sıkıştırma sonrası söylenmez. Yanında: iki dilde statusline, kişisel kural kapısı,
iskele, harita, zil ve doktor.

---

## Tasarım notları

- [docs/COST-MODEL.md](docs/COST-MODEL.md) — token'lar nereye gidiyor, ondan çıkan kural
- [docs/DECISIONS.md](docs/DECISIONS.md) — bunu şekillendiren kararlar ve nedenleri
- [docs/BENCH.md](docs/BENCH.md) — eklenti düz Claude Code'a karşı nasıl ölçülüyor

---

## Katkı

Kod yazmadan önce bir issue açın — yamanızın bir şeyle çakıştığını sonradan öğrenmekten
hızlıdır. Pull request'i küçük tutun; tek iş yapan diff aynı gün okunur, beş iş yapan hiç.

Depo İngilizce yazılır. Katkılar buradaki her şey gibi AGPL-3.0-or-later altında iner; CLA
yok, tören yok.

Vaktinizden kazandırıyorsa [çalışmayı destekleyebilirsiniz](https://github.com/sponsors/Teknesyum).

---

## Destek

Eklenti ücretsiz ve ücretsiz kalacak — AGPL, ücretli sürüm yok, satın almanız için kenarda
tutulan özellik yok. Kötü bir merge'ü ya da bir öğleden sonranızı kurtardıysa, destek bunu
söylemenin bir yolu.

Yardım etmenin ücretsiz yolları da var: hataları bildirin, yapıcı eleştirilerinizi yazın,
bir arkadaşınıza tavsiye edin.

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Teknesyum'u Destekle" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="Lisans AGPL-3.0" height="38"></a>

</div>
