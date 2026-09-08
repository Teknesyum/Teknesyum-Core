# contains-studio/agents

- lisans yok · kurulum bicimi: ajan catisi (dosyalar `~/.claude/agents/` icine kopyalanir) · ★12410
- mekanizma: 37 ajan .md, kanca 0, komut 0, skill 0, MCP 0; kurulum "cp -r agents/* ~/.claude/agents/"
- sıradan turda bağlama: ~60 KB / ~15k token — depo 283 KB; ajan tanimlari her turda yuklenir, orneklem `rapid-prototyper` yalniz `description` alaninda 2 KB (uc `<example>` blogu icinde)
- premium: yok

## Ne yapar
Tasarim/muhendislik/pazarlama/urun bolumlerine ayrilmis hazir alt-ajan tanimlari. Her dosya bir uzmanlik
rolu; Claude Code tanimlari otomatik esleyip cagiriyor. Ajanlar arasi tutarlilik yok — bir kismi
frontmatter'li (rapid-prototyper), bir kismi duz baslikli (growth-hacker), yani yarisi hic yuklenmiyor.

## Core'a alınacak
- fikir: karsi-ornek olarak olculmus rakam — 37 ajan = her turda ~15k token; Core'un "sıradan turda sifir" ilkesinin somut gerekcesi, `docs/` icinde tek satirlik olgu olarak durur.
- hic: ajan metinlerinin kendisi (rol oyunculugu agirlikli, mekanizma yok).

## Karar
hayır — Core'un ilkesinin tam tersi: 37 dosyanin tamami surekli baglamda, mekanizma olarak alinacak parca yok.
