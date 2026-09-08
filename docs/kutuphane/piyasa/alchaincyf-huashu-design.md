# alchaincyf/huashu-design

- MIT · metin paketi (skill, `npx skills add`, ajandan bağımsız) · ★23978
- mekanizma: tek skill · kanca yok · komut yok · MCP yok · ajan yok; 60 HTML yerel stil kütüphanesi ve üç "mantık danışmanı" skill gövdesinin içinde.
- sıradan turda bağlama: tek SKILL.md frontmatter'ı kadar (yüzlerce bayt, ~150-250 token); gövde ve stil kütüphanesi talep üzerine okunuyor. Ölçüm README ve kurulum biçiminden; depo klonlanmadı (1. adımda elendi, tasarım ürünü).
- premium: yok; 2026-05-14'ten beri MIT, ticari kullanım serbest.

## Ne yapar
Tek cümlelik istemi teslim edilebilir tasarıma çeviriyor: ürün tanıtım animasyonu, tıklanabilir uygulama prototipi, düzenlenebilir sunum, baskı kalitesinde infografik — hepsi HTML yerel. Marka varlığı verilirse onu okuyor, verilmezse stil kütüphanesine düşüyor.

## Core'a alınacak
- fikir: marka varlığı verilmediğinde "AI slop"a düşmemek için adlandırılmış stil kütüphanesine geri çekilme kuralı; Core'da arayüz standardı (teknesyum-ui) kurulu olmadığı için bugün kullanıcıya soruluyor — bu, sorulacak şeyin listesini netleştirir.
- hayır: skill'in kendisi; tasarım üretimi Core'un alanı değil ve teknesyum-ui ile çakışır.

## Karar
hayır — alan dışı; yalnız "marka verisi yoksa uydurma, adlandırılmış kütüphaneye düş" kuralı Core'un renk/ölçü uydurmama kuralını destekliyor.
