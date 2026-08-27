# Cost model

Where tokens actually go in Claude Code. Every Core decision cites a row here.

## Classes

| Class | Paid | Cached | Stays in transcript | Verdict |
|---|---|---|---|---|
| **S** setup | once per context | yes | n/a | cheap, accept |
| **O** on demand | only when the feature runs | no | yes, that turn | accept if the turn earns it |
| **C** continuous | every message | no | **yes, resent forever** | reject |
| **Z** zero | never enters context | n/a | no | free, prefer |

## Mechanisms

| Mechanism | Class | Note |
|---|---|---|
| Command name + description | S | body loads only on invoke |
| Command body | O | |
| Agent description | S | one line each, 7 agents ≈ 950 tok |
| Skill name + description | S | |
| Skill body (`SKILL.md`) | O | stays in transcript after load |
| Skill `references/*` | O | loaded only when the body points there |
| MCP tool schema | S | deferred schemas cost a name only |
| Hook exit code / block reason | Z→O | blocking text is paid once, only on a real block |
| Hook `additionalContext` | **C** | worst case: written per turn **and** resent in every later request |
| Hook `systemMessage` | **C** | same |
| Model forced to print a banner | **C×5** | output tokens, ~5× input price, then resent as input forever |
| Statusline | **Z** | terminal only, never reaches the model |
| File on disk the model may read | **Z** until read | |

## The compounding rule

A 1,500-token injection is not 1,500 tokens. In an `n`-turn session it is
`1500 × n` carried tokens, and every subagent repeats it in its own context.
Base measured 20 agents in one turn — that is 20 repayments of the same text.

**Core law: no feature may write to `additionalContext` or `systemMessage` on a
normal turn.** Allowed only on a condition that is rare and actionable, and then
it must be under 200 characters.

## Where each need goes instead

| Need | Base did | Core does |
|---|---|---|
| Show state (profile, contracts, agents) | inject text | statusline (**Z**) |
| Teach doctrine (protocol, thresholds) | inject reminders | skill body, read once (**O**) |
| Enforce a rule | ask the model nicely | hook that blocks with an exit code (**Z**) |
| Prove work happened | make the model print banners | write to a log file, statusline reads it (**Z**) |
| Carry state across turns | re-inject | file on disk, read on demand (**Z**) |

## Language

All artifacts are English. Rationale: tokenizer density (Turkish inflection splits
into 2–4 tokens per word; English averages ~1.3) plus training-distribution match.
Expect ~35–45% fewer tokens for identical meaning, and fewer misreadings.
User-facing chat stays Turkish — that text is written once and is not a plugin asset.

## Measured — Core 0.1.0

| Item | Class | Cost |
|---|---|---|
| `relay` skill name + description | S | ~25 tok, once per context |
| `worker` agent name + description | S | ~20 tok, once per context |
| commands | — | none exist |
| hook injection on an ordinary turn | C | **0** — asserted by `test/all.js` |
| forced banner output | C | **0** — no rule asks for one |
| `SKILL.md` body when relay is invoked | O | ~950 tok, once |
| role file when an agent holds that role | O | 130–320 tok, once per agent |
| statusline | Z | 0 |

Always-on: **~45 tokens per context.** Base measured ~1,211 plus ~1,500 per turn of
injection. The per-turn figure is the one that compounded; it is now zero by construction,
and `test/all.js` fails if any hook reintroduces `additionalContext` or `systemMessage`.
