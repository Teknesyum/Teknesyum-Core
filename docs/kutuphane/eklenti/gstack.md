# garrytan/gstack

- lisans: MIT
- kurulum biçimi: skill çatısı (`~/.claude/skills/gstack`, klasik plugin değil) + CLAUDE.md'ye kısa liste eklenir
- mekanizma: 4 hook (PreToolUse: soru-tercih arayı; PostToolUse: auq-error-fallback + question-log; Stop: timeline-stop, makine geneli); 54 skill (her biri kendi SKILL.md'si, 71 üst klasör), 1 router skill (`gstack`), 8 "power tool" CLI (`browse`, `make-pdf` vb.)
- sıradan turda bağlama: her skill'in tek satır `description` alanı her zaman listede — 54 × ~100 karakter ≈ 5-6 KB ≈ ~1.5K token; SKILL.md gövdeleri (toplam 2.4 MB) yalnız tetiklenince yüklenir
- premium: yok — tamamen ücretsiz, MIT

## Ne yapar
Claude Code'u ~70 rol/komuttan oluşan bir "sanal mühendislik ekibi"ne çeviriyor: CEO incelemesi, tasarım, review, QA, güvenlik, ship. Her skill kendi preamble script'ini (`gstack-skill-start`) bash ile çalıştırıp durum satırları döndürüyor, bazıları tek seferlik "instruction block" ile onboarding/consent akışı tetikliyor. Gerçek tarayıcı sürüşü (`browse`) ve PDF üretimi gibi derlenmiş CLI ikilileri var.

## Kullanıcıya nasıl hissettirir
Slash komut listesi kalabalık (`/office-hours`, `/review`, `/ship`, `/qa`...), her biri kendi checklist/rapor formatını basıyor. Sessiz değil: skill başlarken durum satırları, hook'lar PreToolUse'da soru davranışını değiştirip (auto-decide) PostToolUse'da forensic log tutuyor.

## Core'a alınacak
- fikir: PreToolUse ile AskUserQuestion'ı yakalayıp tekrarlayan tercihleri otomatik karara bağlama (question-preference-hook) — Core'un "eşikte bir kez konuş" ilkesine yakın, betik olarak uyarlanabilir.
- fikir: Stop hook'ta "timeline" — oturum sonu makine geneli bir iz bırakma; log.js'e ek bir olay türü olabilir.
- hiç: 54 skill'lik dev kadro, preamble/telemetri/onboarding makinesi — ölçek ve bakım yükü Core'un tek-kullanıcı, sıfır-bağlam ilkesiyle çelişiyor.

## Ölçülecek
- question-preference-hook'un auto-decide mantığı ayrı çıkarılırsa: kaç AskUserQuestion turu gerçekten atlanıyor (örnek log ile).

## Karar
fikir notu — PreToolUse soru-otomasyonu ve Stop-hook izleme fikri değerli ama 54 skill'lik gövdenin kendisi Core'un kapsamı dışında.
