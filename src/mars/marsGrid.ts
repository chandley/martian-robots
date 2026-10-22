export type Orientation = 'N' | 'E' | 'S' | 'W'

type Status = 'active' | 'lost'

export interface Position {
  x: number
  y: number
  orientation: Orientation
}

interface Robot {
  id: number
  position: Position
  status: Status
}

const LEFT_OF: Record<Orientation, Orientation> = { N: 'W', W: 'S', S: 'E', E: 'N' }

const RIGHT_OF: Record<Orientation, Orientation> = { N: 'E', E: 'S', S: 'W', W: 'N' }

const FORWARD_STEP: Record<Orientation, { dx: number; dy: number }> = {
  N: { dx: 0, dy: 1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: -1 },
  W: { dx: -1, dy: 0 },
}

export class MarsGrid {
  private readonly maxX: number
  private readonly maxY: number
  private robots: Robot[] = []

  constructor(maxX: number, maxY: number) {
    this.maxX = maxX
    this.maxY = maxY
  }

  addRobot(start: Position): number {
    const id = this.robots.length + 1
    this.robots.push({ id, position: start, status: 'active' })
    return id
  }

  processInstruction(robotId: number, instruction: string): void {
    const robot = this.findRobot(robotId)
    const next = this.nextPosition(robot.position, instruction)
    if (this.isOnGrid(next)) {
      robot.position = next
    } else {
      robot.status = 'lost'
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

  private isOnGrid({ x, y }: Position): boolean {
    return x >= 0 && x <= this.maxX && y >= 0 && y <= this.maxY
  }

  private findRobot(robotId: number): Robot {
    const robot = this.robots.find(r => r.id === robotId)
    if (!robot) {
      throw new Error(`No robot with id ${robotId}`)
    }
    return robot
  }
}
