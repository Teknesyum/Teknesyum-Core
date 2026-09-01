# Core decisions

Locked after the 2026-08-27 triage. Each entry: decision, cost class, rationale.
Second opinion on all four came from a Fable advisor pass; dissent is recorded.

---

## D1 — Completion gate

**Deterministic first, agent only on high risk.**

- A contract carries `verify:` — shell commands with expected exit codes, plus
  grep/path assertions. A Stop-hook runs them. Class **Z**: no context cost.
- Risk is computed by the hook, not declared by the model: touched path globs
  (auth, migrations, hooks, build config), diff line count, new dependencies.
- The model may raise risk `low → high`. It may never lower it.
- The `auditor` role opens only on `risk: high`.

Rationale: of the 4 defects Base's auditor caught, 2 were "the agent said done, the
code disagrees" — exactly the class a command + exit code catches, cheaper and more
reliably. The other 2 were semantic; that is why the auditor role survives.

*Fable's catch, accepted:* if the model declares its own risk, the party saying "done"
is the party saying "low risk". Hence risk comes from signals, not from a claim.

---

## D2 — Doctrine size

**One `SKILL.md`, English, 120–150 lines. No `references/`.**

Delete everything the model already does by default. Keep only:

1. File schemas — contract fields, return-block shape. Given as **one filled example**,
   not prose.
2. Ownership boundary (`owns:`) and the completion gate.
3. Thresholds and concrete values (delegate at N, profile knob values, paths).
4. Rules that run **against** the model's default (e.g. "T0 never writes code").
5. A `Precedence` block, 3–5 lines: which rule wins when two collide.

Anything pointing the same way as the model's default is cut. Anything already in
the user's `CLAUDE.md` is cut — paying for it twice is the definition of waste.

*Fable's catch, accepted:* the risk of cutting is not lost behaviour, it is lost
tie-breaking. Precedence block is mandatory.

---

## D3 — Surface

**Zero slash commands. One skill. One agent type.**

| Base | Core |
|---|---|
| 16 commands (~700 tok/session) | none |
| 7 agent definitions (~950 tok/session, **repaid inside every subagent**) | 1 generic agent (~150 tok) |
| skill descriptions ×2 | 1 skill — the only entry point |

Roles (`planner`, `builder`, `auditor`, `advisor`, `scout`) live as files under
`roles/`. The caller writes the role's **path** into the agent prompt; the agent reads
it. Cost moves from **S paid in every context** to **O paid once per agent that
actually holds that role** — and role selection stops being a guess, because the
caller names it.

Why one skill survives: a hook can enforce and a statusline can display, but neither
can *start* a behaviour — the model never opens a disk file it was not pointed at.
One entry point is the minimum that makes the plugin do anything at all.

---

## D4 — Setup

**`setup.js` does the work. The model only interviews.**

- Dual mode via `process.stdin.isTTY`:
  - user's own terminal → the script asks its own questions, **zero tokens**;
  - inside Claude Code (no TTY) → `--check` prints JSON of what is missing, the model
    asks those questions in one message, then calls `--apply` with flags.
- Everything deterministic stays in the script: file writes, `settings.json` wiring,
  statusline bridge, repo clone, platform checks.
- Persistent output: `~/.claude/teknesyum.json` + `settings.json`. Read afterwards by
  the statusline and the hooks — class **Z**, never by the model.
- The private-repo question is asked during setup and stored there.
- README ships both paths, terminal one recommended.

The pasted README text must be **instructions with no interpretation left open** —
"run this, ask these, call that with these flags" — because a model rewriting
`settings.json` from a description will not produce the same file twice.

---

## D5 — Closing the bypasses

A Fable review of the built Core found three holes. All three are closed.

**`audits/` and `live/` were writable.** An agent could compose its own passing audit
record with `Write` and complete a high-risk contract unaudited. Both directories now
refuse Write, Edit and the shell. The record is produced by

```bash
node <P>/scripts/contract.js audit --id T7 --run-id <agent> --verification "..."
```

which computes `headSha`, `diffHash` and `owns` itself. The auditor supplies only what it
observed, and cannot supply what it would need to forge.

