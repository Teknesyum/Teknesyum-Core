# zakariagharzouli/sparda

- BUSL-1.1 · MCP + CLI (`npx sparda-mcp`) + GitHub Action · ★8
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill (depo kökünde `SKILL.md`, `sparda-mcp`), 1 MCP sunucu; `.claude-plugin/marketplace.json` var, plugin.json yok
- sıradan turda bağlama: kanca ve CLAUDE.md yok; skill kurulursa tek açıklama ~610 B ≈ ~150 token (frontmatter sayıldı). MCP bağlıysa `sparda_get_context`, `sparda_info`, `sparda_confirm` araç tanımları eklenir.
- premium: BUSL-1.1 — ticari kullanım lisansa bağlı; kendisi %100 yerel, API anahtarı istemiyor

## Ne yapar

Backend'i (rotalar, veritabanı sorguları, durum değişimleri, korumalar, yan etkiler) tek bir deterministik davranış grafiğine derliyor, sonra statik olarak kanıtlıyor: korumasız mutasyon yok, kırık invariant yok, atomik olmayan toplu yazma yok. Yalnız bir kısmını görebiliyorsa **PROVEN (PARTIAL)**, hiç göremiyorsa **PREMISE NOT VERIFIED** diyor — asla sahte yeşil vermiyor.

## Core'a alınacak

- **fikir**: üç durumlu verdikt (kanıtlandı / kısmi / önerme doğrulanmadı). Core'un ölçüm ve bench raporlarında "bilmiyorum"u ayrı bir sonuç olarak yazma disiplini; şu an ölçülemeyen kol sessizce eksik kalıyor.
- **fikir**: `apocalypse` kipi — gerçek riskte exit 1, doğrulanmamış önermede de exit 1. Core'un kanca eşiklerinde ikili yerine üçlü çıkış kodu düşünülebilir.
- **fikir**: deterministik, çevrimdışı, anahtarsız kapı — "model gerekmiyorsa model kullanma" kuralının backend güvenliğine uygulanmış hâli.

## Karar

hayır — BUSL-1.1 lisansı ve backend'e özel kapsam Core'a girmesini engelliyor; yalnız üç durumlu verdikt fikri not edilir.
