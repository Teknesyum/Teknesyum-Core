# wei18/Upkeep

- MIT · plugin (skill) + CLI betiği + GitHub Action · ★14
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill, 0 MCP; 8 gözden geçirici istem dosyası (12.9 KB toplam), 1 kabuk betiği
- sıradan turda bağlama: yalnız SKILL.md açıklaması, 181 B ≈ 45 token; SKILL.md gövdesi 2129 B tetiklenince
- premium: yok; kendi Claude Pro/Max aboneliğini `claude -p` alt süreçleriyle kullanır, API faturası yok

## Ne yapar
Depoyu tarar, dosya envanteri çıkarır (hash, `referencedBy`, `lastCommitISO`), sonra paralel `claude -p` alt süreçleriyle 7 odaklı gözden geçirici çalıştırır: bayat doküman, koda uymayan spec, yetim dosya, kural ihlali, çeviri sapması. Kanıtla raporlar, hiçbir dosyayı düzenlemez.

## Core'a alınacak
- kitap: **paralel gözden geçirici istem şablonu** (`_reviewer-prompt.md`, 2972 B) — tur bütçesi, katı JSON çıktı sözleşmesi, "araç reddedilirse tekrar deneme", "önce envanter metadata, sonra derin okuma". Core'un ajan çağırma disiplinine hazır metin.
- fikir: **SSOT yönü belirsiz kalabilir** — hangi tarafın doğru olduğunu varsayma, yalnız sapmayı kanıtla bildir (`ssot_direction: "uncertain"`). Core'un rapor dilinde eksik olan bir kural.
- fikir: `.claude/audit.yml` gibi tek, küçük, isteğe bağlı yapılandırma; yoksa hiçbir şey olmaz.

## Karar
Al — 45 token pasif maliyetle çalışan, kancasız, ajan kurmayan bir skill; gözden geçirici istem şablonu Core'a raf olarak girer.
