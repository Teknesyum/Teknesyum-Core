# softaworks/agent-toolkit

- MIT · plugin pazaryeri (marketplace.json, her beceri ayrı eklenti) · ★2446
- mekanizma: 0 kanca, 7 komut, 6 ajan, 47 skill; `dist/plugins/<ad>` altında her biri tek tek kurulabilir
- sıradan turda bağlama: CLAUDE.md tek satır `@AGENTS.md` (9 B) → AGENTS.md 3391 B (~850 token). Hepsi kurulursa 47 skill açıklaması 11.9 KB (~3000 token) daha. Tek beceri kurmak ~250 B (~60 token).
- premium: yok

## Ne yapar
Günlük Claude Code işini hızlandıran becerileri (codex, gemini, humanizer, kod tarama ajanları) tek depoda toplar. Ayırt edici yanı dağıtım: 47 becerinin her biri marketplace.json'da ayrı eklenti olarak listelenir, kullanıcı yalnız istediğini kurar.

## Core'a alınacak
- **fikir**: tek tek seçilebilir dağıtım — 47 kalemin toplam 3000 tokenlik açıklama yükü, kullanıcı beşini seçtiğinde ~320 tokene iner. Core'un kütüphane raflarının ayrı ayrı açılabilir olması aynı hesabın karşılığı.
- **fikir**: `CLAUDE.md` yalnız `@AGENTS.md` içerir — bizim kuralımızın vahşi doğada karşılığı, host bağımsızlığı bedava geliyor.
- **hiç**: kanca yok, makine yok.

## Karar
Fikir notu — mekanizma yok, yalnız katalog; ama seçilebilir dağıtımın token aritmetiği ölçülü bir kanıt.
