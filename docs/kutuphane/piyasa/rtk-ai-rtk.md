# rtk-ai/rtk

- Apache-2.0 · CLI (tek Rust ikilisi) · ★79470
- mekanizma: kanca yok (kullanıcı isterse Bash komutlarını yeniden yazan kendi kancasını kurar) · komut/skill/ajan/MCP yok · 100+ desteklenen komut · <10 ms ek yük
- sıradan turda bağlama: 0. Bağlama hiçbir metin yazmıyor; tersine, `ls`, `cat`, `grep`, `git status/diff/log`, `npm test`, `pytest`, `docker ps` gibi komutların *çıktısını* modele ulaşmadan sıkıştırıyor (iddia: bash çıktısının %90'ına kadarı). README kendi de uyarıyor: bu, faturanın %90'ı değil, yalnız bash çıktısının payı.
- premium: yok; Homebrew, Discord, çok dilli README.

## Ne yapar
Kabuk komutlarını araya girip çıktılarını modele göstermeden önce sıkıştıran bir vekil. `rtk gain` ile ölçülen tasarrufu, `rtk discover` ile geçmiş oturumlardaki kaçırılmış fırsatları raporluyor.

## Core'a alınacak
- fikir: `rtk gain`/`discover` deseni — aracın kendi tasarrufunu ölçüp raporlaması; Core'un `bench/` tarafında "kanca ne kadar kazandırdı" ölçümü için aynı biçim kullanılabilir.
- hayır: aracın kendisi Core'a alınmaz; kullanıcının makinesinde zaten kurulu ve genel `~/.claude/RTK.md` ile yönetiliyor, Core'un kapsamı değil.

## Karar
hayır — Core'a girecek bir parçası yok; kullanıcının makinesinde zaten kurulu, yalnız kendi kazancını ölçme deseni not edildi.
