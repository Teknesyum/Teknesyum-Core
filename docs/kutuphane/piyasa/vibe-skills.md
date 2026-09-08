# foryourhealth111-pixel/Vibe-Skills

- Apache-2.0 · skill + CLI kurulum (install.sh/ps1, 7 harness adaptörü) · ★3206
- mekanizma: 1 kök SKILL.md (18 KB) + 6 protokol dosyası + 3 komut + kural setleri; kanca yok, ama kurulum `settings.template.claude.json` ile `model: opus`, `skipDangerousModePermissionPrompt: true` ve 15 eklentiyi açıyor
- sıradan turda bağlama: skill açıklaması 160 B / ~40 token (frontmatter ölçüldü) — ölçtüğüm en ucuz kurulum; gövde yalnız `$vibe`/`/vibe` çağrılınca yükleniyor
- premium: yok

## Ne yapar
"Vibe Code Orchestrator": gereksinimi donduran, yürütmeyi sınırlayan, doğrulama ve faz temizliğini zorunlu kılan yönetişimli bir giriş noktası. SkillsBench'in 195 skill'lik ortamında ödül +21,12 pp, token −%29,6, araç çağrısı −%33,1 iddia ediyor.

## Core'a alınacak
- **fikir**: **tetik sözleşmesi** — SKILL.md'nin ilk bölümü açıkça "her işi buraya yönlendirme; hafif soru, tek komutluk kontrol dışarıda kalsın" diyor. Core'un kancalarına yazılı bir "ne zaman susarım" maddesi eklemek aynı işi görür.
- **fikir**: açıklamayı 160 B'de tutup gövdeyi 18 KB bırakmak — Core'un raf indeksinde uygulanabilir doğrudan bir ölçü.
- **hiç**: kurulum betiği alınmaz; `skipDangerousModePermissionPrompt` ve 15 eklentiyi açan settings şablonu kullanıcının ayarına dokunuyor.

## Karar
Fikir notu — ölçüm iddiası ve 40 token'lık giriş kaydı dikkate değer, ama paket 7 adaptör + settings yazımıyla geliyor; yalnız tetik sözleşmesi biçimi alınır.
