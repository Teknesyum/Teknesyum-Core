# multica-ai/andrej-karpathy-skills

- lisans: MIT (plugin.json ve SKILL.md frontmatter'da beyan; kökte ayrı LICENSE dosyası yok)
- kurulum biçimi: plugin (tek skill) | alternatif olarak CLAUDE.md kopyala-yapıştır
- mekanizma: kanca yok, komut yok, ajan yok, MCP yok — tek skill (`karpathy-guidelines`, 2585 bayt gövde)
- sıradan turda bağlama: yalnız skill description'ı (~230 karakter, ~60 token); gövde tetiklenmeden okunmaz. Plugin.json+marketplace.json birlikte ~1 KB, yalnız kurulumda okunur.
- premium: yok

## Ne yapar
Karpathy'nin LLM kodlama hataları tespitinden (varsayım yapma, aşırı karmaşıklaştırma, alakasız kod değiştirme) türetilmiş dört davranış ilkesi: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution. Statik metin dışında hiçbir mekanizma yok — ne kanca ne ölçüm.

## Kullanıcıya nasıl hissettirir
Sessiz: skill yalnız "writing/reviewing/refactoring code" bağlamında tetiklendiğinde gövdesi okunur, statusline'a veya banner'a dokunmaz. Çıktı yalnız modelin davranışını (soru sorma, sade kod, cerrahi düzenleme) örtük şekilde etkiler — görünür bir arayüz yok.

## Core'a alınacak
- kitap: dört ilke metni kütüphaneye ham kitap olarak zaten alınabilir — mekanizma değil, saf davranış talimatı; Core'un "??" kütüphanesine tek dosya olarak eklenebilir.
- Core'da zaten RULES.md içinde büyük ölçüde örtüşen kurallar var (angarya, cerrahi değişiklik, kanıt gösterme) — yeni bir mekanizma getirmiyor.

## Ölçülecek
- Alınırsa ölçülecek bir mekanizma yok; yalnız "bu ilkeler zaten RULES.md'de var mı" karşılaştırması yapılır (metin çakışması kontrolü).

## Karar
hayır — mekanizma sıfır (tek statik skill metni), içerik zaten RULES.md ile örtüşüyor, alınacak yeni bir yapı yok.
