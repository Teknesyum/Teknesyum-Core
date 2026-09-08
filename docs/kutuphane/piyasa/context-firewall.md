# Alepha188838884/context-firewall

- MIT · MCP (yerel proxy, npm `context-firewall`) · ★2
- mekanizma: 0 kanca · 0 komut · 0 ajan · 0 skill · aşağıdaki tüm MCP sunucularının önüne geçen 1 proxy, dışarıya 4 meta araç
- sıradan turda bağlama: kendisi CLAUDE.md/skill yüklemiyor, kazancı araç tanımlarında. README'nin ölçümü: 122 araç → 4 meta araç, 102.158 ham tanım karakteri → 2.146 karakter, ~28.600 token tasarruf (char÷3.5 tahmini). Çıktı sıkıştırma gerçek ölçümlerde %70-98 (Wikipedia sayfası 232.391 → 6.907 karakter).
- premium: yok

## Ne yapar
Ajan ile MCP sunucuları arasına giren yerel bir vekil. Aşağıdaki sunucuların araç tanımlarını 4 meta araca katlıyor (kademeli açığa çıkarma), büyük araç çıktılarını (ham HTML, dev JSON, base64) modele ulaşmadan sıkıştırıyor, bütçeyi aşanı kesip tamamını `read_more` ile erişilebilir bırakıyor. Oturum sonunda ölçülmüş bir tasarruf karnesi basıyor.

## Core'a alınacak
- fikir: oturum sonu "tasarruf karnesi" — kaç token kazanıldı, hangi aşamada; Core'un bench/statusline tarafında ölçülmüş sayı gösterme alışkanlığına uygun.
- fikir: kademeli açığa çıkarma (önce isim, isteyince şema) — Core'un pasif kütüphane rafı zaten bunun metin karşılığı; MCP tarafına gerek yok, notu değerli.
- kitap: kısaltma aşamaları listesi (jsonSummary, HTML damıtma, bütçe kesme) bir "çıktı küçültme" rafı olarak yazılabilir.

## Karar
Fikir notu — Core'da MCP katmanı yok, ürünün kendisi alınamaz; ölçülmüş sıkıştırma aşamaları ve tasarruf karnesi deseni not olarak değerli.
