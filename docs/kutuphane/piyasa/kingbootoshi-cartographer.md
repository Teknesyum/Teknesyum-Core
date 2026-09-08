# kingbootoshi/cartographer

- lisans belirtilmemiş (repo kökünde LICENSE yok; eklenti alt klasöründe var) · CLI (bun) + plugin · ★680
- mekanizma: 1 skill (SKILL.md 8.976 B + `scan-codebase.py` 14.714 B), kanca 0, komut 0, ajan 0, MCP 1 (stdio sarmalayıcı, 10 araç)
- sıradan turda bağlama: skill frontmatter ~470 B (~120 token); gövde yalnız tetiklenince. CLI tarafı Claude Code'a hiç girmiyor
- premium: yok

## Ne yapar
Depoyu yerel bir SQLite grafına indeksliyor (`.cartographer/graph.sqlite` + `CODEBASE_MAP.md`), sonra dosya okutmak yerine sınırlı "brief"ler derliyor: bir yol, paket, sembol, env değişkeni ya da değişen dosyalar etrafında. Ayrıca kaldırma/eksiklik denetimi, kanıta bağlı not defteri ve ajanın graf bağlamını gerçekten kullanıp kullanmadığını puanlayan `adoption` komutu var.

## Core'a alınacak
- **fikir**: "bounded brief" kavramı — grafı ajana açmak yerine soruya göre sınırlı bir özet derlemek. Core'un `map.js`'i bugün düz import haritası çıkarıyor; brief katmanı doğal devamı.
- **fikir**: `adoption` — ajanın düzenlemeden önce bağlamı okuyup okumadığını çalışma izinden puanlama. Core'un bench'ine ölçüt olur.
- **fikir**: artefaktın dosya-hash önbelleğiyle artımlı yenilenmesi (`--force`/`--no-incremental`); `map.js` her seferinde baştan tarıyor.
- Not: Core zaten `graphify` kullanıyor; bu depo ondan bağımsız ikinci uygulama.

## Karar
Fikir notu — `map.js` için brief ve artımlı önbellek fikirleri alınır, kod/MCP alınmaz.
