<!-- lang -->

[<img src="assets/badge-lang.svg" alt="English selected, switch to Türkçe" width="124" height="44">](README.tr.md)

<div align="center">
<img src="assets/banner.svg" alt="Teknesyum Core, a subtraction plugin for Claude Code." width="900">
</div>

# Teknesyum Core

Counts, Shows, And Speaks Once

---

## The Numbers First

Every claim below was measured against plain Claude Code on the same seat (sonnet, low
effort), clean config, 2026-09-05 and 2026-09-06. Method, tables and raw rows are in
[bench/rapor.md](bench/rapor.md); the whole bench cost about 40 $.

| What was measured | Plain Claude Code | Core 0.16 |
|---|---|---|
| Ordinary turn, bytes the hooks write into the context (200 turns) | 0 | 0 |
| Ordinary turn, extra tokens per turn, p50 / p95 | - | +207 / +427, all cache read, 0.0001 $ |
| Tasks 02-05, median cost, five runs each | 0.11-0.39 $ | within 3 % or cheaper, all pass |
| Task 06, four files and ~185 lines, three runs | 0.34 $, 3/3 pass | 0.37 $, 3/3 pass, hook silent 3/3 |
| The one line the hook speaks, when it speaks | - | ~450 tokens, 0.0007 $, no extra tool call |
| Resume: session cut at six turns, next session says "continue" | 0/3 finished | 3/3 finished; second session 0.33 $ vs 0.11 $ |
| The removed 0.15 machinery put back whole | - | 4-8x the cost, 7-15 agent calls, same acceptance |
| Each removed 0.15 part put back alone | - | inside or above the baseline range, nothing the acceptance could see |

What that says in one breath: on a turn where nothing happens, Core costs nothing. On a
task, Core costs what plain Claude Code costs. The one thing it buys is a session that can
be cut and picked up again; that is where the money goes, and it goes there because the
second session does the work instead of saying "looks fine".

The last two rows are the design proof. The previous version gated multi-agent work behind
contracts, roles and tiers. Put back whole, it passed the same tasks at four to eight times
the price. Put back one piece at a time, with the decision rule written before the runs,
no piece moved the acceptance column and none came back. Section 8 of the report has the
rows; the variants live under `bench/varyant/` and rerun with one command.

---

## What It Is

Teknesyum Core is a plugin for Claude Code that adds nothing to an ordinary turn. It counts
the files a session touches, shows the count on the statusline, and speaks into the
conversation exactly once, when the work has grown past a threshold and there is no plan on
disk. When the session ends, or when the context window fills up, it writes a handoff file
the next session resumes from with one word: "continue".

Everything Claude Code already does natively - subagents, worktrees, plan mode, hooks, the
statusline - is left alone. Nothing is wrapped, gated or rewritten.

---

## What It Does

### Count

After every `Write`, `Edit` and `NotebookEdit` the hook records the touched file and asks git
how many lines changed. Below the threshold it writes nothing: zero bytes into the context.

The threshold is five files, or a hundred and fifty changed lines in tracked files, or a
single file whose path looks risky: `migrations/`, `auth`, `secur`, `config`, a lock file,
`.github/`, a `Dockerfile`. Lines in brand-new files are shown but do not count toward the
line threshold; a task that writes three fresh files is not a task that needs a plan. When
the threshold is crossed and there is no `docs/plan.md`, one line arrives, once per session:

> 5 files touched and no plan. Write docs/plan.md or say skip.

That is the whole conversation. The model writes the plan or says skip; the hook never asks
again.

### Show

The statusline reads the same state: files touched with added and removed lines, whether a
plan exists, the tests the session ran and how many failed, the context percentage, whether
a handoff is waiting, open bug logs, and hook errors if any. Plain text, no colours or
measures invented here.

### Handoff

When the context passes sixty percent, or when the session ends, `.claude/handoff.md` is
written by the machine. It opens with one rule line - read the task, then the changed files,
continue from the first unfinished part, do not redo what the diff already shows - and then
carries `task`, the session's first prompt read from the transcript; `changed_files` from
`git diff --stat`; `tests_run` from the commands the hook saw and how they exited; and
`plan` if there is one. Two sections are left for the model, `decisions` and `next_action`,
and one line asks for them at the threshold:

> Context 64%. Fill decisions and next_action in .claude/handoff.md.

A regenerated handoff keeps what the model wrote. The next session start says one line,
`Resume: .claude/handoff.md`, and nothing else. When the work is finished, the file goes to
`trash/`.

### Chime

A sound when Claude is waiting on you - a permission prompt, a question, a dialog - and
silence for everything that does not need you. Off with one setting.

### Consult

A prompt that starts with `??` is a request to sharpen the question before any work starts:
the model gathers the facts it already has, puts them in front of a consulting seat, and
saves the exchange verbatim under `docs/danisma/` with the round's cost on one line. There
is no hook behind this; it is a rule in `CLAUDE.md` and a script that lists the records.

### Tools that only run when called

