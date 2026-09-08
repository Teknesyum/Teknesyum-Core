# feiskyer/claude-code-settings

- MIT · plugin marketplace + settings şablonu · ★1647
- mekanizma: 0 kanca, 12 skill, 9 ajan, 1 MCP (chrome-devtools), 3 alt eklenti
  (codex-skill, nanobanana-skill, youtube-transcribe-skill), 1 statusline betiği
- sıradan turda bağlama: 12 SKILL.md frontmatter'ı 5,63 KB (~1,4k token) + 9 ajan tanımı;
  kanca olmadığı için kanca çıktısı 0. Tümü kurulursa sabit yük ~1,4k token.
- premium: yok

## Ne yapar
Hazır bir `settings.json` / marketplace paketi: derin araştırma, görsel üretimi, GitHub
otomasyonu skill'leri ve çok modelli geçiş (LiteLLM gateway, Copilot) yapılandırması.
Kod değil, yapılandırma dağıtıyor.

## Core'a alınacak
- fikir: `guidances/llm-gateway-litellm.md` — model geçişini ayrı bir yapılandırma belgesine
  ayırmak; Core'un `setup.js`'i makine ayarını yazıyor ama model/gateway tarafı boş.
- fikir: eklentiyi koleksiyonlara bölmek (10 küçük plugin) — kullanıcı yalnız istediğini
  kuruyor, sabit yük ölçülebilir kalıyor.
- hiç: 12 skill + 9 ajanın kendisi; Core hiçbir şeyi ajan/skill olarak kurmuyor.

## Karar
hayır — içerik yapılandırma paketi, mekanizma yeni bir şey getirmiyor; ölçülen ~1,4k token
sabit yükün karşılığı yok.
