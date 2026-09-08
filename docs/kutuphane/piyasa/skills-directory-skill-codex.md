# skills-directory/skill-codex

- MIT · plugin (marketplace) · ★1430
- mekanizma: 1 eklenti, 1 skill (SKILL.md 8 KB), kanca yok, komut yok, ajan yok, MCP yok
- sıradan turda bağlama: tek skill description ~180 bayt (~45 token); gövde yalnız Codex istenince okunur.
- premium: yok (Codex CLI aboneliği kullanıcının)

## Ne yapar
Claude Code'un `codex exec` / `codex resume` ile OpenAI Codex CLI'ye iş devretmesini anlatan tek dosyalık rehber: model ve akıl yürütme seviyesi seçimi, sandbox kipi, zaman aşımı tablosu, oturum devam ettirme.

## Core'a alınacak
- kitap: "dış CLI'ye iş devretme" rafı — `2>/dev/null` ile düşünme token'larını kesme, `</dev/null` ile stdin kapatma (aksi halde `codex exec` sonsuza dek bloklanır: sıfır bayt çıktı, sıfır CPU), akıl yürütme seviyesine göre zaman aşımı tablosu (low 150s … ultra 1800s). Somut, ezberlenmez, tam da rafa yazılacak bilgi.
- fikir: "Codex'i meslektaş say, otorite sayma" bölümü — dönen cevabı sorgulama yönergesi; Core'un danışma akışına (agency.js) uyarlanabilir tek paragraf.

## Karar
Al — tek raf dosyası; kurulum yok, kanca yok, sıradan turda 45 token bile değil (Core'a kitap olarak girerse 0).
