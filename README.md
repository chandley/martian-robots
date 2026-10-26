# Martian Robots

A Node + TypeScript command-line solution to the [Martian Robots challenge](docs/CHALLENGE.md).
It reads a grid size and a list of robots from a text file, and moves each robot in turn.
It prints each robot's final position, adding `LOST` if the robot fell off the grid.

## Getting started

Requires Node 22.18 or later.

```
npm install                                   # install TypeScript (first time only)
npm run build                                 # compile src/ to dist/
node dist/cli.js examples/sample.txt          # run on an input file
npm test                                      # run the node tests
```

## Example

The file examples/sample.txt contains the example in the CHALLENGE.md document

```
5 3
1 1 E
RFRFRFRF
3 2 N
FRRFLLFFRRFLL
0 3 W
LLFFFLFLFL
```

if we run 

```
node dist/cli.js examples/sample.txt        
```

we see the expected output

```
1 1 E
3 3 N LOST
2 3 S
```

## Extensions

we could add an optional 'verbose' parameter to the input
When selected, this could show logging for each move before showing the output.

## Assumptions

The brief leaves some points open. This is how the solution handles them.

- **Robots can share a square.** They don't collide or block each other.
- **A square can hold several scents.** A scent records the square, the robot's orientation and the instruction that took it off the grid. So `0 0 N` + `F` and `0 0 W` + `F` are two different scents, and a scent only blocks that same instruction from that same orientation.
- **A lost robot ignores the rest of its instructions.** It is reported at its last square on the grid, with `LOST`.
- **Limits:** grid coordinates are at most 50, an instruction line has at most 100 letters, and a file has at most 1000 robots.
- **The smallest grid is `0 0`** (a single square). Negative values are rejected.
- **An empty instruction line is allowed**, and so is a missing final instruction line. The robot reports its start position.
- **Blank lines and extra spaces are ignored.**
- **Bad input rejects the whole file.** A grid over the limits, a robot starting off the grid, an unknown orientation or instruction letter, an instruction line that's too long, or too many robots, all print an error with the line number to stderr, for example `examples/badorientation.txt line 2: orientation must be one of N, E, S, W, got "X"`. Nothing goes to stdout, and the exit code is 1. A missing file or argument also exits with code 1.
