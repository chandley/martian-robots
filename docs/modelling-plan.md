# Martian Robots: brief review and modelling plan

Status: agreed 2026-10-22, revised 09:45 (robot state, processInstruction, log). No code yet.
Stack: Node + TypeScript, backend modules only. Animation is out of scope for now.

---

## 1. Brief review

### What the brief asks for
- A rectangular grid. Its lower-left corner is `0 0`, and the first input line gives the upper-right corner.
- Robots are processed **one after another**. Each one has a start position (`x y orientation`) and an instruction string.
- Instructions: `L` and `R` turn 90° in place. `F` moves one square forward. North means `y + 1`.
- A robot that moves off the grid is **LOST**. It leaves a **scent** at the last valid grid position it held.
- A later robot that tries the **same move from the same position** that lost an earlier robot ignores that instruction.
- Output is one line per robot: `x y O`, with ` LOST` added if the robot was lost.
- Limits: the maximum coordinate value is 50, and the maximum instruction length is 100.
- Design for **new command types** being added later.
- Reviewers look at the **commit history**, want the code to be easy to run, and suggest using the sample data. They also say KISS and "solve the hardest problems first".

### Sample traced by hand (it agrees with the rules above)
| Robot | Trace | Result |
|---|---|---|
| `1 1 E` / `RFRFRFRF` | Goes round a square and ends where it started | `1 1 E` |
| `3 2 N` / `FRRFLLFFRRFLL` | …reaches `3 3 N`, then `F` goes to `3 4`, which is off the grid. **Lost**, and the rest of its instructions are skipped. Scent left at (3,3), facing N, instruction F | `3 3 N LOST` |
| `0 3 W` / `LLFFFLFLFL` | Turns to E and moves to `3 3 E`. Turns L to N. `F` would go off the grid, but there's a scent for (3,3, N, F), so it's **ignored**. Then L to W, F to `2 3`, L to S | `2 3 S` |

The sample exercises both the scent rule and "a lost robot stops processing". It can't tell apart "scent per square" from "scent per square and move". The brief says "same position **and move**", so a scent records the square, the orientation before the instruction, and the instruction that went off the grid (section 2).

### Things the brief leaves open, and what I propose
| # | Gap | Proposal | README assumption? |
|---|---|---|---|
| A1 | Can two robots share a square? | **Yes.** Robots don't collide or block each other. | Yes (your call) |
| A2 | Several scents on one square? | **Yes.** A scent is keyed by (x, y, orientation, instruction), so a corner can have both an N scent and an E scent. | Yes (your call) |
| A3 | How many robots? | **At most 1000.** Input with more is rejected. | Yes (your call) |
| A4 | Grid larger than 50 | **Rejected.** | Yes (your call) |
| A5 | Instruction longer than 100 | **Rejected.** | Yes (your call) |
| A6 | What happens to a lost robot's remaining instructions? | They're **ignored**, as the sample implies. | Yes |
| A7 | Robot starts off the grid, or has an unknown orientation or command letter | **Rejected** at parse time. | Yes |
| A8 | Smallest grid | `0 0` (a single square) is valid. Negative values are rejected. | Yes |
| A9 | Empty instruction line | Allowed. The robot just reports its start position. | Yes (your call) |
| A10 | Does a robot sitting on a scent change anything? | No. A scent only blocks the **same instruction from the same orientation** on that square. | Yes |
| A11 | Lost robots on the grid | A lost robot stays on record (for the report) at its last valid position. It doesn't affect other robots. Only its scent does. | Yes |
| A12 | Whitespace and blank lines | Blank lines between robots and extra spaces are tolerated. | Yes |

---

## 2. Domain model

*Revised 09:45. Robot only holds its state. MarsGrid processes one instruction at a time and returns a log entry. A separate `processInstructionString` feeds instructions in and collects the log.*

These terms come from the brief, so code, tests and docs all use the same words. That's the same idea as the Shut the Box naming rules.

### Vocabulary
| Name | Meaning |
|---|---|
| `Location` | `{ x, y }`, a square on the grid |
| `Orientation` | `'N' \| 'E' \| 'S' \| 'W'` |
| `Position` | **Location + Orientation**: `{ x, y, orientation }`, the brief's "robot position" |
| `Status` | `'active' \| 'lost'` |
| `Instruction` | A single letter: `'L'`, `'R'`, `'F'` (later perhaps `'J'`) |
| `instructionString` | The whole instruction line for one robot, e.g. `"FRRFLLFFRRFLL"` |
| `Scent` | `{ x, y, orientation, instruction }`, the position and instruction that took a robot off the grid |
| `Result` | What one instruction did: `'moved' \| 'ignored' \| 'lost'`. A turn counts as `moved`. |
| `LogEntry` | One line of the move log: robot id, instruction, result, and the robot's position and status afterwards |

### Instruction set
```ts
type InstructionSet = Record<Instruction, (position: Position) => Position>

const instructionSet: InstructionSet = {
  L: p => ({ ...p, orientation: turnLeft(p.orientation) }),
  R: p => ({ ...p, orientation: turnRight(p.orientation) }),
  F: p => moveForward(p, 1),
  // later: J: p => moveForward(p, 2)
}
```
- Each instruction is a pure `Position → Position` function. The new position **may be off the grid**, and the function doesn't care.
- Adding an instruction means adding one entry plus its tests. The parser checks letters against the set's keys, so the list of valid letters lives in one place.

### Robot: state only
```ts
interface Robot {
  id: number               // 1, 2, 3… in the order the robots were added
  position: Position       // last valid position
  status: Status
}
```
The robot doesn't know about instruction strings or the log.

