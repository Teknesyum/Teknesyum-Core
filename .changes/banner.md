bump: minor

agency.js show leaves a seat mark; the next Stop prints it once in the chat as a systemMessage line, "Seat: <slug> read, <n> KB". The line is rendered by the client and never enters the model context (DECISIONS D13, bench/deney/banner.karar.md).
