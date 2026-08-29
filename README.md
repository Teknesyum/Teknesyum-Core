<!-- lang -->

**English** · [Türkçe](README.tr.md)

<div align="center">
<img src="assets/banner.svg" alt="Teknesyum Core, multi-agent work in Claude Code with the plumbing done. Below the name, the line the plugin prints into the chat: Teknesyum, three Opus-Medium workers at work. Under it, three linked stages: hooks enforce, the gate closes, roles do the work." width="900">
</div>

# Teknesyum Core

Multi-agent work in Claude Code, with the plumbing already done.

---

## What it is

A job splits into contracts. A contract names the files it owns and the commands that prove
it finished. Agents run in parallel, each at whatever model the work is actually worth, and
the gate runs those commands itself before anything is called done.

None of it costs you a token per turn. Getting that part right took fifteen abandoned
attempts, all of which are written down.

---

## What it solves

Four things go wrong the moment more than one agent works on one repository.

**They write over each other.** Two agents, one file, and the second one wins. A contract
says which files are its own; `guard.js` refuses everything else before the write lands, so
the collision never happens instead of being found later.

**"Done" is a claim.** Everyone reports success, nobody ran anyone else's tests, and the
branch stops building an hour later inside somebody else's work. `contract.js complete` runs
the verify commands itself rather than believing the report, works risk out from the actual
diff, and refuses a high-risk close outright until an audit record names who checked what.

**One model does everything.** That is either too expensive for renaming a variable or too
cheap for the design call. Role and profile pick a cell out of a table; repeated failure
raises it, the profile caps it, nothing lowers it. Nobody has to remember any of this.

**Structure gets bought with context.** This is the one plugins do to you. A command list,
seven agent descriptions, a rule block stapled to every message — a bill you pay every turn,
forever, resent with the whole transcript. Core's enforcement lives in hooks. They read
files, write files, and never say a word to the model. **Zero tokens per turn**, measured
rather than hoped for, table in [docs/COST-MODEL.md](docs/COST-MODEL.md).

---

## What it does not do

- **It will not make your agents smarter.** It refuses bad closes. It has nothing to say
  about the work that led to one.
- **No slash commands. On purpose.** Every command's name and description loads into every
  session whether you use it or not. The entry point is the `relay` skill; the rest are
  scripts you run by path.
- **It is not a sandbox.** `guard.js` is a hook, and a hook is a policy, not a kernel. It
  closes the paths a model actually walks. Someone determined to get around it will, and
  the ways we know about are named in the tests that cover them.
- **It cannot translate Claude Code itself.** Core's own output is in your language. The
  client's built-in labels are nobody's to reach from a plugin.
- **It does not touch your git.** No commits, no branches, no pushes.

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

**Restart Claude Code afterwards.** Hooks reload mid-session; the desktop client does not
redraw what they produce until it restarts. Everyone forgets this once.

Both one-liners point at a tag, never at `main` — what you pipe into a shell should be the
released script, not whatever the branch happens to hold today. Every release publishes the
SHA-256 of both installers.

**Needed:** Claude Code, git. **Optional:** Node.js. Without it the statusline and the gate
scripts do not run, and you get told so instead of left guessing.

The installers finish by running setup in your own terminal, where it asks its questions
for free. Skipped it? Run the script yourself:

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

A markdown file under `.claude/relay/contracts/`. A goal, the files it owns, the commands
that prove it.

```markdown
## Goal
The banner reads in the user's language.

## owns
core/scripts/statusline.js
core/strings.json

## verify
node test/all.js
```

`owns:` lists files, not directories — a directory is a promise about files that do not
exist yet. `verify:` is the part that makes a contract closable at all. If the acceptance
cannot be written as a command that exits 0, the split is wrong, and the planner is told to
say so rather than invent a checkbox.

<div align="center">
<img src="assets/flow-contract.svg" alt="A contract's life: it is opened, an agent takes it to active, the agent submits it, and the gate then runs the contract's own verify commands. A failing command sends the contract back to active. When every command exits zero, the gate computes risk from the diff; at high risk it also demands an audit record, and only then does the contract move to done." width="900">
</div>

### The gate

`contract.js complete` is the only thing that can close a contract. It runs the verify
commands itself instead of believing the report, works risk out from the diff, and will not
close a high-risk contract until an audit record names the agent and what it checked. Audit
records are a sealed chain, so backdating one leaves a visible break.

Two hooks stand in front of the filesystem. `guard.js` blocks writes to files the current
contract does not own, and shuts the shell out of the gate's own bookkeeping entirely — a
shell that can edit those can forge a close. `prefs.js` blocks a README or LICENSE missing
its required markers, and exits immediately when the author's preference file is absent, so
for everyone else it does nothing at all.

### The cost

