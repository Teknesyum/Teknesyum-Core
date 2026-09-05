# Cost model

Where tokens actually go in Claude Code. Every Core decision cites a row here.

## Audited scope (2026-09-03)

"Zero continuous tokens" means **no routine banner/status payload added to model
context**, not zero total plugin cost. Agent/skill metadata, loaded instructions,
tool results, actionable cues and blocked calls still contribute. Repeated work
and model routing can dominate these savings. See the
[VidShrink audit](raporlar/2026-09-03-vidshrink-denetim.md) for measured usage and limits.

## Measured: what the relay itself costs (2026-09-05)

The claim above is about context injection, not about the relay being free. Both halves have
now been measured on a real task (`pallets/click` bugfix, `sonnet/low`, three repeats each).

**Context injection is zero.** All four context hooks - `UserPromptSubmit`, `SessionStart`,
`Stop`, `MessageDisplay` - were run against a live session payload and each returned zero
bytes. Nothing reaches the model on an ordinary turn.

**The gate itself is free too, once the agent never touches the contract.** Binding is
established at dispatch from the contract path in the prompt, so the agent needs no write of
its own. With the identical task text on both sides:

| Arm | Turns (median) | Agent cost (median) |
|---|---|---|
| no contract | 11 | $0.1079 |
| under contract, agent writes it once | 12 | $0.1292 |
| under contract, agent never touches it | 10 | $0.1047 |

The last row sits 2.9% *below* the contract-less arm and the ranges overlap, so the gate has
no measurable cost. Two caveats hold: one task, three repeats, one seat; and the cost of the
coordinator running the relay is a separate line item, roughly 85% of the total in that
measurement and not yet split by phase. Detail:
[pilot bench result](raporlar/2026-09-05-pilot-bench-sonuc.md).

**Later the same day, after the fold.** The contract now travels inside the dispatch prompt
and the close runs on SubagentStop, so the coordinator spends no turn writing or closing a
contract. Six more runs of the same task, same text, against three contract-less runs: agent
cost +16% by median and +21% by mean, coordinator turns 1 per run against 2. The first three
of those runs did not seal - the risk rule counted the 17-file `owns` set instead of the diff
and asked for an auditor; the rule was changed to count changed files and the last three sealed
from the hook, `done/` reached with no coordinator write. The +16% is not resolved: the six
Core runs spread from $0.08 to $0.17 on an identical prompt, wider than the gap between the
arms, and n=3 against n=6 cannot see a 5% difference. About twenty runs per arm (~$25) would.
Details and the pre-registered thresholds, both of them, in the
[operation result](raporlar/2026-09-05-ameliyat-sonuc.md).

Two rules follow, and both are load-bearing: give every arm the same task text, and never ask
an agent to write its own contract to become bound.

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