**`verify:` reached into the gate.** A verify step is shell, so a step could move a file
into `done/` or call `contract.js`. Steps touching `done/`, `audits/`, `live/` or
`contract.js` are now refused before anything runs.

**Nothing enforced `owns:`.** Base did not enforce it either — the earlier claim in
`TRIAGE.md` that it did was wrong. An agent binds to the first contract it edits; after
that, writes outside that contract's `owns` are blocked. A session with no binding is
unaffected, so the main loop is never restricted.

`GIT_READ` was also renamed `GIT_SAFE`: it contains `add`, `commit` and `push`, which are
not reads. They stay — none can place a file into `done/` — but the name lied.

---

## D6 — Personal conventions, off by default

The author's standing conventions — license choice, README shape, signature block — are
personal, not part of the plugin. They live in `~/.claude/teknesyum/prefs.md`, mirrored to
a private repository, never in a published tree.

A `PreToolUse` hook watches Write and Edit. If `prefs.json` does not exist it exits
immediately, so for every other user the feature does not exist. If it does, and a README
or LICENSE is written without the conventions it lists, the hook blocks once and names the
file to read.

The condition is on **content**, not on the filename — a filename condition would block the
corrected write too and loop forever. A per-session counter caps it at two blocks per file,
so a genuine disagreement stops the gate rather than the work.

Cost: zero on an ordinary turn, one block message when it actually fires.

---

## D7 — Constants are written by a script, not by the model

A token audit of D6 found the gate itself cheap and the thing it guards expensive. Blocking
a bad README costs one message; making the model *produce* the license text costs 8–10k
output tokens at output prices, every repository, forever. The same holds for the signature
block, the badge SVGs and the language link — text that never varies between projects.

So they left the model's output path. `scripts/scaffold.js` writes them:

```
license [--spdx <id>]   copy the license text, set the license field
signature [--file F]    append the signature block, copy its assets
langlink                link README.md and README.tr.md to each other
```

`prefs.md` also split into one file per subject with a `doc` field on each rule, so writing
a README no longer loads the license rules. The diagram question became an `ask` line: the
hook asks once, the answer is written to `docs/diagram.md` in the repository, and it never
asks again there.

What the model still writes is the part that differs per project — the prose.

---

## D8 — Model tiering

**The cell is data. Signals raise it, the profile caps it, and three roles are exempt from
the cap. Nothing lowers it.**

A single base per role was too coarse: the same builder is waste on a rename and too thin on
a refactor, and the user's profile should move the whole grid, not clip its top. So the tier
became a table of cells, `core/tiers.json`, resolved in one place:

```bash
node <P>/scripts/contract.js tier --role builder --profile eco --id T7
```

Cell is `model/effort`. Bold cells pierce the profile ceiling.

| Row | eco | normal | premium |
|---|---|---|---|
| T0 (advice only, not forced) | sonnet | opus | opus |
| planner | sonnet/medium | opus/medium | opus/high |
| builder | sonnet/low | sonnet/medium | opus/medium |
| ui-builder | sonnet/low | sonnet/medium | opus/medium |
| scribe | haiku/low | haiku/low | sonnet/low |
| scout | haiku/low | sonnet/low | sonnet/medium |
| auditor | **opus/medium** | opus/medium | opus/high |
| advisor | **opus/medium** | off | **fable/medium** |

The advisor cell is a fallback. When the asker names its own model, `advisorLadder`
decides instead, and the ladder is the real rule: **the advisor is one rung above the
asker.** Sonnet asks, opus answers; opus asks, fable answers. Effort is `medium` by
default and T0 lifts it to `high` when the question earns it.

**Normal runs no advisor.** Its T0 is opus, so the rung above is fable, and the standard
plan carries no fable credit. Rather than sell a cheaper opinion that is no opinion, the
cell says `off`: `contract.js tier` exits 2 and names the profile. The question goes to
the user or the profile goes up.

Search subagents are not roles: `haiku/low` in every profile, fixed.

