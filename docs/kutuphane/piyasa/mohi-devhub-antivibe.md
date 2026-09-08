# mohi-devhub/antivibe

- MIT · tek skill + kanca + 4 kabuk betiği · ★1100
- mekanizma: 1 hooks.json'da 2 kanca (Stop, SubagentStop) — ikisi de `"type": "prompt"`, yani her tur sonunda **model çağırır**; 1 SKILL.md (8.8 KB, 15 tetik ifadesi), 2 ajan, 4 betik (analyze-code.sh, capture-phase.sh, find-resources.sh, generate-deep-dive.sh)
- sıradan turda bağlama: CLAUDE.md yok, skill açıklaması ~230 B (~58 token). Asıl maliyet kancada: Stop her turda bir prompt turu harcar, hiçbir kod yazılmamış turda bile.
- premium: yok

## Ne yapar
Herhangi bir kod tabanını — yeni, eski ya da AI yazmış — eğitici derin anlatıma veya mimari denetime çevirir. Ne yaptığını değil neden öyle yazıldığını anlatmayı hedefler.

## Core'a alınacak
- **fikir (karşı örnek)**: `"type": "prompt"` kancası, sıradan turda sıfır token ilkesinin tam zıddı — her Stop'ta bir model turu. Core'un ölçülü karşı örnek listesine yazılacak somut vaka.
- **fikir**: 15 tetik ifadesini frontmatter'da `triggers:` altında listeleme; açıklamayı şişirmeden çağrı yüzeyi genişletme denemesi.
- **hiç**: alınacak makine yok.

## Karar
Hayır — iki kancası da her tur sonunda model çağırıyor; ilkeye ters, ama karşı örnek olarak not değerli.
