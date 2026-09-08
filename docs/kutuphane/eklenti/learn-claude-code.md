# shareAI-lab/learn-claude-code

- lisans: MIT
- kurulum biçimi: hiçbiri — eğitim deposu (Python), plugin/CLAUDE.md/MCP/CLI değil
- mekanizma: kanca yok, komut yok, MCP yok; 17 aşamalı ders (`s01_agent_loop`…`s17_goal_loop`) + `agents/` altında aynı aşamaların Python örnek kodu; `skills/` altında 4 örnek SKILL.md (agent-builder, code-review, mcp-builder, pdf) ders malzemesi olarak
- sıradan turda bağlama: 0 KB, 0 token — kurulan bir bileşen yok, klonlanan kodu okumadıkça hiçbir şey yüklenmez
- premium: yok

## Ne yapar
Claude Code benzeri bir ajan harness'ini sıfırdan Python ile inşa etmeyi öğreten kademeli ders serisi (agent loop, tool use, permission, hooks, todo, subagent, skill loading, context compact, memory, task system, background tasks, cron, agent teams, MCP/plugin, workflow runtime, goal loop). Anthropic'in "ajan = model + harness" tezini işler. `skills/` klasörü Claude Code'un SKILL.md formatına örnek olarak dört basit yetenek dosyası içerir.

## Kullanıcıya nasıl hissettirir
Kurulan bir araç değil, okunan bir kitap; banner, statusline, çıktı yok. README'yi ve `sNN_*` kodunu okuyup öğrenerek ilerlenir.

## Core'a alınacak
- hiç — kurulabilir bir mekanizma, kanca veya betik içermiyor; Core'un pasif kütüphanesine yalnızca "harness mimarisi nasıl anlatılır" referansı olarak, kavramsal düzeyde girebilir (madde değil, okuma notu)

## Ölçülecek
- yok — alınacak somut bir parça yok

## Karar
hayır — eğitim/kavram deposu, Core'a entegre edilecek mekanizma taşımıyor.
