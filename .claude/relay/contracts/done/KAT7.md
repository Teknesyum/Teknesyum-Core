---
result: passed
id: KAT7
status: done
round: 1
lang: tr
role: builder
tier: sonnet/low
owns:
  - bench/kosu6/m-7/src/click/__init__.py
  - bench/kosu6/m-7/src/click/_compat.py
  - bench/kosu6/m-7/src/click/_termui_impl.py
  - bench/kosu6/m-7/src/click/_textwrap.py
  - bench/kosu6/m-7/src/click/_utils.py
  - bench/kosu6/m-7/src/click/_winconsole.py
  - bench/kosu6/m-7/src/click/core.py
  - bench/kosu6/m-7/src/click/decorators.py
  - bench/kosu6/m-7/src/click/exceptions.py
  - bench/kosu6/m-7/src/click/formatting.py
  - bench/kosu6/m-7/src/click/globals.py
  - bench/kosu6/m-7/src/click/parser.py
  - bench/kosu6/m-7/src/click/shell_completion.py
  - bench/kosu6/m-7/src/click/termui.py
  - bench/kosu6/m-7/src/click/testing.py
  - bench/kosu6/m-7/src/click/types.py
  - bench/kosu6/m-7/src/click/utils.py
verify:
  - bash bench/gorevler/02-click.kabul.sh bench/kosu6/m-7
---

## Goal
Prompt'taki dondurulmus gorev metni. Bu sozlesme yalnizca kapiyi, owns sinirini ve kabul betigini devreye sokar.

## Acceptance
Gorev metnindeki olcutlerle ayni; verify adimi kabul betiginin kendisidir.