**The council is retired.** It ran N planners on one question, blind to each other, and it
was never once convened. The user's reading, accepted: T0 is opus and already thinks about
the question; a second opus planner is that same thought a second time, at full price. What
widens the view is a *different* model, and that is exactly what the advisor already is.
One mechanism instead of two. `council`, `councilMemberOverride`, `contract.js council` and
the whole member table are gone.

**Four signals, on top of the risk gate.** All four are computed, never declared:

1. The same verify step failed twice with the same signature → `effort` +1; a third time
   → `model` +1. The run of consecutive failures is counted by the `PostToolUseFailure`
   hook into `live/_tally.json`; `contract.js tier` reads it when `--repeat-fail` is
   absent, and the banner shows it from two upward. No one has to remember to count.
2. `round >= 3` → the builder's model +1.
3. `round >= 4` → the advisor opens **before** the next attempt.
4. An irreversible operation — migration, release, history rewrite, detected by
   `risk.js` from the owned paths and the verify commands — opens the auditor whatever
   the profile says.

**Why the ceiling is pierced.** The profile is a budget, and a budget that silently buys a
weaker auditor is not saving money, it is removing the check that the money was spent well.
Every role the risk gate opens is therefore exempt from the ceiling: `auditor`, `advisor`,
and a `builder`/`ui-builder` that a signal has raised. On eco a risk-raised builder goes to
opus; it does not stop at `sonnet/high`. The user decided this: eco is for ordinary work,
and work that tripped the gate is not ordinary work.

**Advisor is exempt outright.** A second opinion that is cheaper than the first opinion is
not a second opinion. Eco opens opus like everyone else.

**The advisor must run above the asker, never beside it.** A model cannot give itself a
second opinion, and one of equal rank is a coin toss. This began as `advisorModelGap`, a
*block*: same model, advisor refused to open, exit code 2. That was the wrong shape — it
punished the asker for a table entry it did not choose. `advisorLadder` replaces it: the
resolver reads the asker's model and returns the rung above. The block survives for the
one case the ladder cannot answer — a profile that does not carry the rung at all.

**No gate on the advisor.** The four signals below open it on their own, but they are not
conditions of entry. Wanting a second opinion is reason enough, and the role file says so:
the list is a reminder of the moments that are easy to walk past, not a permission slip.
The gate was built to make asking *easier*, and a list read as a whitelist does the
opposite.

**Blinding.** The advisor is given the contract's Goal and Acceptance, the raw evidence and
the file paths. It is not given the draft decision or the history of earlier attempts; an
opinion that has already seen the answer is a review, not an opinion.

**Frequency, in force now.** On premium the advisor opens alongside every `builder` and
`ui-builder` contract — same message, in parallel with that agent, never a serial step.
`scribe` and `scout` are exempt. One opening per contract by default; signals may add more.
Work T0 does without a contract is not a hole: if it trips a `risk.js` signal — irreversible
operation, protected path, new dependency — the advisor opens there too. Computed, never
declared.

**Three structural locks.** Exemption without a limit is just a higher ceiling, so each
exempt role is fenced:

- **Tool set** — the auditor reads and runs, never writes; one written file voids the
  audit and the gate rejects the record (D5). The advisor writes no file at all.
- **Output ceiling** — the advisor returns three headings and at most twenty lines. An
  expensive model on a bounded output is a bounded cost.
- **Quota** — on eco, at most 1 advisor opening per contract and 3 per relay.
  `contract.js` counts them from the `live/` records and blocks the overflow. Normal and
  premium have no quota.

`xhigh` and `max` effort are never granted automatically. They exist only on the user's
explicit request.

**Cost class.** `tiers.json` is **Z** — a file the resolver reads, never the model.
Role frontmatter is **O**, two lines, paid once by the agent that holds the role. The
display is **Z**: `statusline.js` prints the profile and `builder·sonnet/low` from the
agent's `live/` record. Per-turn injection stays **0**.

*Fable's objection, rejected:* "the Task tool may not be able to pass a model, so the tier
would have to be encoded as separate agent definitions." It can. The `Agent` tool takes a
`model` parameter that takes precedence over the agent definition's frontmatter — verified
against the live tool contract. Splitting one agent into a tier per model would reinstate
the class **S** cost D3 removed.

