bump: minor

Premium raises the ceiling, not the starting model. `builder` and `ui-builder` open on
`sonnet/high` in every profile's premium column instead of `opus/medium`; the existing
signals - a repeated failure, round 3, risk high - still reach opus.

`scout` now covers measurement as well as prior art: benchmarks, timings, inventories, any
question whose answer is a number rather than a change.

The model is checked at dispatch. An `Agent` call above what the role resolves to with no
signal behind it is refused before a token is spent; below the cell stays free. The seal
writes the same finding to `live/problems.log` rather than refusing work already paid for.

The `main`-branch hatch is per command again. `TEKNESYUM_GATE_OPEN=1` pinned in the
environment is ignored - the Windows registry or an `export` in a shell profile - and the
block says why. One machine had carried it for months with the gate quietly off.

A promise now survives the turn it was made in. `.claude/relay/OWED.md` holds at most three
lines of sixty characters, written by `handoff.js owe --add` and closed by `owe --done <n>
--because "..."`. Every prompt carries the list back inside the cue string that was already
there, so an empty ledger still costs nothing. Nothing expires - an old debt is marked
`stale`, not dropped - closing needs a reason, and the reason lands in `HANDOFF.md`.
