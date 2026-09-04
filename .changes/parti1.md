bump: minor

Five ways a seal could be issued without the work behind it are now closed. A contract
verified in the wrong worktree, an auditor from an older round or another contract, a diff
that moved after the audit, an acceptance block with nothing executable in it, and a
dependency that never passed - each is refused at the gate rather than noticed afterwards.

A closure interrupted halfway now recovers. The journal under `audits/closures/` lets the
next run finish the move without writing a second ledger row for the same contract.

Alongside the main suite, 33 closure scenarios and a synthetic host fixture drive the real
hooks end to end, and the earlier counterexample set no longer reproduces seven of its
twelve holes.
