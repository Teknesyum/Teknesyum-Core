# iurykrieger/claude-bedrock

- MIT · plugin (marketplace) · ★97
- mekanizma: 1 kanca (Stop → error_reporter.py, hatayı GitHub issue'suna çeviriyor), 0 komut, 0 ajan, 10 skill, 0 MCP sunucusu (Atlassian/Chrome MCP'lerini tüketiyor)
- sıradan turda bağlama: ~3,4 KB / ~850 token — 10 skill'in çok satırlı `description` blokları toplamı; iki skill `user_invocable: false`, yine de açıklamaları yükleniyor. Skill gövdeleri 5-56 KB (preserve 56 KB, sync 46 KB), talep üzerine.
- premium: yok

## Ne yapar
Obsidian kasasını 7 varlık türüyle yapılandırılmış bir "ikinci beyin"e çevirir: varlık tespiti, çift yönlü wikilink, Confluence/Google Docs/GitHub'dan içe aktarma, tekilleştirme ve senkronizasyon. Çalışma zamanı yok; her şey markdown ve skill.

## Core'a alınacak
- fikir: `ask` skill'inin "önce graph.json indeksini oku, yetmezse canlı /graphify çağır" kademesi — Core'un graphify yönlendirmesine hazır bir kademe kuralı, dosya okumadan önce grafik.
- fikir: tek yazma noktası (`preserve`) — bütün yazmalar tek skill'e delege ediliyor; Core'un özel raf/kütüphane yazımı için aynı teklik uygulanabilir.
- hiç: Stop kancasının hatayı otomatik GitHub issue'suna çevirmesi — Core'un `log.js write` yerel günlüğü zaten var ve dışarı bir şey göndermiyor.

## Karar
Fikir notu — 850 tokenlık sabit yük Core ilkesine aykırı; alınacak olan iki desen (grafik-önce kademesi, tek yazma noktası).
