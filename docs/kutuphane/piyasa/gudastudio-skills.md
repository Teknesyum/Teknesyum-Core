# GuDaStudio/skills

- MIT · skill koleksiyonu (alt depolar) · ★2027
- mekanizma: 2 skill (`collaborating-with-codex`, `collaborating-with-gemini`), her biri ayri depoda; 0 kanca, 0 komut, 0 MCP; Python 3.8+ betikleri araciligiyla Codex/Gemini CLI'ye is devrediyor
- sıradan turda bağlama: 2 skill kurulursa yalniz iki description satiri (~1 KB'nin altinda); asil maliyet devredilen CLI'nin kendi turunda
- premium: yok

## Ne yapar
Claude Code'dan Codex CLI ve Gemini CLI'ye kodlama isi devretmek icin iki skill: prototip, hata ayiklama, kod inceleme. Skill yalnizca devir protokolunu tarif ediyor, isi baska model yapiyor.

## Core'a alınacak
- fikir: "ikinci modele devret" protokolunu skill degil pasif betik olarak tutmak — Core'un `agency.js`/danisma akisinin ayni sorunu cozdugu yer; buradaki fark, Core'un ajan/skill kurmadan yapmasi.
- hiç: kod Python ve alt depolarda, alinacak metin yok.

## Karar
hayir — Core'daki danisma akisi ayni isi ajan/skill kurmadan yapiyor, eklenecek bir sey yok.
