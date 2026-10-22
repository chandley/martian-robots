import { readFileSync } from 'node:fs'
import { parseInput } from './io/parseInput.ts'
import { MarsGrid } from './mars/marsGrid.ts'
import { addAndMoveRobots } from './addAndMoveRobots.ts'

const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: node martian-robots <input-file>')
  process.exit(1)
}

const { gridSize, robots } = parseInput(readFileSync(inputFile, 'utf8'))
const grid = new MarsGrid(gridSize)
console.log(addAndMoveRobots(grid, robots))
