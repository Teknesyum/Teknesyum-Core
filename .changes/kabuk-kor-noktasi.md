bump: minor

The step ceiling now counts every tool, not only the writing ones. A contract that did its
work through `Bash` used to pass its ceiling unchecked; the statusline reported the overrun
and nothing acted on it. The only command still let through past the ceiling is the one that
closes the contract.

Independent git repositories sitting inside the checkout are now a boundary the guard holds.
It notes where they are and what they had uncommitted, and refuses the next shell call if one
of them moved. A shell call that dirties tracked files outside `owns` in the checkout itself
is only written to `live/problems.log`, so the false-positive rate can be measured before it
becomes a gate.

A ceiling raised on purpose reads as `Adım 197/250 (yükseltildi)` instead of a silent overrun.
