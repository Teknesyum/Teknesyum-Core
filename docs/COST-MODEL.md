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
| Hook `systemMessage` on `SessionStart` / `UserPromptSubmit` | **C** | enters the model's context exactly like `additionalContext` |
| Hook `systemMessage` on a closing event | **Z** | renders in the chat, never converted into context — measured, see D13 |
| Model forced to print a banner | **C×5** | output tokens, ~5× input price, then resent as input forever |
| Statusline | **Z** | terminal only, never reaches the model |
| File on disk the model may read | **Z** until read | |

## The compounding rule

A 1,500-token injection is not 1,500 tokens. In an `n`-turn session it is
`1500 × n` carried tokens, and every subagent repeats it in its own context.
Base measured 20 agents in one turn — that is 20 repayments of the same text.

**Core law: no feature may write to `additionalContext`, and none may write
`systemMessage` on an event that converts it into context** — `SessionStart`,
`UserPromptSubmit`, `UserPromptExpansion`. The single exception is `cue.js`, under a
200-character cap, on a condition that is rare and actionable.

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

Two channels, both measured rather than assumed.

The **statusline** is the older one: terminal only, the model never sees it, and it survives
scrolling because it is not part of the transcript.

The second is **`systemMessage` on a closing event**. On `SessionStart` and
`UserPromptSubmit` the harness converts a hook's output into model context — plain stdout
and `systemMessage` alike — so a banner there is class C. On `Stop` it does not: the line
renders in the chat and the model cannot see it. Verified in a live session, and again in
the shipped binary, whose context conversion for hook output returns nothing unless the
event is `SessionStart`, `UserPromptSubmit` or `UserPromptExpansion`.

The cost of that channel is not tokens but attention. The chat renders it as
`<event> says: <text>`, with no way to change or drop the prefix, and a line that repeats
every turn stops being read. Any use must be change-gated.

`terminalSequence` also bypasses context, but the one thing it was tried for — the terminal
window title — does not exist in the desktop app. Stderr with exit 2 reaches the user and
the harness labels it a hook error, which is a lie about what happened.
