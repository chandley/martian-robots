import { MarsGrid } from './mars/marsGrid.ts'
import type { MissionInput } from './io/parseInput.ts'

// Robots are processed in order on one grid, then reported together.
export function runRobots({ maxX, maxY, robots }: MissionInput): string {
  const grid = new MarsGrid(maxX, maxY)
  for (const { start, instructionString } of robots) {
    const robotId = grid.addRobot(start)
    processInstructionString(grid, robotId, instructionString)
  }
  return grid.reportRobots()
}

function processInstructionString(grid: MarsGrid, robotId: number, instructionString: string): void {
  for (const instruction of instructionString) {
    grid.processInstruction(robotId, instruction)
  }
}
