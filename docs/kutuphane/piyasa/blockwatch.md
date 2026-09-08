# mennanov/blockwatch

- MIT · plugin (`.claude-plugin` + tek skill) + Rust CLI · ★29
- mekanizma: 0 kanca (Claude tarafı), 0 komut, 0 ajan, 1 skill (`.agents/skills/blockwatch/SKILL.md`, 9 KB); ayrıca pre-commit ve GitHub Action girdisi
- sıradan turda bağlama: skill gövdesi tembel; yalnız frontmatter `description` (~640 karakter ≈ 160 token) her turda yüklü. Deponun kendi `CLAUDE.md`'si 7110 B ≈ 1780 token ama o yalnız kendi deposunda.
- premium: yok. `check-ai` doğrulayıcısı isteğe bağlı API anahtarı ister, gerisi tamamen deterministik.

## Ne yapar
Kaynak dosyaların yorum satırlarına `<block name=... affects=...>` etiketi koyar; bir blok değişip
bağlı blok değişmezse `git diff | blockwatch --diff --only-changed` çıkışı 1 verir. 33 dil, config
dosyası yok. `same-as` iki yerdeki değerin eşitliğini, `keep-sorted` / `keep-unique` / `line-pattern`
/ `line-count` liste disiplinini denetler.

## Core'a alınacak
- pasif betik: README ikizleri kuralı bugün modelin hafızasında; `affects` ile deterministik hale gelir — TR/EN README ve davranış kodu aynı commit'te değişmezse commit öncesi tek satır hata.
- fikir: "önce deterministik doğrulayıcı, LLM en sona" hiyerarşisi — `check-ai` açıkça en pahalı ve en güvenilmez seçenek diye işaretlenmiş; Core'un kanca felsefesiyle birebir.
- kitap: raf notu olarak SKILL.md'nin "yüksek değerli blok" ölçütü (gürültü yapan kural yok sayılır).

## Karar
Al — kancasız, sıfır token, tek ikili dosya; Core'un README-ikizi ve liste sıralama kurallarını modelden alıp araca veriyor.
