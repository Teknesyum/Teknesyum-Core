# BetaBots-LLC/callimachus

- AGPL-3.0 (ticari ikinci lisans) · masaüstü uygulama + CLI + MCP sunucusu + VS Code eklentisi · ★38
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill; 1 MCP sunucusu, 11 ajan kaynağı için
  indeksleyici, Tauri 2 + Rust + React 19 tek depo
- sıradan turda bağlama: 0 KB / ~0 token kurulmadıkça — Claude Code tarafında yalnız
  isteğe bağlı MCP sunucusu var; kurulursa araç tanımları her tura girer. Ölçüm: kök
  listede `CLAUDE.md` ve `.claude-plugin/` yok
- premium: var — `COMMERCIAL.md`, AGPL'in yanında ücretli ticari lisans

## Ne yapar
11 kodlama ajanının (Claude Code, Codex, Cursor, Gemini CLI, Goose, Cline...) tüm
konuşmalarını tek yerel SQLite deposuna indeksler. Arama melez: FTS5/BM25 ile cihaz
üstü anlamsal benzerlik (sqlite-vec KNN) Reciprocal Rank Fusion ile birleşiyor.
`file:yol/dosya.rs` sorgusuyla bir dosyaya dokunan tüm oturumlar bulunuyor; karar ve
tuzakları isteğe bağlı LLM ile damıtıyor. Her şey yerelde.

## Core'a alınacak
- fikir — dosya-anması indeksi: indeksleme anında her turdan geçen dosya yolları
  ayrı tabloya yazılıyor, sonra "bu dosyaya kim dokundu" tek sorgu. Core'un
  `log.js` hata günlüğü ve devir notu için aynı indeks ucuz ve pasif.
- fikir — melez sıralama (anahtar kelime + gömme, RRF ile birleştirme) kütüphane
  raflarında arama gerekirse hazır tarif.
- hiç — uygulamanın kendisi (Tauri/Rust/React) Core'un pasif ilkesine tümüyle aykırı.

## Karar
fikir notu — MCP sunucusu kurulursa her tura araç tanımı yazar, AGPL + ticari lisans
Core'a uymaz; yalnız dosya-anması indeksi fikri kalır.
