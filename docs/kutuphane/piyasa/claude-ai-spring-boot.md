# piomin/claude-ai-spring-boot

- Apache-2.0 · plugin (`.claude-plugin/plugin.json`) + CLAUDE.md şablonu · ★1286
- mekanizma: 6 ajan (code-reviewer, devops-engineer, docker-expert, kubernetes-specialist, security-engineer, spring-boot-engineer), 5 skill (code-quality, design-patterns, jpa-patterns, logging-patterns, spring-boot), 0 kanca, 0 komut, 0 MCP
- sıradan turda bağlama: CLAUDE.md 2138 B + 6 ajan açıklaması 1243 B ≈ 3,4 KB / ~850 token (dosya boyutları + frontmatter description satırları sayıldı)
- premium: yok

## Ne yapar
Spring Boot projeleri için hazır Claude Code şablonu: Maven/JPA/Docker kuralları, ajanlar ve skill'ler. CLAUDE.md'nin ilk yarısı ise dilden bağımsız çalışma disiplini — plan modu varsayılanı, kullanıcı düzeltmesinden sonra `tasks/lessons.md`'e yazma, bitmeden doğrulama, "daha zarif yolu var mı" duraklaması.

## Core'a alınacak
- **fikir**: **`tasks/lessons.md` kendini düzeltme döngüsü** — "kullanıcı seni düzelttiyse deseni dosyaya yaz, oturum başında oku". Core'un `RULES.md` 30 satır tavanıyla aynı fikir ama tetikleyicisi otomatik; Core'da `/rule` kaldırılmış, kancayla geri getirilebilir.
- **fikir**: plan modu eşiği "3+ adım" — Core'un eşiği "5 ve üstü dosya"; iki ölçü karşılaştırmaya değer.
- **hiç**: Spring Boot içeriği ve 6 ajan alınmaz.

## Karar
Fikir notu — alan içeriği Core'a yabancı ve 850 token'lık sabit yük var; yalnız otomatik ders-kaydı tetikleyicisi alınır.
