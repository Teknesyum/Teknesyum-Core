# breaking-brake/cc-wf-studio

- lisans OTHER · VS Code eklentisi + CLI + MCP (`@cc-wf-studio/cli`, `@cc-wf-studio/mcp`) · ★5374
- mekanizma: 0 kanca · 0 Claude Code komutu/skill'i/ajanı · 1 MCP sunucusu · asıl arayüz VS Code/OpenVSX eklentisi
- sıradan turda bağlama: 0 token — üretilen şey diskteki Markdown iş akışı dosyası; MCP takılmazsa konuşmaya hiçbir şey girmez.
- premium: yok.

## Ne yapar
İş akışlarını görsel bir tuval üzerinde tasarlatır ve ajanın anladığı Markdown olarak dışa aktarır. Sloganı "sen görsel düşünürsün, AI `.md` düşünür".

## Core'a alınacak
- fikir: iş akışının kaynağı tuval değil dışa aktarılan Markdown olması — Core'un `docs/plan.md`'si zaten bu; tuval yalnız yazma kolaylığı, çalıştıran şey dosya.
- hiç (kurulacak kanca/betik yok, Core'un çalıştığı yer terminal).

## Karar
hayır — VS Code eklentisi; Core'un terminal ve dosya temelli yapısına takılacak bir mekanizması yok.
