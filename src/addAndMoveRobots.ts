import type { MarsGrid, Position } from './mars/marsGrid.ts'

export interface RobotOrders {
  startPosition: Position
  instructionString: string
}

// Robots are added to the grid and moved in order, one robot at a time.
export function addAndMoveRobots(grid: MarsGrid, robotOrders: RobotOrders[]): void {
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
