# Martian Robots: brief review and modelling plan

Status: agreed 2026-10-22. No code yet.
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
| A11 | Lost robots on the grid | A lost robot leaves the grid. Only its scent stays. | Yes |
| A12 | Whitespace and blank lines | Blank lines between robots and extra spaces are tolerated. | Yes |

---

## 2. Domain model

*Revised 09:10. Your renames are in, the steps for animation are dropped in favour of a simple `moveLog`, and `MarsGrid.reportRobots()` produces the output.*

These terms come from the brief, so code, tests and docs all use the same words. That's the same idea as the Shut the Box naming rules.

### Vocabulary
| Name | Meaning |
|---|---|
| `Location` | `{ x, y }`, a square on the grid |
| `Orientation` | `'N' \| 'E' \| 'S' \| 'W'` |
| `Position` | **Location + Orientation**: `{ x, y, orientation }`, the brief's "robot position" |
| `Instruction` | A single letter: `'L'`, `'R'`, `'F'` (later perhaps `'J'`) |
| `instructionString` | The whole instruction line for one robot, e.g. `"FRRFLLFFRRFLL"` |
| `Scent` | `{ x, y, orientation, instruction }`, the position and instruction that took a robot off the grid |
| `moveLog` | A robot's positions in order (start, then after each instruction it carried out), so you can look at what happened. It's for debugging and tests, not animation. |

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

### Robot
```ts
interface Robot {
  position: Position        // last valid position
  lost: boolean
  moveLog: Position[]
}
```

### MarsGrid
```ts
class MarsGrid {
  constructor(maxX: number, maxY: number)
  addRobot(start: Position, instructionString: string): void   // runs the robot straight away (robots are processed in order)
  reportRobots(): string                                        // "1 1 E\n3 3 N LOST\n2 3 S"
}
```
- It holds the bounds, the scents (any number per square), and the robots in the order they were added (more than one per square is allowed).
- `reportRobots()` builds each robot's line from its final position and `lost` flag. Any result type stays private to the function.

### The core rule, in one place (private to MarsGrid)
For each instruction in the `instructionString`, while the robot isn't lost:
1. **Scent check.** If there's a scent for (position, instruction), skip the instruction.
2. Otherwise `next = instructionSet[instruction](position)`.
3. If `next` is on the grid, the robot takes that position (a move or a turn) and `next` is appended to its `moveLog`.
4. If it's off the grid, add the scent (position, instruction), mark the robot `lost`, and **stop**. Its position stays at the last valid square.

That's one scent check and one grid check, in order, in one place. Turns can never leave the grid, so they never leave scents, but they go through the same path. It's the "hardest problem", so it gets tested first.

Assumption for the README: a robot lost by a multi-square move such as `J` is reported at the square where that instruction **started**.

### Later: animation
This is out of scope for now. If a frontend comes later, the `moveLog` is a natural starting point.

---

## 3. Module layout (pure logic, no I/O except the CLI)

```
src/
  mars/
    orientation.ts     turnLeft, turnRight, moveForward(position, distance)
    instructions.ts    Instruction, InstructionSet, instructionSet (L, R, F)
    marsGrid.ts        MarsGrid: bounds, scents, robots, the core rule, addRobot, reportRobots
    limits.ts          MAX_COORDINATE = 50, MAX_INSTRUCTION_LENGTH = 100, MAX_ROBOTS = 1000
  io/
    parseInput.ts      text -> { maxX, maxY, robots: { start, instructionString }[] }, or throw InputError(line, message)
  cli.ts               reads a file argument or stdin, parses it, adds each robot to a MarsGrid, prints reportRobots()
  test/                Jest tests, written before the implementation
docs/
  CHALLENGE.md         (existing)
  model.md             this model, trimmed down, added later when you say so
README.md              how to run and test, plus every assumption from section 1
```

---

## 4. Development cycle (based on Shut the Box)

1. **Agree on the model.** You review this plan. `docs/model.md` and the README skeleton come later, when you say so.
2. **Scaffold.** `package.json`, TypeScript and Jest (ts-jest, or Babel as in Shut the Box), with `npm test` and `npm start < sample.txt`. I'll ask before adding any config.
3. **Test-first, hardest part first**, one commit point per step:
   1. `orientation`: turning and moving forward
   2. `instructions`: L, R and F as position-to-position functions
   3. `MarsGrid` core rule: moves, gets lost and leaves a scent, skips an instruction because of a scent (including an `F` scent not blocking a test-only `J`)
   4. `MarsGrid.reportRobots`: the sample as an acceptance test, plus `moveLog` checks
   5. `parseInput`: the valid sample, an empty instruction line, and every rejection (grid over 50, instruction over 100, over 1000 robots, bad orientation or letter, off-grid start)
   6. `cli`
4. **README** finished with run steps, assumptions and next steps.

You commit by hand. I'll call out a natural commit point after each step so the history shows the test-first approach the reviewers want to see.

---

## 5. Questions for you

- ~~**Q1. Scent direction.**~~ Settled: a scent records location, orientation before the instruction, and the instruction.
- ~~**Q2. Bad input.**~~ Settled: any bad line rejects the whole input with a line-numbered error.
- ~~**Q3. Empty instruction line.**~~ Settled: allowed, and the robot reports its start position.
- ~~**Q4. Where this lives.**~~ Settled: it goes into `docs/model.md` later, not yet.
