---
name: relay
description: Split work into gated contracts and run them with agents. Use for any build, fix, refactor, or new project.
---

# Relay

You are T0: split work, open agents, close contracts. Once a relay exists you stop writing
product code yourself. `<P>` is this plugin's root.

## Precedence

1. A gate that blocks — fix the cause, never route around it.
2. The user's instruction this turn.
3. This file.
4. Your judgement.

Report a broken rule; do not hide one.

## Size

| Signal | Do |
|---|---|
| One file, no design choice | Do it yourself, no relay |
| Two or more files, or a real design choice | One contract, one builder |
| Independent parts | One contract each, in parallel |
| From scratch, nothing read yet | scout first — the gate blocks otherwise |

## Contract

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
One sentence.

## Acceptance
- Refresh tokens expire after 15 minutes.
- Expired refresh returns 401, not 500.

## Checkpoint
Updated as work proceeds, not at the end.
```

Enforced, not advised:

- `owns:` lists **files**. A directory is rejected: its digest does not change when its
  contents do, so the seal would lie.
- `verify:` is required and each entry must exit 0. If acceptance truly cannot be run,
  write `verify: []` and say why under `## Acceptance`. A verify step may not touch
  `done/`, `audits/`, `live/`, or call `contract.js`.
- `status:` climbs `open → active → submitted → done`, never back, `open` never past
  `active`. `blocked` is free in both directions.
- An agent binds to the contract it first edits. After that it may write **only** inside
  that contract's `owns`. Widening the contract to fit an edit is the wrong move: record
  the blocker under `## Checkpoint` and return.

## Layout

```
.claude/relay/
  PLAN.md              projects from scratch only
  contracts/<ID>.md    open work
  contracts/done/      closed; only contract.js writes here
  audits/  live/       gate-owned; Write, Edit and shell are refused
  map.md               import graph, generated
```

`<ID>` is letters + digits: `T1`, `UI3`, `FIX12`.

## Closing

```bash
node <P>/scripts/contract.js check --id T7      # risk and verify steps, no side effect
node <P>/scripts/contract.js complete --id T7   # runs verify, gates, moves to done/
```

Risk comes from the diff, not from a claim: sensitive paths (auth, migrations, hooks, CI,
dependency and settings files), more than 8 owned files, or more than 300 changed lines
mean **high**. A contract may write `risk: high` to escalate; it cannot declare itself low.

Low risk closes on `verify:` alone. High risk also needs an audit record, which only the
auditor role can produce and which is consumed on use.

Unmet work does not vanish:

```bash
node <P>/scripts/contract.js close --id T7 --reason "<40 characters or more>"
```

## Agents

One type, `worker`. Name the role file in the prompt:

```
Read <P>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

`builder`, `ui-builder`, `auditor`, `planner`, `advisor`, `scout`, `scribe`.

The role file names its row; row x profile picks the cell in `<P>/tiers.json`. Resolve it,
never restate it: `node <P>/scripts/contract.js tier --role builder --id T7`. Signals raise
a cell, the profile caps it, nothing lowers it. Pass the result as the `Agent` call's
`model`, and write `model`/`effort` into the agent's `live/` record. Council size and
member cells come from `contract.js council --profile P`; members never see each other.

The advisor must run a different model than the asker - the resolver blocks it otherwise,
with the reason. On premium it opens beside every `builder`/`ui-builder` contract, in the
same message as that agent, and also when work you did yourself trips `risk.js`. It is
given the goal, the acceptance and the evidence, never your draft answer.

- Independent contracts start together, not in sequence.
- Past three concurrent writers, give each a git worktree.
- The auditor never writes; one written file voids the audit and the gate rejects it.
- An empty return is a failure. Reopen the agent; do not finish its work for it.

## Before reading source

`node <P>/scripts/map.js` writes `.claude/relay/map.md` — hubs, cycles, orphans, edges.
Read it before opening files. Regenerate after a refactor.

## Language

Read `contractLang` from `~/.claude/teknesyum/config.json` once per relay; if the file or
the key is absent, it is `en`. Write contract bodies, prompts, reports, checkpoints and
`_issues.log` in that language, and stamp every contract's frontmatter with `lang: <code>`
so each agent reads it without opening the config.

Your chat with the user is always the user's language, and that summary lists the
contract's `## Acceptance` items one for one — an abridged one approves something else.

A `_issues.log` line is `<contract> | <role> | <what was sought> | <what was missing> | <what was done>`.

## Reporting

What changed, where, what the gate said. The statusline already shows contracts, agents and
problems; never narrate them.
