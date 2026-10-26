export type Orientation = 'N' | 'E' | 'S' | 'W'

type Status = 'active' | 'lost'

export interface Position {
  x: number
  y: number
  orientation: Orientation
}

export interface GridSize {
  maxX: number
  maxY: number
}

interface Robot {
  id: number
  position: Position
  status: Status
}

// The instruction letters nextPosition understands.
export const INSTRUCTIONS = ['L', 'R', 'F']

const LEFT_OF: Record<Orientation, Orientation> = { N: 'W', W: 'S', S: 'E', E: 'N' }

const RIGHT_OF: Record<Orientation, Orientation> = { N: 'E', E: 'S', S: 'W', W: 'N' }

const FORWARD_STEP: Record<Orientation, { dx: number; dy: number }> = {
  N: { dx: 0, dy: 1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: -1 },
  W: { dx: -1, dy: 0 },
}

export class MarsGrid {
  private readonly gridSize: GridSize
  private robots: Robot[] = []
  private scents = new Set<string>()

  constructor(gridSize: GridSize) {
    this.gridSize = gridSize
  }

  addRobot(start: Position): number {
    const id = this.robots.length + 1
    this.robots.push({ id, position: start, status: 'active' })
    return id
  }

  processInstruction(robotId: number, instruction: string): void {
    const robot = this.findRobot(robotId)
    if (robot.status === 'lost') {
      return
    }
    const scentForProposedMove = this.scentKey(robot.position, instruction)
    if (this.scents.has(scentForProposedMove)) {
      return
    }
    const next = this.nextPosition(robot.position, instruction)
    if (this.isOnGrid(next)) {
      robot.position = next
    } else {
      robot.status = 'lost'
      this.scents.add(scentForProposedMove)
    }
  }

  reportRobots(): string {
    return this.robots
      .map(({ position: { x, y, orientation }, status }) =>
        `${x} ${y} ${orientation}${status === 'lost' ? ' LOST' : ''}`)
      .join('\n')
  }

  private nextPosition(position: Position, instruction: string): Position {
    switch (instruction) {
      case 'L':
        return { ...position, orientation: LEFT_OF[position.orientation] }
      case 'R':
        return { ...position, orientation: RIGHT_OF[position.orientation] }
      case 'F': {
        const { dx, dy } = FORWARD_STEP[position.orientation]
        return { ...position, x: position.x + dx, y: position.y + dy }
      }
      default:
        throw new Error(`Unsupported instruction: ${instruction}`)
    }
  }

  // A scent records the last position on the grid and the instruction that took a robot off it.
  private scentKey({ x, y, orientation }: Position, instruction: string): string {
    return `${x},${y},${orientation},${instruction}`
  }

  private isOnGrid({ x, y }: Position): boolean {
    const { maxX, maxY } = this.gridSize
    return x >= 0 && x <= maxX && y >= 0 && y <= maxY
  }

  private findRobot(robotId: number): Robot {
    const robot = this.robots.find(r => r.id === robotId)
    if (!robot) {
      throw new Error(`No robot with id ${robotId}`)
    }
    return robot
  }
}
