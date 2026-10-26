import { readFileSync } from 'node:fs'
import { InputError, parseInput, type RobotOrders } from './io/parseInput.ts'
import { MarsGrid } from './mars/marsGrid.ts'

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

// Robots are added to the grid and moved in order, one robot at a time.
function addAndMoveRobots(grid: MarsGrid, robotOrders: RobotOrders[]): void {
  for (const { startPosition, instructionString } of robotOrders) {
    const robotId = grid.addRobot(startPosition)
    processInstructionString(grid, robotId, instructionString)
  }
}

function processInstructionString(grid: MarsGrid, robotId: number, instructionString: string): void {
  for (const instruction of instructionString) {
    grid.processInstruction(robotId, instruction)
  }
}

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}