Every mechanism Claude Code offers gets classed by when you pay: **S** once per context,
**O** only when the feature runs, **C** every message forever, **Z** never. One rule falls
out of that table — on an ordinary turn, no hook writes into context.

<div align="center">
<img src="assets/flow-cost.svg" alt="One turn through the plugin's hooks and what each writes into the model's context. The cue hook stays silent; the guard blocks a write outside the contract; the prefs hook blocks a README missing its markers; the watcher records the step to disk; the notice hook draws the banner as display only; the notifier plays a sound at the end. Every entry in the context column is empty, so the per-turn cost is zero tokens." width="900">
</div>

The chat banner rides on the `MessageDisplay` hook, which changes what is drawn without
touching what is stored or what the model sees. The binary's own words: *"Display-only: the
stored message and what the model sees are untouched."* About 43 ms of node startup per
message, no tokens. Fifteen other channels were tried and buried first; the funeral notices
are in [docs/DECISIONS.md](docs/DECISIONS.md).

### The agents

<div align="center">
<img src="assets/flow-agents.svg" alt="How work is dispatched. The main agent splits the job into contracts. Each contract names a role, and role times profile picks one cell from the tier table, which resolves to a model and an effort. Agents then run in parallel, each leaving its own record on disk. Beside them the advisor opens one rung above whoever asked: sonnet asks and opus answers, opus asks and fable answers." width="900">
</div>

One agent type, `worker`. The role is a file named in the prompt:

```
Read <plugin>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `ui-builder`, `planner`, `auditor`, `advisor`, `scout`, `scribe`. Seven agent
descriptions sitting in every context became one, and the role text is paid for only by the
agent holding it.

Role and profile pick a cell out of [core/tiers.json](core/tiers.json); the cell is a model
and an effort. Three profiles — `eco`, `normal`, `premium` — slide the whole grid. Signals
raise a cell, the profile caps it, nothing lowers it. Repeated failure raises the effort and
then the model, and the run of failures is counted by a hook rather than by anyone's memory.

The **advisor** runs one rung above whoever asked: sonnet asks, opus answers; opus asks,
fable answers. A model cannot give itself a second opinion. There is no qualifying list —
wanting one is reason enough — and it gets the goal, the acceptance and the evidence, never
your draft answer.

---

## What it looks like in use

One line above and below each answer, saying the single most important thing happening. Not
a dashboard.

```
Teknesyum ▸ Opus-Medium Worker — Writing The Banner Code
Teknesyum ▸ 3 Opus-Medium Worker At Work
Teknesyum ▸ Heads Up — 4 Tool Calls Failed In A Row
Teknesyum ▸ Premium · 1 Contract Waiting At The Gate · 1 Contract Not Started
```

A run of failed tool calls beats everything else. The closing line reports what finished,
because it is computed after the message and simply knows more. Counters that only ever
grow — steps taken, logs open — were cut: a number with nothing to compare it against is
decoration.

---

## Commands

None. The entry point is the `relay` skill; everything else is a script.

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

## Layout

```
.claude/relay/
  contracts/           open work, one file per contract
  audits/              records and ledger.jsonl
  live/                agent records, written by the hook
  map.md               import graph
```

`node <plugin>/scripts/map.js` writes the import graph — hubs, cycles, orphans, edges. It
costs less to read than opening files, and answers things opening files does not.

---

## Tests

```bash
node test/all.js
```

2,294 assertions over the guard, the completion gate, the audit chain, the ledger, the
known bypasses, the tier and quota locks, the personal-convention gate, the scaffold, the
cue, the banner, and one check that no hook writes into context.

---

## Design notes

- [docs/COST-MODEL.md](docs/COST-MODEL.md) — where tokens go, and the rule that follows
- [docs/TRIAGE.md](docs/TRIAGE.md) — what came over from Teknesyum Base and what did not
- [docs/DECISIONS.md](docs/DECISIONS.md) — the decisions that shaped this, and why

---

## Contributing

Open an issue before writing code — it is faster than finding out your patch collided with
something. Keep the pull request small; a diff that does one thing gets read the same day,
a diff that does five gets read never.

The repository is written in English. Contributions land under AGPL-3.0-or-later, same as
everything else here; there is no CLA to sign and no ceremony to perform.

If it saves you time, you can [sponsor the work](https://github.com/sponsors/Teknesyum).

---

## License

AGPL-3.0-or-later. See [LICENSE](LICENSE).

<!-- signature -->
<div align="center">

<a href="https://github.com/sponsors/Teknesyum"><img src="assets/badge-sponsor.svg" alt="Support Teknesyum" height="38"></a>
&nbsp;
<a href="LICENSE"><img src="assets/badge-license.svg" alt="License AGPL-3.0" height="38"></a>

</div>
