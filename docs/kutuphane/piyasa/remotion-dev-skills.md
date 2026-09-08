# remotion-dev/skills

- lisans belirtilmemiş (repo kökünde LICENSE yok) · skill paketi (npm senkron betikleri) · ★4511
- mekanizma: 0 kanca · 0 komut · 0 ajan · 12 skill · 0 MCP
- sıradan turda bağlama: 12 skill açıklamasının toplamı 559 B (~140 token); yönlendirici skill gövdesi 2542 B, geri kalan 2,9 MB (REFERENCE.md dosyaları) yalnız istenince okunuyor
- premium: yok

## Ne yapar
Remotion (video-as-React) için 12 skill'lik paket. Tek "router" skill'i (`remotion-best-practices`, açıklaması yalnız "Router for all Remotion skills") bir yönlendirme tablosu tutar: "kullanıcı video oluşturmak isterse `./remotion-create/REFERENCE.md` yükle" gibi koşul-hedef satırları. Gövdeler ayrı REFERENCE.md dosyalarında.

## Core'a alınacak
- **kitap/fikir** — yönlendirici tablo biçimi: kütüphane dizini "raf listesi" değil, "şu durumda şu rafı oku" koşul satırları olsun. 2,9 MB bilgiyi 2,5 KB'lık tek dosyayla adresliyor.
- **fikir** — 559 B'lık toplam açıklama bütçesi: 12 skill'in açıklaması ortalama 46 B. Core'un dizin satırları için ölçülebilir tavan.
- **fikir** — SKILL.md ile REFERENCE.md ayrımı: başlık dosyası yönlendirir, gövde dosyası hiç yüklenmez.

## Karar
Al — yönlendirici tablo Core'un kütüphane dizinine bugün uygulanabilir, maliyeti bir dosya düzenlemesi.
