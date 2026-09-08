# tech-leads-club/agent-skills

- MIT · MCP + CLI + skill kataloğu (nx monorepo) · ★5149
- mekanizma: 88 skill, 0 Claude Code kancası (repodaki "hooks" React hook'ları), 0 komut, 1 MCP (`agent-skills-mcp`), 1 CLI kurucu
- sıradan turda bağlama: yalnız MCP araç tanımı (~birkaç yüz token); kök CLAUDE.md 9 B — tek satır `AGENTS.md`. Skill gövdeleri aramayla, referanslar ancak doğrulanmışsa yükleniyor
- premium: yok

## Ne yapar
Doğrulanmış skill kayıt defteri. MCP kademeli açığa çıkarma uyguluyor: Ara → kanonik SKILL.md yükle → yalnız doğrulanmış referansları getir. CLI ile seçip kuruyorsun; katalog CI'da şema doğrulamasından geçiyor.

## Core'a alınacak
- fikir: kademeli açığa çıkarma zinciri (ara → gövde → referans) Core'un pasif rafıyla aynı; fark, Core'un bunu MCP yerine önek kancasıyla yapması. Ölçüt olarak not değeri var, kod değeri yok.
- kitap: `AGENTS.md`'deki çalışma disiplini — plan modu varsayılan, alt ajanı bolca kullan, "bitti" demeden kanıtla, hacky çözümde dur ve zarif olanı iste. Kısa ve Core'un K0 kuralıyla çelişmiyor.
- fikir: `CLAUDE.md` = tek satır `AGENTS.md` — Core'un kendi kuralıyla birebir aynı; dışarıdan doğrulama.

## Karar
fikir notu — mekanizma MCP'ye bağlı, Core MCP kurmuyor; alınacak olan kademeli açığa çıkarma ölçütü ve kısa disiplin metni.
