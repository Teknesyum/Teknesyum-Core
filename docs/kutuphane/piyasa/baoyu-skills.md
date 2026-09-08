# JimLiu/baoyu-skills

- MIT · plugin (marketplace) + `npx skills add` + ClawHub · ★25752
- mekanizma: 0 kanca · 0 komut · 0 ajan · 21 skill · 0 MCP
- sıradan turda bağlama: 21 skill açıklamasının toplamı 7893 B (~2 KB'lık ortalama değil: skill başına ~376 B), ~2k token; deponun CLAUDE.md'si 7294 B geliştiriciye ait, kurulan pakete girmiyor
- premium: yok; bazı skill'ler WeChat/X API anahtarı istiyor (`~/.baoyu-skills/.env`)

## Ne yapar
Bir yazarın günlük iş akışını skill'e çevirmiş paket: makale kapak görseli, infografik, markdown→WeChat HTML, X/Weibo/WeChat'e gönderme, YouTube transkripti, çeviri. Alan Core'la ilgisiz (içerik üretimi), ama paketleme disiplini ilgili.

## Core'a alınacak
- **fikir** — README'nin kendi uyarısı: "20+ skill var, yalnız gerçekten gerekeni kur; hepsini kurmak her turda gereksiz bağlam yükü." Satıcının kendi ağzından Core'un sıfır-bağlam ilkesinin doğrulaması; kütüphane README'sine alıntılanabilir.
- **fikir** — `baoyu-danger-*` ad öneki: yan etkisi/riski olan skill'i adında işaretleme. Core'un özel raf ve kanca adlandırmasında ucuz bir uyarı deseni.
- **fikir** — kimlik bilgisi kapsamı: kullanıcı düzeyi `~/.baoyu-skills/.env` ile proje düzeyi `<proje>/.baoyu-skills/.env` ayrımı.

## Karar
fikir notu — alan dışı, ama "tehlikeli" ad öneki ve seçmeli kurulum uyarısı iki satırlık kazanç.