### MarsGrid
```ts
class MarsGrid {
  constructor(maxX: number, maxY: number)
  addRobot(start: Position): number                                // places the robot, returns its id
  processInstruction(robotId: number, instruction: Instruction): LogEntry
  reportRobots(): string                                           // "1 1 E\n3 3 N LOST\n2 3 S"
}
```
- It holds the bounds, the scents (any number per square), and every robot in the order added, lost ones included, so they can be reported. More than one robot per square is allowed.
- **The core rule lives in `processInstruction`**:
  1. **Scent check.** If there's a scent for (robot's position, instruction), the result is `ignored`.
  2. Otherwise `next = instructionSet[instruction](position)`.
  3. If `next` is on the grid, the robot takes that position. The result is `moved`.
  4. If it's off the grid, add the scent (position, instruction), set the status to `lost`, and keep the last valid position. The result is `lost`.
- Calling `processInstruction` for a robot that's already lost is a programming error, so it throws. `processInstructionString` never does it.
- `reportRobots()` gives one line per robot, in order: `x y O`, plus ` LOST` if lost.

### LogEntry
```ts
interface LogEntry {
  robotId: number; instruction: Instruction; result: Result
  position: Position; status: Status                 // after the instruction
}
formatLogEntry(entry) // "robot id:3 instruction:F result:lost coordinates:0 0 orientation:W status:lost"
```
It's an object rather than a ready-made string, so `processInstructionString` can see the status and stop, and tests can assert on fields. `formatLogEntry` gives the text line.

### processInstructionString (outside MarsGrid)
```ts
function processInstructionString(grid: MarsGrid, robotId: number, instructionString: string): LogEntry[]
```
It feeds the instructions one at a time to `grid.processInstruction`, collects each `LogEntry` into the move log, and **stops after a `lost` result**, so the rest of the string is skipped. An empty string returns an empty log.

### Main flow (cli)
```
parse input → new MarsGrid(maxX, maxY)
for each robot in order:
    id  = grid.addRobot(start)
    log = processInstructionString(grid, id, instructionString)   // optional: the main loop may print it as a log (not a core requirement)
print grid.reportRobots()
```

### Worked example: a 1x1 grid
Input (the grid line `0 0` is a 1x1 grid):
```
0 0
0 0 N
F
0 0 N
F
0 0 N
LF
```
Move log:
```
robot id:1 instruction:F result:lost coordinates:0 0 orientation:N status:lost
robot id:2 instruction:F result:ignored coordinates:0 0 orientation:N status:active
robot id:3 instruction:L result:moved coordinates:0 0 orientation:W status:active
robot id:3 instruction:F result:lost coordinates:0 0 orientation:W status:lost
```
Output:
```
0 0 N LOST
0 0 N
0 0 W LOST
```
This one example covers getting lost, a scent blocking a later robot, a turn going through the same path as a move, two scents on one square (N+F and W+F), and the rest of the instructions being skipped after a robot is lost. It becomes an acceptance test alongside the brief's sample.

Assumption for the README: a robot lost by a multi-square move such as `J` is reported at the square where that instruction **started**.

---

## 3. Module layout (pure logic, no I/O except the CLI)

```
src/
  mars/
    orientation.ts               turnLeft, turnRight, moveForward(position, distance)
    instructions.ts              Instruction, InstructionSet, instructionSet (L, R, F)
    marsGrid.ts                  MarsGrid: bounds, scents, robots; addRobot, processInstruction (core rule), reportRobots
    logEntry.ts                  LogEntry, formatLogEntry
    processInstructionString.ts  feeds one robot's instructions to the grid, returns LogEntry[]
    limits.ts                    MAX_COORDINATE = 50, MAX_INSTRUCTION_LENGTH = 100, MAX_ROBOTS = 1000
  io/
    parseInput.ts                text -> { maxX, maxY, robots: { start, instructionString }[] }, or throw InputError(line, message)
  cli.ts                         main loop above
  test/                          Jest tests, written before the implementation
docs/
  CHALLENGE.md
  modelling-plan.md              this plan
README.md                        how to run and test, plus every assumption from section 1
```

---

## 4. Development cycle (based on Shut the Box)

1. **Agree on the model.** Done. The plan is in `docs/modelling-plan.md`.
2. **Scaffold.** `package.json`, TypeScript and Jest (ts-jest, or Babel as in Shut the Box), with `npm test` and `npm start < sample.txt`. I'll ask before adding any config.
3. **Test-first, hardest part first**, one commit point per step:
   1. `orientation`: turning and moving forward
   2. `instructions`: L, R and F as position-to-position functions
   3. `MarsGrid.processInstruction` on a 1x1 grid: lost and leaving a scent, ignored because of a scent, a turn is `moved`, two scents on one square, an `F` scent not blocking a test-only `J`, throws for a lost robot
   4. `processInstructionString`: the 1x1 log above, stops after lost, empty string
   5. `reportRobots`: the 1x1 example and the brief's sample as acceptance tests
   6. `parseInput`: the valid sample, an empty instruction line, and every rejection (grid over 50, instruction over 100, over 1000 robots, bad orientation or letter, off-grid start)
   7. `cli`
4. **README** finished with run steps, assumptions and next steps.

You commit by hand. I'll call out a natural commit point after each step so the history shows the test-first approach the reviewers want to see.

---
## 5. Questions for you

- ~~**Q1. Scent direction.**~~ Settled: a scent records location, orientation before the instruction, and the instruction.
- ~~**Q2. Bad input.**~~ Settled: any bad line rejects the whole input with a line-numbered error.
- ~~**Q3. Empty instruction line.**~~ Settled: allowed, and the robot reports its start position.
- ~~**Q4. Where this lives.**~~ Settled: the plan lives in `docs/modelling-plan.md`.
