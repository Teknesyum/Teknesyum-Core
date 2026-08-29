<!-- lang -->

**English** · [Türkçe](README.tr.md)

<div align="center">
<img src="assets/banner.svg" alt="Teknesyum Core: a contract gate for multi-agent work in Claude Code. Below the name, the line the plugin prints into the chat reads Teknesyum, three Opus-Medium workers at work. Under it, three linked stages: hooks, the gate, and roles." width="900">
</div>

# Teknesyum Core

A contract gate for multi-agent work in Claude Code.

---

## What it solves

An agent that says it is finished is making a claim, and nothing checks it. On a small
change that is fine. Across a dozen parallel agents it is how a branch quietly stops
building: each one reports success, none of them ran the other's tests, and the failure
surfaces an hour later inside someone else's work.

Core turns "done" from a claim into a measurement. Work is split into contracts. A contract
names the files it owns and the commands that prove it finished. Nothing closes until those
commands exit 0, risk is computed from the actual diff rather than declared, and a
high-risk close is refused until an audit record exists.

The second problem is what all that scaffolding costs. Plugins usually buy their structure
with context: a command list, agent descriptions, a rule block injected on every message.
That is a bill you pay on every single turn, forever, and it is resent with the whole
transcript. Core's enforcement lives in hooks, which read files and write files and never
speak to the model. **The per-turn cost is zero tokens** — measured, not estimated, and the
table is in [docs/COST-MODEL.md](docs/COST-MODEL.md).

---

## Install

### Windows — one line

```powershell
irm https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.1.12/install.ps1 | iex
```

### macOS / Linux — one line

```bash
curl -fsSL https://raw.githubusercontent.com/Teknesyum/Teknesyum-Core/v0.1.12/install.sh | bash
```

### From inside Claude Code

```
/plugin marketplace add Teknesyum/Teknesyum-Core
```

```
/plugin install teknesyum-core@teknesyum
```

**Restart Claude Code after installing.** Hooks reload mid-session, but the desktop client
does not redraw what they produce until it restarts.

Both one-liners point at a tag, not at `main`: what gets piped into a shell is the released
script, not whatever the branch holds today. Each release publishes the SHA-256 of both
installers in its notes.

**Required:** Claude Code, git. **Optional:** Node.js — without it the statusline and the
gate scripts do not run, and you are told so rather than left guessing.

The installers end by running setup in your own terminal, where it asks its questions and
costs nothing. If you skip them, either run the script yourself:

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

**or paste this to Claude:**

> Set up Teknesyum Core. Run `node <plugin>/scripts/setup.js --check`, where `<plugin>` is
> the installed teknesyum-core directory. It prints JSON. Ask me every question under
> `missing` in a single message, then call `node <plugin>/scripts/setup.js --apply` with
> the matching flags. Do not write any config file yourself.

Setup writes `~/.claude/teknesyum/config.json` and wires the statusline. It applies at the
next session start.

---

## How it works

### The contract

A contract is a markdown file under `.claude/relay/contracts/`. It carries a goal, an
`owns:` list of files, and `verify:` commands.

```markdown
## Goal
The banner reads in the user's language.

## owns
core/scripts/statusline.js
core/strings.json

## verify
node test/all.js
```

`owns:` lists files, never directories — a directory is a promise about files that do not
exist yet. `verify:` is what makes the contract closable at all: if the acceptance cannot
be written as a command that exits 0, the contract is split wrong, and the planner is told
to say so rather than invent a checkbox.

<div align="center">
<img src="assets/flow-contract.svg" alt="A contract's life: it is opened, an agent takes it to active, the agent submits it, and the gate then runs the contract's own verify commands. A failing command sends the contract back to active. When every command exits zero, the gate computes risk from the diff; at high risk it also demands an audit record naming the agent and the verification, and only then does the contract move to done and its file into the closed folder." width="900">
</div>

### The gate

`contract.js complete` is the only thing that can close a contract. It runs the verify
commands itself rather than believing a report, computes risk from the diff, and refuses a
high-risk close until an audit record names the agent and what it verified. The audit
records form a sealed chain, so one cannot be added after the fact without the break
showing.

Two hooks stand in front of the filesystem. `guard.js` blocks a write to a file the current
contract does not own, and blocks shell writes into the gate's own bookkeeping entirely — a
shell that can edit those can forge a close. `prefs.js` blocks a README or LICENSE write
that is missing its required markers; it exits immediately when the author's preference file
is absent, so it is inert for everyone else.

### The cost

Every mechanism Claude Code offers is classed by when you pay for it: **S** once per
context, **O** only when the feature runs, **C** on every message forever, **Z** never.
The single rule that falls out of the table is that no hook writes into context on an
ordinary turn.

