# node9-ai/node9-proxy

- Apache-2.0 · CLI + kanca kurulumu (`node9 init`) + MCP ağ geçidi · ★210
- mekanizma: 34 CLI alt komutu (`src/cli/commands/`), PreToolUse kancası ile araç çağrısı
  denetimi, MCP gateway; 0 skill, 0 ajan. Depodaki `CLAUDE.md` 3.508 B ama bu kendi geliştirme
  kuralları, kullanıcının projesine kurulmuyor
- sıradan turda bağlama: 0 KB — kullanıcı tarafına metin koymuyor; maliyet kancanın süreç
  başlatması (her PreToolUse) ve isteğe bağlı statusline
- premium: bulut tarafı (node9.ai) var, CLI ücretsiz

## Ne yapar
Ajanla araçları arasına giren bir güvenlik katmanı: ne yapıldığını yerel oturum günlüklerinden
(`~/.claude/projects/` vb., API çağrısı yok) tarar, riskli eylemleri gerçek zamanlı engeller,
zaman aralığına göre denetim raporu üretir. Docker + iptables ile kapalı bir kum havuzu üretebiliyor.

## Core'a alınacak
- **fikir — `skill-pin` / `mcp-pin`**: kurulu bir skill'in ya da MCP sunucusunun içeriğini
  özet (hash) ile sabitleyip sessiz değişimi yakalıyor. Core'un kütüphane raflarında
  "kaynak depo değişti, raf bayat" tespiti için doğrudan karşılığı.
- **fikir — oturum günlüğünü yerelden okuma**: tarama tamamen çevrimdışı, model çağırmadan.
  Core'un sayaçları aynı kaynağı kullanıyor; ek olarak `~/.codex`, `~/.gemini` yollarını da
  biliyor.
- **hayır — proxy/daemon**: sürekli çalışan süreç Core'un "kanca yalnız eşikte" ilkesine ağır.

## Karar
Fikir notu — güvenlik ürünü olarak kapsam dışı; pin (özet sabitleme) fikri rafların bayatlığı için alınır.
