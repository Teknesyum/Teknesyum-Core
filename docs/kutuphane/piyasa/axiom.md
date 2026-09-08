# CharlesWiltgen/Axiom

- MIT · plugin (`/plugin marketplace add`, ayrica Cursor/Codex surumleri) · ★1151
- mekanizma: 27 "router" skill (331 md dosyasi, 7,6 MB kutuphaneye yonlendirir), 42 ajan, 18 komut, 5 kanca olayi (PreToolUse/Read, PostToolUse/Bash, PostToolUse/Write|Edit, SessionStart, UserPromptSubmit, SubagentStart), 4 gomulu ikili (xclog, xcsym, xcui, xcprof)
- sıradan turda bağlama: Apple projesi disinda ~6,4 KB (~1,6k token) — yalniz 27 router'in name+description satirlari; SessionStart ve UserPromptSubmit kancalari `project_detect.py` kapisiyla susturuluyor. Apple projesinde SessionStart `axiom-tools` SKILL.md'yi (9,0 KB) + arac tanitimlarini `additionalContext` olarak enjekte ediyor, ~4-5k token. Sayim: `wc -c` router frontmatter'lari ve axiom-tools/SKILL.md, hooks.json olay dokumu.
- premium: yok

## Ne yapar
Apple platformu gelistirmesi icin skill/ajan/arac paketi. 274 skill dogrudan yuklenmiyor; 27 router skill kataloglama yapiyor ve gerekli alt dosyayi cagiriyor. Kancalar Swift dosyalarinda guardrail calistiriyor, kirilma dosyasi okundugunda semboliklestirmeye yonlendiriyor, Bash ciktisina ipucu ekliyor.

## Core'a alınacak
- betik/kanca: `project_detect.py` proje tipi kapisi — kancalar yalniz ilgili projede konusur, disarida sifir. Yukari 6 seviye + asagi 4 derinlik tarama, `PRUNE_DIRS` ile node_modules/Unity/Unreal budama, 10.000 girdi tavani, supheye dusunce "fail-open". Core'un kancalarina dogrudan uyarlanabilir; sifir-token ilkesinin makine karsiligi.
- kitap: router deseni — 274 skill yerine 27 katalog dosyasi; bagalama giren yalniz 6,4 KB tanim. Core'un raf/kutuphane modelinin buyuk olcekte kanitlanmis hali.
- kitap: kanca dayanikliligi — stdin'i kapidan ONCE bosaltmak (buyuk yapistirma icin EPIPE / boru tikanmasi), hicbir kosulda sifir disi cikis, gomulu ikilide boyut tabani ile bozuk kurulum tespiti. Her biri gercek bir hata numarasina (GH #24/#45/#48/#52) bagli.

## Karar
Al — kitap; alan (Apple) Core icin ilgisiz ama proje kapisi ve router deseni olculmus (Apple disi projede 6,4 KB, kanca ciktisi 0) ve Core'un ilkesine birebir uyuyor.
