## Introduction

Think of this challenge as an opportunity to show us what “good” looks like to you — and a fun way to showcase your skills.

Guidelines
• We don’t expect you to spend more than 2–3 hours on this challenge.
• If you don’t have time to fully complete it, please still send it in and indicate what your next steps would be.
• Try to solve the hardest problems first.
• Use any language and frameworks you want.
• KISS — Keep it Simple, Stupid.
• User interface design is not the main focus.
• Put your code on a public repository (e.g., GitHub) and share the URL.
• Please submit your commit history; we want to see how you approach and validate your solution.
• We should be able to run your code without complicated steps.
• 💡 Secret tip: Make use of the sample data!

## Problem: Martian Robots

## The Problem

The surface of Mars can be modeled by a rectangular grid on which robots move according to instructions provided from Earth. You are to write a program that determines each sequence of robot positions and reports the final position of each robot.
• A robot position consists of:
• Grid coordinates (x, y)
• Orientation (N, S, E, W)
• A robot instruction is a string containing:
• L → turn left 90° (stay in place)
• R → turn right 90° (stay in place)
• F → move forward one grid point in current orientation

The direction North corresponds to moving from (x, y) to (x, y+1).

Extra Considerations
• Additional command types may be added in the future; design with flexibility.
• If a robot moves off the grid, it is considered LOST.
• A lost robot leaves a scent at the last valid grid position.
• Future robots encountering the same position and move that previously led to being lost ignore that instruction.

## Input

1. The first line: upper-right coordinates of the grid (lower-left assumed to be 0 0).
2. The remaining lines: sequence of robots, each with two lines:
    - Initial position: x y orientation
    - Instruction string: sequence of L, R, F
    - Robots are processed sequentially.
    - Max coordinate value: 50.
    - Max instruction length: 100.

## Output

For each robot, print the final coordinates and orientation.
If the robot is lost, append LOST.

## Sample Input

```
5 3
1 1 E
RFRFRFRF
3 2 N
FRRFLLFFRRFLL
0 3 W
LLFFFLFLFL
```

## Sample Output

```
1 1 E
3 3 N LOST
2 3 S
```