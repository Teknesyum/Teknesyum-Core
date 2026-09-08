# fabioconcina/claumon

- MIT · tek ikili CLI + yerel pano (127.0.0.1:3131) · ★16
- mekanizma: 0 kanca, 0 komut, 0 ajan, 0 skill, 0 MCP; Go ikilisi + SQLite, SSE ile canlı pano
- sıradan turda bağlama: 0 KB — Claude Code'un bağlamına hiç girmez, `~/.claude` dosyalarını dışarıdan okur
- premium: yok

## Ne yapar
`~/.claude/.credentials.json` (ya da OS kimlik deposu) üzerinden OAuth kullanım ölçerlerini okur, günlük yeniden eğitilen ampirik-Bayes modeliyle sıfırlamadaki kullanımı %80 güven aralığıyla öngörür. Oturum maliyetleri, disk ayak izi ve hafıza dosyası tarayıcısı da aynı panoda.

## Core'a alınacak
- fikir: durum bilgisini bağlama değil dışarı yazmak — Core'un statusline ilkesiyle aynı; limit öngörüsü statusline'a tek alan olarak eklenebilir.
- fikir: tahmini yayımlanmış modele bağlayıp örneklem dışı puanlamayla ölçmek (MODEL.pdf); Core'un bench iddiaları için aynı disiplin.

## Karar
Fikir notu — ürünün kendisi Go ikilisi ve Core'a girmez; 0 KB bağlam ve statusline yaklaşımı doğrulayıcı örnek.
