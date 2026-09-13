[[netlestirme:001]]

# Netleştirme: yani ayrı bir plugin ile ui ın yapılmasının gerekli olmadığını düşünmeye başladı

İşe başlamadan önce soruyu keskinleştir. Görüş verme, plan yazma, kod yazma.
Yalnız şunu döndür: soruda belirsiz kalan yerler, her biri için tek satırlık bir netleştirme sorusu, en fazla beş. Belirsizlik yoksa "net" yaz.

## Soru

yani ayrı bir plugin ile ui ın yapılmasının gerekli olmadığını düşünmeye başladım core de pp miz var zaten plugin aktif tüketim yapmıyorken bu denetimi nasıl yapacak / her program tasarlamamda bir standart olsun istiyorum bunu pp kısmımıza yazdırıyoruz yavaş yavaş benim programa pp deki düzenimi oku demem mi mantıklı aktif bir pluginin olması mı işlevi ne ölçüde güçlü onu ne ölçüde mantıklı ne ölçüde geliştirilebilir bunu anlayamıyorum fable ın desteğini bu konuda istiyorum maliyeti arttırmadan ui tercihlerimi bana sunabilir mi misal güncelleme konusunda bir yenilik yaptım teknesyum ui açıkken benim ek efor sarf etmeden programlarımda o güncelleme arayüzü kullanılıyor mu kullanılmıyormu ve kullanılmıyorsa ilgili formu düzenle şeklinde otomasyon mümkün mü vb

## Elde olan olgular

# Olgular

## Teknesyum-UI eklentisi bugün nasıl çalışıyor
- `ui/hooks/guard.js` bir **Stop** kancası. Turun transkriptini okur, dokunulan UI dosyalarını
  bulur (`.css .tsx .jsx .xaml .axaml .xaml.cs`), `scan.js`'i alt süreç olarak koşar.
  Bulgu yoksa hiçbir şey yazmaz. Bulgu varsa stderr'e en fazla 200 karakter yazıp `exit 2`
  ile turu durdurur: "N UI violations, first <dosya:satır>. Run: node scan.js ." Aynı dosya
  için en fazla 2 kez (MAX_BLOCKS), sayaç oturum durumunda tutuluyor.
- Yani maliyet: temiz turda 0 token, yalnız node koşusu. Yakaladığında ≤200 karakter modele
  girer. Bunun dışında bağlama hiçbir şey yazmıyor.
- Kapı: `<proje>/.claude/teknesyum-ui.json` ya da `~/.claude/teknesyum-ui.json`. Dosya yoksa
  standart uygulanmıyor, skill kendini devre dışı sayıyor. `off: true` ile kapanıyor.
- `ui/scripts/scan.js` (585 satır) kuralları `ui/scripts/rules/` altından yüklüyor:
  colour.js 24 kural, states.js 28, forms.js 21, core.js 17, process.js 3 — toplam 93 kural id'si.
  Kurallar satır ve dosya düzeyinde; `fixes` tablosu ve `applyFixes()` var, yani bir kısmı
  otomatik düzeltilebiliyor.
- `ui/skills/teknesyum-ui/SKILL.md` bir skill; başlığı ve açıklaması oturum listesinde durur,
  gövdesi yalnız çağrılınca yüklenir.
- `ui/scripts/generate.js` (1588 satır) token üreteci; `neon.tokens.json` (14.4 KB) kaynak.
  `setup.js` projeye `.claude/teknesyum-ui.json` yazıp tema çıktılarını üretiyor.
- `ui/scripts/scaffold.js` şablonları kopyalıyor: `kur` (Kur.bat + kur-<ad>.ps1, 331 satır
  panel, {{AD}}/{{DEPO}}/{{SIMGE}}/{{ADIMLAR}} yer tutucuları), `ustcubuk` (TitleBar.tsx +
  titlebar.css), `durum` (Electron senkron rozeti: sync.js, preload.js, badge.js, badge.css).
- Depo: Teknesyum/Teknesyum-UI, sürüm 0.2.1, AGPL-3.0.

## Özel raf (pp) bugün nasıl çalışıyor
- `pp` işareti istemin başında ya da sonunda okunuyor; kanca rafı açıp uyan kitapları
  modele veriyor. İşaret yoksa raf hiç okunmuyor, maliyet 0.
- `private/tercihler/` altında dokuz kısa dosya. Bu turda `guncelleme-paneli.md` (3.076 B)
  eklendi, `ui.md`'ye tek satır bağlantı kondu.
- Raf pasif: yazılı tercih. Hiçbir şeyi ölçmez, hiçbir şeyi durdurmaz, bir dosyanın kurala
  uyup uymadığını bilmez.

## Kullanıcının kararı ve sorusu
- Teknesyum-UI deposu arşivlenip private yapılacak, artık kullanılmayacak.
- İstenen UI düzeni Teknesyum-UI içinde varsa oradan çıkarılıp pp genişletilecek.
- Kullanıcı ayrı bir eklentinin gerekli olup olmadığını sorguluyor: "plugin aktif tüketim
  yapmıyorken bu denetimi nasıl yapacak", "programa pp'deki düzenimi oku demem mi mantıklı
  yoksa aktif bir plugin mi".
- Somut beklenti örneği: güncelleme panelinde bir yenilik yapıldığında, kullanıcı ek efor
  harcamadan programlarında o arayüzün kullanılıp kullanılmadığının anlaşılması ve
  kullanılmıyorsa ilgili formun düzenlenmesi.

## Bağlayıcı kurallar
- Maliyet altın kural: her turda maliyet ekleyen özellik önce haber verilir, sıradan tur
  yerliden pahalı olmaz.
- Ölçü ve renk uydurulmaz, teknesyum-ui tokenlarının dışına çıkılmaz.
- Ölü dosya bırakılmaz; işi biten dosya trash/'e taşınır.
- Standing law: hiçbir özellik additionalContext yazmaz; SessionStart/UserPromptSubmit'te
  systemMessage yazılmaz. Kullanıcının gözü için olan şey Z sınıfı kanala gider.
