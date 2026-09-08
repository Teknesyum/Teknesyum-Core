# Myr-Aya/GouvernAI-claude-code-plugin

- MIT · plugin (marketplace + plugin.json) · ★23
- mekanizma: 1 kanca dosyası (`hooks/hooks.json`) — tek betik 5 matcher'a bağlı (Bash, Write, Edit, MultiEdit, Read), hepsi PreToolUse; 1 komut (`/guardrails`, 4.1 KB); 1 skill (5 dosya, 26 KB); 0 ajan; 0 MCP.
- sıradan turda bağlama: skill açıklaması ~380 B (~95 token) her turda yüklü; kanca sıradan turda stdout basmaz (`guardrails-enforce.py` ihlal yoksa sessiz exit 0), ama her Read/Edit/Bash çağrısında 17.7 KB Python süreci doğar. Sayım: `wc -c` frontmatter + betik akışı.
- premium: yok (MIT, sıfır bağımlılık); site gouvernai.ai var, satış yok.

## Ne yapar
Aracı çağrılarını dört risk katına ayırır: okuma/taslak sessiz geçer, yazma bildirimle geçer, ağ/config/kimlik bilgisi onaya durur, gizlenmiş komut ve toplu silme sert bloklanır. İki katman: nüans için skill, pazarlıksız kural için PreToolUse kancası. Karar `hookSpecificOutput.permissionDecision` ile `allow|ask|deny` olarak döner.

## Core'a alınacak
- kitap: PreToolUse kanca sözleşmesinin doğru biçimi — `hookEventName` alanı yoksa Claude Code çıktıyı düşürür, `ask_user` geçersiz, doğrusu `ask`. Betikte yorum olarak yazılı, ölçülü bir olgu.
- fikir: token tavanı kancası (`check_token_cap`) — araç girdisi tahmini token'ı aşarsa `ask` döner. Core'un "eşikte bir kez konuş" ilkesine birebir uyar.
- fikir: politika dosyaları düz Markdown; model değil kullanıcı düzenler.

## Karar
fikir notu — 5 matcher'a bağlı 17.7 KB Python her araç çağrısında koşuyor; Core'un sıfır-token ilkesine ağır, ama kanca karar sözleşmesi ve token tavanı fikri kitaba değer.
