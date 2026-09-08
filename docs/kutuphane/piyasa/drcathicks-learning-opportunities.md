# DrCatHicks/learning-opportunities

- CC-BY-4.0 · plugin marketplace (Claude Code + Codex) · ★2409
- mekanizma: 3 eklenti (learning-opportunities, -auto, orient), 2 skill (SKILL.md 12 KB ve 16 KB), 1 kanca (PostToolUse, matcher `Bash`, tek bash betiği), komut yok, MCP yok
- sıradan turda bağlama: 2 skill description ~600 bayt (~150 token). Kanca yalnız Bash çıktısında `git commit` görürse konuşur, oturum başına en fazla 2 kez (`$TMPDIR/lo_auto_<session>.state` sayacı), aksi halde exit 0 sıfır çıktı.
- premium: yok

## Ne yapar
Ajanla kod yazarken "üretkenlik tuzağı"na karşı öğrenme egzersizleri önerir: yeni dosya, şema değişikliği veya refactor sonrası 10-15 dakikalık, kanıta dayalı öğrenme bilimi alıştırması teklif eder. `orient` skill'i depoya özgü `orientation.md` üretir.

## Core'a alınacak
- kanca: PostToolUse + Bash matcher ile `git commit` yakalayıp `additionalContext` yazmak — Core'un "N dosyaya dokunuldu, plan yok" eşiğine ikinci bir doğal an (commit anı) ekler; oturum başına 2 tavanı ve tmp state dosyası kalıbı hazır.
- fikir: `orient` — depoya özgü bir yönlendirme dosyasını modelin degil betiğin ürettiği, sonra istenince okunan pasif kaynak; Core'un `map.js` çıktısına yakın.
- fikir: `disable-model-invocation: true` frontmatter'ı — modelin kendiliğinden çağıramayacağı, yalnız kullanıcı isteyince açılan kaynak; pasif raf mantığına birebir.

## Karar
Al — kanca kalıbı (commit anı + oturum tavanı + sessiz exit) 60 satırlık bash, sıradan turda sıfır token.