*Fable's two open points, recorded:*

- Eco ceiling-piercing was left ambiguous — "is an eco builder raised to opus, or to
  `sonnet/high`?" Settled by the user: opus.
- The cost ratios behind the grid are estimates. They are to be checked against the first
  real relay run, and the grid revised there rather than argued here.
- Divergence between the advisor and the asker has no referee, and no cross-examination
  round is built: a second round would mostly buy an agreement, not a truth. A factual,
  testable divergence is settled by verification, not by more opinion — run the command and
  read the exit code. What stays genuinely open is presented to the user unarbitrated.

---

## D9 — Agent language

Every artifact an agent reads or writes is English: contract bodies, agent prompts,
reports, checkpoints, `_issues.log`. Contract frontmatter, role files, `map.md`, `live/`
and `tiers.json` were already English; what changes is T0's writing habit. Turkish keeps
exactly one channel: T0's chat with the user.

**Cost.** A contract body of ~2,500 output tokens in Turkish is ~1,700 in English. Output
is priced ~5× input, so the saving is worth roughly 4k input-equivalent tokens per
contract. Agent reports shrink ~40%, and unlike the body a report stays in T0's context
for the rest of the relay, so the saving is paid once and collected on every later turn.

**Approval fidelity.** The user no longer approves the contract; they approve T0's Turkish
summary of it. A summary that drops an acceptance item makes the user approve something
else. Rule: the summary lists the contract's `## Acceptance` items one for one, unabridged.
`## Goal` and the work list may be summarised; `## Acceptance` may not.

**`_issues.log` format.** Lines stay short and templated —
`<contract> | <role> | <what was sought> | <what was missing> | <what was done>`.
No prose. The user opens that file without T0.

The numbers above are unmeasured estimates. They are to be checked against the first real
relay run and corrected here.

**The contract language is a setting.** `contractLang` in `~/.claude/teknesyum/config.json`,
default `en`, asked by `setup.js`. T0 reads it once per relay and stamps each contract's
frontmatter with `lang:`; every agent then reads the language off the contract it was given
and never opens the config. Switching costs one flag and changes the next contract written.

The user reads contract files directly, so a contract is not backstage for them — that is
what settles it, not the token arithmetic. Turkish costs roughly 800 more output tokens per
contract body, and that body is re-read by every agent the contract touches. Worth it when
the user reads the file; not worth it when they rely on the summary.

**Three categories, not two.** What the model reads is English. What only the user reads is
served in `settings().lang` from `core/strings.json`, defaulting to English so the plugin
stays publishable: `setup.js` questions and summary, the statusline, the window title. The
third category is text both of them read — gate refusals, `cue.js`, `contract.js` output —
and it stays **English**, because its first reader is the model, which must parse it and
correct itself. The user is not left out: the model's very next sentence is Turkish chat,
so the refusal is explained in their language for free, in the same turn. A Turkish line
appended to the block message would cost tokens inside model context to say what the
paraphrase already says.

## D10 — Cues, not injections

A statusline is **Z**: the user sees it, the model never does. So a relay left half-open
across a session boundary is invisible to the model, and the next unrelated request walks
over a contract someone else owns. Compaction is worse — the summary dissolves the contract
IDs and the model starts inventing what is still open.

One hook, `cue.js`, answers two events and nothing else writes context:

- `SessionStart` — silent unless `contracts/*.md` or an unended, unstale `live/` record
  exists. Output is one English line: the relay path first, then contract IDs and live
  roles. Never the goal, the acceptance list or the route.
- `UserPromptSubmit` — silent unless the prompt matches `(log|günlük) (yaz|tut)\w*`. Then
  it points at `scripts/log.js`; the file body is written by that script, not by the model.

Cap 200 characters, enforced in code and asserted in `test/all.js`. The rejected
alternatives were a dedicated skill (~25 tok in every context and every subagent) and a
line in the user's `CLAUDE.md` (the same rent, in every project) — both class **S** rent
for a capability used a few times a month.

