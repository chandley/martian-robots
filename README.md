# Martian Robots

A Node + TypeScript command-line solution to the [Martian Robots challenge](docs/CHALLENGE.md).
It reads a grid size and a list of robots from a text file, and moves each robot in turn.
It prints each robot's final position, adding `LOST` if the robot fell off the grid.

## Getting started

Requires Node 22.18 or later.

```
npm install                                   # install TypeScript (first time only)
npm run build                                 # compile src/ to dist/
node dist/cli.js examples/smallgrid.txt       # run on an input file
npm test                                      # run the node tests
```
