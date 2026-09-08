# BayramAnnakov/claude-reflect

- MIT · plugin (marketplace) · ★1429
- mekanizma: 4 kanca (UserPromptSubmit, SessionStart, PreCompact, PostToolUse:Bash), 4 komut, 1 skill (265 B frontmatter), 9 Python betiği ~900 satır
- sıradan turda bağlama: skill açıklaması 265 B (~65 token); UserPromptSubmit kancası yalnız
  düzeltme kalıbı eşleşirse tek satır basıyor (`📝 Learning captured: ...`), aksi halde sıfır.
  SessionStart'ta kuyruk boşsa sıfır, doluysa en çok 5 satır. Ölçüm: `hooks.json` + betiklerdeki
  `print` çağrıları sayıldı.
- premium: yok

## Ne yapar
Kullanıcının düzeltmelerini ("hayır, şunu kullan") UserPromptSubmit kancasında regex ile
yakalayıp kuyruğa yazıyor; `/reflect` komutu kuyruğu gözden geçirip CLAUDE.md'ye kalıcı kural
olarak ekliyor. Ayrıca oturum geçmişinden tekrar eden işleri bulup skill önerisi çıkarıyor.

## Core'a alınacak
- pasif betik: `scripts/lib/reflect_utils.py` içindeki `detect_patterns` — EXPLICIT /
  GUARDRAIL / POSITIVE kalıpları, FALSE_POSITIVE ve NON_CORRECTION listeleri, güven skoru ve
  `decay_days`. Model çağırmadan düzeltme yakalıyor; Türkçe kalıp listesi eklenerek `log.js`
  yanına kural yakalayıcı olarak konabilir (CJK var, Türkçe yok).
- kanca: SessionStart'ta "N bekleyen öğrenme" tek satırı — Core'un eşikte bir kez konuşma
  ilkesiyle birebir aynı desen.
- fikir: `decay_days` — eskiyen kuralın kendiliğinden düşmesi; RULES.md'nin 30 satır tavanına
  hangi satırın silineceğini olguya bağlar.

## Karar
Al — sıfır-token sıradan tur, tek dosyalık deterministik kalıp motoru; Core'un RULES.md
tavanı sorununa doğrudan çözüm.