<div align="center">
<img src="assets/flow-cost.svg" alt="One turn through the plugin's hooks and what each writes into the model's context. A prompt arrives; the cue hook stays silent; before a tool runs, the guard may block a write and the prefs hook may block a README missing its markers; after every tool the watcher records the step to disk; while the answer streams, the notice hook draws the banner as display only; and at the end the notifier plays a sound. Every arrow into the model's context is empty, so the per-turn cost is zero tokens." width="900">
</div>

The banner in the chat comes from the `MessageDisplay` hook, which replaces what is drawn
without touching what is stored or what the model sees — the binary's own words are
*"Display-only: the stored message and what the model sees are untouched."* It costs about
43 ms of node startup per message and no tokens at all. Fifteen other channels were tried
and closed first; the record is in [docs/DECISIONS.md](docs/DECISIONS.md).

### The agents

<div align="center">
<img src="assets/flow-agents.svg" alt="How work is dispatched. The main agent splits the job into contracts. Each contract names a role, and the role plus the active profile picks one cell from the tier table, which resolves to a model and an effort. Agents then run in parallel, each leaving its own record on disk. Beside them the advisor opens one rung above whoever asked, so an opus asker is answered by fable and a sonnet asker by opus." width="900">
</div>

There is one agent type, `worker`. The role is a file named in the prompt:

```
Read <plugin>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `ui-builder`, `planner`, `auditor`, `advisor`, `scout`, `scribe`. Seven agent
descriptions in every context became one, and the role text is paid only by the agent that
holds it.

Role and profile pick a cell from [core/tiers.json](core/tiers.json), and the cell is a
model and an effort. Three profiles — `eco`, `normal`, `premium` — move the whole grid.
Signals raise a cell and the profile caps it; nothing lowers it. A repeated failure raises
the effort and then the model, and the run of failures is counted by a hook rather than by
anyone's memory.

The **advisor** runs one rung above whoever asked: sonnet asks and opus answers, opus asks
and fable answers. A model cannot give itself a second opinion. It opens whenever a second
mind would widen the view — there is no qualifying list — and it is given the goal, the
acceptance and the evidence, never the asker's draft answer.

---

## The banner

While an answer is being written, one line above and below it says what the plugin is
doing. It is not a status bar: it reports the single most important thing happening.

```
Teknesyum ▸ Opus-Medium İşçi — Banner Kodunu Yazıyor
Teknesyum ▸ 3 Opus-Medium İşçi Çalışıyor
Teknesyum ▸ Dikkat — 4 Araç Çağrısı Üst Üste Başarısız
Teknesyum ▸ Premium · 1 Sözleşme Onay Bekliyor · 1 Sözleşme Başlanmadı
```

A run of failed tool calls outranks everything. The closing band reports what finished,
because it is computed after the message and simply knows more. Counters that only grow —
steps taken, logs open — were removed: a number with nothing to compare it against is not
information.

Every word is in your language, role names included.

---

## What it does not do

- **It does not make agents smarter.** It refuses bad closes; it does not improve the work
  that led to them.
- **It has no slash commands, on purpose.** Every command's name and description loads into
  every session. The entry point is the `relay` skill; everything else is a script run by
  path.
- **It does not sandbox anything.** `guard.js` is a hook, and a hook is a policy, not a
  kernel. It stops the paths the model actually takes; it is not a defence against a
  determined bypass, and the bypasses that are known are named in the tests that cover them.
- **It does not localise Claude Code itself.** The banner and every message Core writes are
  in your language. The client's own labels are not reachable from a plugin.
- **It does not manage your git.** No commits, no branches, no pushes.

---

## Layout

```
.claude/relay/
  contracts/           open work, one file per contract
  audits/              records and ledger.jsonl
  live/                agent records, written by the hook
  map.md               import graph
```

`node <plugin>/scripts/map.js` writes the import graph — hubs, cycles, orphans, edges.
Reading it costs less than opening files, and it answers questions opening files does not.

---

## Commands

None. The entry point is the `relay` skill; everything else is a script:

| Script | What it does |
|---|---|
| `contract.js` | open, submit, complete, audit, tier resolution |
| `map.js` | import graph — hubs, cycles, orphans |
| `risk.js` | risk from the diff and from irreversible paths |
| `log.js` | the error log; not written by hand |
| `setup.js` | machine setup, statusline wiring |
| `scaffold.js` | licence, signature, language links |
| `statusline.js` | the statusline and the chat banner |

---

## Tests

```bash
node test/all.js
```

2,261 assertions covering the guard, the completion gate, the audit chain, the ledger, the
known bypasses, the tier and quota locks, the personal-convention gate, the scaffold, the
cue, the banner, and a check that no hook writes into context.

---

## Design notes

- [docs/COST-MODEL.md](docs/COST-MODEL.md) — where tokens go, and the rule that follows
- [docs/TRIAGE.md](docs/TRIAGE.md) — what came over from Teknesyum Base and what was left
- [docs/DECISIONS.md](docs/DECISIONS.md) — the decisions that shaped this, and why

---

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Support Teknesyum" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="License AGPL-3.0" height="38"></a>

</div>
