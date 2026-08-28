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
| Hook `systemMessage` | **C** | not a display channel: measured at `SessionStart`, it enters the model's context exactly like `additionalContext`, and it interrupts the user as well |
| Model forced to print a banner | **C×5** | output tokens, ~5× input price, then resent as input forever |
| Statusline | **Z** | terminal only, never reaches the model |
| File on disk the model may read | **Z** until read | |

## The compounding rule

A 1,500-token injection is not 1,500 tokens. In an `n`-turn session it is
`1500 × n` carried tokens, and every subagent repeats it in its own context.
Base measured 20 agents in one turn — that is 20 repayments of the same text.

**Core law: no feature may write to `additionalContext` or `systemMessage` at all.**
The two are one mechanism, not two — whatever reaches the model on an event, both reach it.
The single exception is `cue.js`, under a 200-character cap, on a condition that is rare
and actionable.

Two events are not ordinary turns. `cue.js` owns both and is the only hook allowed to
write context at all:

| Event | Fires | Writes when | Cost |
|---|---|---|---|
| `SessionStart` | once per session, including the one that resumes after compaction (`source: "compact"`) | open contracts or an unended, unstale live record exist | ~25 tok, **S** |
| `UserPromptSubmit` | every turn | the prompt matches the bug-log phrase | 0 on every other turn, **Z→O** |

`PostCompact` was registered and is not any more. The event fires, but plain stdout reaches
the model on `SessionStart`, `UserPromptSubmit` and `UserPromptExpansion` only; anywhere
else it goes to the debug log. `SessionStart` already fires after compaction, so the branch
was dead weight pretending to be a feature.

A cue carries pointers only — contract IDs and a path. Goal, acceptance and route text
never enter it; the model opens the file itself if it needs the body (**O**).

## What reaches the user without reaching the model

There is exactly one such channel, and it is not a hook: the **statusline**. Everything a
hook prints on `SessionStart` — plain stdout and `systemMessage` alike — is added to the
model's context; this was checked against the hook reference, not assumed. `terminalSequence`
does bypass context but is documented for a bell, a window title and a desktop notification,
not for lines of text, and is not documented for `SessionStart` at all. Stderr with exit 2
reaches the user but the harness labels it a hook error, which is a lie about what happened.

So anything meant for the user's eyes goes to the statusline or to a file the user opens.
A session-opening banner was designed, costed and rejected on this ground: it would have
been a second `SessionStart` context write carrying facts `cue.js` already carries.

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
| `cue.js` on an ordinary turn | Z | **0** — asserted by `test/all.js` |
| `cue.js` at session start / after compaction | S | ~25 tok, capped at 200 chars |

Always-on: **~45 tokens per context.** Base measured ~1,211 plus ~1,500 per turn of
injection. The per-turn figure is the one that compounded; it is now zero by construction,
and `test/all.js` fails if any hook reintroduces `additionalContext` or `systemMessage`.
