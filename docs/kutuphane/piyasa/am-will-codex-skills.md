# am-will/codex-skills

- lisans yok · npx ile kurulan beceri/ajan paketi (Codex ve Claude Code) · ★1030
- mekanizma: 2 kanca dosyası (`hooks/aitmpl-codex`), 22 skill, 44 ajan, 0 komut, `bin/` CLI
- sıradan turda bağlama: CLAUDE.md 5141 B (~1285 token) + 22 skill açıklaması 3514 B (~880 token) = **~8.6 KB, ~2165 token**; 44 ajanın açıklaması da çağrı yüzeyine eklenir.
- premium: yok

## Ne yapar
Planlama (planner, plan-harder, parallel-task, llm-council), dokümantasyon erişimi (Context7, OpenAI docs) ve tarayıcı otomasyonu becerilerini toplar. `llm-council` birden çok modele bağımsız plan yazdırıp bir yargıç ajanla birleştirir, gerçek zamanlı web arayüzü taşır.

## Core'a alınacak
- **fikir**: `llm-council` — bağımsız planlar + yargıç; Core'un danışma kurulu (agency.js) akışının çok modelli sürümü, koltuk seçimi yerine paralel plan.
- **hiç**: 44 ajan ve 2165 tokenlik sabit yük; Core hiçbir şeyi ajan olarak kurmuyor.

## Karar
Hayır — sabit 2165 token ve 44 ajan kurulumu ilkeye ters; llm-council yalnız fikir olarak not.
