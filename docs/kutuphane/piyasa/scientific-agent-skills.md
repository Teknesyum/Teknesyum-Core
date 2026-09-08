# K-Dense-AI/scientific-agent-skills

- MIT · plugin (Agent Skills / Agent Plugins standardı) · ★43750
- mekanizma: 163 skill (`skills/*/SKILL.md`), 0 kanca, 0 komut, 0 ajan, 0 MCP; `CLAUDE.md` 109 B → `AGENTS.md` 18.3 KB'a yönlendiriyor.
- sıradan turda bağlama: 163 skill'in `name` + `description` satırları toplam **70.150 B ≈ ~17.5k token**, her turda yüklü; üstüne repo içinde çalışılıyorsa AGENTS.md 18.3 KB (~4.6k token). Sayım: her SKILL.md frontmatter'ından `name:`/`description:` satırları süzülüp `wc -c`.
- premium: yok kütüphanede; K-Dense BYOK masaüstü ürünü ve Modal bulut ölçeği ayrı satılıyor.

## Ne yapar
Biyoloji, kimya, tıp için 163 dar skill ve 100+ veri tabanı erişimi paketler. Her skill tek bir paket/veri tabanı/iş akışına bağlı (`scanpy`, `depmap`, `adaptyv`). Kurulunca hepsinin açıklaması her turda bağlamda durur.

## Core'a alınacak
- kitap: `AGENTS.md`'nin "kapsam dışı" listesi — genel mühendislik skill'i alınmaz çünkü her görevde seçim için yarışır; başka skill'lere yönlendiren orkestratör skill alınmaz çünkü tasarımı gereği hepsiyle çakışır. Core'un "hiçbir şey skill olarak kurulmaz" ilkesinin dışarıdan gerekçesi.
- fikir: ölçülmüş karşı örnek — 163 skill = ~17.5k token/tur. Core'un README'sinde sayı vererek kullanılabilecek tek somut rakam.
- hiç (kod tarafı).

## Karar
fikir notu — kütüphanenin kendisi Core'a girmez (~17.5k token/tur), ama kapsam-dışı kuralı ve bu rakam kitaba yazılır.
