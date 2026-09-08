# nyldn/claude-octopus

- MIT · plugin (Claude Code eklentisi, 12 dış sağlayıcı) · ★4057
- mekanizma: 57 kanca betiği (hooks/ altında .sh/.mjs), 53 komut, 61 skill,
  49 ajan md'si, `.mcp.json` boş (0 MCP)
- sıradan turda bağlama: CLAUDE.md 22.155 bayt ≈ 5.500 token + 61 skill'in
  `description:` satırları 7.090 bayt ≈ 1.800 token → her turda ~7.300 token sabit
  (bayt/4 ile sayıldı, kanca stdout hariç)
- premium: var — `/octo:premium-mode` model yönlendirmesini premium katmana çeviriyor,
  `/octo:budget-mode` ve `/octo:costs` ile maliyet kapısı

## Ne yapar
Aynı işi Codex, Copilot, Qwen, Grok, Kimi gibi 12 sağlayıcıya paralel koşturur,
%75 uzlaşma kapısıyla anlaşmazlığı yayına çıkmadan yakalar. Claude-native yol
sıradan iş için; Octopus yalnız `/octo:*` yazılınca uyanıyor.

## Core'a alınacak
- fikir: uzlaşma kapısı — Core'un danışman akışında (agency.js) 2-3 koltuk aynı soruya
  bakınca çelişkiyi tek satır bildirmek; ajan çatısı kurmadan raporda yapılabilir.
- fikir: `budget-mode` / `costs` — Core her turda maliyeti statusline'da gösteriyor;
  eşik aşımında tek satır uyarı kancası aynı mantık.
- hiç: kanca/komut/skill yığını alınamaz; sabit 7.300 token Core ilkesinin tam tersi.

## Karar
Hayır — ölçülen ~7.300 token/tur sabit gider Core'un "sıradan turda sıfır" ilkesini
ihlal ediyor; yalnız uzlaşma kapısı fikri not edilir.
