# hamelsmu/claude-review-loop

- lisans belirtilmemiş · plugin (marketplace) · ★724
- mekanizma: 1 kanca dosyası (`Stop`, 30 sn), 2 komut (`/review-loop`, `/cancel-review`), 0 ajan, 0 skill, 0 MCP; 1 kurulum betiği
- sıradan turda bağlama: eklentinin `CLAUDE.md`'si 9 bayt (yalnız `@AGENTS.md`), `AGENTS.md` 2.345 bayt ≈ 590 token ama proje köküne değil eklenti köküne ait; asıl kanca durum dosyası `.claude/review-loop.local.md` yoksa hiç konuşmadan `{"decision":"approve"}` basıyor → sıradan turda **0 token**
- premium: yok (Codex CLI ve OpenAI aboneliği dışarıdan)

## Ne yapar
`/review-loop <görev>` iki fazlı bir yaşam döngüsü kuruyor: Claude işi bitirince Stop kancası bir Codex koşucu betiği hazırlayıp çıkışı bloke ediyor, Claude Codex'i çalıştırıp bulguları gideriyor. Codex tarafında 4 paralel alt ajan (diff, bütüncül, Next.js, UX) tek bir `reviews/review-<id>.md` üretiyor.

## Core'a alınacak
- kanca: **durum dosyası kapısı** — dosya yoksa tek satır `approve` ve çıkış; Core'un "sıradan turda sıfır" ilkesinin birebir uygulaması, kopyalanabilir.
- kanca: `trap ... ERR` ile hatada daima `approve` + kilit/geçici dosya temizliği; "kullanıcıyı bozuk döngüde bırakma" güvencesi Core kancalarında yok.
- fikir: `review_id`'yi regexle doğrulayıp path traversal'ı kesme (`^[0-9]{8}-[0-9]{6}-[0-9a-f]{6}$`).

## Karar
Al — Stop kancasının durum dosyası kapısı ve ERR tuzağı Core'un kanca yazım kalıbına doğrudan giriyor.
