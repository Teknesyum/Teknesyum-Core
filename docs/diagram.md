# Diagrams — decided once

The README convention says to ask which diagram a repository needs and never ask again.
Asked on 2026-08-29; this file is the answer.

## Banner — `assets/banner.svg` + `assets/banner.tr.svg`

Three things in one plate, in this order of weight:

1. The name and a single line saying what it is. This carries the emphasis.
2. The real banner line the plugin prints into the chat, verbatim, so a visitor sees the
   product's own output in the first second.
3. A light architecture hint — hooks, gate, roles — small enough not to compete.

## Flow — three separate figures, one per section

- `assets/flow-contract.svg` — a contract's life: `open → active → submitted → done`, the
  gate running the verify commands, risk computed from the diff, an audit record demanded
  at high risk, and the rejection path back to `active`.
- `assets/flow-cost.svg` — one turn through the hooks, and what each writes into the
  model's context. Classes S, O, C, Z. The claim of the project is that the per-turn column
  is empty; the figure has to show that emptiness.
- `assets/flow-agents.svg` — t0 splits work into contracts, each role resolves its cell
  from the tier table, agents run in parallel and leave a `live/` record, and the advisor
  opens one rung above whoever asked.

## Rules that apply to all of them

Palette is the one already in `assets/badge-*.svg` — plate `#0a0a0c`, cyan `#00f3ff`,
violet `#b026ff`, white text, Segoe UI for prose and Consolas for code. Nothing invented:
a dark plate carries its own background, so the figures read the same in either GitHub
theme.

Alt text is a full descriptive sentence naming every stage in order.

## One set per language

Every figure ships twice: `<figure>.svg` for `README.md` and `<figure>.tr.svg` for
`README.tr.md`, with every word inside translated. A figure whose labels are in the other
language is a figure half the readers cannot read.

Labels inside a figure are signage, not sentences: every word starts with a capital.
Turkish needs the dotted İ, so `İşçi`, never `Işci`.

Both sets are generated from one script rather than hand-drawn twice — the geometry is
shared, only the strings differ.