Bug logs land in `logs/openlogs/`, which is `.gitignore`d: they are the user's Turkish
working notes and this repo publishes in English.

### What the audit changed

An outside review (fable) plus a check of the hook documentation broke four things:

**`PostCompact` was dead.** The event exists, but plain stdout is injected into context on
only three events — `SessionStart`, `UserPromptSubmit`, `UserPromptExpansion`. Everywhere
else stdout goes to the debug log and the model never sees it. The compaction cue was
working only by accident, because `SessionStart` also fires after compaction with
`source: "compact"`. The registration and the branch are gone; `SessionStart` covers it.

**Silence leaked.** `watch.js` only swept `live/` once 40 files had piled up, so below that
a crashed agent's record was immortal and every later session announced `live: builder`
forever. There was no `SessionEnd` handler either — Base had one and Core had dropped it.
Now `SessionEnd` closes every unended record, the sweep ages records out at any count, and
`cue.js` independently ignores any record untouched for 12 hours. Two locks, because the
first one depends on a hook that a killed process never fires.

**Truncation ate the instruction.** `read .claude/relay/` was pushed last, so the 200-char
slice cut the only actionable sentence and left bare IDs. It is now first: eight contracts
and six roles truncate the list, never the instruction.

**The positive path had no test.** Every assertion was about silence; nothing proved the
line's content, its cap, or that it carries no contract body. It does now, including the
stale-record and crowded-relay cases.

Accepted knowingly: the cue points only at `.claude/relay/`. Work tracked in a document
outside that tree is not named. Adding a second search path costs a directory scan at every
session start to serve a convention that is this repository's, not the plugin's.

**Open question.** `SessionStart` earns nothing if the user always opens with "devam",
since the relay skill then reads `contracts/` anyway. The measurement is offline and costs
nothing per turn: grep the session transcripts under `~/.claude/projects/<project>/*.jsonl`
for whether a read of `.claude/relay/contracts` happens in the first few tool calls, and
whether the opening prompt already said "devam". Two weeks of transcripts give fired,
useful and redundant counts. If useful stays near zero, drop the event.

---

---

## D11 — The banner that was not built

The user asked for Base's session-opening banner back, on the condition that it cost
nothing. At `SessionStart` it cannot. `systemMessage` reads like a display channel and is
not one there: the harness adds it to the model's context exactly as it adds plain stdout
and `additionalContext`. That measurement was later confirmed in the shipped binary, which
converts a `hook_success` attachment into model context only for `SessionStart`,
`UserPromptSubmit` and `UserPromptExpansion`.

The deciding argument was not the token count. A banner would have been a **second**
`SessionStart` context write carrying the contract IDs and live roles that `cue.js` already
carries — paying twice for one fact.

What this decision got wrong: it generalised one `SessionStart` measurement into a claim
about every event. See D13.

---

## D12 — The title bar, retired

`title.js` wrote the terminal window title through `terminalSequence`, from the same data
the statusline reads. It shipped explicitly as a measurement rather than a claim, and the
measurement failed: the user works in the desktop app, which has no window title, and
PowerShell restores its own title within a second. The hook is in `trash/`.

The reasoning it carried forward stands. An agent-start announcement through a token
channel was costed and refused: `systemMessage` on `SubagentStart` would be ~15 tokens per
agent into the main session, resent every later turn, and `additionalContext` on a subagent
lifecycle event is what destroyed Base's report bodies in three cases out of four.

---

## D13 — `systemMessage` on a closing event is free

The user rejected the title bar in one sentence: they read the chat, so the notice belongs
in the chat. That forced the D11 measurement to be redone per event instead of assumed.

Emitted from a `Stop` hook, `systemMessage` renders as a line in the chat **and does not
enter the model's context.** Measured twice. In the experiment session the probe string
`TKNSYM-PROBE-7391` appears in the transcript only inside `attachment` records of type
`hook_system_message` and in the raw hook stdout record — exactly one occurrence sits
inside `message.content`, and that one is the user's own typed question. Asked whether it
had seen the string, the model answered no.

