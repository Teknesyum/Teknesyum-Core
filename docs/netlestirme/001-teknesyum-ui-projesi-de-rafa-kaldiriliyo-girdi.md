[[netlestirme:001]]

# Netleştirme: teknesyum ui projesi de rafa kaldırılıyor core un içinde private rafımıza (pp) y

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

teknesyum ui projesi de rafa kaldırılıyor core un içinde private rafımıza (pp) ye taşıyoruz tüm gereken bilgileri >> yinede fikrimi son birkez fable değerlendirsin

## Elde olan olgular

# Olgular

## Teknesyum-UI deposu bugün ne
- Yol: Desktop\Projeler\Teknesyum-UI, kendi GitHub deposu var (Teknesyum/Teknesyum-UI), sürüm 0.2.1, AGPL-3.0, package.json "private": true.
- İçerik: ui/scripts/ (generate.js 1588 satır, scan.js 585, setup.js 614, manifest.js 334, scaffold.js 159, manifest-apply.js 153), ui/hooks/ (guard.js + Stop kancası), ui/roles/ui-builder.md, ui/skills/{rules, teknesyum-ui}, ui/templates/{kur, ustcubuk/react, durum/electron}, neon.tokens.json (14.4 KB), test/ (7 dosya), docs/ (DECISIONS, EXTRACT, RULE-API, coverage/ 6 dosya), assets/ 4 rozet svg.
- Yani: token üreteci + kural tarayıcı + Stop kancası + şablonlar + bir skill + bir rol. Çalışan kod, belge değil.
- Kur şablonu (ui/templates/kur/kur.ps1, 331 satır) Asistan'ın kurulum panelinin genelleştirilmiş hali: {{AD}}, {{DEPO}}, {{SIMGE}}, {{ADIMLAR}} yer tutucuları, aynı Adim/tavan sözleşmesi, aynı 16 ms zamanlayıcı, aynı çizim. Renkler burada hâlâ sabit hex (#08090a, #00f3ff, #b026ff, #34d399, #ff54eb, #71717a); token kullanmıyor.
- durum/electron (sync.js, badge.js, badge.css) senkron rozeti; badge.css tümüyle --tk-* tokenları kullanıyor, durumlar syncing/synced/offline.
- ustcubuk/react TitleBar.tsx + titlebar.css.

## Teknesyum-Core bugün ne
- Claude Code eklentisi, sürüm 0.33.2, kancalar core/hooks/ (dokuz kanca), betikler core/scripts/.
- Özel raf `pp` işaretiyle okunuyor; kutuphane.js fetch/push ile yönetiliyor.

## Özel raf (teknesyum-private) bugün ne
- Yerel klon: ~/.claude/teknesyum-private. Kökte yalnız README.md, oku-private.md ve proje klasörleri.
- private/tercihler/ altında sekiz kısa dosya: kimlik.md, araclar.md, calisma.md, depo.md, lisans.md, readme-protokolu.md, ui.md (1.4 KB), yazim.md. Hepsi madde madde, kısa tercih cümleleri.
- Kökte ayrıca teknesyum-ui/ klasörü var, içinde yalnız git-disi-2026-09-08-trash/.
- oku-private.md'nin değişmez kuralı: "Kokte yalniz bu iki dosya ve proje klasorleri bulunur"; deponun amacı genel depolara giremeyen kişisel veri (anahtar, token, sertifika, kişisel not). Projeye özel açıklama buraya yazılmaz, projenin kendi klasörüne gider.

## Mevcut ui.md maddeleri (1.4 KB, 10 madde)
Renk/ölçü uydurma yok; banner sessiz; özel mod cevabı ayrılır; statusline modele görünmez; kısa düzen; her program standart üst çubuk + Kur penceresi taşır, kod Teknesyum-UI templates'te, scaffold.js ile kopyalanır; yığın Tauri2+React / Avalonia, Electron donduruldu; ~1 sn üstü iş ilerleme gösterir; güncelleme uyarısı tek eylem "Yükle"; geliştirici yüzeyi gizli.

## Bu turda hazırlanan taslak
Teknesyum-Core\docs\standart-guncelleme-paneli.md, 10 başlık: iki kanal ayrımı, iş/arayüz ayrımı, tavan kuralı, kullanıcı boş kalmaz, sonuç duyurulur, tokenlar, rozet, güncelleme ne yaptığını söyler, prova kipi, şablon elle yazılmaz. Kaynağı Asistan raporu.

## Kullanıcının kuralları (bağlayıcı)
- Ölçü ve renk uydurulmaz, teknesyum-ui tokenlarının dışına çıkılmaz.
- Ölü dosya bırakılmaz; işi biten dosya trash/'e taşınır.
- Maliyet altın kural: her turda maliyet ekleyen özellik önce haber verilir.
- Yapım sırası kullanıcınındır.
