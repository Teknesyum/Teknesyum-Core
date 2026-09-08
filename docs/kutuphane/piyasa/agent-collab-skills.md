# WenyuChiou/agent-collab-skills

- MIT · plugin (marketplace) + isteğe bağlı Python harness (`agent_collab_harness`) · ★26
- mekanizma: 7 skill, 0 kanca, 0 komut, 0 ajan, 0 MCP
- sıradan turda bağlama: 7 SKILL.md frontmatter'ı 1546 B ≈ 385 token; harness kurulmazsa başka bağlam yok. Sayım: ilk `---` bloklarının bayt toplamı.
- premium: yok

## Ne yapar
Çok ajanlı işi bir yönetişim katmanı olarak ele alıyor: görev bölücü, bağlam bütçesi, plan-uygula-yansıt döngüsü, çıktı uzlaştırıcı, sınırlı münazara, yalnız-öneri hafıza ve kabul kapısı. Deterministik katman durumu ve limitleri tutuyor; kırılma noktalarında, hafızanın kalıcılaşmasında ve kabulde karar insanda kalıyor. Model/araç/oturum sağlamıyor, ana çatıya bağlanıyor.

## Core'a alınacak
- fikir: "yalnız-öneri hafıza" — ajan kanonik hafızayı yazamaz, öneri üretir, onaylanınca eklenir; Core'un `MEMORY.md` ve özel raf disiplini için doğrudan uygulanabilir.
- fikir: kontrol noktası + bağlam bütçesi — Core'un `handoff.md` devir notuna sayısal bütçe alanı eklemek.
- kitap: kabul kanıtı (acceptance evidence) kalıbı, tek raf sayfası.

## Karar
Fikir notu · 385 token'lık 7 skill Core'un çok ajanlı iş yapmadığı bir alanı kuruyor; hafıza ve kontrol noktası fikirleri alınır, kurulum alınmaz.
