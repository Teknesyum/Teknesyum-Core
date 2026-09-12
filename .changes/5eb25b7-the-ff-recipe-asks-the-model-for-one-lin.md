bump: patch

The ff recipe asks the model for one line before the first tool call, so the queued banner is drawn at the top of the turn instead of above the last answer. Costs 54 bytes, only on an ff turn.
