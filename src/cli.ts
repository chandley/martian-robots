import { readFileSync } from 'node:fs'
import { InputError, parseInput } from './io/parseInput.ts'
import { MarsGrid } from './mars/marsGrid.ts'
import { addAndMoveRobots } from './addAndMoveRobots.ts'

const inputFile = process.argv[2]
if (!inputFile) {
  fail('Usage: node martian-robots <input-file>')
}

let text: string
try {
  text = readFileSync(inputFile, 'utf8')
} catch {
  fail(`Cannot read input file: ${inputFile}`)
}

try {
  const { gridSize, robotOrders } = parseInput(text)
  const grid = new MarsGrid(gridSize)
  addAndMoveRobots(grid, robotOrders)
  console.log(grid.reportRobots())
} catch (error) {
  if (error instanceof InputError) {
    fail(`${inputFile} line ${error.lineNumber}: ${error.message}`)
  }
  throw error
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}
