# UC Kampanyası — Ortak Brif

Sahibin şikâyeti: "butonlar okunurluğa dikkat edilmeden açık mavi dolgu içine koyu mavi yazı".
Amaç bunu kökten bitirmek: her yazı ve simge gerçekten üstünde durduğu zemine karşı 7:1.

## Yordam
`C:\Users\Administrator\.claude\teknesyum-private\private\tercihler\ui-denetim.md` kitabını
oku ve sırasıyla uygula. Kurallar: aynı klasördeki `ui-duzeni.md` Okunurluk bölümü ve `ui.md`.

Eklenti: `C:\Users\Administrator\.claude\plugins\cache\teknesyum\teknesyum-ui\0.5.0\scripts\`
- Bağlama: `node <eklenti>/setup.js` (teknesyum-ui.json yoksa)
- Tarama: `node <eklenti>/scan.js <proje>` ve `--json --rules okunurluk`
- Web canlı kontrast: `node <eklenti>/denetim.js --snippet <dosya>`, çıktıyı çalışan sayfada koş
- Avalonia/WPF canlı kontrast: `node <eklenti>/scaffold.js denetim <Namespace> [--wpf|--avalonia]`

## Sınırlar
- Renk yalnız token'dan; dolgulu yüzeyin yazısı `on` eşinden. Renk uydurma.
- Pembe (#ff00ea) ve mor (#b026ff) dolgu üstünde hiçbir yazı 7:1 tutmuyor; bu karar sahipte
  bekliyor. Yazı taşıyan pembe/mor dolguyu 7:1 tutan bir token dolguya (ör. mavi + on-blue)
  ya da çerçeveli/saydam biçime çevir; her birini raporda "Sahip Kararı Bekler" altında listele.
- Windows ekran ölçeği ayarını DEĞİŞTİRME. %125/%150 görüntüyü uygulama içi ölçekle al
  (Avalonia: `AVALONIA_GLOBAL_SCALE_FACTOR`; web: deviceScaleFactor; WPF: yapılamıyorsa gerekçe yaz).
- Ekran görüntüsünü tam ekrandan değil, kendi sürecinin penceresinden al (PrintWindow ya da
  başsız render); başka ajanlar aynı masaüstünde çalışıyor.
- Depoda senin olmayan kirli dosyalar olabilir: yalnız kendi değiştirdiğin dosyaları commit et,
  başkasına dokunma, `git add -A` kullanma. Push et. Sürüm kesme.
- Kod yorumu yazma. Rapor Türkçe, başlıklar Baş Harfleri Büyük.
- Dış bakış (adım 5): Agent aracın varsa işi yapmamış bir alt ajana yalnız görüntüleri ver;
  yoksa görüntü yollarını rapora yaz, "dış bakış ana oturumda" de.

## Dönüş
Tek satır: rapor yolu, önce→sonra pair-contrast/scan hata sayısı, commit hash, açık kalan sayısı.
