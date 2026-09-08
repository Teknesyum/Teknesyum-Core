# mishanefedov/agentwatch

- MIT · CLI + MCP (npm `@misha_misha/agentwatch`, TUI + web arayüz tek süreçte) · ★14
- mekanizma: 0 kanca · 0 komut · 0 skill · 0 ajan; MCP sunucu kipi ve OpenTelemetry dışa aktarıcı var. Claude Code, Codex, Gemini CLI, Cursor, Hermes, OpenClaw günlüklerini okuyor.
- sıradan turda bağlama: 0 — eklenti değil, ajanın günlük dosyalarını dışarıdan okuyor; MCP kipi açılmadıkça modele hiçbir şey girmiyor.
- premium: yok, bulut/telemetri yok

## Ne yapar
Aynı makinede koşan bütün kodlama ajanları için tek yerel zaman çizgisi: ne çalıştırıldı, ne kadara mal oldu, nerede raydan çıktı. TUI canlı akış, web arayüzü ise proje/oturum kırılımı, token grafiği, sıkıştırma kıvılcım çizgileri, çağrı grafiği, diff atfı ve anomali ayıklaması veriyor. Ajanlara `AGENTS.md` ile kendi kendini tanıtıyor.

## Core'a alınacak
- fikir: sıkıştırma (compaction) kıvılcım çizgisi ve token grafiği — Core'un statusline'ında gösterilebilecek ölçüm; model görmediği için maliyeti sıfır.
- fikir: `AGENTS.md` içinde üç adımlık ajan öz-kurulumu (kur → doğrula → çalıştır); Core'un ≤20 satırlık yönlendirici AGENTS.md kuralıyla uyumlu bir biçim.
- fikir: diff atfı — hangi değişikliği hangi ajan yaptı; Core'un hata günlüğüne alan olarak eklenebilir.

## Karar
Fikir notu — ayrı bir gözlem ürünü, Core'a kurulacak parçası yok; statusline ölçümü ve AGENTS.md öz-tanıtım biçimi not değerinde.
