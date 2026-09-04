# Closure integrity — September 2026 correction batch

These are workflow integrity checks, not a sandbox or cryptographic attestation. The
implementation and isolated tests are ahead of the installed-plugin/real-host validation.
Do not treat this document as a claim that the complete audit backlog is resolved.

## Successful closure

`complete` holds the verifier lock before reading closure inputs. It uses the caller's
actual checkout, including a linked worktree sharing the main relay. It rejects malformed
contract metadata, unmet dependencies, and Git-visible changes outside `owns`, including
untracked files and documents. Relay metadata and generated `.claude/map.md` / `.claude/map.json`
are exceptions. Ignored files, dependencies and arbitrary external inputs are not a hermetic
snapshot; reproducible verification still needs a controlled build environment.

After verify, HEAD, owned contents, contract text and the Git index must match the captured
inputs. Other cooperating closure commands cannot overlap. This does not freeze the entire
filesystem against arbitrary concurrent processes; a mutate-and-restore race is not ruled out.

Executable acceptance is the default. `verify: []` requires `verification-mode: manual`,
`manual-reason:` containing at least 40 characters, an `## Acceptance` section containing at
least 40 characters, and an independent audit even at low risk. These lengths are missing-data
checks, not proof of review quality. The hollow-command and empty-test checks are heuristics.

## Two-phase audit

1. The coordinator dispatches an Agent with the auditor role and exact contract path.
   PreToolUse records the tool-use id, parent, contract, round, checkout and revision.
2. The child reviews and returns its final answer. It does **not** issue `audit` itself.
   PostToolUse links the returned child id; SubagentStop supplies completion and transcript.
3. The coordinator requires the final lines `verdict: passed` and `findings: none`, then
   runs `contract.js audit --id T7 --run-id <child-id> --verification "<evidence>"`.
   `--dry-run` checks completed-run eligibility without creating the record.
4. `complete` validates the version-2 binding and transcript hash and consumes the record.

The record binds contract, round, checkout, dispatch, review-start HEAD/owned digest/contract
text, and final transcript. An unrelated past auditor, an unfinished child, changed inputs,
a negative final verdict, and an old unbound record cannot satisfy this path. A CLI
`--verification` string is a claim, not evidence that a command actually ran. The semantic
quality of the audit still needs acceptance-level review and tests.

Legacy ledger entries remain readable. Active contracts needing an audit must obtain a
bound version-2 record; do not retrofit identity fields into old records to force acceptance.
No automatic paid re-audit or migration runs as part of this change.

## Recovery and dependencies

`audits/closures/<ID>.json` records a prepared transaction before audit consumption. A
successful transaction consumes the audit, appends its unique transaction id once, publishes
the stamped contract in `done/`, then marks the journal committed. Dependency checks require
that commit marker for new-format entries. `close` records `unmet`, retains the recovery pin,
and does not satisfy a dependency. An adopted archive is also insufficient.

After an ordinary I/O failure, retry the **same closure command with unchanged inputs**.
The journal prevents duplicate ledger rows and refuses to overwrite conflicting edits.
Preserve the journal, ledger, audit and contract when investigating a mismatch. Do not delete
or hand-edit them simply to make a gate pass. A hard-killed process can leave a verifier
`.held` lock requiring manual diagnosis; automatic crash-lock recovery is not implemented.
The tests inject audit-consumption, ledger, archive-rename and final-journal failures. They
do not simulate power loss, disk corruption or guarantee durable writes with `fsync`.

## Security boundary and pending host validation

Write/Edit controls use the caller's relay and canonical paths. Refused attempts cannot
bind a worker; successful contract writes do. A bound worker cannot switch contracts or
rewrite its ownership metadata. Junction/symlink paths escaping the checkout are rejected.

Bash/PowerShell are **not** restricted filesystem sandboxes. The worker, hooks, live records,
transcripts and ledger ordinarily share the same user permissions. Another such process can
forge all those files. A real adversarial boundary requires a trusted out-of-worker broker,
separate identity/permissions, authenticated host events, and controlled filesystem access.
Adding a secret beside the worker-writable files or more shell regexes would not establish it.

The test host is synthetic: no Claude agent or API is called. Before release, validate actual
event ordering, `tool_use_id`/child-id correlation, transcript availability, foreground and
background agents, Windows worktrees, and abnormal exits in the supported host version.
If the host does not expose the required evidence, refuse with a useful diagnostic; do not
silently downgrade to accepting an arbitrary local `role: auditor` record.

## Reproduction

Run `node test/run.js` for the isolated suite. It copies the repository to a temporary
directory and uses a separate Claude config; release/scaffold tests cannot edit this checkout
or the live registry. Fixtures are retained for investigation. Run
`node tools/full-review-probes.js --expect-fixed` for the broader adversarial probes; a
nonzero result is expected while out-of-batch findings remain open.
