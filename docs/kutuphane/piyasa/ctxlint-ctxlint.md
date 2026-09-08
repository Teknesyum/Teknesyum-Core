# ctxlint/Ctxlint

- MIT · CLI (npx @ctxlint/ctxlint) · ★11
- mekanizma: 0 kanca, 0 ajan, 0 skill, 0 MCP sunucusu; 5 komut (check, init, slim, diff, mcp), 9 kural dosyası
- sıradan turda bağlama: 0 KB, 0 token — depoda `.claude-plugin` yok, kurulan tek şey npm paketi; kendi AGENTS.md'si 3 KB ama o kendi deposu için
- premium: yok

## Ne yapar
AGENTS.md / CLAUDE.md / .cursorrules / .mcp.json dosyalarını linter gibi tarar: ölü dosya referansı, package.json'la uyuşmayan komut, dizin ağacı, gömülü sır, README tekrarı, token israfı. `slim` işaretlenen bölümleri otomatik siler, `diff` git geçmişinden sapmayı çıkarır. Eşikleri sabit: 200 satır uyarı, 400 satır hata, 60 satır "mükemmel", token ≈ karakter/4.

## Core'a alınacak
- pasif betik: `ctxlint check --json`'u saran ince bir `lint.js` — Core'un "sıradan turda sıfır token" ilkesini ölçülebilir kılar; eşiği kanca değil, kullanıcı çağırır.
- fikir: stale-file-ref ve stale-command kuralları Core'un kendi AGENTS.md/CLAUDE.md ikizlerine uygulanabilir; `map.js` zaten import grafiğini biliyor, dosya referansı doğrulaması oradan bedava.
- kitap: token-budget kuralının "gürültü yüzdesi" tanımı (noiseTokens/totalTokens) rafa alınabilir bir ölçüm reçetesi.

## Karar
Al — bağlama sıfır token maliyetiyle Core'un temel iddiasını (bağlam israfı) dışarıdan ölçen tek araç; 1 çalışma bağımlılığı var.
