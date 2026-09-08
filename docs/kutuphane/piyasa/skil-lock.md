# skills-lock/skil-lock

- Apache-2.0 · CLI + GitHub Action (Go) · ★3
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill (kendi sürüm yardımcısı); üretilen `skills.lock` + `.skil-lock.yaml` politika dosyası
- sıradan turda bağlama: 0 token — Claude içine hiçbir şey kurulmuyor, tümü CI/PR tarafında çalışıyor.
- premium: yok.

## Ne yapar
Depodaki her skill'in *yetenek yüzeyini* (çalıştırdığı kabuk komutları, eriştiği ağ adresleri, okuduğu
ve yazdığı dosya yolları) tarar ve `skills.lock` dosyasına sabitler. Her PR'da yeniden tarar, farkı
yorum olarak yazar, onaylanmamış sapmayı bloklar. Depo sahibinin taraması: 17.065 açık skill'in
%38,8'i kabuk komutu çalıştırıyor, yalnız %4,0'ı bunu frontmatter'da bildiriyor.

## Core'a alınacak
- fikir: Core'un kütüphane rafları dış depolardan besleniyor; bir rafın "ne çalıştırabildiği" (kabuk, ağ, dosya) tek satırda kayıtlı olsa güncellemede sapma görünür olurdu.
- pasif betik: `kutuphane.js fetch` sonrası indirilen metnin komut/URL yüzeyini çıkarıp raf notuna yazan küçük tarayıcı — model gerektirmez, saf regex.
- kitap: `SPEC.md`'nin lockfile şeması (kanonik sıralama, sha256 içerik özeti) kısa bir raf notu değerinde.

## Karar
Fikir notu — araç Go ve PR odaklı, Core'a kurulmaz; ama "indirdiğin metnin yetenek yüzeyini kaydet" fikri kütüphane rafına doğrudan uyar.
