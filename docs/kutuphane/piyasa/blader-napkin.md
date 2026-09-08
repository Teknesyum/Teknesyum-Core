# blader/napkin

- MIT · kurulum biçimi: metin paketi (tek skill, `~/.claude/skills/napkin`) · ★590
- mekanizma: 1 skill, 0 kanca, 0 komut, 0 ajan, 0 MCP; depo toplam 3 dosya
- sıradan turda bağlama: SKILL.md 3,9 KB ≈ 1.000 token — skill "her oturumda koşulsuz etkin" diye yazılmış, üstüne repo içi `.claude/napkin.md` de her oturum başında okunuyor (dosya boyutu ölçüldü)
- premium: yok

## Ne yapar
Ajanın yaptığı hataların kalıcı belleğini `.claude/napkin.md` içinde tutar. Oturum başında okunur, iş sırasında sürekli yazılır; günlük değil "sürekli budanan runbook": kategori başına en çok 10 madde, her madde tarih + zorunlu `Do instead:` satırı, her okumada yeniden önceliklendirme.

## Core'a alınacak
- kitap: budama sözleşmesi — kategori başına 10 madde tavanı, her maddede "bunun yerine şunu yap" satırı, tarih damgası. RULES.md'nin 30 satır tavanıyla aynı fikrin daha keskin hâli; rafa girecek olgu bu.
- fikir: hata günlüğünün (`log.js write`) çıktısına `Do instead:` alanı zorunlu kılmak — belirtiyi kaydetmek ucuz, tekrarı önleyen tek satır asıl değer.
- hayır: "her oturum koşulsuz oku" kısmı — Core'un sıfır token ilkesini doğrudan bozar (1.000 token/tur sabit gider).

## Karar
Fikir notu — mekanizması (koşulsuz her tur okuma) ilkeye aykırı, ama budama sözleşmesi 3 satırlık bir raf maddesi olarak değerli.
