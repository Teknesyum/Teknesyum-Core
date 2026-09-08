# kenryu42/cc-safety-net

- MIT · plugin (+ npx CLI, çok-CLI kurulum) · ★1528
- mekanizma: 1 kanca (PreToolUse → dist/bin/cc-safety-net.js), 0 komut, 0 ajan, 1 skill, 0 MCP
- sıradan turda bağlama: ~0,25 KB / ~60 token — CLAUDE.md 10 bayt, tek skill `disable-model-invocation: true` ve açıklaması 230 karakter; SKILL.md gövdesi 17 KB ama yalnız çağrılınca okunur; kanca sessizken stdout yazmaz
- premium: yok (ücretsiz, ayrı dokümantasyon sitesi var)

## Ne yapar
PreToolUse'ta komutu ayrıştırıp yıkıcı git/dosya işlemlerini ve `.env`, SSH anahtarı gibi sır erişimlerini çalışmadan önce durdurur. Sarmalama ya da bayrak sırası değiştirme kaçış sağlamıyor; bozuk yapılandırma hiçbir şeyi engellemiyor (fail-open). Windows/macOS/Linux ve Claude Code, Codex, Cursor, Gemini CLI dahil çok CLI destekli.

## Core'a alınacak
- kanca: tek PreToolUse kancasında "sessizse hiç konuşma, yalnız engellerken tek satır" düzeni Core'un eşik ilkesiyle birebir; Core'un kendi kancalarına örnek desen.
- fikir: `disable-model-invocation: true` + kısa açıklama — skill'i modelin kendiliğinden çağırmasını kapatıp yalnız kullanıcı çağrısına bırakma; Core'un "hiçbir şey ajan/skill olarak kurulmaz" ilkesine en yakın uzlaşma biçimi.
- fikir: fail-open sözleşmesi (yapılandırma bozuksa engelleme yok) — Core kancalarının hata halinde turu bloke etmemesi için yazılı kural.

## Karar
Fikir notu — koruma işlevi Core'un kapsamı dışında, ama kanca disiplini ve fail-open sözleşmesi doğrudan kopyalanabilir.
