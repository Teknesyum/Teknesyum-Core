# dongshuyan/compass-skills

- MIT · skill paketi (`npx skills add`) · ★724
- mekanizma: 9 SKILL.md; kanca 0, komut 0, ajan 0, MCP 0
- sıradan turda bağlama: 9 frontmatter toplamı 4.676 B (~1,2K token) her turda yüklü; gövdeler 86.748 B yalnız tetiklenince
- premium: yok

## Ne yapar
Ajanla çalışmanın çevresine dokuz beceri koyuyor: `task-clarifier` (iş başlamadan hedef/kapsam/kabul ölçütü hizalama), `task-forest` (repo-yerel görev DAG'ı), `pause-and-resume`, `session-handoff-prompt` (konuşmayı yeni oturuma yapıştırılabilir isteme sıkıştırma), `user-profile-keeper`, iki tane çalışma geçmişinden skill üreten/yükselten beceri, artı iki alan becerisi.

## Core'a alınacak
- **kitap**: `task-clarifier`'ın netleştirme protokolü. Core'da "netleştirme" sözcüğü zaten var (`advice.js ask`); bu dosya hangi soruların sorulacağını ve kabul ölçütünün nasıl yazılacağını maddeler — rafta pasif dursun.
- **kitap**: `session-handoff-prompt` + `pause-and-resume`. Core'un `handoff.md`/`devir.md`'si aynı problemi çözüyor; bu iki metin "devir notunda ne bulunmalı" için hazır kontrol listesi.
- **fikir**: 4.676 B'lik daimi frontmatter yükü — Core'un neden skill kurmadığının somut fiyatı; ölçüm olarak kaydedilsin.

## Karar
Al — iki metin rafa; skill olarak kurulmaz, ilke bozulmaz.
