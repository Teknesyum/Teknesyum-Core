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

Three channels, all measured rather than assumed.

**`MessageDisplay` `displayContent`** is the one the plugin uses. The event fires as an
assistant message streams; answering it replaces what is drawn on screen. The binary states
the guarantee itself: *"Display-only: the stored message and what the model sees are
untouched."* `notice.js` answers only the `final` flush and appends one line. Zero tokens,
one hook run per message, ~43 ms of node startup — against the ~1.3 s `watch.js` already
spends per turn across twenty tool calls.

**The statusline** is terminal-only. The desktop app draws its own React UI from the CLI's
stream and never renders the Ink statusline component, so this channel does not exist for
desktop users.

**`systemMessage`** is free on every event — the attachment→API table maps
`hook_system_message` to nothing, with no event gate, and the compaction summariser reads
the same normalisation. But the CLI bakes `hookName + " says: "` into the content before it
leaves, and the desktop client wraps it in a collapsed "Claude Code notice" chip that no
hook input can open. Free, and nearly unreadable.

Not channels, though they look like ones: `terminalSequence` (OSC only — a window title
the desktop app does not have), `statusMessage` (Ink spinner only), `taskDecorations`
(Ink only, fed by a user setting), `sessionNoticesPoll` (injects into model context),
`pluginMonitors` (disabled in the capability map), and tool-call chips (the `description`
is model output and the `tool_use` block is resent every turn).
