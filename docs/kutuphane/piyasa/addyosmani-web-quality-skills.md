# addyosmani/web-quality-skills

- MIT · plugin (marketplace.json + plugin.json), ayrıca Gemini/Codex kopyaları · ★2766
- mekanizma: 0 kanca, 0 komut, 0 ajan, 6 skill (10-14.8 KB gövde, toplam 77 KB) + her birinin `references/` klasörü
- sıradan turda bağlama: CLAUDE.md 3382 B (~850 token) + 6 skill açıklaması ~1.5 KB (~375 token) = **~4.9 KB, ~1225 token**, her turda. Gövdeler çağrılınca yüklenir.
- premium: yok

## Ne yapar
Lighthouse, Chrome DevTools MCP ve CrUX üzerinden ölçüme dayalı web kalitesi becerileri: performans, Core Web Vitals, erişilebilirlik, SEO, en iyi uygulamalar. Çatı bağımsız; her beceri önce ölçer, sonra düzeltir.

## Core'a alınacak
- **kitap**: "ölçmeden iddia etme" disiplini — beceri metni, önce/sonra sayısı olmadan iyileşme raporlamayı yasaklar. Core'un bench ve rapor kurallarıyla aynı damar.
- **fikir**: tek depoda üç host kopyası (`.claude-plugin/`, `.gemini/`, `.agents/`, `codex/`) — Core'un raflarını AGENTS.md üzerinden host-bağımsız tutma savını destekleyen çalışan örnek.
- **hiç**: kanca yok, alınacak makine yok.

## Karar
Fikir notu — alan (web performansı) Core'un işi değil; 3.4 KB'lik daimi CLAUDE.md ise tam kaçındığımız maliyet.
