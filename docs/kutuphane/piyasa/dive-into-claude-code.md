# VILA-Lab/Dive-into-Claude-Code

- CC-BY-NC-SA-4.0 · metin paketi (kurulmaz, sadece okunur) · ★2101
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP — depoda yalnız `README.md`, `docs/`, `paper/`
- sıradan turda bağlama: 0 KB — kurulacak hiçbir şey yok; okunursa README 150 KB (~37k token), `docs/architecture.md` 12,9 KB (~3,2k), `docs/build-your-own-agent.md` 19,4 KB (~4,8k), `docs/agent-design-space-source-notes.md` 105 KB (~26k). Ölçüm: `wc -c` / 4.
- premium: yok

## Ne yapar

Claude Code v2.1.88 kaynağının (~1900 TS dosyası, ~512k satır) mimari çözümlemesi ve buna
dayanan bir ajan tasarım-uzayı kılavuzu. Ana tez: kodun yalnız %1,6'sı model kararı, %98,4'ü
deterministik altyapı — izin kapıları, bağlam yönetimi, araç yönlendirme, kurtarma.

## Core'a alınacak

- kitap: `docs/build-your-own-agent.md` (19,4 KB) rafa uygun tek parça — kanca/izin/bağlam
  kararlarını karşılaştırmalı tabloyla veriyor, Core'un "kanca eşikte konuşur" tercihini
  tartacak dış ölçüt sağlıyor.
- fikir: "%1,6 model / %98,4 deterministik" ayrımı Core'un kendi kuralına (angaryada önce
  deterministik araç) dışarıdan gelen kanıt; RULES'a değil, raf notuna yazılır.
- fikir: `docs/architecture.md` bağlam/compact bölümü, Core'un compact talimatını
  karşılaştırmak için 12,9 KB'lik ucuz referans.

## Karar

Al — kitap; ama lisans NonCommercial-ShareAlike, rafa alıntı+kaynak olarak girer, kopyalanmaz.