The binary agrees. The chat render is `hookName + " says: " + content`, and the
context conversion for `hook_success` returns nothing unless the event is `SessionStart`,
`UserPromptSubmit` or `UserPromptExpansion`. `Stop` is none of them.

**The prefix cannot be removed.** `hookName` is computed as the event name, plus the
matcher when one applies — there is no `name`, `label` or `displayPrefix` field on a hook
object or a matcher group, and `hook_system_message` is the only hook attachment that
renders into the chat at all. `additionalContext` has no prefix but is the wrong shape
twice over: it is class C, and on `Stop` the model's only way to act on it is to write a
new message, which in three trials out of three meant reproducing the whole answer.

So the channel is free and unusable as it stands. The notice goes through the statusline
instead — see D14.

---

## D14 — The hook does not speak, it writes

The hook stopped trying to reach the user directly. It writes one line to
`live/_duyuru.json`; `statusline.js` reads it and renders it. No prefix, because we own
both ends. No tokens, because the statusline is class Z and the file is only read by our
own script.

The line is change-gated at the writer: `setNotice` compares against what is already on
disk and does nothing when the text is unchanged, so a repeated event does not re-stamp the
clock. It expires after two minutes, capped at 80 characters, so the statusline returns to
standing state on its own instead of showing a receipt from an hour ago.

Two writers, both announcing something the statusline cannot derive from counts: `watch.js`
on `SubagentStop` names the role that just finished, and `contract.js` names the contract
it just closed. The statusline also now opens with `Teknesyum ▸`, which is the honest
answer to what the user was asking for — presence, permanently visible, for nothing.

---

## D15 — The notice rides on the message, not beside it

Every channel in D11-D14 failed the same test: the user reads the chat, and nothing we
could write reached the chat cleanly. The statusline is an Ink component the desktop app
never draws. `terminalSequence` needs a window title the desktop app does not have.
`systemMessage` renders, free, on every event that forwards it — but the CLI bakes
`hookName + " says: "` into the content before it leaves, and the desktop client wraps the
result in a collapsed "Claude Code notice" chip. That chip is folded on arrival and no hook
input opens it: the client expands only on `level: "warning"` or the viewer's own verbose
mode, and the hook path pins `level` to `"notice"`.

`MessageDisplay` is the answer, and it was found by asking a second model after two
exhaustive sweeps had closed the question. The event fires as an assistant message streams,
carrying `turn_id`, `message_id`, `index`, `final` and `delta`. Answering with
`hookSpecificOutput.displayContent` replaces what is drawn. The binary's own words:
*"Display-only: the stored message and what the model sees are untouched."*

So `notice.js` answers the first flush and the last one — the line sits above the message
and below it, framing the answer rather than trailing it, because a footer alone scrolls out
of sight on a long reply. Every flush in between is silent, and so is everything else — outside a relay, on other events, on malformed input. Measured:
zero model tokens, one hook run per message, ~43 ms of node startup. For scale, `watch.js`
spends about 1.3 s per turn across twenty tool calls; the notice is 3% of what the plugin
already costs in latency and 0% of what it costs in tokens.

**The line is an event, not a scoreboard.** The first version listed everything it could
count: profile, contracts, agents, steps watched, problems, open logs. The user read
`2 Ajan Explore · 72 Adım İzlendi · 6 Günlük` and asked what any of it meant. Fair: a
number with nothing to compare it against is not information, and "2 agents" without
saying *what they were asked* answers a question nobody had.

So the banner now shows one thing — the most important thing happening — in this order:

1. A run of failed tool calls, from two upward. It outranks everything; nothing else
   matters while the same call keeps failing.
2. On the closing band only, what just finished — the agent that returned, the contract
   that closed.
3. What is running, as `Role Model/Effort — Task`. The task is the `description` of the
   `Agent` call, captured by `watch.js` into `live/_calls.json` at `PreToolUse` and
   matched back by role. With several agents the models drop out and the tasks stay.
4. Only when nothing is happening: the profile, contracts by status, problems, and the
   gate if it is off.

