# Teklif: Kurulumda Tek Tip: AmeliyatListe Düzeni

**State:** open
**Tür:** Teklif
**İlk görüldüğü yer:** VidShrink, 2026-09-25
**Amaç:** Her proje kurulum panelini ayrı kuruyor (Asistan kur-usb, Teknesyum-UI kur şablonu, AmeliyatListe Installer.tsx); kullanıcı tek tip istiyor

## Durum

Üç projede üç ayrı kurulum yüzü var:
- **Asistan:** `kur-usb.ps1` kullanıyor.
- **Teknesyum-UI:** `templates/kur/kur.ps1` şablonu, 560x424 pencere ve son 9 günlük satırı.
- **AmeliyatListe:** Tauri + React `Installer.tsx`, 720x540 pencere, beş adım listesi.

pp rafında yalnız `private/tercihler/guncelleme-paneli` var ("Kurulum ve Güncelleme Paneli"). Kuruluma özel, tek tip bir kayıt yok.

VidShrink 0.9.4'te Setup.exe paneli yazılırken referans ortadan değişti, önce Asistan düzeni, sonra AmeliyatListe düzeni. Bu, işin bir kısmının yeniden yapılmasına yol açtı.

İnceleme: `VidShrink/docs/olcumler/ameliyatliste-kurulum-incelemesi.md`. Satırlar yerinde doğrulandı.

## Teklif

Bundan sonra her projenin kurulumu AmeliyatListe düzenini izler:
- **Adımlar:** beş adım listesi. Her adım ✓, ! ya da sıra numarası gösterir; süren mavi ve parıltılı, biten yeşil, hatalı pembe.
- **İlerleme:** gradyan ilerleme çubuğu ve yüzde; hareket azaltma tercihine uyar.
- **Günlük:** tek aralıklı yazı, üstü solarak kaybolur, son satır parlak.
- **Kurulum yeri:** yer satırı ve "Değiştir" düğmesi.
- **Düğmeler:** Kur → pasif "Kuruluyor" → "Kapat" + "Programı aç"; hatada "Yeniden dene".
- **Kurulum:** yönetici yetkisi istemez, kullanıcı profiline kurar ve yazma iznini önceden dener.
- **Özel kipler:** sessiz kip (`*_OTOMATIK`) ve prova kipi (`*_PROVA`).
- **Hata iletileri:** Türkçe ve anlaşılır.

Taşınmayanlar:
- Özel depo, gömülü SSH anahtarı ve MinGit ile çekme. Bu anahtar AmeliyatListe README'sinde açık metin duruyor.
- Doğrulamasız indirme.

Kaynak her projede GitHub Releases + sha256 olur.

## Core İçin Öneri

1. **pp rafı:** `private/tercihler/kurulum-paneli` adıyla yeni bir kayıt. Yukarıdaki maddeleri ve AmeliyatListe `Installer.tsx` / `app.css:532-616` referansını taşısın. `guncelleme-paneli` yalnız güncelleme kanalını anlatsın.
2. **Teknesyum-UI:** `templates/kur` bu düzene çekilsin: beş adım listesi, yüzde ve "Değiştir" satırı. Renkler mevcut neon belirteçleri; `#00f3ff`, `#b026ff`, `#34d399` ve `#ff00ea` zaten orada.
3. **Yeni projede soru yok:** yeni bir projede kurulum istendiğinde ajan bu rafı okusun ve referans sormasın. "Hangi projedeki gibi?" sorusu tek tip ile kalkar.
4. **Kural ekle:** "SSH deploy anahtarı deseni taşınmaz" kuralı rafa yazılsın. Şu an yalnız VidShrink oturum hafızasında duruyor.

## 3. Closed

pp rafına `private/tercihler/kurulum-paneli.md` adıyla yeni kitap açıldı: Düzen, Kaynak
(GitHub Releases + sha256, taşınmayanlar), Özel depo istisnası, Antivirüs/Windows
tuzakları, Sınama kipi bölümleriyle. `ui.md` kitap listesine bir satır bağlandı. Raf
commit: `c1298b8`.
