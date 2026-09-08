# parcadei/Continuous-Claude-v3

- MIT · plugin + ev dizini kurulumu (`~/.claude` tümden değiştirilir) · ★3937
- mekanizma: 74 kanca komutu / 7 olay (PreToolUse, PostToolUse, UserPromptSubmit, SessionStart, Stop, PreCompact, SessionEnd), 160 SKILL.md, 33 ajan, 12 kural dosyası
- sıradan turda bağlama: skill frontmatter'ları 20,8 KB (~5,2k token, 160 SKILL.md'nin `---` blokları toplandı) + `.claude/rules` 21 KB + UserPromptSubmit'te 5 ayrı kanca (skill-activation, premortem-suggest, memory-awareness, impact-refactor, tracing) çıktı yazıyor. Sıradan tur ≥40 KB.
- premium: yok

## Ne yapar
Claude Code'u "sürekli öğrenen" bir ortama çeviriyor: YAML handoff ile sıkıştırma kaybını
azaltıyor, bir bellek daemon'ı oturumdan çıkarım topluyor, TLDR adlı 5 katmanlı kod
analiziyle dosya okumayı azaltmaya çalışıyor. Kurulum ev dizinindeki `.claude`'u sahipleniyor.

## Core'a alınacak
- fikir: "handoff YAML" — Core'un `handoff.md`'si serbest metin; alan adları sabit bir YAML
  başlığı makinenin yazdığı kısmı küçültür.
- fikir: PreCompact kancasında handoff'u tazeleme; Core compact talimatını CLAUDE.md'de
  tutuyor, kanca tarafı boş.
- hiç: 74 kanca + 160 skill'lik yığın Core ilkesinin tam zıddı; ölçülen ~5,2k token sabit yük.

## Karar
fikir notu — handoff/PreCompact fikirleri değerli, mekanizma (sıradan turda ≥40 KB) alınamaz.
