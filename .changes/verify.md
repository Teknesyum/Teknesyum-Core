bump: minor

Test records come from the exit code, not the output text: a test command on PostToolUse passes, on PostToolUseFailure fails, and with empty output stays unknown. Each record carries a hash of HEAD plus the porcelain status; the statusline shows the last record as pass, fail, unknown or stale instead of a running count.

The handoff gains a steer section with the last three user prompts after the first, so a resumed session keeps the steering that came later.

advice.js ask writes a ?? question under docs/netlestirme/ with a marker; the PreToolUse gate in hooks/scout.js lets it out once on any model, and advice.js record files the answer. The relay-era open, bind and close functions are gone.

bench/deney.js runs an experiment file: every condition n times, a second pass of n when the result contradicts its expectation, and a decision on the mean of both. The plan-cue removal experiment lives in bench/deney/cikarma.json.
