import { readFileSync } from 'node:fs'
import { MarsGrid, type Orientation } from './mars/marsGrid.ts'

// Reads the grid and a single robot for now; validation comes with parseInput later.
const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: node martian-robots <input-file>')
  process.exit(1)
}

const lines = readFileSync(inputFile, 'utf8').split('\n')
const [maxX, maxY] = lines[0].trim().split(/\s+/).map(Number)
const [x, y, orientation] = lines[1].trim().split(/\s+/)
const instructionString = lines[2]?.trim() ?? ''

const grid = new MarsGrid(maxX, maxY)
const robotId = grid.addRobot({ x: Number(x), y: Number(y), orientation: orientation as Orientation })
for (const instruction of instructionString) {
  grid.processInstruction(robotId, instruction)
}
console.log(grid.reportRobots())
