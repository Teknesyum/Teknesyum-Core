# EricAndrechek/Pacer

- MIT · masaüstü uygulama (Swift, yalnız macOS 15+) · ★8
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP — Claude Code'a hiçbir şey kurmaz, `~/.claude` günlüklerini yerelde okur.
- sıradan turda bağlama: 0 B — menü çubuğu uygulaması, bağlama yazmıyor.
- premium: yok, tümü ücretsiz ve yerel.

## Ne yapar
Menü çubuğundan Claude Code kullanımını gösterir: harcanan token, maliyet, 5 saatlik ve haftalık kota doluluğu, proje/model/gün kırılımı, anlık yakma hızı ve gün sonu projeksiyonu. Veri makineden çıkmıyor.

## Core'a alınacak
- fikir: statusline'a **kota temposu** — yalnız harcanan değil, 5 saatlik ve haftalık pencerede ne kadar kaldığı ve mevcut hızla ne zaman biteceği. Core'un statusline'ı zaten durumu gösteriyor, model görmüyor; kota satırı aynı yere sıfır token maliyetle sığar.
- hiç (kod tarafı — Swift, macOS'a bağlı).

## Karar
fikir notu — kod taşınmaz (Swift/macOS), ama kota temposu satırı Core statusline'ına ucuz bir ek.