The step counter and the open-log counter are gone for good. They grew without bound and
meant nothing at any value.

**The two bands differ.** The opening band says what is running, the closing band says what
finished — it is computed after the message and simply knows more. Suppressing that would
be throwing away free information.

Counting agents had a bug worth recording: `agents()` globbed `*.json` under `live/`,
which swept up `_tally.json` as an agent with no role. That is where "2 Ajan Explore" came
from — one real agent and one bookkeeping file. Records are now the files that do not
start with `_`.

**Every word is in the user's language, role names included.** The first pass translated the
frame and left the payload: `3 Ajan Worker×2`, `1 Sunuldu 1 Açık`. Role keys, contract
statuses and the × shorthand are all internal vocabulary, and a banner nobody can read is
worse than no banner. Roles resolve through `role.<name>` in `strings.json`, contract
statuses read as sentences — `1 Sözleşme Onay Bekliyor` — and identical agents are counted
in words: `3 Opus-Medium İşçi Çalışıyor`.

The whole line is Title Cased with `toLocaleUpperCase('tr')` so a Turkish dotted İ
survives, and the case break includes `/`, `-` and the em dash so `Opus-Medium` does not
come out `Opus-medium`.

Free of tokens is not free of everything, and the first version paid twice. It trimmed the
delta on the opening flush as well as the closing one, so a batch ending mid-word lost the
space that held the next batch off it. And it counted steps by opening every record under
`live/` — 0.13 ms per file, twice per message, over a directory that only grows. `watch.js`
now keeps the count in `_tally.json` as it goes and the banner reads that one file.

Two segments were cut on the same principle: a field that never changes is decoration, not
information. The gate is named only when it is **off**, and the mark at the head of the line
already says the plugin is here.

What is lost: the line is part of the assistant's message, not an element beside it. It
scrolls away with the message instead of standing still. Accepted — the statusline still
serves terminal users, and this is the only thing the desktop user can actually see.

---

## D16 — English is the front page, Turkish is one click away

**Two README files, joined by a button-shaped badge.** `README.md` is English and is what
the repository serves; `README.tr.md` carries the Turkish text. Each one opens with a
`<!-- lang -->` marker followed by a single linked figure: `assets/badge-lang.svg` on the
English page, `assets/badge-lang.tr.svg` on the Turkish one. The figure is a two-half
switch — EN | TR — with the current language lit, so the link reads as a toggle rather
than as a line of prose.

Nothing else on a GitHub README can behave like a control. Scripts never run, `<style>` is
stripped, there is no `Accept-Language` negotiation, and the repository description is
plain text. A `<details>` block looks like one click but doubles the page and breaks the
anchors. A link dressed as a button is the whole of what the platform allows, so that is
what we ship.

`scaffold.js langlink` writes both lines and copies both figures out of the plugin, so no
model composes this markup and no project has to remember the shape of it.

The rule that repository documents are English did not change: the Turkish README is its
one user-facing exception, and internal papers — contracts, reports, decision packets —
stay Turkish. The pair is the README's alone; this file has no Turkish twin and needs none.

---

## Standing law

No feature may write to `additionalContext`, and no feature may write `systemMessage` on an
event that converts it into model context — `SessionStart`, `UserPromptSubmit`,
`UserPromptExpansion`. The sole exception is `cue.js` under its 200-character cap (D10).

Anything meant for the user's eyes goes to a class-Z channel: `MessageDisplay`
`displayContent` (D15), the statusline, or a file on disk. No feature may require the model
to print a banner.

Two channels look available and are not. `systemMessage` is free on every event but arrives
in a chip that cannot be opened; wire it only where the fold does not matter. And these
events discard a hook's `systemMessage` outright — never wire one there expecting to be
seen: `Notification`, `SessionEnd`, `StopFailure`, `PreCompact`, `PostCompact`,
`ConfigChange`, `Elicitation`, `InstructionsLoaded`, `WorktreeCreate`, `WorktreeRemove`,
`SubagentStart` and `SubagentStop`. See `COST-MODEL.md`.
