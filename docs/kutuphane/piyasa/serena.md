# oraios/serena

- MIT · MCP sunucusu (+ ajan çatısı) · ★29033
- mekanizma: 0 Claude Code kancası · 0 komut · 0 skill · 1 MCP sunucusu (LSP tabanlı ~25 sembol aracı) · `contexts` + `modes` YAML'leriyle araç kümesi daraltma
- sıradan turda bağlama: kendi deposundaki CLAUDE.md yalnız 12 B, AGENTS.md 443 B; asıl maliyet MCP araç şemaları — Core'a kurulursa her turda araç tanımları bağlamda durur
- premium: yok

## Ne yapar
Dil sunucusu (LSP) üstünden semantik kod arama/düzenleme veren MCP takımı: dosyayı baştan okumak yerine sembol düzeyinde bulur ve düzenler. `contexts/` ve `modes/` YAML'leri hangi araçların açık olduğunu duruma göre değiştirir.

## Core'a alınacak
- **fikir** — `.serena/memories/`: proje belleği 6 ayrı markdown (project_structure, task_completion, critical_info, memory_maintenance...), hiçbiri kendiliğinden yüklenmez, ajan adıyla ister. Core'un `handoff.md` tekliğine karşı konu başına dosya fikri.
- **fikir** — `memory_maintenance.md`: belleğin kendi bakım kuralını bellekte tutmak. Core'un `MEMORY.md` tavanı için aynı desen.
- **fikir** — mod/bağlam ile araç kümesini daraltma; Core'da karşılığı yok ama kanca eşiğini duruma bağlama fikrine yakın.

## Karar
fikir notu — MCP kurmak Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesine aykırı; alınacak olan konu başına bellek dosyası deseni.
