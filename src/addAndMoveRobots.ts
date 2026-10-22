import type { MarsGrid, Position } from './mars/marsGrid.ts'

export interface RobotInput {
  startPosition: Position
  instructionString: string
}

// Robots are added and run in order on the given grid, then reported together.
export function addAndMoveRobots(grid: MarsGrid, robots: RobotInput[]): string {
  for (const { startPosition, instructionString } of robots) {
    const robotId = grid.addRobot(startPosition)
    processInstructionString(grid, robotId, instructionString)
  }
  return grid.reportRobots()
}

function processInstructionString(grid: MarsGrid, robotId: number, instructionString: string): void {
  for (const instruction of instructionString) {
    grid.processInstruction(robotId, instruction)
  }
}
