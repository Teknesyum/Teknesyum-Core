# elementalsouls/Claude-BugHunter

- MIT · plugin (skill paketi) · ★4378
- mekanizma: 83 skill, 15 slash komut, 0 kanca, 0 ajan; Burp MCP entegrasyonu (opsiyonel)
- sıradan turda bağlama: 83 SKILL.md `name`+`description` 55 743 B + 15 komut `description` 3 494 B ≈ 59 KB ≈ ~15 000 token, her turda. Skill başına ortalama 671 bayt açıklama — uzun tetikleyici listeleri yüzünden
- premium: yok; sponsorlu

## Ne yapar
Hata avcılığı ve red-team işini 83 skill'e bölmüş bir paket: 58 `hunt-*` zafiyet sınıfı,
kurumsal platform saldırı zincirleri (M365/Entra, Okta, vCenter, SSL-VPN), kanıt hijyeni ve
raporlama. 681 açıklanmış HackerOne raporundan çıkarılmış desenler skill gövdelerinde duruyor.

## Core'a alınacak
- fikir (karşı örnek): tur başına 59 KB daima yüklü açıklama, Core'un "bilgi rafta durur,
  istenince okunur" tercihinin ölçülmüş gerekçesi; bench raporunda referans sayı olur.
- kitap: `evidence-hygiene` ve `token-scan` metinleri — kanıtı dosyaya yazma disiplini,
  kullanıcının "özetleme, kanıtı göster" kuralıyla örtüşüyor.

## Karar
hayır — içerik alanı Core'un dışında ve mekanizması tam tersini yapıyor; yalnız 59 KB rakamı karşı örnek olarak kalır.
