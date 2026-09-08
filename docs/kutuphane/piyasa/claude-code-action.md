# anthropics/claude-code-action

- MIT · GitHub Action (CI) · ★8818
- mekanizma: 0 kanca, 0 komut, 0 skill, 0 ajan kurar; 2 mod (`tag`, `agent`) + `detector.ts`, 5 dahili MCP sunucusu (github-comment, github-file-ops, github-inline-comment, github-actions, install-mcp-server), 11 ornek workflow
- siradan turda baglama: 0 — kullanici oturumuna hicbir sey kurulmuyor, tamamen CI kosucusunda calisiyor. Depodaki CLAUDE.md 3.5 KB yalnizca katkici icin
- premium: yok; maliyet kullanicinin kendi API/Bedrock/Vertex/Foundry anahtarinda

## Ne yapar
PR ve issue'larda Claude Code'u calistiran resmi action. Baglama gore modu kendi seciyor: `@claude` anmasi ya da atama gelirse etkilesimli `tag` modu, workflow'da acik `prompt` varsa otomasyon icin `agent` modu. Yorum, dosya yazma ve inline review islerini kendi MCP sunuculariyla yapiyor.

## Core'a alinacak
- kitap: mod tespiti (`src/modes/detector.ts`) — tek giris noktasi, davranisi kullanicinin konfigurasyonundan degil olayin seklinden cikariyor. Core'un "kanca yalnizca esikte konusur" ilkesinin CI'daki karsiligi.
- fikir: `plugin_marketplaces` + `plugins` girdileri — Core eklentisi CI'da da kurulabilir; ileride Core icin hazir workflow ornegi yazmanin yolu bu.
- fikir: yapilandirilmis cikti (structured outputs) ile action ciktisina donen dogrulanmis JSON; Core'un `log.js`/rapor tarafinda ayni kalip kullanilabilir.

## Karar
fikir notu — Core'a kod girmez, ama mod tespiti ve CI'da eklenti kurulumu iki somut not.
