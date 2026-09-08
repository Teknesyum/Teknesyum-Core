# Equilateral-AI/equilateral-agents-open-core

- NOASSERTION (README MIT diyor) · plugin + npm paketi (JavaScript) · ★59
- mekanizma: 4 eklenti, 10 komut (`/ea-*`), 2 skill, 22 "ajan" (npm içinde JS sınıfları, Claude alt ajanı değil), kanca yok; YAML standart dosyalarını `StandardsLoader` üç katmanlı dizinden okur
- sıradan turda bağlama: `equilateral-agents` skill açıklaması 385 karakter ≈ 96 token, `project-object` ile birlikte ~200 token sürekli yüklü; `.claude/CLAUDE.md` + `WORKFLOW_PATTERN.md` kurulu projede ek yük.
- premium: var — skill metninin içinde GDPR/HIPAA, çok hesaplı AWS ve ML tabanlı optimizasyon "commercial tier" olarak satılıyor.

## Ne yapar
Güvenlik taraması, kod kalitesi, dağıtım doğrulama ve uyumluluk iş akışlarını veritabanı destekli bir
orkestratörle çalıştırır. v3'te tüm standartlar markdown'dan YAML'a taşındı: `id`, `priority`,
`rules: [{action: ALWAYS|NEVER, rule}]`, `anti_patterns`, `tags` — makinenin okuyacağı biçim.

## Core'a alınacak
- fikir: kuralı düzyazı yerine `ALWAYS`/`NEVER` + `anti_patterns` alanlı YAML olarak tutmak; Core'un `RULES.md` 30 satır tavanında hangi kuralın neden var olduğunu makineye okutur.
- hiç: 22 ajan, 10 komut ve ticari katman reklamı skill açıklamasının içinde — Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesine aykırı.

## Karar
Fikir notu — yalnız YAML standart şeması ilgi çekici; kalanı her turda token yakan ve upsell taşıyan bir skill katmanı.
