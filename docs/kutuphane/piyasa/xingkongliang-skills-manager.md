# xingkongliang/skills-manager

- MIT · masaüstü uygulaması (Rust/Tauri) · ★4554
- mekanizma: kanca yok · komut yok · skill yok · MCP yok; 50+ kodlama aracının skill dizinlerini okuyup yazan bir GUI. Depo klonlanmadı (1. adımda ürün olarak elendi).
- sıradan turda bağlama: 0 — ajanın bağlamına hiçbir şey girmiyor, uygulama dosya sistemi üzerinden çalışıyor.
- premium: yok; "buy me a coffee" bağlantısı var.

## Ne yapar
Global, ajan ve proje çalışma alanları arasında skill'leri kurmayı, eşitlemeyi ve düzenlemeyi tek arayüzden yapıyor; içinde bir pazar yeri de var.

## Core'a alınacak
- fikir: üç kademeli çalışma alanı ayrımı (global / ajan / proje) — Core'un kütüphane rafları bugün tek kademede; hangi rafın global, hangisinin projeye ait olduğunu ayırmak ileride gerekebilir.
- hayır: uygulamanın kendisi; Core kurulum yapmıyor, GUI hiç yok.

## Karar
hayır — ayrı bir ürün, Core'a taşınacak mekanizması yok; yalnız üç kademeli raf ayrımı fikri not edildi.
