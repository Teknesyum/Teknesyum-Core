# Gentleman-Programming/gentle-ai

- MIT · CLI (Go, yapılandırıcı) · ★6440
- mekanizma: 37 SKILL.md (`skills/` + `internal/assets/skills/`) · kanca dosyası yok · komut yok · MCP yok; kurulum, kullandığın ajanın (Claude Code, Cursor, OpenCode, Codex, Pi) yapılandırma dosyalarını yazan bir Go ikilisi.
- sıradan turda bağlama: depo kökündeki `AGENTS.md` 2.678 B ≈ 670 token ve bu bir *dizin tablosu* — her satır: skill adı · tetikleyici cümle · dosya yolu. Skill gövdeleri yüklenmiyor, ajan tetikleyiciye bakıp yolu okuyor. Ölçülen sabit maliyet 670 token, gövdeler 0.
- premium: yok; marka/ticari isim koruması var (TRADEMARKS.md).

## Ne yapar
Zaten kullandığın kodlama ajanını yapılandırılmış bir mühendislik ortamına çeviriyor: tek Go ikilisiyle skill, kural ve ajan dosyalarını hedef araca yazıyor. Kendi deposundaki çalışma yöntemlerini (PR zincirleme, iş birimi commit'leri, sistemik triyaj) skill olarak taşıyor.

## Core'a alınacak
- kitap: `AGENTS.md` dizin tablosu biçimi — "Skill | Tetikleyici | Yol" üç sütunu; Core'un raf indeksini bugünkü düz listeden bu biçime çevirmek, hangi rafın ne zaman açılacağını modele 670 token'dan ucuza anlatır.
- fikir: kurulumun deterministik ikiliye verilmesi — Core'un `setup.js`/`scaffold.js` çizgisiyle aynı; model yazmıyor, betik yazıyor.
- hayır: 37 skill'in kendisi; depoya özgü (RDD, bench eksenleri) ve Core'a taşınmaz.

## Karar
fikir notu — tetikleyici sütunlu indeks tablosu Core'un raf indeksine uygulanabilir tek somut kazanç.
