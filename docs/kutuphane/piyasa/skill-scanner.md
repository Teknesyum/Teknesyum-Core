# cisco-ai-defense/skill-scanner

- Apache-2.0 · bağımsız CLI (pip/PyPI `cisco-ai-skill-scanner`) · ★2509
- mekanizma: 0 kanca / 0 komut / 0 skill / 0 MCP — Claude Code'a hiç kurulmuyor; pattern (YAML + YARA-X), AST + dataflow, opsiyonel LLM-yargıç, cel-go v0.32.0 karar katmanı; SARIF çıktısı, pre-commit kancası, GitHub Action
- sıradan turda bağlama: 0 B — model bağlamına hiçbir şey yazmıyor, terminalde çalışan denetçi
- premium: yok (Cisco AI Defense ürününe köprü var)

## Ne yapar
Üçüncü taraf Agent Skill paketlerini istem enjeksiyonu, veri sızdırma ve zararlı kod kalıplarına karşı tarar. Kendi ölçümünü açıkça yayımlıyor: geliştirme kıyasında F1 %32,92'den %47,73'e, geri çağırma %19,88'den %31,43'e; kaynak-ayrık bölmede F1 yalnız %13,74 ve terfi kapısını geçemediği için tüm CEL kuralları "gölge" modda bırakılmış. "Bulgu yok, risk yok demek değildir" uyarısı README'nin başında.

## Core'a alınacak
- pasif betik: kütüphaneye yeni raf metni ya da dış eklenti alınmadan önce tek satırlık tarama (`npx`/`pipx` ile, kurulumsuz); Core zaten dış depoları okuyup emiyor, kapı burada eksik.
- kitap: dış metin emme kontrol listesi — enjeksiyon kalıpları, veri sızdırma çağrıları, gizli talimat; raf sayfası olarak taranan kalıp aileleri.
- fikir: kendi ölçüsünü terfi kapısına bağlama ("gate'i geçmeyen kural gölgede kalır") — Core'un bench/rapor.md eşiği için doğrudan uygulanabilir kural.

## Karar
Al — turda 0 B, tamamen kurulum dışı; Core'un kütüphaneye dış metin alma adımında eksik olan deterministik kapıyı kapatıyor.
