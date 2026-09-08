# antonbabenko/terraform-skill

- Apache-2.0 · plugin (marketplace) / saf skill paketi · ★2332
- mekanizma: 0 kanca, 0 komut, 0 ajan, 1 skill (SKILL.md + `references/`), mcp.json 244 bayt
- sıradan turda bağlama: ~0,25 KB / ~60 token — tek skill açıklaması 230 karakter; skills klasörü toplam 216 KB, tamamı isteğe bağlı okunuyor; deponun CLAUDE.md'si (9,9 KB) katkıcılar için, kullanıcıya yüklenmiyor
- premium: yok

## Ne yapar
Terraform/OpenTofu için teşhis öncelikli bir bilgi paketi: test çerçevesi seçimi, modül yapısı, uzak state ve kilitleme, CI/CD, Trivy/Checkov taraması. Çekirdek SKILL.md bir iş akışı; derinlik `references/` altında, ancak gerekince yükleniyor.

## Core'a alınacak
- kitap: "çekirdek dosya iş akışı, derinlik references/'ta, talep üzerine yüklenir" ayrımı — Core'un raf biçimi için doğrudan model; 216 KB bilgi 60 token karşılığında duruyor.
- kitap: açıklamayı "ne zaman" ile yazma kalıbı ("Use when writing, reviewing, or debugging ... - diagnoses failure mode (...)"); Core raflarının başlık satırı bu kalıba çekilebilir.
- hiç: Terraform içeriğinin kendisi Core kapsamı dışında.

## Karar
Al — içerik değil, biçim: pasif kütüphanenin "ince başlık + ağır ek" düzeni bu depoda ölçülmüş halde (60 token / 216 KB).
