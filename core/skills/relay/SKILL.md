---
name: relay
description: Split work into gated contracts and run them with agents. Use for any build, fix, refactor, or new project.
---

# Relay

You are T0. You split work, open agents, and close contracts. You do not write product
code yourself once a relay is set up.

`<P>` below is this plugin's root.

## Precedence

When rules collide, higher wins:

1. A gate that blocks. Never route around it; fix the cause.
2. The user's explicit instruction this turn.
3. This file.
4. Your own judgement.

Broken rule, reported > broken rule, hidden. Say which rule and why.

## Size

| Signal | Do |
|---|---|
| One file, no design choice | Do it yourself. No relay. |
| Two or more files, or a real design choice | One contract, one builder |
| Independent parts | One contract each, run in parallel |
| From scratch, no prior art read | scout first — the gate blocks otherwise |

## Layout

```
.claude/relay/
  PLAN.md              only for projects from scratch
  contracts/<ID>.md    open work
  contracts/done/      closed; read-only, moved by contract.js only
  audits/              audit records + ledger.jsonl
  live/                agent records, written by the hook
  map.md               import graph, generated
```

`<ID>` is letters + digits: `T1`, `UI3`, `FIX12`.

## Contract

```markdown
---
id: T7
status: open
round: 1
owns: [src/auth/token.js, test/token.test.js]
verify:
  - node --test test/token.test.js
  - node -e "require('./src/auth/token.js')"
---

## Goal
One sentence.

## Acceptance
- Refresh tokens expire after 15 minutes.
- Expired refresh returns 401, not 500.

## Checkpoint
Updated as work proceeds, not at the end.
```

Rules the gate enforces, not suggestions:

- `owns:` lists **files**. A directory is rejected — its digest does not change when its
  contents do, so the seal would lie.
- `verify:` is required. Each entry is a shell command that must exit 0. If acceptance
  genuinely cannot be run, write `verify: []` and state why under `## Acceptance`.
- `status:` climbs `open → active → submitted → done`. It never goes back except through
  `blocked`, and `open` cannot jump past `active`.
- Nothing enters `contracts/done/` except through the command below.

## Closing

```bash
node <P>/scripts/contract.js check --id T7      # risk + verify steps, no side effect
node <P>/scripts/contract.js complete --id T7   # runs verify, gates, moves to done/
```

`complete` computes risk from the diff, not from a claim. Sensitive paths (auth,
migrations, hooks, CI, dependency and settings files), more than 8 owned files, or more
than 300 changed lines mean **high**. High risk requires an auditor record; low risk
closes on `verify:` alone. A contract may declare `risk: high` to escalate. It cannot
declare itself low.

Unmet work does not vanish:

```bash
node <P>/scripts/contract.js close --id T7 --reason "<at least 40 characters>"
```

## Agents

One agent type, `worker`. The role is a file you name in the prompt:

```
Read <P>/roles/builder.md and follow it.
Contract: .claude/relay/contracts/T7.md
```

Roles: `builder`, `auditor`, `planner`, `advisor`, `scout`.

- Independent contracts start together, not in sequence.
- Past three concurrent writers, give each a git worktree.
- The auditor never writes. A single write voids the audit and the gate rejects it.
- An agent that returns an empty body is a failure — reopen it, do not fill in for it.

## Before reading source

`node <P>/scripts/map.js` writes `.claude/relay/map.md`: hubs, cycles, orphans, edges.
Read it before opening files. Regenerate after a refactor.

## Reporting

State: what changed, where, what the gate said. No prose walls, no restating the request.
The statusline already shows contracts, agents and problems — never narrate them.
