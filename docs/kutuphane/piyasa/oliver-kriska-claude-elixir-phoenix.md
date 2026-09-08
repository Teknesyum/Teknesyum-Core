# oliver-kriska/claude-elixir-phoenix

- MIT · plugin (çoklu: catchup, ecto, elixir-phoenix) · ★541
- mekanizma: 323 SKILL.md, 30 ajan, 2 komut, 34 kanca dosyası, 2 `hooks.json`, 0 MCP; 1.857 dosya; depo içi CLAUDE.md 46 KB
- sıradan turda bağlama: skill frontmatter 41.622 B + ajan frontmatter 12.892 B = 54,5 KB ≈ 13.600 token; kancalar PostToolUse'ta koştuğu için sıradan turda stdout üretmiyor
- premium: yok (SkillSpector güvenlik taraması rozeti var)

## Ne yapar
26 uzman ajanı paralel çalıştırıp Elixir/Phoenix kodunu planlıyor, yazıyor, inceliyor. Asıl iddiası "26 Iron Law": `assign_new` yeniden bağlanmada sessizce atlar, `:float` para alanını bozar, Oban işin idempotent değil — testlerin yakalamadığı, alana özgü tuzaklar.

## Core'a alınacak
- kanca: `hooks.json` içindeki `"if": "Edit(*.ex)"` koşul sözdizimi ve `statusMessage` alanı — kanca yalnız eşleşen dosyada koşuyor ve modele değil kullanıcıya tek satır yazıyor. Core'un "kanca yalnız eşikte konuşur" ilkesinin resmî mekanizması; Core kancaları bunu kullanmıyor.
- kitap: "Iron Law" biçimi — her kural tek cümlelik somut tuzak + neden testlerin yakalamadığı. Genel tavsiye değil, olgu.
- hayır: 26 ajan ve 13,6k token; alan da (Elixir) Core'a uzak.

## Karar
Fikir notu — `hooks.json`'daki `if:` koşulu ve `statusMessage` alanı Core kancalarına doğrudan uygulanabilir; gerisi ağır ve alan dışı.
