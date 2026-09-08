# hluaguo/learn-faster-kit

- MIT · CLI başlatıcı (uv tool) · ★371
- mekanizma: 0 kanca, 5 kip × (1 sistem istemi + 3-4 komut + 0-1 ajan), 0 MCP; 6 pasif Python
  betiği (`review_scheduler.py`, `generate_syllabus.py`, `log_progress.py`, `concept_quiz.py`,
  `init_learning.py`, `generate_exam_pdf.py`)
- sıradan turda bağlama: seçilen kipin sistem istemi 5.946 B (~1.500 token) — ama
  `claude --system-prompt <metin>` ile **yerine geçiyor**, eklenmiyor (`cli/launcher.py:86`);
  Codex tarafında aynı metin `AGENTS.md` (3.284 B) olarak ekleniyor
- premium: yok

## Ne yapar
Aralıklı tekrar ilkesiyle çalışan bir öğrenme koçu. `learn-faster` komutu kipi (Balanced,
Exam, Theory, Practical, Programming) sorup Claude Code'u o kipin sistem istemiyle başlatıyor;
müfredat, tekrar takvimi ve ilerleme kaydı Python betiklerinde tutuluyor.

## Core'a alınacak
- **fikir — kip başına sistem istemi değiştirme**: tek büyük CLAUDE.md yerine, başlatıcı yalnız
  o işe ait metni `--system-prompt` ile koyuyor. Core'un "premium mod" ve raf yükleme
  tartışmasında ölçülebilir bir alternatif: ekleme değil, ikame.
- **pasif betik — `review_scheduler.py`**: aralıklı tekrar takvimi modelsiz hesaplanıyor.
  Core'un okunmuş kitapların "tekrar bakılacak" listesi için birebir uyarlanabilir.
- **fikir — aynı içeriğin iki hedefe (Claude Code / Codex) tek kaynaktan üretilmesi**;
  Core'un `AGENTS.md` + tek satırlık `CLAUDE.md` kuralıyla aynı derdi çözüyor.

## Karar
Fikir notu — ürün öğrenme koçu, alınmaz; sistem istemi ikamesi ve tekrar takvimi betiği not edilir.
