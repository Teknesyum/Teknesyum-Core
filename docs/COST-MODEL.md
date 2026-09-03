# Cost model

Where tokens actually go in Claude Code. Every Core decision cites a row here.

## Audited scope (2026-09-03)

"Zero continuous tokens" means **no routine banner/status payload added to model
context**, not zero total plugin cost. Agent/skill metadata, loaded instructions,
tool results, actionable cues and blocked calls still contribute. Repeated work
and model routing can dominate these savings. See the
[VidShrink audit](raporlar/2026-09-03-vidshrink-denetim.md) for measured usage and limits.

## Classes

| Class | Paid | Cached | Stays in transcript | Verdict |
|---|---|---|---|---|
| **S** setup | once per context | yes | n/a | cheap, accept |
| **O** on demand | when invoked and while retained in later context | may be cached | until compacted/removed | accept if worthwhile |
| **C** continuous | recurring injection and retained context | may be cached | bounded by context management | avoid routine injection |
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
| Hook exit code / block reason | Z→O | exit code is not text; model-visible reasons can remain in later context |
| Hook `additionalContext` | **C** | worst case: written per turn **and** resent in every later request |
| Hook `systemMessage` | event/version dependent | do not equate it with `additionalContext` or assume it is always free |
| Model forced to print a banner | **C** | output charge plus subsequent retained-input charge; model/cache dependent |
| Statusline | **Z** | terminal only, never reaches the model |
| File on disk the model may read | **Z** until read | |

## The compounding rule

A single 1,500-token insertion carried through `n` requests contributes up to
`1500 × n` input tokens before compaction. A fresh 1,500-token insertion on every
request contributes `1500 × n × (n+1) / 2` under the same retention assumption.
Neither expression is a dollar bill: cache writes, cache reads and ordinary input
have different prices. Subagent context composition must be measured separately.

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

Three channels, all measured rather than assumed.

**`MessageDisplay` `displayContent`** is the one the plugin uses. The event fires as an
assistant message streams; answering it replaces what is drawn on screen. The binary states
the guarantee itself: *"Display-only: the stored message and what the model sees are
untouched."* `notice.js` answers the first and last flush, framing the message with one line. Zero tokens,
one hook run per message, ~43 ms of node startup — against the ~1.3 s `watch.js` already
spends per turn across twenty tool calls.

**The statusline** is terminal-only. The desktop app draws its own React UI from the CLI's
stream and never renders the Ink statusline component, so this channel does not exist for
desktop users.

**`systemMessage`** is not universally free. Current documentation describes
event-specific routing, including asynchronous hook output delivered as context.
The earlier binary observation supports only its tested build and event. It cannot
prove a universal guarantee. `MessageDisplay` replacement is documented as
display-only; node startup and hook execution still have wall-clock/CPU costs.

Sources: [hook output and event reference](https://code.claude.com/docs/en/hooks),
[current token/cache pricing](https://platform.claude.com/docs/en/about-claude/pricing),
[subscription versus API cost](https://code.claude.com/docs/en/costs).

Not channels, though they look like ones: `terminalSequence` (OSC only — a window title
the desktop app does not have), `statusMessage` (Ink spinner only), `taskDecorations`
(Ink only, fed by a user setting), `sessionNoticesPoll` (injects into model context),
`pluginMonitors` (disabled in the capability map), and tool-call chips (the `description`
is model output and the `tool_use` block is resent every turn).
