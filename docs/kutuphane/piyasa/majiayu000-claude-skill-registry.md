# majiayu000/claude-skill-registry

- MIT · dizin/kayıt defteri (web + `sk` CLI + JSON API) · ★598
- mekanizma: kurulacak kanca/komut/ajan/skill yok; üç depoya bölünmüş üretim hattı (core = iş akışı, data = `skills/**` arşivi, main = birleştirilmiş ayna), günlük otomatik güncelleme
- sıradan turda bağlama: 0 — Claude Code'a hiçbir şey kurulmuyor, tarayıcıdan ya da CLI'dan sorgulanıyor
- premium: yok

## Ne yapar
GitHub ve topluluk kaynaklarından toplanan Claude Code becerilerinin en geniş aranabilir dizini. Üç kullanım yolu: web araması, `sk` terminal paket yöneticisi, doğrudan JSON API. `registry_summary.json` ve `provenance/merge-source.json` ile üretim kaynağı izlenebilir.

## Core'a alınacak
- **fikir**: kütüphane/veri/ayna ayrımı. Core'un kütüphanesi de büyüdükçe "mantık + indeks" ile "içerik arşivi"nin ayrılması gerekebilir; bu depo o bölünmenin gerekçesini (`SCHEME2_SPLIT.md`) yazılı tutmuş.
- **fikir**: `stats.json` üzerinden badge — raf sayısı ve son güncelleme tarihini üretilmiş JSON'dan okuma; Core'un README'sindeki elle yazılan raf sayısı yerine.
- **fikir**: piyasa taramasının kendisi için kaynak listesi (günlük güncellenen dizin), gelecekteki dilimlerde aday havuzu olarak.

## Karar
Fikir notu — mekanizma sunmuyor ama Core'un kütüphanesi büyürse ayrım ve badge fikirleri işe yarar.
