# Devir — 5 Eylül 2026, Masaüstünden Dizüstüne

Bu dosya, oturumu başka bir makinede kaldığı yerden sürdürmek için yazıldı. Depoyu çekip
bunu okuyan bir oturum, konuşma geçmişi olmadan da devam edebilmeli.

## Ağacın durumu

Dal `main`, en son etiket **v0.15.0**, çalışma ağacı temiz. Takım: `npm test` → dört suite
yeşil, `test/all.js` **2.672 geçti, 0 kaldı**.

Son beş commit:

```
eeabf6d Release 0.15.0
27051ac Record the consult on global versus per-project reach
ba4f24f Say less on the banner, and say who is being asked
340ec2a Release 0.14.0
4a2714b Let setup open the folder that holds your projects
```

Açık sözleşme yok. `.claude/relay/contracts/` boş.

## Bu oturumda ne yapıldı

**v0.13.0 — netleştirme danışmana taşındı.** `??` işareti artık kendine ait bir rol açmıyor,
`advisor` rolünü açıyor ve ondan görüş değil netleştirme istiyor. Kullanıcının cümlesi girdinin
ilk satırı oluyor; dönüş `## Soru / ## Olgu / ## Yol`. `core/roles/clarifier.md` → `trash/`.
Gerekçe: [docs/danisma/005-clarifier-gerekli-mi.md](../danisma/005-clarifier-gerekli-mi.md).

**v0.14.0 — kardeş projeye uzanma.** `setup.js --apply --projectsRoot <klasör>` o klasörü
deponun kendi `.claude/settings.local.json` dosyasına yazıyor, küresel dosyaya değil; aynı
adımda `.gitignore`'a giriyor. Bayrak yoksa hiçbir şey yazmıyor, komutu basıyor. Ev dizini,
dosya sistemi kökü, var olmayan klasör ve `~/.claude` içi reddediliyor. Gerekçe:
[docs/danisma/006-tasinabilir-proje-kapsami.md](../danisma/006-tasinabilir-proje-kapsami.md).

**v0.15.0 — banner sadeleşti.** Adım sayacı, dosya sayacı ve geçen dakika bannerdan kalktı;
üçü de kimsenin bakıp bir şey yapmadığı sayıydı. Etiketlerde artık her kelime büyük harfle
başlamıyor (`4 dk sessiz`). Koltuk kademesini yazıyor (`Fable-Medium Danışman`). `??` ile
başlayan prompt `cue.js` kancasına `_sharpen.json` bıraktırıyor ve banner "İş Netleştiriliyor"
diyor; işaretsiz tur dosyayı siliyor. İş satırındaki `son:` yerine danışma cümlesi geçiyor:
`Fable önerisi soruluyor: 003-....md`.

**Küresel izin kapsamı kaldırıldı.** `~/.claude/settings.json` içindeki
`permissions.additionalDirectories` silindi; yedeği `~/.claude/settings.json.bak-kuresel-kapsam`.
Yerine bu depoda `.claude/settings.local.json` var. Gerekçe:
[docs/danisma/007-kuresel-mi-projeye-ozel-mi.md](../danisma/007-kuresel-mi-projeye-ozel-mi.md).

## Dizüstünde ilk adımlar

1. `git pull` — bu dosya ve v0.15.0 gelir.
2. Eklentiyi kur: `install.ps1` tek satırı, ya da elle
   `node core/scripts/setup.js --apply --projectsRoot "<projelerinin durduğu klasör>"`.
   Dizüstündeki yol masaüstündekiyle aynı olmak zorunda değil; `settings.local.json`
   `.gitignore`'da olduğu için o makinenin kendi yolunu taşır.
3. `npm test` — dört suite yeşil olmalı, `all.js` 2.672 sav.

## Depoya girmeyen, elle taşınması gereken dosyalar

Bunlar makineye ait, git'e gitmiyor. Dizüstünde yoksa oturum aynı kurallarla çalışmaz:

| Dosya | Ne taşıyor |
|---|---|
| `~/.claude/CLAUDE.md` | çalışma stili, `??` işaretinin ne yaptığı, Core komutları, compact talimatı |
| `~/.claude/RULES.md` | yinelenen tercihler; yorum yazma, kanıtı göster, PowerShell 5.1, ölü dosya yok |
| `~/.claude/RTK.md` | rtk proxy kullanımı |
| `~/.claude/settings.json` | izin listeleri (`deny`, `ask`), `defaultMode`, statusline bağı |
| `~/.claude/projects/<proje>/memory/` | kalıcı hafıza dosyaları ve `MEMORY.md` dizini |
| `~/.claude/teknesyum-ozel/` | özel ayna deposu (git; ayrıca çekilebilir) |

`~/.claude/settings.json` içindeki `additionalDirectories` **artık olmamalı** — o iş projeye
özel dosyaya taşındı.

## Açık kalan işler

- `??` turlarının ilk onunda kaç `## Soru` bloğunun kullanıcının cevabını değiştirdiğini say.
  Üçten azsa rol ve işaret tamamen kalkar; beşten çoksa mekanik bir insiyatif koşulu tasarlanır.
  Fable'ın kendi ölçüm istemi, 005'te.
- `docs/danisma/` turlarından kaçının bir sonraki adımı değiştirdiğini say.
- Fable'ın 007'deki iki maddesi: (a) `guard.js` yazma sınırını depoya göre mi bu izin
  listesine göre mi çiziyor, doğrula; (b) izin listelerinin kapsamlar arası birleşip
  birleşmediğini tek denemeyle kesinleştir — yerel liste boş, küresel açıkken dışarı yazmayı
  dene.
- `problems.log` içindeki `shell` satırlarını 7 Eylül 2026'dan sonra oku ve B kolunun kapıya
  dönüp dönmeyeceğine karar ver (003'ün sırası).
- VidShrink defteri: Fable'ın üç ölçümü, tasnif dalgası 4.
- `packet.js check`, `kaynaklar.json` + sha256, denetçi arşivinin dal ∪ main'den toplanması,
  `--list-tests` kol sayımı.
- `sonnet/high` kalıcı sayılmadan önce 20-30 sözleşme yeniden ölçülecek.
