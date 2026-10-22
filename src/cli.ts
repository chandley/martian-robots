import { readFileSync } from 'node:fs'
import { MarsGrid } from './mars/marsGrid.ts'

// The grid size and robot start are still hard-coded in MarsGrid,
// so only the first robot's instruction line (line 3) is read from the file.
const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: node martian-robots <input-file>')
  process.exit(1)
}

const lines = readFileSync(inputFile, 'utf8').split('\n')
const instructionString = lines[2]?.trim() ?? ''

const grid = new MarsGrid()
for (const instruction of instructionString) {
  grid.processInstruction(1, instruction)
}
console.log(grid.reportRobots())
