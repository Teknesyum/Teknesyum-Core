# Base → Core triage

Every Base feature, its cost class (see `COST-MODEL.md`), and the Core verdict.
`ASK` = needs a decision before it moves.

## 1. Keep as is — zero context cost

These enforce or inform without ever entering the model's context. Highest value
per token in the whole codebase.

| Base | Class | Core |
|---|---|---|
| `contract-guard.js` — blocks writes outside a contract's owned paths | Z | keep, rename `guard.js` |
| `denetim-kaydi.js` — single-use audit seal bound to contract+turn+HEAD | Z | keep, fold into `guard.js` |
| `beep.js` (hook + script) — audio notify, bypasses OS toast | Z | keep |
| `statusline.js` | Z | keep and **expand** — becomes the only status surface |
| `bridge.js` — version-proof statusline path | Z | keep |
| `harita.js` — import graph, read instead of opening files | Z | keep, net token *saver* |
| `platform-denetim.js` — portability scan | O | keep as script |
| `contract.js`, `contract-schema.js` | Z | keep |
| `ortak.js` | Z | keep |

## 2. Cut — continuous cost, no enforcement

Every item below writes into context on ordinary turns. None of them has code-side
enforcement; they are wishes addressed to the model.

| Base | Cost | Why cut |
|---|---|---|
| `premiumNotu` (profile prose) | 838 tok/turn | model/effort already chosen by `premium.js`; text has zero authority |
| `olcu` (forces the `Ölçüm ▸` banner) | 262 tok in + output tok | statusline shows the same thing free |
| `yonlendirmeYonerge` + `Fark ▸` lines | 62 tok in + **output** tok, per turn | pure narration; log to file, statusline reads it |
| `seviye2` steering level | 233 tok | never used |
| `kapsayiciEtkin` + `kapsayici.js` | 120 tok + a hook | works around our own rule; Core requires project root |
| `ecoNotu` | 106 tok | measured effect between profiles: 8 tokens |
| `platformNotu` | 100 tok/session | one-time question paid every session |
| `gunlukProseduru` | 82 tok | the procedure is already in the skill body |
| `dugmeSapma` | 100 tok/turn | duplicates the profile note |
| `dil.js` (82-key translation table, 39 KB) | maintenance | Core is English-only; see `COST-MODEL.md` §Language |

**Removed from a normal turn: ~1,900 tokens of input plus the forced output lines,
compounding over every turn and every subagent.**

### Dropped after the port started

| Base | Why |
|---|---|
| `ekran-kapisi.js` — desktop access gate | its only unlock was the `/ekran` command; with no command surface the gate becomes a permanent lock |

## 3. Out of scope — different project

| Base | Goes to |
|---|---|
| `teknesyum-ui` skill (60 KB SKILL.md + 8 references + 18 assets) | Teknesyum-UI |
| `ui-builder` agent | Teknesyum-UI |
| `/uisetup`, `/uicheckup`, `uicheckup.js`, `uicheckup-apply.js` | Teknesyum-UI |
| `graphify` | already separate |

## 4. Resolved — see `DECISIONS.md`

| # | Base | Verdict |
|---|---|---|
| A1 | auditor agent | deterministic `verify:` gate primary; auditor role only on hook-computed `risk: high` (D1) |
| A2 | plan council | dropped as a standing step; a single advisor pass covers the same node |
| A3 | relay protocol 110 KB | one `SKILL.md`, 120–150 lines, English, no references (D2) |
| A4 | 16 commands / 7 agents | 0 commands, 1 skill, 1 generic agent, roles on disk (D3) |
| A5 | `/rc`, `/rcall`, `/rcadvanced` | out of Core |
| A6 | `/pusla` + `ozel.js` | out of Core; the private repo is asked once during setup and stored in `~/.claude/teknesyum.json` |
| A7 | `/save`, `/load`, `/saveall`, `/loadall` | out of Core |
| A8 | `/scan` + `tarama.js` | out of Core |

Nothing here is deleted from Base; these move to a companion plugin if they are ever
wanted again.

## 5. Naming rules for Core

- English, everywhere, including file names and any surviving code comment.
- A description is the shortest string that makes the model pick correctly.
  Target: ≤ 15 words.
- No rationale in descriptions. Rationale lives in `docs/`.
- No sentence in a hook payload that the statusline could show instead.
