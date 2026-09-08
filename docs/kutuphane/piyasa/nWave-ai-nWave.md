# nWave-ai/nWave

- MIT · plugin + `nwave-ai` CLI (curl | sh kurulumu, uv/pipx) · ★610
- mekanizma: 276 SKILL.md, 103 ajan, 29 komut, 78 kanca dosyası, 1 `hooks.json`, 0 MCP; 1.327 dosya
- sıradan turda bağlama: skill frontmatter 52.571 B + ajan frontmatter 42.835 B = 95,4 KB ≈ 23.900 token — dilim 44'ün açık ara en pahalısı; üstüne PreToolUse kancası **her araç çağrısında** python3 başlatıyor (tek satırlık gömülü `python3 -c` betiği, `hooks.json`'da ölçüldü)
- premium: yok (docs.nwave.ai ayrı barındırılıyor)

## Ne yapar
Özellik teslimini yedi "dalga"ya bölüyor (discover, diverge, discuss, design, devops, distill, deliver). Her dalgada uzman ajanlar artefakt üretiyor, sonrakine geçmeden insan onayı isteniyor.

## Core'a alınacak
- fikir: her dalga sonunda insan kapısı — Core'un `docs/plan.md` eşiğiyle aynı fikir, ama yedi noktaya yayılmış; tek eşik yerine kaç kapı olduğu tartışılabilir.
- hayır: PreToolUse'ta her araç çağrısında python süreci — Core'un "sıradan turda hiçbir kanca bağlama yazmaz" ilkesinin tam tersi, hem gecikme hem kırılganlık (kanca `hooks.json` içine gömülü tek satırlık python, `CLAUDE_PLUGIN_ROOT` yoksa `HOME` altında glob'la yol arıyor).
- hayır: 23,9k token sabit gider.

## Karar
Hayır — 23,9k token ve her araç çağrısında koşan gömülü python kancası; Core ilkesinin karşı örneği.