| Script | What it does |
|---|---|
| `scripts/map.js .` | Import graph: hubs, cycles, orphans. `map.js who <file>` says what imports it. |
| `scripts/log.js write` | A bug log with a fixed shape, into the project's own repository. |
| `scripts/advice.js list` | The consultation records under `docs/danisma/`. |
| `scripts/manset.js` | The banner line, if you want one. |
| `scripts/scaffold.js` | License, signature block, language link: fixed texts the model never types. |
| `scripts/setup.js` | Machine setup: language, chime, private repository, projects folder. |
| `scripts/doctor.js` | Seven checks: node, git, version, hooks, statusline, map, logs. |
| `scripts/release.js` | Bumps the version from the notes left in `.changes/`, rewrites the install lines, tags. |

---

## What Went Out

Version 0.16 is a subtraction release. These left the plugin and sit under
`trash/0.15-relay/`, recoverable from the `v0.15.0` tag:

- the contract machine: `contract.js`, `risk.js`, `verify-runner.js`, the relay `handoff.js`;
- nine hooks: autoclose, closure, cue, embed, guard, notice, schema, seal, watch;
- six role texts, the `worker` agent, the relay skill, `tiers.json`.

What replaced them is two hooks, `count.js` and `handoff.js`, and the five-line rule below.
Agents, worktrees and plan mode are still there; they are Claude Code's own, and the model
picks them the way it always did. The removed part was the machine that chose for it.

---

## Install

### Windows - one line

```powershell
irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.16.1/install.ps1 | iex
```

### macOS / Linux - one line

```bash
curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.16.1/install.sh | bash
```

**Restart Claude Code afterwards.** Hooks reload mid-session; the desktop client does not
redraw what they produce until it restarts.

Both one-liners point at a tag, never at `main`. Every release publishes the SHA-256 of both
installers.

**Needed:** Claude Code, git, Node.js.

The installers finish by running setup in your own terminal. Skipped it? Run it yourself:

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

Setup writes `~/.claude/teknesyum/config.json` and wires the statusline. It applies at the
next session start.

---

## The Rule For CLAUDE.md

The plugin does not tell the model how to work. This is the five-line rule it suggests you
put in your own `CLAUDE.md`; the count hook is its only enforcement, and the rule itself is
the ~200 tokens per turn in the table above.

```
- One file and a job you know: do it.
- Five or more files: docs/plan.md first.
- A library you do not know: read before writing.
- When done, run it and show the output.
- Small job: none of the above.
```

---

## What It Looks Like In Use

```
Teknesyum ▸ my-app · context 41% · 3 files +82-14 · no plan · tests 1✓
Teknesyum ▸ my-app · context 67% · 6 files +240-31 · plan · tests 2✓ 1✗ · handoff
```

The first line is a session below every threshold: nothing has been said to the model. The
second is a session that wrote its plan, ran its tests, and has a handoff waiting for the
`decisions` and `next_action` lines.

---

## Hooks

Six events, four files, all under `core/hooks/`:

| Event | Hook | Says |
|---|---|---|
| `SessionStart` | `count.js` | `Resume: .claude/handoff.md` if one exists, else nothing |
| `PostToolUse` | `count.js` | one line at the threshold, once; else nothing |
| `PreToolUse` | `prefs.js` | your own README conventions, when a README is written |
| `Stop` | `count.js` | nothing; refreshes the diff for the statusline |
| `SessionEnd` | `handoff.js` | nothing; writes the handoff |
| `Notification` | `notify.js` | nothing; rings |

Only `count.js` can write into the context, and the test suite checks that it is the only one.

---

## Layout

```
.claude/
  handoff.md           where the work stands, machine-written, two lines yours
  map.md               import graph
docs/
  plan.md              the plan the hook asks for, when it asks
  danisma/             consultation records from ?? turns
bench/
  rapor.md             the report behind the table above
  varyant/             the removed parts, ready to be measured again
~/.claude/teknesyum/
  config.json          your setup
  state-<session>.json the count
  hook-errors.log      what a hook could not do
```

---

## Tests

```bash
npm test
```

The suite drives the real hooks through a temporary repository: the count stays silent
below the threshold and writes zero bytes, speaks once above it, treats a risky path as a
reason on its own, and stays quiet when a plan is on disk. The handoff is generated from
git, keeps what the model wrote, and is announced on the next start but not after a
compaction. Alongside those: the statusline in both languages, the personal-convention gate,
the scaffold, the map, the chime, doctor, and the bench's own cost and run helpers.

---

## Design Notes

- [docs/COST-MODEL.md](docs/COST-MODEL.md) - where tokens go, and the rule that follows
- [docs/DECISIONS.md](docs/DECISIONS.md) - the decisions that shaped this, and why
- [docs/BENCH.md](docs/BENCH.md) - how the plugin is measured against plain Claude Code

---

## Contributing

Open an issue before writing code - it is faster than finding out your patch collided with
something. Keep the pull request small; a diff that does one thing gets read the same day,
a diff that does five gets read never. A new feature comes with a `bench/varyant/` entry
and its rows; the table at the top is the bar.

The repository is written in English. Contributions land under AGPL-3.0-or-later, same as
everything else here; there is no CLA to sign and no ceremony to perform.

If it saves you time, you can [sponsor the work](https://github.com/sponsors/Teknesyum).

---

## Support

The plugin is free and stays free - AGPL, no paid tier, nothing kept back for a version you
have to buy. If it saved you a bad merge or an afternoon, sponsoring is one way to say so.

There are free ways to help too: report the bugs you hit, write down the criticism you have,
recommend it to a friend.

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Support Teknesyum" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="License AGPL-3.0" height="38"></a>

</div>
