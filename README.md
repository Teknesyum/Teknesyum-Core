# Teknesyum Core

A contract gate for multi-agent work in Claude Code.

Work is split into contracts. A contract names the files it owns and the commands that
prove it done. Nothing closes until those commands exit 0, and contracts that touch
sensitive ground additionally need an auditor that never wrote a line.

**It costs nothing per message.** No hook writes into the model's context on an ordinary
turn, no rule asks the model to print a banner, and there are no slash commands. State
lives in the statusline, which the model never sees. You pay once, at install.

---

## Install

```
/plugin marketplace add Teknesyum/Teknesyum-Core
/plugin install teknesyum-core@teknesyum
```

Then set it up. Two ways, same script.

**In your own terminal — free, nothing enters a context:**

```bash
node ~/.claude/plugins/cache/teknesyum/teknesyum-core/*/scripts/setup.js
```

**Or paste this to Claude:**

> Set up Teknesyum Core. Run `node <plugin>/scripts/setup.js --check`, where `<plugin>` is
> the installed teknesyum-core directory. It prints JSON. Ask me every question under
> `missing` in a single message, then call `node <plugin>/scripts/setup.js --apply` with
> the matching flags. Do not write any config file yourself.

Setup writes `~/.claude/teknesyum/config.json` and wires the statusline. It applies at the
next session start.

---

## How it works

Say what you want. The `relay` skill sizes the job: one file goes straight to work, more
than that becomes contracts.

A contract:

```markdown
---
id: T7
status: open
round: 1
owns: [src/auth/token.js, test/token.test.js]
verify:
  - node --test test/token.test.js
---

## Goal
Refresh tokens expire after 15 minutes.

## Acceptance
- Expired refresh returns 401, not 500.

## Checkpoint
Updated as work proceeds.
```

Closing it:

```bash
node <plugin>/scripts/contract.js complete --id T7
```

That command runs every `verify:` step, computes risk from the actual diff, and moves the
file only if everything holds. It is the only route into `contracts/done/` — a hook blocks
writes, shell moves, and anything else that tries.

### Risk is measured, not declared

The party that says "done" does not get to say "low risk". The gate computes it:

| Signal | Result |
|---|---|
| auth, migrations, hooks, CI, dependency or settings files | high |
| more than 8 owned files | high |
| more than 300 changed lines | high |
| otherwise | low |

A contract may write `risk: high` to escalate. It cannot escalate downward. High risk
requires an audit record bound to one contract, one round, one HEAD, and the exact content
of the owned files — and it is consumed on use, so it cannot be replayed.

### What the auditor may not do

Write. A single file written during the audit voids it; the gate reads the agent's live
record and rejects the seal. This is what catches "the agent said done and the code
disagrees".

---

## Agents

One agent type, `worker`. The role is a file named in the prompt:

```
Read <plugin>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `auditor`, `planner`, `advisor`, `scout`. Seven agent descriptions in every
context became one; the role text is paid only by the agent that holds it.

---

## Layout

```
.claude/relay/
  contracts/<ID>.md    open work
  contracts/done/      closed; written only by contract.js
  audits/              records and ledger.jsonl
  live/                agent records, written by the hook
  map.md               import graph
```

`node <plugin>/scripts/map.js` writes the import graph — hubs, cycles, orphans, edges.
Reading it costs less than opening files, and it answers questions opening files does not.

---

## Commands

None. That is the point: every slash command's name and description is loaded into every
session. The plugin's entry point is the `relay` skill, and everything else is a script
you or the model runs by path.

---

## Tests

```bash
node test/all.js
```

45 assertions covering the guard, the completion gate, the audit chain, the ledger, and a
check that no hook writes into context.

---

## Design notes

- `docs/COST-MODEL.md` — where tokens go, and the rule that follows from it
- `docs/TRIAGE.md` — what came over from Teknesyum Base and what was left behind
- `docs/DECISIONS.md` — the four decisions that shaped this and why

## License

Apache-2.0
