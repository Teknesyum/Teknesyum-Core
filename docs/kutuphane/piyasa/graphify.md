# Graphify-Labs/graphify

- Apache-2.0 (+ LICENSE-MIT) · CLI · ★115947
- mekanizma: 0 kanca, 0 komut, 0 skill, 0 MCP; kurulum yüzeyi 419 B'lik `AGENTS.md` ve `graphify-out/` çıktısı
- sıradan turda bağlama: AGENTS.md 419 B (~105 token) — kurulan tek şey bu; grafik ancak sorulunca okunuyor
- premium: graphify.com barındırılan hizmet

## Ne yapar
Kod tabanını, dokümanlarını, SQL şemalarını ve PDF'lerini sorgulanabilir bir bilgi grafiğine çevirir. `graphify update .` AST-only, API maliyeti yok. Core zaten kullanıyor (kullanıcı CLAUDE.md'sinde kayıtlı).

## Core'a alınacak
- kitap: AGENTS.md'nin 7 satırlık sözleşmesi — "mimari soruya cevap vermeden önce GRAPH_REPORT.md'yi oku, wiki varsa ham dosya yerine onu gez, oturum sonunda `graphify update .` çalıştır". 105 token'a bir davranış değişikliği; Core'un AGENTS.md standardı için örnek ölçü.
- fikir: pahalı indeksi bir kez üret, sonra bağlama indeks özetini değil sorgu sonucunu al — Core'un pasif raf mantığının kod tabanı karşılığı.
- hiç: CLI'nin kendisi Core'a girmez, dışarıda kalır.

## Karar
Al · 419 B'lik AGENTS.md sözleşmesi Core'un "her klasörde ≤20 satır yönlendirici" kuralının ölçülmüş kanıtı.
