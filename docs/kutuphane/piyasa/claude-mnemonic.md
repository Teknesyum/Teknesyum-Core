# lukaszraczylo/claude-mnemonic

- MIT · plugin + MCP + arka plan servisi (Go ikili, `curl | bash` kurulumu) · ★19
- mekanizma: 5 kanca olayı / 5 kanca komutu (SessionStart, UserPromptSubmit, PostToolUse `*`, SubagentStop, Stop) · 1 komut (`/restart`) · 1 MCP sunucusu (`mcp-server`, `${CLAUDE_PROJECT}`) · 0 skill · 0 ajan · localhost:37777 panosu
- sıradan turda bağlama: **her istemde** `cmd/hooks/user-prompt/main.go` `<relevant-memory>` bloğu enjekte ediyor; kodda `maxTokens := 8000` tavanı var (satır 130). Yani sıradan turda 0 değil, **0–8.000 token** arası. Artı MCP araç tanımları hep yüklü.
- premium: yok

## Ne yapar
Oturum sırasında öğrenilenleri (hata düzeltmeleri, mimari kararlar) SQLite + FTS5 + yerel ONNX gömme ile saklar; sonraki oturumlarda soruyla ilgili anıları çapraz-kodlayıcı yeniden sıralamayla bulup istem öncesinde bağlama yazar. Bilgi grafiği, önem puanı ve çelişki tespiti panosunda gösterilir.

## Core'a alınacak
- **fikir** — kanca "başarısızsa açık kal": worker'a erişilemezse hata vermeden boş dönüp istemi hiç engellememe deseni (`return "", nil`, 10 sn zaman aşımı). Core kancalarında da aynı sertlik iyi olur.
- **fikir** — enjeksiyona token tavanı koyup gözlemleri o tavana kadar doldurma; Core'un özel rafında ileride benzeri gerekirse ölçü buradan.

## Karar
Hayır — mekanizması Core'un tam tersi: her istemde 8.000 token'a kadar bağlam yazıyor, arka planda daemon + MCP + pano gerektiriyor.
