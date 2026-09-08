# glama-ai/tool-definition-quality-score

- lisans yok (yalnız README + CHANGELOG) · metin paketi (tek dosya spesifikasyon) · ★32
- mekanizma: 0 kanca · 0 komut · 0 ajan · 0 skill · 0 MCP. Depoda 3 dosya: `README.md` (62.187 bayt ≈ **~15.500 token**), `CHANGELOG.md`, `.gitignore`.
- sıradan turda bağlama: 0 — hiçbir şey kurulmuyor, istenince okunan bir metin.
- premium: yok (Glama'nın ticari kaydına ölçüt sağlıyor ama belge tam açık)

## Ne yapar
Bir MCP araç tanımının ajana ne kadar iyi anlattığını puanlayan açık çerçeve; Glama kaydındaki her aracı bununla ölçüyor. Boru hattı dört aşama: (1) deterministik şema sinyalleri — parametre sayısı, açıklama kapsamı, `definitionBytes`, `invocationCost = requiredFieldCount + 2·(schemaDepth−1) + 2·unionChoiceCount`; (2) bozuk tanımları LLM'e hiç göndermeden eleyen sert kapılar (açıklama yok → 1.0; açıklama ad ile aynı → Purpose Clarity ≤ 2); (3) tek LLM çağrısında altı boyut 1–5 (Purpose Clarity %25, Usage Guidelines %20, Behavioral Transparency %20, Parameter Semantics %15, Conciseness %10, Contextual Completeness %10); (4) deterministik düzeltmeler ve bayraklar. `inputHash` sayesinde değişmeyen tanım yeniden puanlanmaz.

## Core'a alınacak
- **kitap** — rafa doğrudan: "açıklamanın işi şemanın zaten söylediğini tekrarlamak değil, üstüne değer katmaktır" ilkesi ve altı boyutlu ölçüt, Core'un skill/komut açıklamalarını yazarken kullanılacak somut ölçek.
- **fikir** — `definitionBytes`: her aracın `tools/list` yükünde işgal ettiği bayt, ajan daha hiçbir iş yapmadan bağlamda duruyor. Core'un "sıradan turda sıfır token" ölçümünü piyasa deposu değerlendirirken bu adla saymak.
- **fikir** — LLM'siz sert kapı deseni: pahalı model çağrısından önce deterministik kod ile bozuğu ele. Core'un "model gerekmiyorsa model kullanma" kuralının ölçülebilir hali.

## Karar
Al — kurulacak hiçbir mekanizma yok, saf metin; kütüphaneye kitap olarak girer ve Core'un kendi açıklama metinlerini denetlemek için ölçek verir.
