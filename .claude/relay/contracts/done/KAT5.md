---
result: unmet
id: KAT5
status: done
round: 1
lang: tr
role: builder
tier: sonnet/low
owns:
  - bench/kosu6/m-5/src/click/__init__.py
  - bench/kosu6/m-5/src/click/_compat.py
  - bench/kosu6/m-5/src/click/_termui_impl.py
  - bench/kosu6/m-5/src/click/_textwrap.py
  - bench/kosu6/m-5/src/click/_utils.py
  - bench/kosu6/m-5/src/click/_winconsole.py
  - bench/kosu6/m-5/src/click/core.py
  - bench/kosu6/m-5/src/click/decorators.py
  - bench/kosu6/m-5/src/click/exceptions.py
  - bench/kosu6/m-5/src/click/formatting.py
  - bench/kosu6/m-5/src/click/globals.py
  - bench/kosu6/m-5/src/click/parser.py
  - bench/kosu6/m-5/src/click/shell_completion.py
  - bench/kosu6/m-5/src/click/termui.py
  - bench/kosu6/m-5/src/click/testing.py
  - bench/kosu6/m-5/src/click/types.py
  - bench/kosu6/m-5/src/click/utils.py
verify:
  - bash bench/gorevler/02-click.kabul.sh bench/kosu6/m-5
---

## Goal
Prompt'taki dondurulmus gorev metni. Bu sozlesme yalnizca kapiyi, owns sinirini ve kabul betigini devreye sokar.

## Acceptance
Gorev metnindeki olcutlerle ayni; verify adimi kabul betiginin kendisidir.

## Closed - unmet (2026-09-05)

Katlanmis akis olcumu: kanca kapanisi kostu, submit 0, complete 17 dosyalik owns yuksek risk sayip denetci istedi. Kabul betigi bagimsiz PASS. Olcum bench/katlama-kol-maliyet.jsonl.

Not sealed. Acceptance was not met; the work stays in the tree.
