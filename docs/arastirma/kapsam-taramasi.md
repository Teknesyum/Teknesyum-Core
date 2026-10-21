# Kapsam Taraması: graphify Ve headroom Bizde Ne Kadar İşe Yarar

Tarih: 2026-10-21. Soru: araç ölçümde tuttu, ama kazandırdığı durumda biz ne kadar bulunuyoruz?

## graphify

Kazandırdığı durum iki koşul ister (bkz. `graphify.md`, "Hangi Durumda Gerçekten Kazandırır"):

1. Proje 400-500'den fazla üretim dosyası.
2. İstem çok adımlı yapı sorusu: katmanlar arası zincir, "kim çağırıyor", etki analizi.

### Koşul 1: Proje Boyutu

`git ls-files`, kod uzantıları, test ve derleme klasörleri hariç.

| Proje | Üretim dosyası | Son 3 ay commit |
|---|---:|---:|
| VidShrink | 673 | 3.677 |
| Teknesyum-UI | 254 | 101 |
| DustyBytes | 247 | 114 |
| Quizloop | 198 | 185 |
| MurphyEngine | 161 | 9.683 |
| Runly | 126 | 80 |
| CodeXray | 118 | 302 |
| Diğer 9 proje | 2-93 | — |

Eşiği yalnız VidShrink geçiyor.

### Koşul 2: İstem Türü (VidShrink, 6 oturum, 379 istem)

Sınıflayan: sonnet ajanı, istemler 400 karakterde kesik; yaklaşık 20 sınır vaka.

| Sınıf | Sayı | Pay |
|---|---:|---:|
| A çok adımlı yapı sorusu | 3 | %0,8 |
| B yeri belli kod işi | 67 | %17,7 |
| C kod dışı (sürüm, git, ölçüm, "devam") | 287 | %75,7 |
| D büyük özellik, önce yapıyı anlamak gerekir | 22 | %5,8 |

A: 12 (boyut ayarı akışı), 144 (kısayol güncelleme zinciri), 170 (Avalonia 12 etkisi).

### Sonuç

graphify'ın ölçülen kazancı yapı sorularında %22 token (`olcum-b.md`). En iyimser hesapla A'nın tamamı ve D'nin keşif kısmı kazanır: istemlerin %7'sinde, o istemin keşif payında %22. Toplama etkisi %1'in altında. Kalıcı bağlantı (CLAUDE.md satırı) her turda yük getirir. Karar: alınmaz, silinir.

## headroom

Ücret yok (Apache-2.0). Bedeli 2,1 GB disk ve MCP kipinde her tur ~1 KB.

Kazandırdığı durum: büyük JSON (-%56) ve tekrarlı log (-%10) araç çıktısı.

Tarama: `~/.claude/projects` altında son 3 ayın 256 oturumu, 91.030 araç sonucu, 101,5 MB.

| Tür (10 KB üstü sonuç) | Adet | MB |
|---|---:|---:|
| Bash, düz metin | 505 | 7,25 |
| Read, düz metin | 273 | 5,34 |
| PowerShell, düz metin | 60 | 0,90 |
| Bash, tekrarlı satır | 40 | 0,62 |
| JSON (Bash, MCP, Agent toplamı) | ~43 | ~0,75 |
| Log | 0 | 0 |

Büyük JSON tüm araç çıktısının %0,7'si. Yarıya indirmek toplamda ~%0,4 eder. Ücretsiz eşdeğer (`belge.js` gibi bir JSON sıkıştırma kancası) yazılabilir ama bu pay için yazılmaz. Karar: alınmaz, silinir.
